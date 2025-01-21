# Smart Calendar Assistant

A PWA calendar application with AI-powered scheduling, training plans, and project management.

## Features

- 🤖 AI-powered scheduling assistant using Claude
- 📅 Google Calendar integration
- 🏃‍♂️ Training schedule management
- 📊 Project timeline and Kanban board
- 📱 Full offline support
- 🔄 Real-time sync across devices
- 📈 Progress tracking
- 🎯 Goal setting and monitoring

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- Google Calendar API
- TanStack Query
- PWA with Workbox
- Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Google Cloud Console account
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nicolascodet/scheduler.git
cd scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Google Cloud Console Setup

1. Go to the Google Cloud Console
2. Create a new project
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables in Vercel

Add the following environment variables in your Vercel project settings:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_ANALYTICS_ID` (optional)

## PWA Features

- Full offline support
- Background sync
- Push notifications
- Add to home screen
- Splash screens
- App icons

## Caching Strategy

- Static assets: Cache-first
- API responses: Stale-while-revalidate
- Calendar data: Network-first with offline fallback
- Training/Project data: IndexedDB with background sync

## Error Handling

- Global error boundary
- API error handling
- Offline error states
- Retry mechanisms
- User-friendly error messages

## Performance Optimization

- Route-based code splitting
- Image optimization
- Font optimization
- Bundle size optimization
- Service worker pre-caching

## License

MIT License - see LICENSE file for details
