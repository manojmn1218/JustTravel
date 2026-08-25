# 🌍 JustTravel — Modern Full-Stack Travel & Tourism Platform

<div align="center">

![JustTravel Banner](https://img.shields.io/badge/JustTravel-Travel%20Booking%20Platform-0284c7?style=for-the-badge&logo=compass&logoColor=white)

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)
[![Twilio](https://img.shields.io/badge/Twilio_SMS-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://www.twilio.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**A production-ready, full-stack travel booking application with destination discovery, Razorpay checkout, Twilio SMS verification, tiered cancellation refunds, and an intuitive Admin dashboard.**

[Explore Features](#-key-features) • [Tech Stack](#️-tech-stack) • [Quick Start](#-quick-start) • [Deployment](#-deployment-guide)

</div>

---

## 📖 Table of Contents

- [✨ Key Features](#-key-features)
  - [Traveler Experience](#-traveler-experience)
  - [Admin Management Portal](#-admin-management-portal)
  - [Security & Architecture Highlights](#-security--architecture-highlights)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Architecture](#-project-architecture)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [🚢 Deployment Guide](#-deployment-guide)
  - [Docker](#docker)
  - [Railway (Backend API)](#railway-backend-api)
  - [Vercel (Frontend SPA)](#vercel-frontend-spa)
- [📜 Available Scripts](#-available-scripts)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Key Features

### 🌟 Traveler Experience

- **Destination Discovery**: Browse curated holiday destinations categorized into **Beach**, **City**, and **Mountain** with ratings, pricing, and duration filters.
- **Deals & Offers**: Special discount packages with early-bird badges and seasonal promotions.
- **Customizable Booking Engine**: Dynamic booking calendar, traveler count selection, and instant price calculation in INR (₹).
- **Secure Payment Checkout**: Integrated with **Razorpay** supporting live orders, test cards, UPI, and HMAC SHA256 signature verification.
- **Instant Booking Confirmation**: Printable booking confirmations and real-time status tracking.
- **Booking History & Refunds**: View past and active trips with automatic refund calculation based on cancellation date:
  - `> 7 days`: **90% Refund**
  - `3 - 7 days`: **50% Refund**
  - `< 3 days`: **0% Refund (Non-refundable)**
- **User Profile Management**: Edit personal info, upload avatar, and verify phone numbers with **Twilio SMS OTP**.
- **Customer Support**: Direct feedback and inquiry submission form.

### 🛡️ Admin Management Portal

- **Dashboard Analytics**: Real-time stats showing total active users, bookings, customer feedback messages, and cumulative revenue.
- **Booking Administration**: View complete booking registries across all users with travel dates and payment status.
- **User Directory**: View registered travelers and manage accounts (with protection against self-deletion).
- **Destination Management**: Create, update, and delete travel packages directly from the admin panel.
- **Inquiry Management**: Review customer feedback and support queries.

### 🔒 Security & Architecture Highlights

- **Authentication**: JWT token-based authentication with Role-Based Access Control (`user` vs `admin`).
- **Data Protection**: Secure password hashing with `bcrypt`, HTTP security headers with `helmet`, and CORS whitelisting.
- **API Defense**: `express-rate-limit` (120 req/min) and strict request validation powered by `zod`.
- **OTP Verification Engine**: Twilio SMS delivery with automatic development simulation fallback.

---

## 🛠️ Tech Stack

| Layer               | Technologies                                                                                          |
| :------------------ | :---------------------------------------------------------------------------------------------------- |
| **Frontend UI**     | **React 19**, **TypeScript**, **Vite 6**, **Tailwind CSS v4**, **Framer Motion**, **React Router v7** |
| **Backend API**     | **Node.js 20+**, **Express 5**, **TypeScript**, **TSX** (Dev watcher)                                 |
| **Database & ORM**  | **PostgreSQL**, **Prisma ORM 6**                                                                      |
| **Auth & Security** | **JWT (jsonwebtoken)**, **bcrypt**, **Helmet**, **CORS**, **Express Rate Limit**, **Zod**             |
| **Integrations**    | **Razorpay** (Payments), **Twilio** (SMS Verification)                                                |
| **DevOps & Cloud**  | **Docker** (Multi-stage Alpine), **Railway** (API), **Vercel** (SPA)                                  |

---

## 📂 Project Architecture

```plaintext
JustTravel/
├── backend/                  # Express + TypeScript API Server
│   ├── prisma/
│   │   ├── schema.prisma     # Prisma Data Models (User, Booking, Location, Feedback, OTP)
│   │   └── seed.ts           # Database Seeder (Admin account + sample destinations)
│   ├── src/
│   │   ├── db/               # Prisma client singleton instance
│   │   ├── lib/              # JWT signing, async wrapper, helper functions
│   │   ├── middleware/       # Auth guards, RBAC, and Zod validator middlewares
│   │   ├── routes/           # REST routes (auth, bookings, payments, locations, admin, otp)
│   │   ├── app.ts            # Express application setup, middlewares, and CORS
│   │   ├── env.ts            # Typed environment variable loader (Zod)
│   │   ├── errors.ts         # Centralized error handler & HttpError class
│   │   └── server.ts         # Server entry point
│   ├── .env.example          # Backend environment template
│   └── package.json
│
├── frontend/                 # React 19 + Vite Single Page Application
│   ├── src/
│   │   ├── assets/           # Static images, icons, and illustrations
│   │   ├── components/       # Reusable UI components (Navbar, Footer, Modals, Cards)
│   │   ├── features/         # Feature-specific logic & custom hooks
│   │   ├── pages/            # Page Views (HomePage, ExplorePage, DealsPage, BookPage,
│   │   │   │                 #   PaymentPage, ProfilePage, SupportPage, Admin dashboards)
│   │   │   └── admin/        # Admin control views (Stats, Bookings, Feedback)
│   │   ├── lib/              # API clients, auth helpers, utility functions
│   │   ├── App.tsx           # Route definitions & protected route guards
│   │   ├── index.css         # Tailwind CSS styling entry
│   │   └── main.tsx          # React application root
│   ├── .env.example          # Frontend environment template
│   └── package.json
│
├── Dockerfile                # Production multi-stage Docker build
├── railway.toml              # Railway backend deployment config
├── vercel.json               # Vercel SPA routing rewrite config
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: `20.x` or higher (Node 22 recommended)
- **Package Manager**: `npm` (comes with Node.js)
- **Database**: Local **PostgreSQL** instance or a cloud PostgreSQL database (e.g. Supabase / Neon / Railway)

---

### 1. Clone Repository

```bash
git clone https://github.com/manojmn1218/JustTravel.git
cd JustTravel
```

---

### 2. Backend Setup

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment File**:
   Copy the provided `.env.example` to create your local `.env` and fill in your configuration:

   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.example .env
   # On macOS / Linux:
   cp .env.example .env
   ```

4. **Run Prisma Migrations & Seed Database**:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

5. **Start the Backend Development Server**:
   ```bash
   npm run dev
   ```
   _Backend API will run at `http://localhost:4000` (Health check: `http://localhost:4000/api/health`)._

---

### 3. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment File**:
   Copy the `.env.example` to `.env`:

   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.example .env
   # On macOS / Linux:
   cp .env.example .env
   ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   _Open your browser and navigate to `http://localhost:5173`._

---

## 🚢 Deployment Guide

### Docker

Build and run the backend container:

```bash
# Build the Docker image
docker build -t justtravel-backend .

# Run container
docker run -d -p 4000:4000 --env-file backend/.env --name justtravel-api justtravel-backend
```

---

### Railway (Backend API)

1. Push your code to GitHub.
2. Link your repository in [Railway.app](https://railway.app/).
3. Add a **PostgreSQL** database service in your Railway project.
4. Add the required environment variables in your Railway API service configuration.
5. Railway automatically utilizes the root [`Dockerfile`](Dockerfile) and [`railway.toml`](railway.toml) to build, run migrations, seed initial data, and serve the API.

---

### Vercel (Frontend SPA)

1. Import the repository in [Vercel](https://vercel.com/).
2. Select **`frontend`** as the **Root Directory**.
3. Framework Preset: **Vite**.
4. Configure your backend API base URL environment variable in Vercel settings.
5. Deploy! Vercel will handle the build (`npm run build`) and route rewrites using [`vercel.json`](vercel.json).

---

## 📜 Available Scripts

### Backend (`/backend`)

| Command                   | Description                                  |
| :------------------------ | :------------------------------------------- |
| `npm run dev`             | Starts server in watch mode via `tsx`        |
| `npm run build`           | Compiles TypeScript into `dist/`             |
| `npm start`               | Runs compiled production server              |
| `npm run prisma:generate` | Generates Prisma Client types                |
| `npm run prisma:migrate`  | Runs database migrations                     |
| `npm run prisma:seed`     | Seeds admin account and default destinations |
| `npm run lint`            | Lints backend code with ESLint               |
| `npm run format`          | Formats code with Prettier                   |

### Frontend (`/frontend`)

| Command           | Description                                         |
| :---------------- | :-------------------------------------------------- |
| `npm run dev`     | Launches Vite local development server              |
| `npm run build`   | Typechecks and creates production bundle in `dist/` |
| `npm run preview` | Previews production build locally                   |
| `npm run lint`    | Runs ESLint analysis on React components            |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve JustTravel:

1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'feat: Add AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

<div align="center">

Made with ❤️ for passionate travelers worldwide.

[⬆ Back to Top](#-justtravel--modern-full-stack-travel--tourism-platform)

</div>
