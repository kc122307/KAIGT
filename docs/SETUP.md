# Goal Glimpse - Setup Guide

## Overview
Goal Glimpse is a collaborative goal achievement app with AI coaching, team features, and progress tracking.

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenRouter API key (optional, for AI features)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenRouter API Configuration (for AI features)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# App Configuration
VITE_APP_NAME=Goal Glimpse
VITE_APP_URL=https://your-app-url.vercel.app
```

## Database Setup

### Required Tables

You need to create the following tables in your Supabase database:

1. **profiles** - User profiles
2. **goals** - Individual user goals
3. **activities** - Goal activities and progress tracking
4. **notifications** - User notifications
5. **team_invitations** - Team invitation system
6. **teams** - Team management
7. **team_members** - Team membership
8. **team_goals** - Team-specific goals
9. **team_goal_contributions** - Individual contributions to team goals

### Database Schema

The app expects the following table structure:

#### Core Tables
- `profiles`: User data with streak counts and completed goals
- `goals`: Personal goals with progress tracking
- `activities`: Daily activity logging
- `notifications`: In-app notifications

#### Team Features
- `teams`: Team information (max 4 members each)
- `team_members`: Team membership with roles
- `team_invitations`: Email-based team invitations
- `team_goals`: Collaborative team goals
- `team_goal_contributions`: Track individual contributions

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` file with your environment variables
4. Set up your Supabase database with required tables
5. Run the development server: `npm run dev`

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` 
   - `VITE_OPENROUTER_API_KEY`
   - `VITE_APP_NAME`
   - `VITE_APP_URL`
4. Deploy

## Features

- ✅ Personal goal tracking with categories
- ✅ Daily activity streaks
- ✅ Progress visualization
- ✅ AI-powered coaching (via OpenRouter)
- ✅ Team collaboration (max 4 members)
- ✅ Email-based team invitations
- ✅ Team-specific goals
- ✅ Member goal visibility
- ✅ Real-time updates
- ✅ Responsive design with bluish-green theme
- ✅ Enhanced leaderboard (top 10 + current user)

## Security Notes

- All API keys are stored in environment variables
- Database access is secured with Row Level Security (RLS)
- Team data is only accessible to team members
- Personal goals can be marked as public/private

## Troubleshooting

1. **Environment Variables**: Make sure all required environment variables are set
2. **Database Connection**: Verify your Supabase URL and API key
3. **Table Structure**: Ensure all required tables exist with proper schemas
4. **RLS Policies**: Check that Row Level Security policies are properly configured