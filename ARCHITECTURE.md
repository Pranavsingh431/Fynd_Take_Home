# System Architecture

Detailed architecture documentation for the Fynd Review Management System.

---

## High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                          │
└──────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
         ┌─────────────────┐       ┌─────────────────┐
         │  User Frontend  │       │ Admin Frontend  │
         │   (Next.js)     │       │   (Next.js)     │
         │  Port: 3000     │       │  Port: 3002     │
         └────────┬────────┘       └────────┬────────┘
                  │                         │
                  │    HTTP/JSON API       │
                  └────────┬────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │     Backend     │
                  │   (Express)     │
                  │  Port: 3001     │
                  └────────┬────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
    ┌──────────────┐ ┌──────────┐ ┌───────────┐
    │  PostgreSQL  │ │OpenRouter│ │  Logging  │
    │   Database   │ │   API    │ │  System   │
    └──────────────┘ └──────────┘ └───────────┘
```

---

## Component Breakdown

### 1. User Frontend (Next.js)

**Purpose:** Public-facing review submission interface

**Technology:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Server Components

**Key Features:**
- Star rating selection (1-5)
- Review textarea with validation
- Real-time character counter
- Loading states
- Error handling
- AI response display

**Data Flow:**
```
User Input → Client Validation → API Call → Loading State
                                              ↓
Display Error ← Error Response ← Backend ← Valid?
                                              ↓ Yes
AI Response ← Success Response ← LLM Processing
```

**API Integration:**
```typescript
POST /api/reviews
{
  rating: number,
  review: string
}
→
{
  success: true,
  data: {
    id: number,
    userResponse: string,
    createdAt: timestamp
  }
}
```

**State Management:**
- Local React state (useState)
- No global state needed (simple form)

---

### 2. Admin Frontend (Next.js)

**Purpose:** Internal analytics and review management dashboard

**Technology:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Server Components

**Key Features:**
- Statistics cards (total + per-rating)
- Filterable review table
- Auto-refresh (30s interval)
- Color-coded ratings
- Responsive layout

**Data Flow:**
```
Page Load → Fetch All Reviews → Display Stats + Table
                                       ↓
User Clicks Rating Filter → Fetch Filtered → Update Display
                                       ↓
30s Timer → Auto Refresh → Fetch Latest → Update Display
```

**API Integration:**
```typescript
GET /api/reviews?rating=5
→
{
  success: true,
  data: {
    reviews: Review[],
    stats: { 1: n, 2: n, ... },
    total: number
  }
}
```

**State Management:**
- Local React state
- useEffect for auto-refresh
- No complex state library needed

---

### 3. Backend API (Express)

**Purpose:** Business logic, LLM integration, data persistence

**Technology:**
- Node.js 18+
- Express.js
- TypeScript
- Zod (validation)
- pg (PostgreSQL client)
- OpenAI SDK (for OpenRouter)

**Architecture Pattern:** Layered Architecture

```
routes/           → HTTP request handling
   ↓
schemas/          → Input validation (Zod)
   ↓
services/         → Business logic (LLM calls)
   ↓
db/               → Data access layer
```

**Directory Structure:**
```
src/
├── index.ts              # Entry point, server setup
├── routes/
│   └── reviews.ts        # API endpoints
├── schemas/
│   └── validation.ts     # Zod schemas
├── services/
│   └── llm.ts            # OpenRouter integration
└── db/
    └── database.ts       # PostgreSQL queries
```

**Key Endpoints:**

#### POST /api/reviews
```typescript
Request:  { rating: number, review: string }
Process:  Validate → LLM Call → Database Insert
Response: { success: true, data: { userResponse, ... } }
```

#### GET /api/reviews
```typescript
Request:  ?rating=<1-5> (optional)
Process:  Database Query → Format Response
Response: { success: true, data: { reviews[], stats } }
```

#### GET /health
```typescript
Process:  Check DB connection
Response: { status: "healthy", services: {...} }
```

**Error Handling Flow:**
```
Request → Validation
           ↓ Fail
           Error Response (400)
           ↓ Pass
          LLM Call
           ↓ Fail
           Fallback Response (use templates)
           ↓ Success
          Database Insert
           ↓ Fail
           Error Response (500)
           ↓ Success
          Success Response (201)
