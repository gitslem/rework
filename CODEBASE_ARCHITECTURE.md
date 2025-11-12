# Remote Works Platform - Comprehensive Codebase Overview

## 1. PROJECT STRUCTURE

### Tech Stack
- **Backend**: FastAPI (Python 3.9+), SQLAlchemy ORM, PostgreSQL/SQLite
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query, Zustand
- **Authentication**: JWT (access + refresh tokens)
- **Payment**: Stripe (configured but not fully integrated)
- **File Storage**: S3 (structure ready)
- **Cache**: Redis (structure ready)

### Directory Layout
```
rework/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py              (JWT, Google OAuth, GitHub OAuth)
│   │   │   │   ├── users.py             (Profile management, stats)
│   │   │   │   ├── projects.py          (CRUD, filtering)
│   │   │   │   ├── applications.py      (Job applications, AI matching)
│   │   │   │   ├── ai_briefs.py         (AI project generation)
│   │   │   │   ├── sandboxes.py         (Shared code execution)
│   │   │   │   ├── proof_of_build.py    (GitHub verification, certificates)
│   │   │   │   └── collaboration.py     (Timezone overlap calculations)
│   │   │   └── dependencies.py          (JWT token validation)
│   │   ├── core/
│   │   │   ├── config.py                (Environment settings)
│   │   │   └── security.py              (Password hashing, JWT tokens)
│   │   ├── db/
│   │   │   └── database.py              (SQLAlchemy setup)
│   │   ├── models/
│   │   │   └── models.py                (All SQLAlchemy models)
│   │   └── schemas/
│   │       └── schemas.py               (All Pydantic models)
│   ├── main.py                          (FastAPI app entry point)
│   ├── requirements.txt                 (Python dependencies)
│   └── .env.example                     (Environment template)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TimezoneSelector.tsx
│   │   │   ├── TimezoneTimeline.tsx
│   │   │   └── WorkingHoursSelector.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                   (Axios HTTP client with interceptors)
│   │   │   └── authStore.ts             (Zustand auth state management)
│   │   ├── pages/
│   │   │   ├── index.tsx                (Landing page)
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── dashboard.tsx            (User dashboard)
│   │   │   ├── projects.tsx             (Project listing)
│   │   │   ├── create-project.tsx       (Project creation)
│   │   │   ├── company-dashboard.tsx    (Business dashboard)
│   │   │   ├── profile-settings.tsx     (Profile management)
│   │   │   ├── sandboxes.tsx
│   │   │   ├── proofs.tsx               (Proof-of-build)
│   │   │   ├── team-timezone.tsx        (Team collaboration)
│   │   │   └── sandbox/[id].tsx         (Sandbox editor)
│   │   └── styles/
│   │       └── globals.css              (Tailwind + global styles)
│   └── package.json
│
└── database/
    └── migrations/
        ├── 001_add_sandbox_sessions.sql
        ├── 003_proof_of_build.sql
        └── 004_add_timezone_fields.sql
```

---

## 2. DATABASE SCHEMA & EXISTING TABLES

### Core User Management
```
Users Table
├── id (PK)
├── email (unique)
├── hashed_password (nullable for OAuth)
├── google_id (OAuth)
├── github_id (OAuth)
├── github_access_token
├── role (enum: FREELANCER, AGENT, BUSINESS, ADMIN)
├── is_active
├── is_verified
├── created_at, updated_at

Profiles Table
├── id (PK)
├── user_id (FK → users)
├── first_name, last_name, bio
├── avatar_url, resume_url
├── skills (JSON array)
├── location, phone, website, linkedin
├── timezone (IANA format: "America/New_York")
├── working_hours_start (0-23)
├── working_hours_end (0-23)
├── working_days (JSON: [0-6] for Sun-Sat)
├── total_earnings, completed_projects
├── average_rating, total_reviews
├── is_agent_approved
├── agent_multiplier (default 3.0 for agents)
└── created_at, updated_at
```

