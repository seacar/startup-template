# Frontend - Next.js 16

Beautiful, production-ready landing page built with Next.js 16, Tailwind CSS, and HeadlessUI.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:13000

## 📦 What's Included

- ✅ **Next.js 16** - Latest React framework with App Router
- ✅ **Tailwind CSS v4** - Modern CSS framework with CSS-based configuration
- ✅ **HeadlessUI** - Unstyled, accessible UI components
- ✅ **Font Awesome v3** - Icon library with latest React support
- ✅ **Static Generation** - Landing page is fully static (fast!)
- ✅ **Responsive Design** - Mobile-first, beautiful on all devices

## 🎨 Features

The landing page showcases:

- Animated gradient backgrounds with floating blobs
- Interactive tabs for Quick Start vs Manual Setup
- Collapsible accordions for step-by-step guides
- Tech stack cards with hover effects
- Service status cards with live URLs
- Feature highlights with icons
- Fully responsive layout

## 🔐 Supabase (Disabled by Default)

**Supabase authentication middleware is currently disabled** to allow deployment without configuration.

**To enable Supabase:**

1. Read `SUPABASE_SETUP.md` for complete instructions
2. Rename `middleware.ts.disabled` → `middleware.ts`
3. Rename `lib/supabase.disabled` → `lib/supabase`
4. Set environment variables
5. Deploy!

## 🛠️ Build & Deploy

### Development

```bash
npm run dev          # Start dev server on port 13000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Deploy to Vercel

**Option 1: Connect via Vercel Dashboard**

1. Import your GitHub repository
2. Select root directory: `frontend`
3. Environment variables: Not required for landing page!
4. Deploy 🚀

**Option 2: Vercel CLI**

```bash
npm i -g vercel
vercel --prod
```

No environment variables needed for the landing page deployment!

## 📁 Project Structure

```
frontend/
├── app/
│   ├── globals.css         # Tailwind v4 CSS with custom animations
│   ├── layout.tsx          # Root layout with fonts
│   └── page.tsx            # Landing page (static)
├── components/
│   ├── QuickStartTabs.tsx  # Interactive tabs component
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── supabase.disabled/  # Supabase clients (disabled)
│   └── utils.ts            # Utility functions
├── stores/
│   └── useAppStore.ts      # Zustand store
├── types/
│   └── __init__.ts         # TypeScript types
├── middleware.ts.disabled   # Auth middleware (disabled)
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind v4 (CSS-based)
└── package.json
```

## 🎯 Environment Variables

### Landing Page (Current)

No environment variables required! The landing page is fully static.

### When You Enable Supabase

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## 🎨 Customization

### Colors & Gradients

Edit `app/globals.css` for custom animations and utilities.

### Landing Page Content

Edit `app/page.tsx` to update:

- Hero section text
- Service URLs
- Tech stack technologies
- Features list
- Quick start commands

### Components

Edit `components/QuickStartTabs.tsx` for setup instructions.

## 📝 Tailwind CSS v4

This project uses **Tailwind CSS v4** with CSS-based configuration:

- ❌ No `tailwind.config.ts` needed
- ✅ Import directly in CSS: `@import "tailwindcss"`
- ✅ Simpler PostCSS setup
- ✅ Faster builds with Turbopack

## 🐛 Troubleshooting

### Build fails with middleware error

- Make sure `middleware.ts` is renamed to `middleware.ts.disabled`
- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`

### Styles not loading

- Restart dev server: `npm run dev`
- Clear browser cache
- Check `app/globals.css` has `@import "tailwindcss"`

### Type errors

- Run `npm run type-check` to see all TypeScript errors
- Make sure all dependencies are installed: `npm install`

## 📚 Documentation

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [HeadlessUI Docs](https://headlessui.com/)
- [Font Awesome React](https://fontawesome.com/docs/web/use-with/react/)

## 🚀 What's Next?

1. **Deploy your landing page** - No config needed!
2. **Enable Supabase** - When you need authentication
3. **Add more pages** - Create pages in `app/` directory
4. **Customize design** - Update colors, fonts, and layout
5. **Add backend integration** - Connect to your Railway API

---

Built with ❤️ using the optimal tech stack for 2026
