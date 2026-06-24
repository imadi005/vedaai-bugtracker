# 🐛 VedaAI Bug Tracker

> Internal bug management platform for the VedaAI team — report, track, assign, discuss, and resolve bugs in one place.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=flat-square&logo=postgresql)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-white?style=flat-square&logo=socket.io)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)
![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)

---

## 🚀 Live Demo

| | URL |
|---|---|
| 🌐 **App** | https://vedaai-bugtracker.vercel.app |
| ⚙️ **API** | https://vedaai-bugtracker.onrender.com |

### Demo Accounts

| Email | Password | Role |
|---|---|---|
| admin@vedaai.com | password123 | Admin |
| pm@vedaai.com | password123 | PM |
| dev@vedaai.com | password123 | Developer |
| qa@vedaai.com | password123 | QA |

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
| Mobile Responsive | ✅ |
| Orange + White Theme | ✅ |
| AI Bug Summaries | 🔜 Future |
| Duplicate Bug Detection | 🔜 Future |
| Slack Integration | 🔜 Future |
| WhatsApp Notifications | 🔜 Future |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS (Orange theme) |
| State | Zustand + React Query (TanStack) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL via Prisma ORM |
| Real-time | Socket.io |
| Auth | JWT (HTTP-only cookies) |
| File Uploads | Multer → AWS S3 (optional) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | Neon (serverless Postgres) |

---

## 🗺️ App Pages

| Page | URL | What's there |
|---|---|---|
| Login | `/auth/login` | Split screen — orange branding + sign in form |
| Dashboard | `/dashboard` | Stats cards, donut chart, team workload bar chart, recent bugs |
| All Bugs | `/bugs` | Full bug list with search + filter pills (status, severity) |
| Report Bug | `/bugs/new` | Friendly form with severity toggle buttons |
| Bug Detail | `/bugs/:id` | Description, real-time comments, status changer, audit log |
| My Bugs | `/my-bugs` | Assigned to me, reported by me, due today, overdue |

---

## 🚀 Local Setup (Run on your machine)

