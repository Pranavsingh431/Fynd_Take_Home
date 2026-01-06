# Quick Start Guide

Get the entire system running locally in under 10 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed locally OR use Neon/Supabase free tier
- OpenRouter API key (provided in the assignment)

---

## Option 1: Local PostgreSQL

### Step 1: Setup PostgreSQL

```bash
# macOS (with Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb fynd_reviews

# Verify
psql fynd_reviews -c "SELECT 1;"
```

### Step 2: Backend

```bash
cd Fynd_Take_Home/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env - add your actual API key:
# OPENROUTER_API_KEY=your_openrouter_api_key_here
# DATABASE_URL=postgresql://localhost:5432/fynd_reviews

# Start backend
npm run dev
```

Backend will run on `http://localhost:3001`

### Step 3: User Frontend

```bash
# New terminal
cd Fynd_Take_Home/frontend-user

# Install dependencies  
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start dev server
npm run dev
```

User dashboard will run on `http://localhost:3000`

### Step 4: Admin Frontend

```bash
# New terminal
cd Fynd_Take_Home/frontend-admin

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start dev server (on different port)
npm run dev -- -p 3002
```

Admin dashboard will run on `http://localhost:3002`

---

## Option 2: Cloud Database (Neon - Free)

If you don't want to install PostgreSQL locally:

### Step 1: Setup Neon Database

1. Go to https://console.neon.tech/
2. Sign up (free, no credit card)
3. Create new project: "fynd-reviews"
4. Copy connection string (looks like `postgresql://user:pass@host/db`)

### Step 2: Follow Option 1 Steps 2-4

But use the Neon connection string in `.env`:
```
DATABASE_URL=postgresql://user:pass@ep-xyz.neon.tech/fynd_reviews
```

**Note:** SSL is already configured! Just paste the connection string and it works. ✅

---

## Verify Everything Works

### 1. Test Backend
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"healthy","services":{"database":"connected","api":"running"}}
```

### 2. Test User Submission

1. Open `http://localhost:3000`
2. Select 5 stars
3. Type: "Amazing service! Highly recommend."
4. Click "Submit Review"
5. Verify you see an AI-generated response

### 3. Test Admin Dashboard

1. Open `http://localhost:3002`
2. Verify your review appears in the table
3. Check the AI summary and recommended action
4. Click the "5 Stars" card to filter
5. Click "Total" to clear filter

---

## Run Task 1 (Rating Prediction)

```bash
cd Fynd_Take_Home/task1

# Install Python dependencies
pip install kagglehub openai pandas numpy

# Run evaluation script
python run_evaluation.py

# This will:
# - Download Yelp dataset
# - Sample 200 reviews
# - Test 3 prompting strategies
# - Generate evaluation_results.csv
# - Generate comparison_metrics.csv

# Or open the notebook
jupyter notebook rating_prediction.ipynb
```

**Note**: The evaluation will take ~20-30 minutes and use ~$0.50-1.00 in API credits.

---

## Common Issues

### Backend won't start

**Error: "DATABASE_URL is required"**
- Verify `.env` file exists in `backend/` directory
- Check the DATABASE_URL is set

**Error: "database does not exist"**
```bash
createdb fynd_reviews
```

**Error: "OPENROUTER_API_KEY is required"**
- Copy the API key from assignment into `.env`

### Frontend won't connect to backend

**Error: "Failed to fetch"**
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Try `curl http://localhost:3001/health`

**CORS Error in browser console**
- This shouldn't happen locally (default is allow all)
- Try restarting backend

### Port already in use

```bash
# If port 3000 is taken
npm run dev -- -p 3005

# Update .env.local to match new port
```

---

## Directory Structure

```
Fynd_Take_Home/
├── task1/                    # Rating prediction experiments
│   ├── rating_prediction.ipynb
│   ├── run_evaluation.py
│   └── prompts.md
├── backend/                  # Express API
│   ├── src/
│   └── package.json
├── frontend-user/            # User dashboard (Next.js)
│   └── app/
├── frontend-admin/           # Admin dashboard (Next.js)
│   └── app/
└── README.md
```

---

## Next Steps

1. ✅ Test all functionality locally
2. ✅ Run Task 1 evaluation
3. 📚 Read `DEPLOYMENT.md` to deploy to production
4. 🚀 Push to GitHub and deploy

---

## Useful Commands

```bash
# Backend
cd backend
npm run dev          # Development with auto-reload
npm run build        # Build for production
npm start            # Run production build

# Frontends
cd frontend-user  # or frontend-admin
npm run dev          # Development server
npm run build        # Build for production
npm start            # Run production build

# Database
psql fynd_reviews                    # Connect to database
psql fynd_reviews -c "SELECT COUNT(*) FROM reviews;"  # Count reviews
psql fynd_reviews -c "DELETE FROM reviews;"          # Clear all reviews
```

---

## Development Tips

### Hot Reload
All three services support hot reload:
- Backend: `ts-node-dev` watches for changes
- Frontends: Next.js Fast Refresh

Just save files and changes appear instantly.

### API Testing

Use VS Code REST Client or Postman:

```http
### Health Check
GET http://localhost:3001/health

### Submit Review
POST http://localhost:3001/api/reviews
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent service!"
}

### Get All Reviews
GET http://localhost:3001/api/reviews

### Filter by Rating
GET http://localhost:3001/api/reviews?rating=5
```

### Database Inspection

```bash
# View all reviews
psql fynd_reviews -c "SELECT id, rating, LEFT(review_text, 50) as review FROM reviews ORDER BY created_at DESC LIMIT 10;"

# Count by rating
psql fynd_reviews -c "SELECT rating, COUNT(*) FROM reviews GROUP BY rating ORDER BY rating;"
```

---

That's it! You should now have everything running locally. 🎉

