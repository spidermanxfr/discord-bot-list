# Discord Bot List Platform (BotSpace)

BotSpace is a modern, responsive, and secure Discord Bot List platform built using **Next.js 15 (App Router)** and **Express TypeScript + MongoDB**. It features Discord-inspired typography and spacing, a premium dark design system, and custom development hooks.

## 🚀 Features

- **Discord-Inspired Premium Theme**: Consistent styling with customized scrollbars, glass panels, skeleton loaders, and Framer Motion micro-animations.
- **Robust Authentication**: Integration with Passport Discord OAuth2, generating secure JWT sessions.
- **Mock Authentication Portals**: A simulation mode for developer testing without needing a live Discord Client ID/Secret.
- **Interactive Vote & Cooldown**: Handles a 12-hour voting cooldown using MongoDB indexes, with developer webhook triggers.
- **REST API + Keys**: Issuing and revoking developer API keys for posting statistics (server/shard counts).
- **Admin Panel**: Queue moderation (Approve, Reject, Verify, Feature bots) and developer suspensions.
- **Containerized Deployments**: Complete `docker-compose.yml` and production `Dockerfiles` for local cluster testing.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, App-TW)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **State & Fetching**: TanStack React Query, Axios, React Hook Form, Zod, React Hot Toast

### Backend
- **Framework**: Node.js, Express (TypeScript ESModules)
- **Database**: MongoDB, Mongoose
- **Auth**: Passport.js, Discord OAuth2, JSON Web Tokens (JWT)
- **Security**: Helmet CSP, CORS configuration, Rate Limiter, Compression

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` at the root and fill in the values:
```bash
cp .env.example .env
```

---

## 🏃 Local Setup & Installation

### Option A: Running with Docker Compose (Recommended)
This command spins up MongoDB, the API Backend, and the NextJS client app:
```bash
docker-compose up --build
```
- API Endpoint: `http://localhost:5000`
- Web Application: `http://localhost:3000`

### Option B: Manual Local Setup

1. **MongoDB**: Ensure MongoDB is running on `mongodb://localhost:27017/discord_bot_list`.
2. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🛡️ Developer Simulation Mode
To easily evaluate developer dashboard features offline (without needing active Discord developer credentials):
1. Launch the frontend and click the **Mock Login** button.
2. Select a role: **Standard Developer**, **Moderator**, or **Global Administrator**.
3. You will immediately be authenticated as a mock session so you can test submissions, editings, and approvals!