### Projects & Applications
```
Projects Table
├── id (PK)
├── owner_id (FK → users)
├── title, description
├── category (string)
├── budget, deadline
├── status (enum: OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
├── required_skills (JSON array)
├── experience_level
├── requirements, attachments (JSON)
└── created_at, updated_at

Applications Table
├── id (PK)
├── project_id (FK → projects)
├── applicant_id (FK → users)
├── cover_letter
├── proposed_rate
├── status (enum: PENDING, ACCEPTED, REJECTED, WITHDRAWN)
├── ai_match_score (0-100)
└── applied_at, updated_at

AgentAssignments Table
├── id (PK)
├── project_id (FK → projects)
├── agent_id (FK → users)
├── freelancer_id (FK → users)
├── status (project status)
├── agent_earnings, freelancer_passive_earnings
└── assigned_at, completed_at
```

### Reviews & Ratings
```
Reviews Table
├── id (PK)
├── project_id (FK → projects)
├── reviewer_id (FK → users)
├── reviewee_id (FK → users)
├── rating (1-5)
├── comment (text)
└── created_at
```

### Payments (STUB - NEEDS COMPLETION)
```
Payments Table
├── id (PK)
├── project_id (FK → projects)
├── payer_id (FK → users)
├── payee_id (FK → users)
├── amount
├── platform_fee (0.1%)
├── stripe_payment_intent_id
├── status (enum: PENDING, PROCESSING, COMPLETED, FAILED)
├── created_at
└── processed_at
```

### Advanced Features
```
Notifications Table
├── id (PK)
├── user_id (FK → users)
├── title, message
├── type (string: "application", "payment", "review", etc.)
├── is_read
├── notification_data (JSON)
└── created_at

SandboxSessions Table
├── id (PK)
├── owner_id (FK → users)
├── project_id (FK → projects, nullable)
├── name, description
├── language (enum: PYTHON, JAVASCRIPT, TYPESCRIPT)
├── status (enum: ACTIVE, STOPPED, TERMINATED, ERROR)
├── files (JSON file tree)
├── execution_history (JSON array)
├── shared_with (JSON array of user IDs)
└── created_at, updated_at

ProofsOfBuild Table
├── id (PK)
├── user_id (FK → users)
├── project_id (FK → projects, nullable)
├── proof_type (enum: COMMIT, PULL_REQUEST, REPOSITORY, FILE, SCREENSHOT)
├── status (enum: PENDING, VERIFIED, FAILED, EXPIRED)
├── github_* fields (URL, hash, PR number, etc.)
├── file_* fields (name, URL, hash, size)
├── verified_at, verification_signature
├── milestone_name, milestone_description
└── created_at, updated_at

BuildCertificates Table
├── id (PK)
├── user_id (FK → users)
├── project_id (FK → projects, nullable)
├── certificate_id (unique)
├── title, description
├── milestone_name, milestone_date
├── status (enum: ACTIVE, REVOKED, EXPIRED)
├── signature, signature_algorithm
├── certificate_data (JSON)
├── badge_url
├── blockchain_tx_hash, blockchain_network (future)
└── issued_at, expires_at, revoked_at
```

---

## 3. AUTHENTICATION & USER MANAGEMENT

### Authentication Flow
1. **JWT-based Authentication**
   - Access tokens: 30 minutes expiry
   - Refresh tokens: 7 days expiry
   - Stored in localStorage (frontend)

2. **OAuth Integrations**
   - Google OAuth 2.0
   - GitHub OAuth 2.0
   - All OAuth users have `hashed_password = NULL`

3. **User Roles**
   - **FREELANCER**: Apply to projects, earn money
   - **AGENT**: Execute projects on behalf of freelancers
   - **BUSINESS**: Post projects, manage teams
   - **ADMIN**: System administration

### Current Security
- **Password Hashing**: BCrypt (passlib)
- **Token Encoding**: HMAC HS256
- **CORS**: Configured per environment
- **Bearer Token**: HTTP Authorization header

### Frontend Auth State (Zustand)
```typescript
useAuthStore
├── user: User | null
├── isAuthenticated: boolean
├── isLoading: boolean
├── login(email, password)
├── register(email, password, role)
├── googleAuth(token, role)
└── logout()
```

