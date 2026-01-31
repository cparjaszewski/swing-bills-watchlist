# SwingVote Analytics

Legislative analysis platform that identifies swing senators and generates AI-powered persuasion strategies.

## Overview

SwingVote Analytics helps users identify senators who are most likely to be persuaded on key legislation and generates personalized email drafts to contact them. The platform uses data from ProPublica Congress API (with mock data fallback) and OpenAI for email generation.

## Features

- **Dashboard**: Overview of legislative analysis with stats on bills, senators, swing votes
- **Bills Watchlist**: Monitor bills with volatility scores and whip count visualizations
- **Bill Details**: Deep dive into bill analysis with senator breakdown by voting status
- **AI Email Drafting**: Generate personalized persuasive emails for senators using OpenAI
- **Topic Personalization**: Onboarding flow to select policy topics and filter relevant bills
- **Swing Detection**: Algorithm categorizes senators as Loyalist (>95%), Leaning (80-95%), or Swing (<80%)

## Technical Architecture

### Frontend (React + Vite)
- **Pages**: Dashboard, Home (Bills), BillDetails, Onboarding, Settings
- **State Management**: TanStack Query for data fetching
- **Styling**: Tailwind CSS with Shadcn UI components

### Backend (Express)
- **API Routes**: Bills, topics, preferences, email drafting
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI via Replit AI Integrations

### Database Schema
- `members`: Senator data (id, name, party, state, party loyalty %)
- `bills`: Legislation (id, title, summary, topics, volatility score)
- `topics`: Policy categories (Healthcare, Environment, Economy, etc.)
- `user_preferences`: User session settings and selected topics

## Key Files

- `shared/schema.ts` - Database schema and types
- `shared/routes.ts` - API route definitions
- `server/routes.ts` - API implementation with OpenAI integration
- `server/storage.ts` - Database operations
- `client/src/pages/` - React page components
- `client/src/components/senator-list.tsx` - Senator cards with email drafting

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection (auto-configured)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (via Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI base URL
- `PROPUBLICA_API_KEY` - Optional, falls back to mock data if not set

## Running the App

The app runs on port 5000 with `npm run dev`. Frontend and backend are served together via Vite.

## Recent Changes

- Added topic-based onboarding flow for personalized experience
- Implemented AI-powered email drafting with OpenAI integration
- Dashboard shows personalization banner and filters bills by selected topics
- Senator cards have "Draft Email" button for quick email generation
- Added custom interests text field in onboarding for free-form input that AI considers when drafting emails
- Redesigned dashboard with feed-style alert cards showing volatility spikes, whip count shifts, swing probability alerts
- Added quick stats sidebar and severity filter tabs (Critical, Moderate, Info)
- Enhanced "View Analysis" with sophisticated senator analytics including voting history, influence factors, demographics, and persuasion strategies
