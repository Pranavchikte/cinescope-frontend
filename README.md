# CineScope Frontend 🎬

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge)

> Modern, responsive frontend for CineScope - a personalized movie & TV tracking platform with AI-powered recommendations.

---

## 🎯 Problem We Solve

**Challenge**: Users want to track what they've watched, discover new content matching their taste, and get recommendations - all on their mobile devices without lag or slow loading.

**Our Solution**: A performant, mobile-first web app with instant interactions, smooth scrolling, and AI-powered conversational discovery.

---

## ⭐ Key Features (What Makes This Project Stand Out)

| Feature | Technical Implementation |
|---------|--------------------------|
| **Mobile-First Design** | Optimized for 60fps scrolling, zero lag |
| **AI Chat Interface** | Conversational recommendations with fast caching |
| **Taste Profile** | Onboarding for personalized discovery |
| **Continue Watching** | Last-viewed resume across devices |
| **Real-time Updates** | Instant watchlist & rating sync |
| **Rich Media** | Trailers, cast info, high-res posters |
| **Creator Profiles** | Public rating pages for influencers |
| **Responsive** | Tailored experience for mobile/tablet/desktop |

---

## 🛠️ Tech Stack

| Category | Technology | Why We Chose It |
|----------|------------|-----------------|
| **Framework** | Next.js 16 (App Router) | SSR/SSG, SEO, performance |
| **Language** | TypeScript | Type safety, better DX |
| **Styling** | Tailwind CSS | Utility-first, small bundle |
| **Animations** | Framer Motion | Smooth, complex animations |
| **UI Components** | Radix UI + shadcn/ui | Accessible, customizable |
| **State** | React Hooks + Context | Simple, effective |
| **API Client** | Fetch + lightweight utilities | Caching, error handling |
| **Images** | Next.js Image | Optimization, lazy loading |

---

## 📁 Project Structure

```
frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes (grouped)
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/                 # Main app routes
│   │   ├── movie/[id]/         # Movie detail page
│   │   ├── tv/[id]/           # TV detail page
│   │   ├── search/            # Search page
│   │   ├── watchlist/         # User watchlist
│   │   ├── ratings/           # User ratings
│   │   ├── profile/           # User profile
│   │   ├── creator-picks/     # Creator profiles
│   │   └── admin/             # Admin dashboard
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage (browse)
│
├── components/                 # Reusable UI components
│   ├── ui/                     # Base UI components
│   ├── movie-card.tsx          # Movie/TV card with actions
│   ├── movie-grid.tsx          # Paginated movie grid
│   ├── browse-page.tsx         # Browse movies/TV
│   ├── movie-detail-page.tsx   # Movie details
│   ├── tv-browse-page.tsx      # TV browse
│   ├── tv-detail-page.tsx      # TV details
│   ├── filter-bar.tsx          # Advanced filters
│   ├── navbar.tsx              # Navigation
│   ├── watchlist-page.tsx     # Watchlist management
│   ├── ratings-page.tsx        # Ratings management
│   ├── chat/                   # AI chat components
│   │   ├── chat-button.tsx    # Floating chat button
│   │   ├── chat-modal.tsx     # Chat interface
│   │   └── movie-suggestion-card.tsx
│   └── verification-banner.tsx # Email verification prompt
│
├── hooks/                      # Custom React hooks
│   ├── use-mobile.ts           # Mobile detection
│   └── use-auth.ts             # Authentication state
│
├── lib/                        # Utilities
│   ├── api.ts                  # API client (fetch)
│   └── utils.ts                # Helper functions
│
├── public/                     # Static assets
├── styles/                    # Global styles
│   └── globals.css            # Tailwind + custom CSS
│
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                 # Environment variables
```

---

## 💻 Development Skills Demonstrated

### Frontend Engineering
- ✅ **React Patterns** - Hooks, Context, memoization
- ✅ **Next.js Mastery** - App Router, SSR, SSG, ISR
- ✅ **TypeScript** - Strict typing, interfaces, generics
- ✅ **Responsive Design** - Mobile-first, adaptive UI
- ✅ **Performance** - Lazy loading, code splitting, image optimization

