# 🐛 VedaAI Bug Tracker

> Internal bug management platform for the VedaAI team — report, track, assign, discuss, and resolve bugs in one place.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=flat-square&logo=postgresql)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-white?style=flat-square&logo=socket.io)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)

---

## 📋 What Does This App Do?

VedaAI Bug Tracker is a **full-stack web app** where your entire team — developers, QA, PMs, designers, ops — can:

- 🆕 **Report bugs** with title, description, severity, module, category
- 👤 **Assign bugs** to team members with due dates
- 🔄 **Track status** — Open → In Progress → Fixed → Closed → Reopened
- 💬 **Discuss** via real-time comments on each bug
- 📊 **Dashboard** showing total/open/overdue/resolved bugs with charts
- 🔔 **Get notified** when bugs are assigned to you or status changes
- 📁 **Upload attachments** — screenshots, logs, files
- 🕵️ **Audit trail** — every status change is logged automatically

---

## ✅ PRD Requirements Coverage

| Feature | Status |
|---|---|
| Bug Creation (title, description, category, severity) | ✅ |
| Module/Feature Selection | ✅ |
| Severity Levels (High, Medium, Low) | ✅ |
| Bug Assignment to team members | ✅ |
| Due Date Management | ✅ |
| Status Workflow (Open → In Progress → Fixed → Closed → Reopened) | ✅ |
| Attachments upload | ✅ |
| Comments & Collaboration (real-time) | ✅ |
| In-app Notifications | ✅ |
| Dashboard — Total / Open / In Progress / Fixed / Closed / Reopened / Overdue | ✅ |
| Bugs Assigned / Resolved / Pending Per Team Member | ✅ |
| My Bugs — Assigned to Me / Reported by Me / Due Today / Overdue | ✅ |
| Role-Based Access (Admin, PM, Developer, QA, Viewer) | ✅ |
| Audit Log (every change tracked) | ✅ |
| Web Application | ✅ |
| Mobile Responsive | ✅ (Tailwind responsive) |
| AI Bug Summaries | 🔜 Future (Claude API ready to plug in) |
| Duplicate Bug Detection | 🔜 Future |
| Slack Integration | 🔜 Future |
| WhatsApp Notifications | 🔜 Future |
| Advanced Analytics | 🔜 Future |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand + React Query (TanStack) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL via Prisma ORM |
| Real-time | Socket.io |
| Auth | JWT (HTTP-only cookies) |
| File Uploads | Multer → AWS S3 (optional) |
| Email | Resend (optional) |
| Hosting (recommended) | Vercel (FE) + Railway (BE) + Neon (DB) |

---

## 🚀 Getting Started (Local Setup)

> Total time: ~15 minutes. Follow every step in order.

### Prerequisites

Before starting, make sure you have these installed:

- **Node.js 18+** → Download from [nodejs.org](https://nodejs.org) (click "LTS" version)
- **npm** → Comes with Node.js automatically
- **Git** → [git-scm.com](https://git-scm.com)

To verify, open your terminal/cmd and run:
```bash
node --version   # Should say v18.x.x or higher
npm --version    # Should say 9.x.x or higher
```

---

### Step 1 — Get the Code

```bash
# Clone the repo
git clone https://github.com/your-username/vedaai-bug-tracker.git

# Go into the project folder
cd vedaai-bug-tracker
```

You'll see two folders inside: `backend/` and `frontend/`. You need to set up both.

---

### Step 2 — Set Up a Free Database (5 minutes)

You need a PostgreSQL database. The easiest free option is **Neon**.

1. Go to [neon.tech](https://neon.tech) → Click **"Sign Up Free"**
2. Sign in with GitHub
3. Click **"New Project"** → Give it any name → Click **"Create Project"**
4. You'll see a screen with a connection string. Click **"Copy"**

It looks like this:
```
postgresql://aditya:abc123@ep-cool-rain-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Save this string — you'll need it in Step 3.**

> **Alternative:** If you have PostgreSQL installed locally, use:
> `postgresql://postgres:YOUR_PASSWORD@localhost:5432/vedaai_bugs`
> First create the DB: `psql -U postgres -c "CREATE DATABASE vedaai_bugs;"`

---

### Step 3 — Backend Setup

Open your terminal and run:

```bash
# Go into the backend folder
cd backend

# Install all Node.js packages (takes 1-2 minutes)
npm install
```

Now create your environment file:

```bash
# On Mac/Linux:
cp .env.example .env

# On Windows (Command Prompt):
copy .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env
```

Open the `.env` file in any text editor (VS Code, Notepad, etc.) and fill in these values:

```env
# REQUIRED — Paste your Neon/Postgres connection string here
DATABASE_URL="postgresql://your-connection-string-here"

# REQUIRED — Make up any secret string (min 32 characters)
JWT_SECRET="vedaai-super-secret-key-2025-change-this-please"

# REQUIRED — Leave as-is for local development
FRONTEND_URL="http://localhost:3000"

# Leave PORT as 5000 (or change if port is busy)
PORT=5000
NODE_ENV=development
```

Now set up the database:

```bash
# Step 3a: Generate Prisma database client
npm run db:generate

# Step 3b: Create all tables in your database
npm run db:push

# Step 3c: Add demo data (4 users + 4 sample bugs)
npm run db:seed
```

After `db:seed`, you'll see:
```
✅ Seed complete!

👤 Test accounts (all passwords: password123):
   admin@vedaai.com  → ADMIN
   pm@vedaai.com     → PM
   dev@vedaai.com    → DEVELOPER
   qa@vedaai.com     → QA
```

Start the backend server:

```bash
npm run dev
```

You should see:
```
🚀 VedaAI Bug Tracker server running on port 5000
📡 Socket.io ready
🌍 Environment: development
```

**Keep this terminal open.** Backend is now running.

---

### Step 4 — Frontend Setup

Open a **new terminal window** (keep the backend one running):

```bash
# From the project root, go into frontend
cd frontend

# Install all packages (takes 1-2 minutes)
npm install
```

Create the frontend environment file:

```bash
# Mac/Linux:
cp .env.local.example .env.local

# Windows CMD:
copy .env.local.example .env.local

# Windows PowerShell:
Copy-Item .env.local.example .env.local
```

The `.env.local` file already has the right values for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

> You don't need to change anything here for local dev.

Start the frontend:

```bash
npm run dev
```

You'll see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
- Ready in 2.3s
```

---

### Step 5 — Open the App

Go to: **[http://localhost:3000](http://localhost:3000)**

You'll be redirected to the login page. Use any of these test accounts:

| Email | Password | Role | What they can do |
|---|---|---|---|
| `admin@vedaai.com` | `password123` | Admin | Everything — delete bugs, manage roles |
| `pm@vedaai.com` | `password123` | PM | Create, assign, close bugs + team analytics |
| `dev@vedaai.com` | `password123` | Developer | Create & update bugs |
| `qa@vedaai.com` | `password123` | QA | Create & read bugs |

---

## 🗺️ App Pages

| Page | URL | What's there |
|---|---|---|
| Login | `/auth/login` | Sign in page with quick-login buttons |
| Dashboard | `/dashboard` | Stats cards, severity pie chart, member bar chart, recent bugs |
| All Bugs | `/bugs` | Full bug list with search + filters (status, severity) |
| Report Bug | `/bugs/new` | Form to create a new bug |
| Bug Detail | `/bugs/:id` | Full bug view — description, comments, status changer, audit log |
| My Bugs | `/my-bugs` | Your assigned bugs, reported bugs, due today, overdue |

---

## 📁 Project Structure

```
vedaai-bug-tracker/
│
├── backend/                        ← Express.js API server
│   ├── prisma/
│   │   └── schema.prisma           ← Database schema (tables & relationships)
│   ├── src/
│   │   ├── index.js                ← Server entry point (starts Express + Socket.io)
│   │   ├── routes/                 ← URL route definitions
│   │   │   ├── auth.routes.js      ← /api/auth/*
│   │   │   ├── bug.routes.js       ← /api/bugs/*
│   │   │   ├── comment.routes.js   ← /api/comments/*
│   │   │   ├── user.routes.js      ← /api/users/*
│   │   │   ├── notification.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── attachment.routes.js
│   │   ├── controllers/            ← Business logic (what happens on each route)
│   │   │   ├── auth.controller.js  ← Login, register, JWT
│   │   │   └── bug.controller.js   ← CRUD bugs, status changes
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  ← JWT verification + RBAC
│   │   │   └── error.middleware.js ← Global error handler
│   │   ├── services/
│   │   │   ├── socket.service.js   ← Real-time Socket.io handlers
│   │   │   ├── notification.service.js
│   │   │   └── audit.service.js    ← Logs every bug change
│   │   └── utils/
│   │       ├── prisma.js           ← Database client singleton
│   │       └── seed.js             ← Demo data script
│   ├── .env.example                ← Copy this to .env and fill values
│   └── package.json
│
├── frontend/                       ← Next.js 14 React app
│   ├── src/
│   │   ├── app/                    ← Pages (Next.js App Router)
│   │   │   ├── auth/login/page.tsx ← Login page
│   │   │   ├── dashboard/          ← Dashboard page + layout
│   │   │   ├── bugs/               ← Bug list, new bug form, bug detail
│   │   │   └── my-bugs/            ← Personal bug view
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx     ← Left navigation bar
│   │   │   │   └── Providers.tsx   ← React Query + auth init wrapper
│   │   │   └── ui/
│   │   │       └── Toaster.tsx     ← Toast notifications
│   │   └── lib/
│   │       ├── api.ts              ← Axios HTTP client (auto-attaches JWT)
│   │       ├── store.ts            ← Zustand auth state (user, token, login/logout)
│   │       ├── socket.ts           ← Socket.io connection hook
│   │       └── utils.ts            ← Colors for status/severity, date helpers
│   ├── .env.local.example          ← Copy this to .env.local
│   └── package.json
│
└── README.md                       ← This file
```

---

## 🔌 API Reference

All API routes are prefixed with `/api`. JWT token is sent automatically via cookie or `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/auth/register` | `{name, email, password, role}` | Create new account |
| `POST` | `/auth/login` | `{email, password}` | Login, returns JWT |
| `POST` | `/auth/logout` | — | Clear cookie |
| `GET` | `/auth/me` | — | Get logged-in user |
| `PUT` | `/auth/me` | `{name, avatarUrl}` | Update profile |
| `PUT` | `/auth/me/password` | `{currentPassword, newPassword}` | Change password |

### Bugs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/bugs` | All | List bugs (with filters: status, severity, search, page) |
| `POST` | `/bugs` | All | Create a new bug |
| `GET` | `/bugs/my` | All | Get my assigned + reported bugs |
| `GET` | `/bugs/overdue` | All | Get all overdue bugs |
| `GET` | `/bugs/:id` | All | Get full bug detail |
| `PUT` | `/bugs/:id` | All | Update bug details |
| `PATCH` | `/bugs/:id/status` | All | Change bug status |
| `PATCH` | `/bugs/:id/assign` | PM / Admin | Assign bug to user |
| `DELETE` | `/bugs/:id` | Admin only | Delete a bug |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/comments/bug/:bugId` | Get all comments for a bug |
| `POST` | `/comments/bug/:bugId` | Add comment to a bug |
| `PUT` | `/comments/:id` | Edit your comment |
| `DELETE` | `/comments/:id` | Delete your comment |

### Other
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Aggregated stats for dashboard |
| `GET` | `/users` | List all active users |
| `PATCH` | `/users/:id/role` | Update user role (Admin only) |
| `GET` | `/notifications` | Get your notifications |
| `PATCH` | `/notifications/:id/read` | Mark notification as read |
| `PATCH` | `/notifications/read-all` | Mark all as read |
| `POST` | `/attachments/bug/:bugId` | Upload files to a bug |
| `DELETE` | `/attachments/:id` | Delete an attachment |

---

## 🔐 Role Permissions

| Permission | Viewer | QA | Developer | PM | Admin |
|---|---|---|---|---|---|
| View bugs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create bug | ❌ | ✅ | ✅ | ✅ | ✅ |
| Update bug | ❌ | ❌ | ✅ | ✅ | ✅ |
| Assign bug | ❌ | ❌ | ❌ | ✅ | ✅ |
| Close bug | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete bug | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| View analytics | Own | Own | Own | Team | Full |

---

## ⚡ Real-time Features (Socket.io)

The app uses WebSockets for live updates — no need to refresh the page.

| Event | Trigger | Who receives it |
|---|---|---|
| `bug:created` | New bug reported | Everyone |
| `bug:updated` | Bug details edited | Users viewing that bug |
| `bug:status_changed` | Status changed | Users viewing that bug |
| `bug:assigned` | Bug assigned | Users viewing that bug |
| `comment:new` | Comment added | Users viewing that bug |
| `comment:updated` | Comment edited | Users viewing that bug |
| `comment:deleted` | Comment deleted | Users viewing that bug |
| `dashboard:refresh` | Any status change | Dashboard page |

---

## 🗄️ Database Schema

```
users          → id, name, email, password, role, avatarUrl, isActive
bugs           → id, title, description, status, severity, module, category, dueDate, reporterId, assigneeId
comments       → id, content, bugId, userId
attachments    → id, fileName, s3Key, s3Url, bugId, uploadedById
audit_logs     → id, bugId, userId, action, field, oldValue, newValue
notifications  → id, userId, type, title, message, payload, readAt
```

---

## 🌐 Deploying to Production

### Deploy Backend → Railway (Free Tier Available)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select your repo → choose the `backend` folder as root
4. Add all environment variables (same as your `.env` file)
5. Set `NODE_ENV=production`
6. Railway gives you a URL like: `https://vedaai-backend.railway.app`

### Deploy Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL = https://vedaai-backend.railway.app/api
   NEXT_PUBLIC_SOCKET_URL = https://vedaai-backend.railway.app
   ```
4. Click Deploy — Vercel handles everything else

### Database → Neon (Already cloud, nothing to do)

Just make sure your Railway backend has the same `DATABASE_URL` from Neon.

### Final checklist before going live:
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `FRONTEND_URL` in backend env to your Vercel URL
- [ ] Set `NODE_ENV=production` in backend
- [ ] Remove quick-login buttons from login page (or keep for internal use)
- [ ] Run `npm run db:seed` on production DB if you want demo data

---

## 🔧 Optional Features

### Enable Email Notifications (via Resend)

1. Sign up at [resend.com](https://resend.com) → Get API key (free tier: 3000 emails/month)
2. Add to `backend/.env`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=bugs@yourdomain.com
   ```
3. Call `sendEmail()` inside `notification.service.js` when creating notifications

### Enable File Attachments (via AWS S3)

1. Create an S3 bucket on AWS
2. Add to `backend/.env`:
   ```env
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET=vedaai-bug-tracker
   ```
3. Update `attachment.routes.js` to use `multer-s3` instead of memory storage

### Enable Redis (for production Socket.io scaling)

1. Get a free Redis URL from [upstash.com](https://upstash.com)
2. Add to `backend/.env`:
   ```env
   REDIS_URL=redis://your-upstash-url
   ```
3. Add `@socket.io/redis-adapter` in `socket.service.js`

---

## 🐞 Troubleshooting

**`npm install` fails with 404 error**
→ Check your internet connection. If a specific package fails, Google that package name — it may have been renamed.

**`Can't connect to database` or Prisma errors**
→ Double check your `DATABASE_URL` in `backend/.env`. Make sure there are no extra spaces or missing quotes.

**`The table does not exist` error**
→ Run `npm run db:push` again from the `backend/` folder. This creates all tables.

**`CORS error` in browser console**
→ Check that `FRONTEND_URL` in `backend/.env` is exactly `http://localhost:3000` (no trailing slash).

**`Port 5000 already in use`**
→ Change `PORT=5001` in `backend/.env`, then update `NEXT_PUBLIC_API_URL=http://localhost:5001/api` in `frontend/.env.local`.

**`Port 3000 already in use`**
→ Run `npm run dev -- -p 3001` in the frontend folder to use port 3001 instead.

**Login not working after seed**
→ Make sure `db:seed` ran without errors. All passwords are `password123`.

**Socket.io not connecting (no real-time updates)**
→ Confirm backend is running on port 5000 and `NEXT_PUBLIC_SOCKET_URL=http://localhost:5000` is in `frontend/.env.local`.

**Page shows blank or white screen**
→ Open browser DevTools (F12) → Console tab — copy the red error and Google it or ask for help.

---

## 📝 Adding a New Feature (Developer Guide)

### Add a new field to bugs (e.g., "environment"):

1. **DB** — Add to `prisma/schema.prisma`:
   ```prisma
   model Bug {
     ...
     environment String?  // add this line
   }
   ```
2. **Migrate** — Run `npm run db:push` in backend
3. **Backend** — Add `environment` to the `createBug` and `updateBug` controller destructuring
4. **Frontend** — Add a field to the bug form in `frontend/src/app/bugs/new/page.tsx`

### Add a new API route:

1. Create controller in `backend/src/controllers/`
2. Create route file in `backend/src/routes/`
3. Register in `backend/src/index.js`: `app.use('/api/your-route', yourRoute)`

---

## 🤝 Contributing

1. Fork this repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit: `git commit -m "Add: your feature description"`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

Built for **VedaAI** internal team use. Questions? Open an issue or ping the team.
