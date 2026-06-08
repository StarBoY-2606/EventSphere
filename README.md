# EventSphere — AI-Powered Event & Media Management Platform

EventSphere is a production-grade full-stack media command center designed for clubs, professional photographers, event organizers, and attendees. It resolves the problem of chaotic, scattered media archives by introducing a central space optimized with **Gemini 2.0 Flash AI Auto-Tagging**, biometric **Facial Recognition** matches, **AWS S3** storage integration, social interactions, and secure **watermark download pipelines**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Motion, Recharts, Lucide |
| **Backend** | Node.js 20, Express 4, TypeScript, tsx |
| **Database** | PostgreSQL 15 (via Docker) · Prisma ORM 5.22 · JSON fallback |
| **AI** | Google Gemini 2.0 Flash (auto-tagging + face recognition) |
| **Storage** | AWS S3 · Local uploads/ fallback |
| **Auth** | Custom JWT (HMAC-SHA256) · Role-based access control |
| **Build** | Vite 6 (frontend) · esbuild (backend) |
| **Container** | Docker · Docker Compose |

---

## System Architecture

```mermaid
graph TD
    A["`**Browser Client**
    React 19 · TypeScript · Tailwind`"] -->|JWT Bearer token| B

    B["`**Express.js Server**
    server.ts · Port 3000`"]

    B --> C1["`**Auth Middleware**
    JWT verify · RBAC`"]
    B --> C2["`**Role Guard**
    ADMIN · PHOTOGRAPHER · VIEWER`"]
    B --> C3["`**Validator**
    Required field check`"]

    C1 --> D1["`**Auth Controller**
    register · login · profile`"]
    C2 --> D2["`**Events Controller**
    CRUD events`"]
    C2 --> D3["`**Media Controller**
    upload · like · comment`"]
    C2 --> D4["`**Analytics Controller**
    stats · activities`"]
    C2 --> D5["`**Notifications Controller**
    like · comment alerts`"]

    D1 --> E1["`**DB Service**
    Prisma ORM · JSON fallback`"]
    D2 --> E1
    D3 --> E1
    D3 --> E2["`**S3 Service**
    AWS S3 · local fallback`"]
    D3 --> E3["`**AI Service**
    Gemini 2.0 Flash`"]

    E1 --> F1[(`PostgreSQL 15`)]
    E1 --> F2[(`data.json fallback`)]
    E2 --> F3[(`AWS S3 · uploads/`)]
    E3 --> F4[(`Gemini API`)]

    D1 --> G1["`**JWT Utils**
    sign · verify · expiry`"]
    D3 --> G2["`**Watermark Engine**
    SVG overlay`"]
    D2 --> G3["`**QR Generator**
    event share links`"]
```

---

## Folder Architecture

