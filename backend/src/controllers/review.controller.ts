import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Review } from '../models/Review.js';
import { Bot } from '../models/Bot.js';
import { logger } from '../config/logger.js';

export const submitReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    const { botId } = req.params;
    const { rating, content } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Login is required to post a review.' });
      return;
    }

    const bot = await Bot.findOne({ botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Bot not found.' });
      return;
    }

    if (bot.owner === userId) {
      res.status(400).json({ success: false, message: 'You cannot review your own bot.' });
      return;
    }

    const existingReview = await Review.findOne({ botId, userId });
    if (existingReview) {
      res.status(400).json({ success: false, message: 'You have already reviewed this bot.' });
      return;
    }

    const review = new Review({
      botId,
      userId,
      rating,
      content
    });

    await review.save();
    logger.info(`User ${userId} reviewed Bot ${botId} with rating ${rating}`);
    res.status(201).json({ success: true, message: 'Review submitted successfully.', review });
  } catch (error) {
    logger.error(`Error submitting review: ${error}`);
    next(error);
  }
};

export const getBotReviews = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { botId } = req.params;
    
    // Find reviews and populate user details
    const reviews = await Review.find({ botId })
      .populate('userId', 'username avatar globalName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    logger.error(`Error fetching reviews: ${error}`);
    next(error);
  }
};

export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    const userRole = req.user?.role || 'user';
    const { reviewId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    // Only review author or admin/moderator can delete
    if (review.userId !== userId && userRole !== 'admin' && userRole !== 'moderator') {
      res.status(403).json({ success: false, message: 'Permission denied.' });
      return;
    }

    await Review.deleteOne({ _id: reviewId });
    logger.info(`Review ${reviewId} deleted by user ${userId}`);
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    logger.error(`Error deleting review: ${error}`);
    next(error);
  }
};

export const likeReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    const { reviewId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Login is required to like a review.' });
      return;
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    const likeIndex = review.likes.indexOf(userId);
    if (likeIndex > -1) {
      review.likes.splice(likeIndex, 1); // unlike
    } else {
      review.likes.push(userId); // like
    }

    await review.save();
    res.status(200).json({ success: true, likesCount: review.likes.length, liked: likeIndex === -1 });
  } catch (error) {
    logger.error(`Error liking review: ${error}`);
    next(error);
  }
};

export const replyToReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.discordId;
    const userRole = req.user?.role || 'user';
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    const bot = await Bot.findOne({ botId: review.botId });
    if (!bot) {
      res.status(404).json({ success: false, message: 'Associated bot not found.' });
      return;
    }

    // Only owner or co-owners can reply
    if (bot.owner !== userId && !bot.team.includes(userId) && userRole !== 'admin') {
      res.status(403).json({ success: false, message: 'Only the bot team can reply to this review.' });
      return;
    }

    review.ownerReply = reply;
    review.ownerReplyAt = new Date();
    await review.save();

    res.status(200).json({ success: true, message: 'Reply posted successfully.', review });
  } catch (error) {
    logger.error(`Error replying to review: ${error}`);
    next(error);
  }
};

export const reportReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    review.reports += 1;
    await review.save();

    res.status(200).json({ success: true, message: 'Review reported successfully.' });
  } catch (error) {
    logger.error(`Error reporting review: ${error}`);
    next(error);
  }
};
