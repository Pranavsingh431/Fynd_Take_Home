# Security Notes

## API Key Management

### ✅ Current State
All API keys are now stored in environment variables. **No hardcoded keys exist in the codebase.**

### How to Set API Key

**For Task 1 (Python scripts/notebook):**
```bash
export OPENROUTER_API_KEY=your_key_here
```

**For Task 2 (Backend):**
```bash
# In backend/.env file
OPENROUTER_API_KEY=your_key_here
```

**For Task 2 (Frontends):**
```bash
# In frontend-user/.env.local and frontend-admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```
Note: Frontends don't need the API key - only backend does!

---

## What Was Fixed

### Files Modified (API Key Removed):
1. ✅ `task1/run_evaluation.py` - Now uses `os.getenv("OPENROUTER_API_KEY")`
2. ✅ `task1/rating_prediction.ipynb` - Now uses `os.getenv('OPENROUTER_API_KEY')`
3. ✅ `task1/create_notebook.py` - Template updated to use env var
4. ✅ `DEPLOYMENT.md` - Example changed to placeholder
5. ✅ `QUICKSTART.md` - Example changed to placeholder

### Files Already Secure:
- ✅ `backend/src/services/llm.ts` - Uses `process.env.OPENROUTER_API_KEY`
- ✅ `backend/src/index.ts` - Validates env var on startup
- ✅ Frontends - No API key needed (backend handles all LLM calls)

---

## Environment Variable Validation

All components now validate that the API key is set before running:

**Python (Task 1):**
```python
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is required")
```

**TypeScript (Backend):**
```typescript
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY environment variable is required');
}
```

This ensures the system fails fast with a clear error message if the key is missing.

---

## .gitignore Protection

The following patterns are in `.gitignore` to prevent accidental commits:
```
.env
.env.local
*.env
```

**Always verify before committing:**
```bash
git status
# Check that no .env files are listed
```

---

## Deployment Security

### Render (Backend):
- API key set in Render dashboard environment variables
- Never commit to repository
- Automatically injected at runtime

### Vercel (Frontends):
- Only `NEXT_PUBLIC_API_URL` needed
- No API keys in frontend (security best practice)
- All LLM calls happen server-side

---

## Verification Commands

**Check for exposed keys:**
```bash
# Should return "No full API keys found"
grep -rE "sk-or-v1-[a-zA-Z0-9]{60,}" . --include="*.py" --include="*.ts" --include="*.js"
```

**Verify environment variable usage:**
```bash
# Should show files using os.getenv or process.env
grep -r "getenv.*OPENROUTER\|process.env.OPENROUTER" . --include="*.py" --include="*.ts"
```

---

## Best Practices Followed

1. ✅ **Never hardcode secrets** - All keys in environment variables
2. ✅ **Fail fast** - Validate env vars on startup
3. ✅ **Separate concerns** - Frontends don't have API keys
4. ✅ **Clear errors** - Helpful messages when keys missing
5. ✅ **Documentation** - Clear instructions for setting keys
6. ✅ **Git protection** - .gitignore prevents commits

---

## For Reviewers

**To run locally:**
1. Set environment variable: `export OPENROUTER_API_KEY=your_key`
2. Or add to `.env` files (backend/.env, not committed)
3. System will validate on startup

**To deploy:**
- Set environment variables in hosting platform dashboard
- Never commit actual keys to repository
- See DEPLOYMENT.md for detailed instructions

---

## Future Enhancements

For production, consider:
- [ ] API key rotation mechanism
- [ ] Rate limiting per key
- [ ] Key expiration monitoring
- [ ] Secrets management service (AWS Secrets Manager, etc.)
- [ ] Audit logging of key usage

---

Last Updated: January 6, 2026