```

---

### 4. Database (PostgreSQL)

**Schema:** Single table design (as required)

```sql
CREATE TABLE reviews (
  id                SERIAL PRIMARY KEY,
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text       TEXT NOT NULL,
  user_response     TEXT NOT NULL,
  admin_summary     TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
```

**Why Single Table?**
- Assignment requirement
- Simple data model
- No complex relationships
- Fast queries with indexes
- Easy to understand

**Query Patterns:**

**Insert:**
```sql
INSERT INTO reviews (rating, review_text, user_response, admin_summary, recommended_action)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
```

**Select All:**
```sql
SELECT * FROM reviews ORDER BY created_at DESC;
```

**Filter by Rating:**
```sql
SELECT * FROM reviews WHERE rating = $1 ORDER BY created_at DESC;
```

**Statistics:**
```sql
SELECT rating, COUNT(*) as count
FROM reviews
GROUP BY rating
ORDER BY rating;
```

---

### 5. LLM Service (OpenRouter)

**Purpose:** Generate AI responses and insights

**Model:** GPT-3.5-turbo (via OpenRouter)

**API Calls per Review:** 2
1. User response generation
2. Admin summary + recommended action

**Prompt Strategy:** Rubric-based (from Task 1 findings)

**System Prompt:**
```
You are an expert review analyst. Use the following rubric:

RATING RUBRIC:
1 Star: Extremely negative, "worst", "awful", "never again"
2 Stars: Mostly negative, disappointed, multiple complaints
3 Stars: Mixed/neutral, "okay" or "average"
4 Stars: Mostly positive, minor issues, would recommend
5 Stars: Extremely positive, "amazing", "perfect", "best"
```

**User Response Generation:**
```typescript
Input:  rating + review_text
Prompt: Generate personalized, empathetic response (2-3 sentences)
        - Thank for feedback
        - Acknowledge experience
        - [Rating-specific response]
Output: user_response (string)
```

**Admin Analysis:**
```typescript
Input:  rating + review_text
Prompt: Provide:
        1. SUMMARY: One sentence summarizing key points
        2. ACTION: One specific recommendation
Output: admin_summary (string)
        recommended_action (string)
```

**Fallback Responses:**
```typescript
If LLM fails → Use template responses based on rating
- Prevents user-facing errors
- Graceful degradation
- System remains functional
```

**Configuration:**
```typescript
{
  model: "openai/gpt-3.5-turbo",
  temperature: 0.3,      // Low for consistency
  max_tokens: 200,       // Limit response length
  timeout: 30000         // 30s timeout
}
```

---

## Data Flow: Complete User Journey

### Scenario: User submits 5-star review

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER FRONTEND                                             │
└─────────────────────────────────────────────────────────────┘
User clicks 5 stars
User types "Amazing service! Highly recommend."
User clicks "Submit Review"
  ↓
Client validation passes (length > 10, < 5000)
  ↓
Loading state activated
  ↓
POST /api/reviews
{
  rating: 5,
  review: "Amazing service! Highly recommend."
}

┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND - Validation Layer                                │
└─────────────────────────────────────────────────────────────┘
Zod schema validates:
  ✓ rating is 1-5
  ✓ review is string
  ✓ review length valid
  ✓ review not empty after trim
  ↓

┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND - LLM Service                                     │
└─────────────────────────────────────────────────────────────┘
Call 1: Generate user response
  Input: 5 stars + "Amazing service! Highly recommend."
  LLM: "Thank you so much for your wonderful feedback! ..."
  ↓
Call 2: Generate admin analysis
  Input: Same
  LLM: 
    Summary: "Enthusiastic 5-star review praising service quality"
    Action: "Share positive feedback with team, request testimonial"
  ↓

┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND - Database Layer                                  │
└─────────────────────────────────────────────────────────────┘
INSERT INTO reviews VALUES (
  5,
  "Amazing service! Highly recommend.",
  "Thank you so much for your wonderful feedback! ...",
  "Enthusiastic 5-star review praising service quality",
  "Share positive feedback with team, request testimonial"
)
RETURNING id, created_at
  ↓

┌─────────────────────────────────────────────────────────────┐
│ 5. BACKEND - Response                                        │
└─────────────────────────────────────────────────────────────┘
200 OK
{
  success: true,
  data: {
    id: 42,
    rating: 5,
    userResponse: "Thank you so much...",
    createdAt: "2024-01-06T12:34:56Z"
  }
}
  ↓

┌─────────────────────────────────────────────────────────────┐
│ 6. USER FRONTEND - Display                                   │
└─────────────────────────────────────────────────────────────┘
Loading state deactivated
Success message displayed
AI response shown in green box
Form cleared
  ↓

┌─────────────────────────────────────────────────────────────┐
│ 7. ADMIN FRONTEND - Auto-refresh                             │
└─────────────────────────────────────────────────────────────┘
(Within 30 seconds)
GET /api/reviews
New review appears in table
5-star count increments
Total count increments
```

**Total Time:** ~2-3 seconds
- Validation: <10ms
- LLM calls: ~2s (majority of time)
- Database: ~50ms
- Network: ~100ms

---

## Security Architecture

### Secrets Management
```
Frontend:  .env.local        → NEXT_PUBLIC_API_URL
Backend:   .env              → OPENROUTER_API_KEY, DATABASE_URL
           (gitignored)
Production: Environment vars → Vercel/Render dashboards
```

### Input Validation
```
Layer 1: Client-side (UX)    → Immediate feedback
Layer 2: Server-side (Zod)   → Security boundary
Layer 3: Database (CHECK)    → Final safeguard
```

### SQL Injection Prevention
```typescript
// ✅ Parameterized queries (safe)
pool.query('SELECT * FROM reviews WHERE rating = $1', [rating]);

// ❌ String concatenation (NEVER)
pool.query('SELECT * FROM reviews WHERE rating = ' + rating);
```

### CORS Configuration
```typescript
cors({
  origin: [
    'http://localhost:3000',      // Dev: User
    'http://localhost:3002',      // Dev: Admin
    'https://user.vercel.app',    // Prod: User
    'https://admin.vercel.app'    // Prod: Admin
  ],
  credentials: true
})
```

---

## Scalability Considerations

### Current Architecture (Assignment Scope)
- **Frontend:** Static, globally distributed (Vercel CDN)
- **Backend:** Single instance (Render free tier)
- **Database:** Single PostgreSQL instance

**Limitations:**
- Backend: ~50 concurrent requests
- Database: ~100 connections
- LLM: Rate limited by API key tier

### Production Improvements

**1. Backend Scaling:**
```
┌──────────┐
│   LB     │  Load Balancer
└────┬─────┘
     │
  ┌──┴───┬───────┬───────┐
  ▼      ▼       ▼       ▼
┌───┐  ┌───┐   ┌───┐   ┌───┐
│BE1│  │BE2│   │BE3│   │BE4│  Multiple backend instances
└───┘  └───┘   └───┘   └───┘
```

**2. Caching Layer:**
```
Request → Redis Cache → (miss) → LLM → Cache → Response
                      ↘ (hit) ↗
```

**3. Database Optimization:**
- Read replicas for admin dashboard
- Connection pooling (already implemented)
- Materialized views for statistics

**4. Async Processing:**
```
User Request → Queue (RabbitMQ/Redis) → Worker → LLM → Database
             ↘ Immediate Response
```

---

## Monitoring & Observability

### Logs
```
Backend:  Express logs → stdout → Render logs
Frontend: Next.js logs → Vercel logs
```

### Metrics to Track
- API response times
- LLM call duration
- Database query performance
- Error rates
- User submission rate
- Admin dashboard views

### Health Checks
```
GET /health → Check DB connection → 200 OK / 503 Unavailable
```

### Error Tracking (Future)
```
Backend:  Sentry → Capture exceptions → Alert
Frontend: Sentry → Capture errors → Alert
```

---

## Deployment Architecture

### Development
```
┌─────────────┐
│   Laptop    │
└──────┬──────┘
       │
   ┌───┴───┬───────┬───────┐
   ▼       ▼       ▼       ▼
┌──────┐ ┌───┐ ┌──────┐ ┌──────┐
│User  │ │API│ │Admin │ │PgSQL │
│:3000 │ │:01│ │:3002 │ │:5432 │
└──────┘ └───┘ └──────┘ └──────┘
```

### Production
```
┌─────────────────────────────────────────────┐
│                 Internet                     │
└─────────────┬──────────────┬────────────────┘
              │              │
      ┌───────▼────┐  ┌──────▼───────┐
      │   Vercel   │  │   Vercel     │
      │   (User)   │  │   (Admin)    │
      └─────┬──────┘  └──────┬───────┘
            │                │
            └────────┬───────┘
                     │
              ┌──────▼───────┐
              │    Render    │
              │   (Backend)  │
              └──────┬───────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
     ┌────────┐ ┌────────┐ ┌────────┐
     │Render  │ │OpenRouter│Other   │
     │PgSQL   │ │  API    │Services│
     └────────┘ └────────┘ └────────┘
```

---

## Technology Decisions

### Why Next.js?
- ✅ Server-side rendering for SEO
- ✅ Great developer experience
- ✅ Built-in TypeScript support
- ✅ Vercel deployment integration
- ✅ Fast refresh for development

### Why Express over Fastify?
- ✅ More familiar to most developers
- ✅ Larger ecosystem (middleware)
- ✅ Sufficient performance for use case
- ✅ Better documentation
- ⚠️ Slightly slower (not significant here)

### Why PostgreSQL over MongoDB?
- ✅ ACID compliance
- ✅ Better for structured data
- ✅ SQL is widely known
- ✅ Strong typing
- ✅ Better for analytics queries
- ⚠️ Less flexible schema (not needed)

### Why OpenRouter over Direct OpenAI?
- ✅ Flexibility (multiple models)
- ✅ Cost optimization
- ✅ Fallback options
- ✅ Same API interface
- ⚠️ Additional layer (minimal latency)

---

## Performance Benchmarks

### Expected Performance

**User Submission Flow:**
- Frontend render: ~50ms
- API call: ~2-3s (LLM dominates)
- Total user wait: ~2-3s

**Admin Dashboard:**
- Initial load: ~200ms
- Review fetch: ~100ms
- Filter change: ~100ms

**Backend:**
- /health: <10ms
- POST /api/reviews: ~2-3s (LLM)
- GET /api/reviews: ~50ms

**Database:**
- INSERT: <10ms
- SELECT all: <50ms
- SELECT filtered: <20ms
- Stats query: <30ms

---

This architecture is designed for the assignment scope but with production-readiness in mind. All components are independently scalable and follow best practices for maintainability.