---

## 4. PAYMENT & TRANSACTION HANDLING (CURRENT STATE)

### What Exists (Structure Only)
- ✅ Payment model with all fields
- ✅ Payment schemas (Pydantic models)
- ✅ PaymentStatus enum (PENDING, PROCESSING, COMPLETED, FAILED)
- ✅ Stripe configuration in environment
- ✅ stripe>=7.11.0 in requirements.txt

### What's MISSING (To Be Implemented)
- ❌ Payment endpoints (create, list, update, confirm)
- ❌ Stripe webhook handling
- ❌ Payment intent creation logic
- ❌ Escrow implementation
- ❌ Fee calculation and distribution
- ❌ Payment notifications
- ❌ Dispute/refund handling
- ❌ Frontend payment UI components
- ❌ Payment history/receipt generation

### Planned Integration Points
1. **When Application is Accepted**
   - Create payment intent for project budget
   - Hold funds in escrow

2. **When Project is Completed**
   - Verify with proof-of-build
   - Release funds to freelancer/agent
   - Deduct platform fee (0.1%)

3. **Refund Cases**
   - Disputed work
   - Project cancellation

---

## 5. API ENDPOINT STRUCTURE

### Authentication (`/api/v1/auth`)
```
POST   /auth/register              - Register new user
POST   /auth/login                 - Login with email/password
POST   /auth/refresh               - Refresh access token
POST   /auth/google                - Google OAuth authentication
POST   /auth/github                - GitHub OAuth authentication
POST   /auth/connect/github        - Connect GitHub to existing account
```

### Users (`/api/v1/users`)
```
GET    /users/me                   - Get current user info
GET    /users/me/profile           - Get current user profile
PATCH  /users/me/profile           - Update profile
GET    /users/me/stats             - Get dashboard stats
POST   /users/me/profile/avatar    - Upload avatar
POST   /users/me/profile/resume    - Upload resume
GET    /users/{user_id}            - Get user by ID
GET    /users/{user_id}/profile    - Get user profile
```

### Projects (`/api/v1/projects`)
```
GET    /projects/                  - List projects with filters
POST   /projects/                  - Create project (business only)
GET    /projects/{id}              - Get project details
PATCH  /projects/{id}              - Update project
DELETE /projects/{id}              - Delete project
GET    /projects/my/projects       - Get my projects
```

### Applications (`/api/v1/applications`)
```
GET    /applications/              - Get my applications
POST   /applications/              - Apply to project
GET    /applications/project/{id}  - Get project applications (owner only)
PATCH  /applications/{id}          - Update application status
DELETE /applications/{id}          - Withdraw application
```

### Sandboxes (`/api/v1/sandboxes`)
```
GET    /sandboxes/                 - List my sandboxes
POST   /sandboxes/                 - Create sandbox
GET    /sandboxes/{id}             - Get sandbox details
PATCH  /sandboxes/{id}             - Update sandbox
DELETE /sandboxes/{id}             - Delete sandbox
POST   /sandboxes/{id}/execute     - Execute code
POST   /sandboxes/{id}/files       - Manage files
POST   /sandboxes/{id}/share       - Share with users
GET    /sandboxes/{id}/collaborators - Get collaborators
POST   /sandboxes/{id}/snapshot    - Create snapshot
```

### Proof of Build (`/api/v1/proofs`)
```
GET    /proofs                     - List my proofs
POST   /proofs                     - Create proof
GET    /proofs/{id}                - Get proof details
POST   /proofs/{id}/verify         - Verify proof
POST   /proofs/{id}/artifacts      - Add artifact
GET    /certificates               - List my certificates
POST   /certificates               - Generate certificate
POST   /certificates/{id}/verify   - Verify certificate
POST   /github/verify-repo         - Verify GitHub repo
POST   /github/verify-commit       - Verify commit
POST   /github/verify-pr           - Verify pull request
```

### AI Briefs (`/api/v1/ai-briefs`)
```
POST   /ai-briefs/                 - Generate project brief from description
GET    /ai-briefs/{id}             - Get generated brief
PATCH  /ai-briefs/{id}             - Update brief
POST   /ai-briefs/{id}/convert     - Convert to actual project
```

