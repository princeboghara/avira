# Avira Life Care Global — Enterprise Associate & MLM Portal

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase_PostgreSQL-336791?style=flat&logo=postgresql)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

An enterprise-grade direct selling, network wellness commerce, and 1:1 binary compensation platform engineered for **Avira Life Care Global**.

---

## 🌟 Key Features

### 1. 1:1 Binary Compensation Engine
- **Volume Matching**: 1 PV = ₹1 with automatic carry-forward calculation on the power leg.
- **Dynamic Daily Capping**: Determined by personal PV (e.g. 100 PV = ₹5,000 / day).
- **Automated Cutoff**: Admin cutoff endpoint `/api/admin/cron/daily-cutoff` calculates matching payouts, updates wallets, and logs ledger entries.
- **Tree Visualization**: Interactive binary downline genealogy tree (`/dashboard/tree`).

### 2. Multi-Device Responsive Design (Laptop & Mobile Optimized)
- **Top Header Bar**:
  - ☰ **3-Line Hamburger Menu**: Seamlessly slides open the **Side Menubar Drawer** on laptop, desktop, tablet, and mobile.
  - Brand identity with live connection indicators (`Supabase PostgreSQL Live`).
  - Real-time wallet balance pill and member identity badge.
- **Side Menubar Drawer**:
  - Digital member identity card with active/red status.
  - Quick navigation: Profile, Dashboard, Shopping, My Community, Binary Tree.
  - Available wallet balance and daily capping summary.
  - One-click secure sign-out.
- **Comprehensive Page Footer**:
  - Brand overview, 256-bit SSL encryption, 100% ledger audit verification.
  - Quick member navigation links, account details, and support helpdesk.

### 3. Holographic 3D Digital Associate Pass
- Interactive 3D tilt member card with holographic foil reflection.
- Displays permanent Member ID (`AV00001`), sponsor hierarchy, and verified RFID status.

### 4. Master Admin Control Portal (`/admin/dashboard`)
- Live overview of all associates, active network nodes, and wallet liabilities.
- Manual trigger for daily 1:1 binary matching cutoff.
- Associate directory management: inspect sponsor lineages, toggle active/blocked account status.
- Immutable financial ledger entries and real-time Supabase sync.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) with Server and Client Components
- **Styling**: Tailwind CSS v4 with bespoke Neomorphic and Glassmorphism design tokens
- **Database**: PostgreSQL on Supabase via high-throughput connection pooler (`pg`)
- **Authentication**: Stateless JSON Web Tokens (JWT) with HTTP-only and secure cookie storage
- **Cryptography**: `bcryptjs` password hashing with salt rounds
- **Icons**: Lucide React + Material Symbols Outlined

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ recommended (verified on v26)
- **Git**

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/princeboghara/avira.git
cd avira
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Supabase PostgreSQL Connection
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"

# JWT Secret Keys
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo & Test Credentials

| Role | Member ID / Identifier | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Root Associate** | `AV00001` | `admin123` | `/dashboard` |
| **Master Admin** | `AV00001` | `admin123` | `/admin/dashboard` |

---

## 📂 Project Architecture

```
avira/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/       # Master Admin Portal with side menubar
│   │   │   └── login/           # Admin Authentication
│   │   ├── api/
│   │   │   ├── admin/           # Admin APIs (cutoff, members, transactions)
│   │   │   ├── auth/            # Associate Auth (login, register, logout)
│   │   │   ├── tree/            # Binary tree genealogy
│   │   │   └── user/            # Profile, wallet, withdrawal endpoints
│   │   ├── dashboard/
│   │   │   ├── community/       # Team downline directory
│   │   │   ├── profile/         # Digital ID Card & associate credentials
│   │   │   ├── store/           # Product packages & PV activation
│   │   │   ├── tree/            # Interactive binary tree diagram
│   │   │   └── page.tsx         # Main Associate Dashboard
│   │   ├── login/               # Member Login
│   │   ├── register/            # Sponsor-linked Registration
│   │   ├── globals.css          # Tailwind CSS v4 styles & animation keyframes
│   │   └── layout.tsx           # Root Next.js Layout
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── MemberLayout.tsx # Universal Top Header, 3-line Drawer & Footer
│   │   │   └── MemberCard3D.tsx # Interactive Holographic 3D Pass
│   │   └── landing/             # Public marketing components
│   ├── lib/
│   │   ├── db.ts                # Supabase PostgreSQL connection pooler
│   │   └── jwt.ts               # JWT signing & verification utilities
│   └── types/
│       └── index.ts             # TypeScript interfaces (User, Transaction, etc.)
└── README.md
```

---

## 🛡️ License & Copyright

© 2026 **Avira Life Care Global Pvt Ltd**. All rights reserved.
Proprietary direct selling software. Unauthorized copying or redistribution is strictly prohibited.
