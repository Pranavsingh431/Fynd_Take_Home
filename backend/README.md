# Fynd Backend API

Express + TypeScript backend for the review management system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
   - `OPENROUTER_API_KEY`: Get from https://openrouter.ai/
   - `DATABASE_URL`: PostgreSQL connection string

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### POST /api/reviews
Submit a new review.

**Request:**
```json
{
  "rating": 5,
  "review": "Amazing service! Highly recommend."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rating": 5,
    "userResponse": "Thank you so much for your positive feedback!...",
    "createdAt": "2024-01-06T12:00:00Z"
  }
}
```

### GET /api/reviews
Get all reviews (with optional rating filter).

**Query Params:**
- `rating` (optional): Filter by rating (1-5)

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "stats": {
      "1": 2,
      "2": 3,
      "3": 5,
      "4": 10,
      "5": 15
    },
    "total": 35
  }
}
```

### GET /api/reviews/stats
Get review statistics.

### GET /health
Health check endpoint.

## Deployment (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy

## Database Schema

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