```
CIG_PS/
├── backend/                          # Express.js API
│   ├── prisma/
│   │   ├── schema.prisma             # Database models (9 tables)
│   │   ├── seed.ts                   # Demo data seeder
│   │   └── migrations/               # SQL migration history
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts              # Prisma + S3 + JWT config
│   │   ├── controllers/
│   │   │   ├── authController.ts     # Register, login, profile, selfie
│   │   │   ├── eventController.ts    # CRUD events
│   │   │   ├── albumController.ts    # CRUD albums
│   │   │   ├── mediaController.ts    # Upload, like, comment, face scan
│   │   │   ├── notificationController.ts
│   │   │   └── analyticsController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verify + RBAC requireRole()
│   │   │   └── validate.ts           # Request body validation
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── events.ts
│   │   │   ├── albums.ts
│   │   │   ├── media.ts
│   │   │   ├── notifications.ts
│   │   │   └── analytics.ts
│   │   ├── services/
│   │   │   ├── dbService.ts          # Prisma + JSON dual backend
│   │   │   ├── s3Service.ts          # AWS S3 + local fallback
│   │   │   └── aiService.ts          # Gemini AI tagging + face match
│   │   ├── utils/
│   │   │   ├── jwt.ts                # Token sign + verify
│   │   │   ├── watermark.ts          # SVG watermark engine
│   │   │   └── qr.ts                 # QR code generator
│   │   └── types.ts                  # Shared TypeScript types
│   ├── public/uploads/               # Local file storage fallback
│   ├── data.json                     # JSON storage (auto-created)
│   ├── activities.json               # Activity log (auto-created)
│   ├── server.ts                     # Express entry point
│   ├── vite.config.ts                # Vite build config
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                         # React 19 App
│   ├── index.html                    # Vite entry point
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── login/page.tsx        # Auth page (login + register)
│       │   ├── dashboard/page.tsx    # Events grid + analytics
│       │   ├── events/[id]/page.tsx  # Event gallery + lightbox
│       │   ├── upload/page.tsx       # Drag-and-drop photo uploader
│       │   ├── my-photos/page.tsx    # Face recognition search
│       │   └── types.ts              # Frontend types
│       ├── components/
│       │   ├── LandingPage.tsx
│       │   ├── AuthPages.tsx
│       │   ├── DashboardSubviews.tsx
│       │   ├── EventsView.tsx
│       │   ├── AIPhotosView.tsx
│       │   ├── EventSphereLogo.tsx
│       │   ├── RecentActivityFeed.tsx
│       │   └── Navbar.tsx            # Nav + notifications
│       ├── utils/
│       │   ├── api.ts                # Fetch wrapper + JWT auth
│       │   └── socket.ts             # Socket.IO client helpers
│       ├── index.css
│       └── main.tsx
│
| 
│                 
│   
│   
│
├── Dockerfile                        # Multi-stage production build
├── .dockerignore
├── docker-compose.yml                # PostgreSQL + app containers
├── .gitignore
├── README.md
├── DEPLOYMENT.md
└── metadata.json
```

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | v20+ |
| npm | v9+ |
| Docker Desktop | v4.20+ |
| PostgreSQL | v15 (via Docker) |

---

## Quick Start

### Step 1 — Clone and setup environment
```bash
cd backend
cp .env.example .env
```

Edit `.env` and set:
```env
JWT_SECRET=your_long_random_secret_here
DB_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventsphere
GEMINI_API_KEY=your_gemini_key_from_aistudio_google_com
```

### Step 2 — Start the database
```bash
# From root cig_ps/ folder
docker compose up -d db
```

### Step 3 — Install dependencies
```bash
cd backend
npm install
```

### Step 4 — Generate Prisma client & run migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Step 5 — Seed demo data
```bash
npx prisma db seed
```

### Step 6 — Run the app
```bash
npm run dev
```

Open: **http://localhost:3000**

---

## Login Credentials

| Email | Password | Role | Access |
|---|---|---|---|
| `admin@eventsphere.com` | `admin123` | ADMIN | Full access — manage users, events, analytics |
| `photographer@eventsphere.com` | `photo123` | PHOTOGRAPHER | Upload photos, create albums |
| `member@eventsphere.com` | `member123` | CLUB_MEMBER | View, like, comment, face scan |
| `viewer@eventsphere.com` | `viewer123` | VIEWER | Read-only public events |

---

## Database Schema

9 models managed by Prisma ORM:

| Model | Purpose |
|---|---|
| `User` | Auth, profiles, selfie reference |
| `Event` | Events with PUBLIC/PRIVATE visibility |
| `Album` | Photo albums per event |
| `Media` | Photos with AI tags, likes, comments |
| `Comment` | Comments on media |
| `Like` | Likes on media (unique per user) |
| `Favourite` | Saved media (unique per user) |
| `Notification` | LIKE / COMMENT / SYSTEM alerts |
| `FaceEmbedding` | AI face recognition vectors |

---

## Storage Modes

