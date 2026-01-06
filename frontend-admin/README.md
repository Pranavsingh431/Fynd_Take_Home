# Fynd Admin Dashboard

Admin analytics and review management dashboard built with Next.js 14.

## Features

- 📊 Real-time statistics by rating
- 🔍 Filter reviews by rating
- 📋 Comprehensive review table
- 🤖 AI-generated summaries and recommended actions
- 🔄 Auto-refresh every 30 seconds
- 📱 Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```bash
cp .env.example .env.local
```

3. Update `NEXT_PUBLIC_API_URL` to point to your backend

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm start
```

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend-admin`
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., `https://your-backend.onrender.com`)

## Features Breakdown

### Statistics Cards
- Total reviews count
- Individual counts for each star rating (1-5)
- Click to filter by rating

### Review Table
- Rating with visual stars
- Full review text (with "Read more" for long reviews)
- AI-generated admin summary
- Recommended business action
- Timestamp

### Filtering
- Click any rating card to filter
- Clear filter to show all reviews
- Filtered count display
