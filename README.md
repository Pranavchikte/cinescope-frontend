# CineScope Frontend

Next.js frontend for CineScope - A movie tracking platform.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **UI Components:** shadcn/ui
- **State Management:** React Hooks

## Features

- Browse trending and popular movies
- Search movies
- Movie detail pages with trailers and cast
- User authentication (register/login)
- Personal watchlist
- Movie ratings (Skip, Timepass, Go for it, Perfection)
- Responsive design

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd cinescope-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` file
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

4. Run development server
```bash
npm run dev
```

App runs at: `http://localhost:3000`

## Build for Production
```bash
npm run build
npm start
```

## Project Structure
```
frontend/
├── app/
│   ├── auth/
│   ├── movie/[id]/
│   ├── watchlist/
│   ├── ratings/
│   ├── search/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── auth-modal.tsx
│   ├── navbar.tsx
│   ├── movie-card.tsx
│   ├── browse-page.tsx
│   ├── movie-detail-page.tsx
│   ├── watchlist-page.tsx
│   └── ratings-page.tsx
├── lib/
│   └── api.ts
├── public/
├── styles/
│   └── globals.css
└── .env.local
```

## Deployment

See deployment guide in main documentation.

## License

MIT