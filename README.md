# Fynd AI Engineering Intern - Take-Home Assignment

## Overview
This repository contains a complete solution for the Fynd AI Engineering Intern take-home assignment. The system demonstrates rating prediction using LLM prompting strategies and a full-stack web application for review management with AI-powered responses.

## Architecture

```
┌─────────────────┐
│  User Frontend  │ (Next.js on Vercel)
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Admin Frontend  │◄────►│   Backend    │ (Express on Render)
└─────────────────┘      │   Node.js    │
  (Next.js on Vercel)    └──────┬───────┘
                                │
                         ┌──────┴───────┬────────────┐
                         ▼              ▼            ▼
                    ┌─────────┐   ┌──────────┐  ┌─────────┐
                    │PostgreSQL│   │OpenRouter│  │ Logging │
                    └──────────┘   │   API    │  └─────────┘
                                   └──────────┘
```

## Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Deployed on Vercel

**Backend:**
- Node.js with TypeScript
- Express.js
- PostgreSQL (single table design)
- OpenRouter API integration
- Deployed on Render

**AI/ML:**
- OpenRouter API (server-side only)
- LLM: GPT-3.5-turbo (configurable)

## Project Structure

```
/Fynd_Take_Home
  /task1
    - rating_prediction.ipynb      # Prompting experiments
    - prompts.md                    # Prompt evolution documentation
    - evaluation_results.csv        # Comparison metrics
  /backend
    - src/
      - index.ts                    # Entry point
      - routes/                     # API endpoints
      - services/                   # Business logic
      - schemas/                    # Validation schemas
      - db/                         # Database setup
    - package.json
    - tsconfig.json
  /frontend-user
    - User-facing review submission dashboard
  /frontend-admin
    - Admin analytics and review management dashboard
  README.md
  .env.example
```

## Task 1: Rating Prediction (Prompting Strategies)

### Dataset
- **Source:** Yelp Reviews dataset via kagglehub
- **Sample Size:** 200 reviews
- **Purpose:** Compare different prompting strategies

### Prompting Strategies Implemented

1. **Naive Prompt**
   - Simple, straightforward instruction
   - Baseline for comparison
   
2. **Structured JSON-Enforced Prompt**
   - Explicit JSON schema enforcement
   - Improved output parsing reliability

3. **Rubric-Based Reasoning Prompt**
   - Chain-of-thought reasoning
   - Evaluation criteria breakdown
   - Best overall performance

### Evaluation Metrics
- **Accuracy:** Exact match with actual star ratings
- **JSON Validity Rate:** % of parseable responses
- **Consistency:** Agreement on duplicate inputs

### Key Findings
Three prompting strategies were evaluated on 200 Yelp reviews. The rubric-based approach achieved the best balance of accuracy (~75%), JSON validity (>95%), and consistency (>90%). This strategy explicitly defines rating criteria and reasoning steps, which improved both prediction quality and output reliability. The findings directly informed the production API implementation in Task 2.

**Full details:** See `task1/prompts.md` for prompt evolution and `evaluation_results.csv` for complete metrics.

## Task 2: Review Management System

### Features

**User Dashboard:**
- Select star rating (1-5)
- Submit review text
- Receive AI-generated personalized response
- Clear error handling and loading states

**Admin Dashboard:**
- View all submitted reviews
- AI-generated summary for each review
- Recommended actions for business
- Filter by rating
- Real-time statistics

### API Endpoints

```
POST /api/reviews
- Body: { rating: number, review: string }
- Returns: { userResponse, adminSummary, recommendedAction }

GET /api/reviews
- Query: ?rating=<1-5> (optional)
- Returns: List of all reviews with metadata
```

### Database Schema

**Single Table Design (reviews):**
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  user_response TEXT NOT NULL,
  admin_summary TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

The system handles:
- ✅ Empty or whitespace-only reviews
- ✅ Very long reviews (>5000 characters)
- ✅ LLM API failures (with fallback messages)
- ✅ Database connection issues
- ✅ Malformed requests
- ✅ Network timeouts

All errors return meaningful messages to users.

## Environment Variables

**Backend (.env):**
```
OPENROUTER_API_KEY=your_key_here
DATABASE_URL=postgresql://...
PORT=3001
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenRouter API key

### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Pranavsingh431/Fynd_Take_Home.git
cd Fynd_Take_Home
```

2. **Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Add your credentials to .env
npm run dev
```

3. **User Frontend:**
```bash
cd frontend-user
npm install
cp .env.example .env.local
npm run dev
```

4. **Admin Frontend:**
```bash
cd frontend-admin
npm install
cp .env.example .env.local
npm run dev
```

5. **Task 1 Notebook:**
```bash
cd task1
pip install kagglehub openai jupyter pandas
jupyter notebook rating_prediction.ipynb
```

## Deployment

### Deployed URLs
- **User Dashboard:** [To be deployed on Vercel](https://vercel.com)
- **Admin Dashboard:** [To be deployed on Vercel](https://vercel.com)
- **Backend API:** [To be deployed on Render](https://render.com)

See `DEPLOYMENT.md` for detailed deployment instructions.

### Deployment Steps

**Backend (Render):**
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables

**Frontends (Vercel):**
1. Import GitHub repo
2. Set root directory to `frontend-user` or `frontend-admin`
3. Framework preset: Next.js
4. Add environment variables
5. Deploy

## Design Decisions & Trade-offs

### Why Single Table?
**Decision:** Used a single PostgreSQL table instead of normalized schema.

**Rationale:** To keep the system simple and reliable for this scope, we chose a single-table design. This limits advanced analytics capabilities but significantly improves clarity, reduces deployment complexity, and eliminates join overhead. For a review management MVP, denormalization trades future flexibility for immediate simplicity and debuggability.

### Why Synchronous LLM Calls?
**Decision:** LLM processing happens synchronously during the API request.

**Rationale:** While async job queues would improve throughput, synchronous calls provide immediate user feedback and simpler error handling. The 2-3 second response time is acceptable for this use case and avoids the complexity of managing background workers, job queues, and polling mechanisms.

### Why Separate Frontends?
**Decision:** Two independent Next.js applications instead of role-based routing.

**Rationale:** Separate deployments enable independent scaling, different security policies, and clearer separation of concerns. User-facing and admin interfaces serve fundamentally different purposes - this architecture allows them to evolve independently without coupling.

### Why Fallback Responses?
**Decision:** Template-based fallback responses when LLM fails.

**Rationale:** LLM reliability isn't guaranteed (network issues, rate limits, API changes). Fallback responses ensure the system remains functional even when AI services are unavailable, prioritizing availability over perfect personalization.

## Limitations & Future Improvements

**Current Limitations:**
- No authentication/authorization
- No rate limiting
- No caching layer
- Single table limits advanced analytics
- No real-time updates

**Potential Improvements:**
- Add user authentication (NextAuth.js)
- Implement Redis caching for LLM responses
- Add rate limiting (express-rate-limit)
- Real-time updates via WebSockets
- Advanced analytics dashboard
- A/B testing for prompts
- Sentiment analysis visualization

## Testing

**Backend:**
```bash
cd backend
npm test
```

**Prompt Evaluation:**
See `task1/evaluation_results.csv` for comprehensive metrics.

## License
MIT

## Contact
For questions about this assignment, please contact the Fynd hiring team.

---
**Note:** This is a take-home assignment demonstrating production-ready code structure, clean architecture, and deployment best practices.

