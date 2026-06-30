import { Router } from 'express';
import { submitReview, getBotReviews, deleteReview, likeReview, replyToReview, reportReview } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ReviewSchema, ReviewReplySchema } from '../validators/index.js';

const router = Router();

// Submit review
router.post('/:botId', requireAuth, validate(ReviewSchema), submitReview);

// Get bot reviews
router.get('/:botId', getBotReviews);

// Delete review
router.delete('/:reviewId', requireAuth, deleteReview);

// Like review
router.post('/:reviewId/like', requireAuth, likeReview);

// Reply to review (owner/team co-owners)
router.post('/:reviewId/reply', requireAuth, validate(ReviewReplySchema), replyToReview);

// Report/flag review
router.post('/:reviewId/report', reportReview);

export default router;
