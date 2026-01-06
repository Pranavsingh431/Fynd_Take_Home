# GitHub Setup Guide

Follow these steps to push the project to GitHub.

## Prerequisites

- Git installed on your system
- GitHub account
- Repository created at: https://github.com/Pranavsingh431/Fynd_Take_Home

---

## Option 1: Command Line (Recommended)

### Step 1: Navigate to Project

```bash
cd "/Users/pranavsingh/Desktop/untitled folder/Fynd_Take_Home"
```

### Step 2: Initialize Git (if not already done)

```bash
# Initialize git repository
git init

# Check status
git status
```

### Step 3: Configure Git User (if first time)

```bash
# Set your name and email
git config --global user.name "Pranav Singh"
git config --global user.email "your-email@example.com"
```

### Step 4: Add All Files

```bash
# Add all files to staging
git add .

# Verify what will be committed
git status
```

### Step 5: Commit

```bash
# Create initial commit
git commit -m "Initial commit: Complete Fynd AI Engineering take-home assignment

- Task 1: Rating prediction with 3 prompting strategies
- Task 2: Full-stack review management system
- Backend: Express + TypeScript + PostgreSQL
- Frontend User: Next.js dashboard for review submission
- Frontend Admin: Next.js analytics dashboard
- Complete documentation and deployment guides"
```

### Step 6: Add Remote

```bash
# Add GitHub remote
git remote add origin https://github.com/Pranavsingh431/Fynd_Take_Home.git

# Verify remote
git remote -v
```

### Step 7: Push to GitHub

```bash
# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

If prompted for credentials:
- Username: `Pranavsingh431`
- Password: Use a Personal Access Token (not your GitHub password)
  - Generate at: https://github.com/settings/tokens
  - Select scope: `repo` (full control of private repositories)

---

## Option 2: GitHub Desktop

1. Open GitHub Desktop
2. File → Add Local Repository
3. Choose: `/Users/pranavsingh/Desktop/untitled folder/Fynd_Take_Home`
4. Click "Create Repository"
5. Write commit message
6. Click "Commit to main"
7. Click "Publish repository"
8. Select repository: `Pranavsingh431/Fynd_Take_Home`
9. Click "Push origin"

---

## Verify Success

1. Visit: https://github.com/Pranavsingh431/Fynd_Take_Home
2. You should see:
   - README.md rendered
   - All folders (task1, backend, frontend-user, frontend-admin)
   - Documentation files

---

## Common Issues

### Authentication Failed

**Problem:** Git push asks for username/password but fails

**Solution:** Use Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`
4. Copy the token
5. Use token as password when git prompts

### Permission Denied

**Problem:** `Permission denied (publickey)`

**Solution:** Add SSH key
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# https://github.com/settings/ssh/new
```

### Remote Already Exists

**Problem:** `remote origin already exists`

**Solution:**
```bash
# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/Pranavsingh431/Fynd_Take_Home.git
```

### Large Files

**Problem:** Git complains about large files

**Solution:**
```bash
# Check what's large
du -sh * | sort -rh | head -10

# If it's node_modules (shouldn't be):
# Make sure .gitignore includes node_modules/
echo "node_modules/" >> .gitignore
git rm -r --cached node_modules
git commit -m "Remove node_modules"
```

---

## Next Steps After Push

1. ✅ Verify all files are on GitHub
2. 📝 Update README with actual GitHub URL
3. 🚀 Follow DEPLOYMENT.md to deploy
4. 📧 Share GitHub link with Fynd team

---

## Repository Structure on GitHub

After pushing, your GitHub repo should look like:

```
Fynd_Take_Home/
├── README.md                    ← Main documentation (will render)
├── PROJECT_SUMMARY.md
├── QUICKSTART.md
├── DEPLOYMENT.md
├── GITHUB_SETUP.md
├── .gitignore
│
├── task1/
│   ├── rating_prediction.ipynb
│   ├── run_evaluation.py
│   ├── prompts.md
│   └── evaluation_results.csv
│
├── backend/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example           ← Notice: .env is ignored
│   └── README.md
│
├── frontend-user/
│   ├── app/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend-admin/
    ├── app/
    ├── package.json
    ├── .env.example
    └── README.md
```

**Important:** `.env` files are NOT pushed (they're in .gitignore) for security.

---

## Update README After Deployment

After deploying (see DEPLOYMENT.md), update README with actual URLs:

```bash
# Edit README.md and update the "Deployed URLs" section with actual links

git add README.md
git commit -m "Update README with deployment URLs"
git push
```

---

## Tips

### Commit Often
```bash
# After making changes
git add .
git commit -m "Description of changes"
git push
```

### Check Status Frequently
```bash
git status
```

### View History
```bash
git log --oneline --graph --all
```

### Create Branch for Experiments
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature
```

---

## GitHub Repository Settings

### Recommended Settings

1. **About Section** (top right):
   - Description: "Full-stack AI-powered review management system - Fynd AI Engineering Intern Assignment"
   - Topics: `ai`, `llm`, `nextjs`, `typescript`, `express`, `postgresql`
   - Website: (add after deployment)

2. **Code Security**:
   - Enable "Private vulnerability reporting"
   - Enable Dependabot alerts

3. **Branches**:
   - Default branch: `main`
   - (Optional) Add branch protection rules if working with team

---

That's it! Your project should now be on GitHub and ready to share. 🎉