### Prerequisites
- Node.js 18+ → [nodejs.org](https://nodejs.org)
- A PostgreSQL database (Neon free tier recommended)

### Step 1 — Clone the repo
```bash
git clone https://github.com/imadi005/vedaai-bugtracker.git
cd vedaai-bugtracker
```

### Step 2 — Backend setup
```bash
cd backend
npm install

# Copy env file
cp .env.example .env   # Mac/Linux
copy .env.example .env # Windows
```

Edit `.env` and fill in:
```env
DATABASE_URL="your-postgres-connection-string"
JWT_SECRET="any-random-32-char-string"
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Create tables in DB
npm run db:seed       # Add demo users + bugs
npm run dev           # Start backend on :5000
```

### Step 3 — Frontend setup
Open a new terminal:
```bash
cd frontend
npm install

cp .env.local.example .env.local   # Mac/Linux
copy .env.local.example .env.local # Windows
```

`.env.local` already has correct defaults:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

```bash
npm run dev   # Start frontend on :3000
```

### Step 4 — Open the app
Go to **http://localhost:3000** and login with any demo account.

---

## 🌐 Deploying to Production

### Current Production Stack
| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://vedaai-bugtracker.vercel.app |
| Backend | Render | https://vedaai-bugtracker.onrender.com |
| Database | Neon | Serverless PostgreSQL |

### Deploy Backend → Render

1. [render.com](https://render.com) → **New Web Service** → Connect GitHub
2. Select `imadi005/vedaai-bugtracker`
3. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Region**: Singapore (for India)
4. Add Environment Variables:
   ```
   DATABASE_URL = your-neon-connection-string
   JWT_SECRET   = your-secret-key
   NODE_ENV     = production
   FRONTEND_URL = https://your-vercel-url.vercel.app
   PORT         = 10000
   ```
5. **Create Web Service** → Deploy!
6. Run DB setup from local machine:
   ```bash
   # Set production DATABASE_URL in local .env, then:
   npm run db:push
   npm run db:seed
   ```

### Deploy Frontend → Vercel

1. [vercel.com](https://vercel.com) → **New Project** → Import `imadi005/vedaai-bugtracker`
2. **Root Directory**: `frontend`
3. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL    = https://your-render-url.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL = https://your-render-url.onrender.com
   ```
4. **Deploy!**

---

## 📁 Project Structure

```
vedaai-bugtracker/
│
├── backend/                        ← Express.js API server
│   ├── prisma/
│   │   └── schema.prisma           ← DB schema
│   ├── src/
│   │   ├── index.js                ← Server entry point
│   │   ├── routes/                 ← API route definitions
│   │   ├── controllers/            ← Business logic
│   │   ├── middleware/             ← Auth (JWT + RBAC), error handler
│   │   ├── services/               ← Socket.io, notifications, audit log
│   │   └── utils/
│   │       ├── prisma.js           ← DB client
│   │       └── seed.js             ← Demo data script
│   ├── railway.json                ← Railway config (if using Railway)
│   ├── render.yaml                 ← Render config
│   └── .env.example
│
├── frontend/                       ← Next.js 14 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/login/         ← Login page (split screen)
│   │   │   ├── dashboard/          ← Dashboard with charts
│   │   │   ├── bugs/               ← List, detail, create
│   │   │   └── my-bugs/            ← Personal bug view
│   │   ├── components/
│   │   │   ├── layout/Sidebar.tsx  ← Navigation sidebar
│   │   │   └── layout/Providers.tsx
│   │   └── lib/
│   │       ├── api.ts              ← Axios client
│   │       ├── store.ts            ← Zustand auth store
│   │       ├── socket.ts           ← Socket.io hook
│   │       └── utils.ts            ← Colors, date helpers
│   ├── vercel.json                 ← Vercel config
│   └── .env.local.example
│
├── render.yaml                     ← Render deployment config
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

All routes prefixed with `/api`. JWT auto-attached via cookie or `Authorization: Bearer`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, get JWT |
| POST | `/auth/logout` | Clear session |
| GET | `/auth/me` | Get current user |

### Bugs
| Method | Endpoint | Access |
|---|---|---|
| GET | `/bugs` | All (filterable) |
| POST | `/bugs` | All |
| GET | `/bugs/:id` | All |
| PATCH | `/bugs/:id/status` | All |
| PATCH | `/bugs/:id/assign` | PM / Admin |
| DELETE | `/bugs/:id` | Admin only |
| GET | `/bugs/my` | All |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Aggregated stats |
| GET | `/users` | List all users |
| POST | `/comments/bug/:bugId` | Add comment |
| GET | `/notifications` | Get notifications |
| POST | `/attachments/bug/:bugId` | Upload file |

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
| Full analytics | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## ⚡ Real-time Events (Socket.io)

| Event | When | Who gets it |
|---|---|---|
| `bug:created` | New bug reported | Everyone |
| `bug:status_changed` | Status updated | Users on that bug |
| `comment:new` | Comment added | Users on that bug |
| `dashboard:refresh` | Any status change | Dashboard viewers |

---

## 🐞 Troubleshooting

**Login fails on production**
→ Check Render env vars — `DATABASE_URL` and `JWT_SECRET` must be set correctly

**CORS error in browser**
→ `FRONTEND_URL` on Render must match your exact Vercel URL (no trailing slash)

**Backend sleeping (Render free tier)**
→ First request after 15min inactivity takes ~30s to wake up. Normal on free plan.

**Socket not connecting**
→ `NEXT_PUBLIC_SOCKET_URL` must be your Render URL (no `/api` at end)

**Tables don't exist**
→ Run `npm run db:push` locally with production `DATABASE_URL` in `.env`

---

Built for **VedaAI** internal team · 20 people · Simple, fast, orange 🟠
