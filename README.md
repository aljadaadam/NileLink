# NileLink 🌊

**MikroTik Hotspot Management SaaS Platform**

A modern web-based platform for managing MikroTik hotspot networks. Network owners (cafés, hotels, ISPs) can connect their MikroTik routers and manage WiFi users and vouchers from a central dashboard.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4** — 2-color theme (Cyan/Teal + Amber)
- **Prisma ORM** + PostgreSQL
- **NextAuth.js v5** — Credentials authentication
- **next-intl** — Arabic & English (RTL-ready)
- **MikroTik RouterOS API** — Direct router integration

## Features

- ✅ User Registration & Authentication
- ✅ Multi-router management with API keys
- ✅ Hotspot voucher generation & printing
- ✅ Flexible packages (time, data, speed limits)
- ✅ Hotspot user management & session tracking
- ✅ Custom captive portal login pages
- ✅ Dashboard with real-time statistics
- ✅ Arabic/English with full RTL support
- ✅ MikroTik API integration for live router control

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- MikroTik router(s) with API enabled

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and secret

# Push database schema
npm run db:push

# Seed demo data (optional)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login

- **Email:** demo@nilelink.com
- **Password:** demo123

## MikroTik Router Setup

1. Add a router in the NileLink dashboard
2. Copy the generated API key
3. On your MikroTik router, configure the hotspot to use NileLink's authentication endpoint:

```
/ip hotspot walled-garden ip
add dst-host=your-nilelink-domain.com action=accept

/ip hotspot profile
set [find] login-by=http-chap http-cookie-lifetime=1d \
  login-by=https html-directory="" \
  http-proxy=0.0.0.0:0
```

The authentication API endpoint is:
```
POST /api/hotspot/auth
Body: { "apiKey": "nl_...", "username": "...", "password": "...", "mac": "...", "ip": "..." }
```

## Project Structure

```
NileLink/
├── prisma/              # Database schema & seed
├── messages/            # i18n translations (en, ar)
├── src/
│   ├── app/
│   │   ├── [locale]/    # Localized pages
│   │   │   ├── auth/    # Login & Register
│   │   │   └── dashboard/
│   │   │       ├── routers/
│   │   │       ├── packages/
│   │   │       ├── vouchers/
│   │   │       ├── users/
│   │   │       ├── login-pages/
│   │   │       └── settings/
│   │   └── api/         # REST API routes
│   ├── components/      # React components
│   ├── lib/             # Auth, Prisma, MikroTik, utils
│   ├── i18n/            # Internationalization config
│   └── types/           # TypeScript types
└── middleware.ts        # i18n routing middleware
```

## License

MIT