### Collaboration (`/api/v1/collaboration`)
```
POST   /collaboration/team-overlap - Calculate team timezone overlaps
POST   /collaboration/custom-overlap - Calculate custom user overlaps
GET    /collaboration/notifications - Get scheduled notifications
```

### System (`/api/v1`)
```
GET    /                           - API info
GET    /health                     - Health check
POST   /init-db                    - Initialize database (admin)
GET    /diagnostics               - Run diagnostics
```

---

## 6. FRONTEND COMPONENT ORGANIZATION

### Pages (Next.js Routes)
- **`/`** (index.tsx) - Landing page with feature overview
- **`/login`** - Login form with email/password, Google OAuth, GitHub OAuth
- **`/register`** - Registration with role selection
- **`/dashboard`** - User dashboard (stats, applications)
- **`/company-dashboard`** - Business dashboard (projects, applicants)
- **`/projects`** - Browse and search projects
- **`/create-project`** - Create new project (business only)
- **`/profile-settings`** - Edit profile, timezone, working hours
- **`/sandboxes`** - List shared sandboxes
- **`/sandbox/[id]`** - Sandbox editor with code execution
- **`/proofs`** - Proof-of-build dashboard
- **`/team-timezone`** - Team collaboration with timezone overlaps

### Components
- **TimezoneSelector.tsx** - IANA timezone selector with autocomplete
- **TimezoneTimeline.tsx** - Visual timeline of overlapping timezones
- **WorkingHoursSelector.tsx** - Set working hours per day of week

### State Management (Zustand)
- **authStore.ts**
  - `useAuthStore` - Global auth state (user, login, register, logout)
  - Handles token persistence and auto-login on app load

### HTTP Client (Axios)
- **api.ts**
  - Base configuration with auto-retry for auth
  - Request interceptor: Add JWT token to headers
  - Response interceptor: Handle 401 → token refresh → retry
  - Named exports: `authAPI`, `usersAPI`, `projectsAPI`, etc.

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive design** - Mobile-first approach
- **Dark/Light mode** - Support built-in

---

## 7. KEY INTEGRATION POINTS FOR PAYMENT/ESCROW/RATINGS

### A. Payment Layer Integration

**Files to Create/Modify:**
1. `/backend/app/api/endpoints/payments.py` (NEW)
2. `/backend/app/api/endpoints/reviews.py` (NEW)
3. `/backend/app/services/payment_service.py` (NEW)
4. `/backend/app/services/escrow_service.py` (NEW)
5. `/frontend/src/lib/paymentAPI.ts` (NEW)
6. `/frontend/src/pages/payments.tsx` (NEW)
7. `/frontend/src/components/PaymentForm.tsx` (NEW)

**Key Flow:**
1. When application accepted → Create Stripe payment intent
2. Project completion → Verify with proof-of-build
3. Release escrow funds → Calculate fees, distribute to freelancer/agent
4. Send notifications → Payment confirmations

### B. Escrow Implementation

**Structure:**
- Create `Escrow` table (amount, status, release_conditions)
- Create escrow service (hold, release, dispute)
- Hook into project status changes
- Webhook for payment confirmations

### C. Ratings & Reviews

**Status:**
- ✅ Review model exists
- ❌ Review endpoints missing
- ❌ Frontend UI missing
- ❌ Rating calculation missing

**Files to Create:**
1. `/backend/app/api/endpoints/reviews.py`
2. `/frontend/src/pages/reviews.tsx`
3. `/frontend/src/components/ReviewForm.tsx`
4. `/frontend/src/components/RatingDisplay.tsx`

---

## 8. ENVIRONMENT CONFIGURATION

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:pass@localhost/remoteworks

# Security
SECRET_KEY=<change-in-production>
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# GitHub OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Email (SendGrid)
SENDGRID_API_KEY=...
FROM_EMAIL=noreply@remote-works.io

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...

# Redis
REDIS_URL=redis://localhost:6379/0

# AI
OPENAI_API_KEY=...