| Mode | When | Where files go |
|---|---|---|
| **JSON** (default) | No `DB_PROVIDER` set | `backend/data.json` |
| **PostgreSQL** | `DB_PROVIDER=postgresql` | Docker / Neon / AWS RDS |
| **Local uploads** | No AWS keys set | `backend/public/uploads/` |
| **AWS S3** | AWS credentials in `.env` | S3 bucket |

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register (defaults to VIEWER) |
| POST | `/login` | Public | Login, returns JWT token |
| GET | `/me` | Auth | Get current user profile |
| POST | `/selfie` | Auth | Upload face recognition selfie |
| DELETE | `/selfie` | Auth | Delete selfie |
| POST | `/profile` | Auth | Update display name |

### Events — `/api/events`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List events (PRIVATE filtered for viewers) |
| POST | `/` | ADMIN | Create event |
| PUT | `/:id` | ADMIN | Update event |
| DELETE | `/:id` | ADMIN | Delete event + cascade |

### Albums — `/api`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/events/:eventId/albums` | Public | List albums for event |
| POST | `/albums` | ADMIN, PHOTOGRAPHER | Create album |
| DELETE | `/albums/:id` | ADMIN, PHOTOGRAPHER | Delete album |

### Media — `/api`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/albums/:albumId/media` | Public | List media in album |
| POST | `/media` | ADMIN, PHOTOGRAPHER | Upload photo → S3 + AI tags |
| DELETE | `/media/:id` | ADMIN, PHOTOGRAPHER | Delete media |
| POST | `/media/:id/like` | Auth | Toggle like |
| POST | `/media/:id/favourite` | Auth | Toggle favourite |
| GET | `/media/:id/comments` | Public | Get comments |
| POST | `/media/:id/comments` | Auth | Add comment |
| GET | `/media/download/:id` | Public | Download with watermark |
| POST | `/face-recognition/scan` | Auth | Run Gemini face match |

### Other
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/notifications` | Auth | Get user notifications |
| POST | `/api/notifications/read-all` | Auth | Mark all as read |
| POST | `/api/notifications/:id/read` | Auth | Mark one as read |
| GET | `/api/analytics/dashboard` | ADMIN | Dashboard statistics |
| GET | `/api/analytics/activities` | ADMIN | Activity audit log |

---

## Docker

### Development (DB only + npm)
```bash
# Start only the database
docker compose up -d db

# Run app locally
cd backend && npm run dev
```

### Production (fully containerized)
```bash
# Build and start everything
docker compose up -d --build
```

### Verify build
```bash
docker build --progress=plain -t eventsphere-test .
docker run -d --name eventsphere-test -p 3001:3000 --env-file backend/.env --network cig_ps_default eventsphere-test
docker logs eventsphere-test
# Open http://localhost:3001
```

### Cleanup
```bash
docker stop eventsphere-test
docker rm eventsphere-test
docker rmi eventsphere-test
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ Yes | Min 32 char random string |
| `DB_PROVIDER` | ✅ Yes | `postgresql` or leave blank for JSON |
| `DATABASE_URL` | ✅ Yes (if PostgreSQL) | PostgreSQL connection string |
| `GEMINI_API_KEY` | ❌ Optional | From aistudio.google.com — offline fallback if missing |
| `AWS_ACCESS_KEY_ID` | ❌ Optional | AWS credentials — local fallback if missing |
| `AWS_SECRET_ACCESS_KEY` | ❌ Optional | AWS credentials |
| `AWS_S3_BUCKET_NAME` | ❌ Optional | S3 bucket name |
| `AWS_REGION` | ❌ Optional | AWS region (default: us-east-1) |
| `PORT` | ❌ Optional | Server port (default: 3000) |
| `APP_URL` | ❌ Optional | Base URL for QR code generation |

---

## Daily Development Workflow

```bash
# Every day — just two commands:
docker compose up -d db
cd backend && npm run dev
```

---

## Prisma Commands Reference

| Command | When |
|---|---|
| `npx prisma generate` | After npm install or schema changes |
| `npx prisma migrate dev --name xyz` | After changing schema.prisma |
| `npx prisma migrate deploy` | Production deployment |
| `npx prisma db seed` | Populate demo data |
| `npx prisma studio` | Visual database browser at localhost:5555 |
| `npx prisma migrate reset` | Wipe and re-seed (dev only) |
