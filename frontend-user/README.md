# Fynd User Dashboard

User-facing review submission dashboard built with Next.js 14.

## Features

- ⭐ Star rating selection (1-5)
- 📝 Review textarea with character counter
- ✅ Real-time validation
- 🤖 AI-generated personalized responses
- 🎨 Beautiful, responsive UI
- ♿ Accessible design

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
3. Set root directory to `frontend-user`
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., `https://your-backend.onrender.com`)