# App
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

## 9. DEVELOPMENT WORKFLOW

### Starting the App
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Access Points
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Frontend**: http://localhost:3000
- **Health Check**: http://localhost:8000/health
- **Diagnostics**: http://localhost:8000/diagnostics

---

## 10. DEPLOYMENT ARCHITECTURE

### Recommended Stack
- **Backend**: Render.com (FastAPI on Python 3.11+)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Vercel (Next.js)
- **Storage**: AWS S3 (file uploads)
- **Payments**: Stripe (production keys)

### Environment Variables
- Development: local .env files
- Production: Platform environment variables (Render, Vercel)

---

## 11. EXISTING ADVANCED FEATURES

### AI Project Briefs
- User describes project in natural language
- AI generates structured brief with:
  - Goals, deliverables, tech stack
  - Implementation steps, timeline, budget estimate
  - Required skills
- Confidence scoring
- Convert brief to actual project

### Shared Sandboxes
- Real-time collaborative code editor
- Support for Python, JavaScript, TypeScript
- Code execution with output capture
- File management
- Sharing with specific users
- Collaboration tracking (cursor position, typing)
- Execution history

### Proof-of-Build Verification
- GitHub integration (commits, PRs, repositories)
- File/screenshot verification
- Hash-based integrity verification
- Cryptographic signatures
- Build certificates (on-chain ready)
- Milestone tracking
- Expiration/revocation management

### Timezone Collaboration
- Each user has timezone + working hours
- Calculate team overlap windows
- Schedule notifications for local times
- Best meeting times calculation
- Visual timezone timeline

---

## 12. RECOMMENDATIONS FOR PAYMENT/ESCROW/RATINGS INTEGRATION

### Phase 1: Payment Processing
1. ✅ Use existing Stripe configuration
2. ✅ Create payment endpoints (create, confirm, list)
3. ✅ Add Stripe webhook endpoint
4. ✅ Test with Stripe test keys
5. ✅ Frontend payment form with Stripe Elements

### Phase 2: Escrow System
1. Create Escrow table
2. Implement escrow service (hold, release, dispute)
3. Hook into project acceptance/completion
4. Webhook for payment confirmations
5. Refund handling

### Phase 3: Ratings & Reviews
1. ✅ Create review endpoints (POST, GET, DELETE)
2. ✅ Implement rating calculation (average, count)
3. ✅ Frontend review form component
4. ✅ Display ratings on profiles
5. ✅ Prevent duplicate reviews (one per project pair)

### Phase 4: Notifications & History
1. Email notifications for payments
2. Payment history/receipts
3. Transaction reports
4. Dispute tracking
5. Admin payment dashboard

---

## 13. KEY FILES TO UNDERSTAND FIRST

Priority order for understanding integration points:

1. `/backend/app/models/models.py` - All database models
2. `/backend/app/core/config.py` - Configuration
3. `/backend/app/api/dependencies.py` - JWT auth
4. `/backend/app/api/endpoints/projects.py` - Project CRUD pattern
5. `/backend/app/api/endpoints/applications.py` - Application pattern
6. `/frontend/src/lib/api.ts` - API client setup
7. `/frontend/src/lib/authStore.ts` - State management pattern
8. `/backend/main.py` - App setup, routers, middleware

---

## 14. QUICK REFERENCE: Adding New Feature

### To Add New API Endpoint:

1. **Create model** in `/app/models/models.py` (if needed)
2. **Create schema** in `/app/schemas/schemas.py` (request/response)
3. **Create router** in `/app/api/endpoints/feature.py`
4. **Include router** in `/main.py`
5. **Create API client** in `/frontend/src/lib/api.ts`
6. **Create page/component** in `/frontend/src/pages/` or `/components/`

### Authentication on Endpoints:
```python
from app.api.dependencies import get_current_user
from app.models.models import User

@router.get("/protected")
def protected_endpoint(current_user: User = Depends(get_current_user)):
    # User is authenticated here
    return {"user_id": current_user.id}
```

---

Generated: 2025-11-12
For: Payment/Escrow/Ratings Feature Integration
