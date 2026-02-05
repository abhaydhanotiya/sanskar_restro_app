# Sanskar Restro - Next.js Version

A modern restaurant management system built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Waiter Dashboard**: Manage tables, orders, and customer service
- **Kitchen Orders**: Track and update order status
- **Menu Management**: Browse and manage menu items
- **Checkout System**: Process payments and billing
- **Owner Dashboard**: View analytics, staff management, and transaction history
- **Multi-language Support**: English and Hindi
- **Real-time Updates**: Live order tracking and table status
- **AI Assistant**: Gemini-powered menu assistant for allergen and ingredient queries

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository or navigate to the project folder:
   ```bash
   cd sanskar-restro-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local` and add your Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Login Credentials

### Owner Access
- Username: `admin`
- Password: `admin123`

### Waiter Access
- Username: Any name (e.g., `Sarah`)
- Password: Any password

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts
- **AI**: Google Gemini AI

## Project Structure

```
sanskar-restro-nextjs/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
├── contexts/              # React context providers
├── services/              # External services (Gemini AI)
├── constants.ts           # Mock data and constants
├── types.ts               # TypeScript type definitions
└── translations.ts        # i18n translations
```

## Features by User Role

### Waiter
- View and manage table status
- Create and edit orders
- Send orders to kitchen
- Request bills for tables
- Browse menu items
- Access AI assistant for menu queries

### Owner
- View sales analytics
- Monitor staff attendance
- Review transaction history
- Manage overall restaurant operations

## Migration from Vite

This project has been migrated from Vite to Next.js with the following changes:

1. Added `'use client'` directive to all interactive components
2. Updated import paths to use `@/` alias
3. Converted to Next.js App Router structure
4. Updated environment variable naming (NEXT_PUBLIC_ prefix)
5. Replaced Vite config with Next.js config
6. Updated Tailwind configuration for Next.js

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
