# Migration Guide: Vite to Next.js

This document outlines the changes made when converting the Sanskar Restro project from Vite to Next.js.

## Key Changes

### 1. Project Structure
- **Vite**: Used `index.html` as entry point with `index.tsx` mounting the React app
- **Next.js**: Uses App Router with `app/layout.tsx` and `app/page.tsx`

### 2. Component Files
All component files have been updated with:
- `'use client'` directive at the top (required for client-side interactivity)
- Updated import paths from relative (`../`) to absolute (`@/`)

### 3. Environment Variables
- **Vite**: `process.env.API_KEY`
- **Next.js**: `process.env.NEXT_PUBLIC_GEMINI_API_KEY`

All client-side environment variables must have the `NEXT_PUBLIC_` prefix.

### 4. Configuration Files

#### package.json
Changed scripts from Vite to Next.js:
```json
// Before (Vite)
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}

// After (Next.js)
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

#### Tailwind CSS
- Moved configuration from inline script in `index.html` to `tailwind.config.ts`
- Updated content paths to include Next.js directories
- Added custom animations and keyframes

### 5. Routing
- **Vite**: Client-side state management for navigation
- **Next.js**: Same client-side approach maintained (no change needed for this SPA-style app)

### 6. File Organization

```
vite project/                    next.js project/
├── index.html                  ├── app/
├── index.tsx                   │   ├── layout.tsx
├── App.tsx                     │   ├── page.tsx
├── components/                 │   └── globals.css
├── contexts/                   ├── components/
├── services/                   │   └── MainApp.tsx (wrapper)
├── constants.ts                ├── contexts/
├── types.ts                    ├── services/
├── translations.ts             ├── constants.ts
├── vite.config.ts              ├── types.ts
└── package.json                ├── translations.ts
                                ├── next.config.ts
                                ├── tailwind.config.ts
                                └── package.json
```

## Components Modified

All components in the `components/` folder have been updated with:
1. `'use client'` directive
2. Import path changes: `'../'` → `'@/'`

### Example Transformation

**Before (Vite):**
```tsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Header: React.FC<Props> = (props) => {
  // component code
};
```

**After (Next.js):**
```tsx
'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Header: React.FC<Props> = (props) => {
  // component code
};
```

## Dependencies

All dependencies remain the same:
- React 19.2.3
- Lucide React 0.561.0
- Recharts 3.5.1
- @google/genai 1.33.0

Added Next.js specific dependencies:
- next 15.1.3
- eslint-config-next 15.1.3

## Running the Projects

### Vite Version
```bash
cd sanskar-restro-ui
npm run dev
# Runs on http://localhost:5173
```

### Next.js Version
```bash
cd sanskar-restro-nextjs
npm run dev
# Runs on http://localhost:3000
```

## Benefits of Next.js Migration

1. **Better SEO**: Server-side rendering capabilities (if needed in future)
2. **Optimized Performance**: Automatic code splitting and optimization
3. **Image Optimization**: Built-in Image component (if needed in future)
4. **API Routes**: Can add backend API routes easily
5. **Production Ready**: Better deployment options (Vercel, etc.)
6. **TypeScript Support**: First-class TypeScript support
7. **File-based Routing**: Easy to add pages in the future

## Testing Checklist

After migration, verify:
- [ ] Login functionality works (both Waiter and Owner)
- [ ] All tabs navigate correctly
- [ ] Table management works
- [ ] Order creation and management
- [ ] Kitchen orders display and update
- [ ] Checkout process
- [ ] Language switching (English/Hindi)
- [ ] Gemini AI assistant (if API key configured)
- [ ] Toast notifications appear
- [ ] Owner dashboard displays correctly
- [ ] All modals open and close properly

## Known Issues

None at this time. The migration maintains feature parity with the Vite version.

## Future Enhancements Possible with Next.js

1. Server-side API for real backend integration
2. Database integration using Prisma or similar
3. Authentication with NextAuth.js
4. Real-time updates with Server-Sent Events
5. Progressive Web App (PWA) capabilities
6. Better caching strategies
