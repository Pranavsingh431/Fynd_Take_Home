# System Test Checklist

Run these tests manually before submission.

---

## A. User Dashboard Tests

### Test 1: Empty Review ❌
1. Open `http://localhost:3000`
2. Select 5 stars
3. Leave review empty
4. Click "Submit Review"
5. **Expected:** Error message "Please enter a review"

### Test 2: Very Short Review ❌
1. Type: "ok"
2. Click "Submit Review"
3. **Expected:** Error message "Review must be at least 10 characters"

### Test 3: Valid Short Review ✅
1. Type: "Great service, very happy!"
2. Click "Submit Review"
3. **Expected:** 
   - Loading spinner appears
   - Success message shows
   - AI response displayed
   - Form cleared

### Test 4: Long Review ✅
1. Paste a 500-word paragraph
2. Click "Submit Review"
3. **Expected:** Submits successfully (under 5000 char limit)

### Test 5: Very Long Review ❌
1. Try to paste >5000 characters
2. **Expected:** Character counter shows "5000 / 5000"

---

## B. Admin Dashboard Tests

### Test 1: Initial Load
1. Open `http://localhost:3002`
2. **Expected:**
   - Statistics cards display
   - Review table loads (or "No reviews" message)
   - No JavaScript errors in console

### Test 2: View Submitted Review
1. After submitting via user dashboard
2. Refresh admin dashboard
3. **Expected:**
   - New review appears in table
   - Rating displayed correctly
   - AI summary visible
   - Recommended action visible
   - Timestamp formatted properly

### Test 3: Filter by Rating
1. Click "5 Stars" card
2. **Expected:**
   - Only 5-star reviews shown
   - Filter indicator appears
   - "Clear filter" button visible

2. Click "Clear filter"
3. **Expected:** All reviews shown again

### Test 4: Statistics Update
1. Note current statistics
2. Submit new review
3. Refresh admin dashboard
4. **Expected:**
   - Total count incremented
   - Rating-specific count incremented
   - Statistics accurate

---

## C. Backend API Tests

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "api": "running"
  }
}
```

### Test 2: Submit Review
```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "review": "Excellent service!"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": <number>,
    "rating": 5,
    "userResponse": "<AI-generated text>",
    "createdAt": "<timestamp>"
  }
}
```

### Test 3: Get All Reviews
```bash
curl http://localhost:3001/api/reviews
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "stats": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 1},
    "total": 1
  }
}
```

### Test 4: Filter by Rating
```bash
curl http://localhost:3001/api/reviews?rating=5
```

**Expected:** Only 5-star reviews returned

### Test 5: Invalid Input - Empty Review
```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "review": ""}'
```

**Expected Response:**
```json
{
  "error": "Validation failed",
  "details": [...]
}
```

### Test 6: Invalid Input - Bad Rating
```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"rating": 10, "review": "Test"}'
```

**Expected Response:**
```json
{
  "error": "Validation failed",
  "details": [...]
}
```

---

## D. Error Handling Tests

### Test 1: Backend Down
1. Stop backend server
2. Try to submit review from user dashboard
3. **Expected:** "Network error" or "Failed to submit" message

### Test 2: Database Connection Lost
1. This would require intentionally breaking DB connection
2. **Expected:** 500 error with generic message (no DB details exposed)

---

## E. Data Persistence Tests

### Test 1: Page Refresh
1. Submit review
2. Refresh user dashboard
3. **Expected:** Form is cleared (no data loss issue)

### Test 2: Cross-Dashboard Sync
1. Submit review via user dashboard
2. Open admin dashboard in new tab
3. **Expected:** Review visible immediately after refresh

---

## Test Results

**Date Tested:** ___________

| Test | Status | Notes |
|------|--------|-------|
| User - Empty review | ⬜ | |
| User - Short review | ⬜ | |
| User - Valid review | ⬜ | |
| User - Long review | ⬜ | |
| Admin - Initial load | ⬜ | |
| Admin - View review | ⬜ | |
| Admin - Filter | ⬜ | |
| Admin - Stats update | ⬜ | |
| API - Health check | ⬜ | |
| API - Submit review | ⬜ | |
| API - Get reviews | ⬜ | |
| API - Filter | ⬜ | |
| API - Invalid empty | ⬜ | |
| API - Invalid rating | ⬜ | |
| Error - Backend down | ⬜ | |
| Persist - Refresh | ⬜ | |
| Persist - Cross-dashboard | ⬜ | |

---

## Common Issues

**"Cannot connect to backend"**
- Check backend is running: `curl localhost:3001/health`
- Check .env.local has correct API_URL

**"Database error"**
- Check DATABASE_URL in backend/.env
- Verify PostgreSQL is running
- Check database exists: `psql fynd_reviews -c "SELECT 1;"`

**"LLM timeout"**
- This is expected occasionally (OpenRouter rate limits)
- Should fall back to template response
- Check fallback is working correctly

---

## Before Submission

- [ ] All tests pass
- [ ] No console errors
- [ ] Error messages are user-friendly
- [ ] AI responses appear
- [ ] Data persists across refresh
- [ ] Statistics are accurate