### UI/UX Development
- ✅ **CSS Architecture** - Tailwind CSS with custom design system
- ✅ **Animations** - Framer Motion for complex interactions
- ✅ **Accessibility** - ARIA labels, keyboard navigation
- ✅ **Component Design** - Reusable, composable components

### State & Data Management
- ✅ **Server State** - Lightweight in-component fetching
- ✅ **Client State** - React Context for auth/theme
- ✅ **Form Handling** - Controlled components, validation

### Developer Experience
- ✅ **Code Quality** - ESLint, Prettier, TypeScript strict
- ✅ **Performance Monitoring** - Lighthouse, Core Web Vitals
- ✅ **Error Handling** - Graceful error boundaries

---

## 🎨 Design System

### Color Palette
| Role | Color | Usage |
|------|-------|-------|
| Primary | `#14B8A6` (Teal) | CTAs, highlights |
| Background | `#0F0F0F` | Main background |
| Surface | `#1A1A1A` | Cards, modals |
| Border | `#2A2A2A` | Dividers, outlines |
| Text Primary | `#F5F5F5` | Headings, body |
| Text Secondary | `#A0A0A0` | Muted text |

### Rating System
- 🟢 **Skip** - Not recommended
- 🟡 **Timepass** - Watch if bored
- 🔵 **Go For It** - Worth watching
- ⭐ **Perfection** - Must watch

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running (http://localhost:8000)

### Installation

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

### Building for Production

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

---

## 📱 Mobile Performance Optimizations

This project implements industry-best practices for mobile performance:

| Optimization | Technique | Result |
|--------------|-----------|--------|
| **Scroll Performance** | Removed backdrop-blur on mobile | 60fps scrolling |
| **Animation Reduction** | Conditional Framer Motion | Instant taps |
| **Code Splitting** | Next.js automatic | Smaller JS bundles |
| **Image Optimization** | Next.js Image + lazy loading | Fast LCP |
| **Memoization** | React.memo on MovieCard | Fewer re-renders |
| **Touch Response** | Removed touch delays | Instant feedback |

### Breakpoints
```css
sm: 640px   # Mobile landscape
md: 768px   # Tablet
lg: 1024px  # Desktop
xl: 1280px  # Large desktop
2xl: 1536px # Extra large
```

---

## 🔗 API Integration

The frontend communicates with the backend REST API:

```typescript
// Example: Fetch trending movies
const data = await moviesAPI.getTrending();
```

### Key Endpoints Used
- `GET /movies/trending` - Trending movies
- `GET /movies/personalized` - AI recommendations
- `GET /watchlist` - User's watchlist
- `POST /ratings` - Rate a movie/TV show
- `POST /chat/ask` - AI chat

---

## 🧩 Component Architecture

### MovieCard (Most Complex Component)
```
MovieCard
├── Image (Next.js optimized)
├── Hover Overlay (Framer Motion)
│   ├── Watchlist Button
│   └── Rating Button
├── Rating Modal (AnimatePresence)
└── Toast Notification
```

### BrowsePage
```
BrowsePage
├── HeroBanner (Featured movie)
├── FilterBar (Genre, Year, Language, etc.)
└── MovieGrid
    └── MovieCard[] (paginated)
```

---

## ✨ Key UI Features

1. **Hero Banner** - Auto-rotating featured content
2. **Infinite Scroll** - Load more movies on scroll
3. **Advanced Filters** - Genre, year, rating, streaming platform
4. **AI Chat** - Floating button with conversational UI
5. **Rating System** - Unique 4-tier rating (Skip/Timepass/Go For It/Perfection)
6. **Creator Profiles** - Public rating pages
7. **Email Verification** - Prominent banner until verified

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:8000/api/v1 |

---

## 👨‍💻 Contribution

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Build: `npm run build`
6. Open a Pull Request

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie data and images
- [shadcn/ui](https://ui.shadcn.com/) for component patterns
- [Lucide](https://lucide.dev/) for icons
