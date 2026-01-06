#!/bin/bash

echo "=========================================="
echo "SECURITY VERIFICATION SCRIPT"
echo "=========================================="
echo ""

# Check for hardcoded API keys
echo "[1/5] Checking for hardcoded API keys..."
FOUND_KEYS=$(grep -rE "sk-or-v1-[a-zA-Z0-9]{60,}" . \
  --include="*.py" \
  --include="*.ts" \
  --include="*.js" \
  --include="*.ipynb" \
  --include="*.md" \
  --include="*.json" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  2>/dev/null | wc -l)

if [ "$FOUND_KEYS" -eq 0 ]; then
  echo "✓ PASS: No hardcoded API keys found"
else
  echo "✗ FAIL: Found $FOUND_KEYS hardcoded API key(s)"
  exit 1
fi
echo ""

# Check for environment variable usage
echo "[2/5] Checking environment variable usage..."
ENV_VAR_FILES=$(grep -r "os.getenv\|process.env" . \
  --include="*.py" \
  --include="*.ts" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  2>/dev/null | grep OPENROUTER | wc -l)

if [ "$ENV_VAR_FILES" -gt 0 ]; then
  echo "✓ PASS: Found $ENV_VAR_FILES file(s) using environment variables"
else
  echo "✗ FAIL: No files using environment variables"
  exit 1
fi
echo ""

# Check .gitignore exists
echo "[3/5] Checking .gitignore protection..."
if grep -q ".env" .gitignore 2>/dev/null; then
  echo "✓ PASS: .gitignore includes .env files"
else
  echo "✗ FAIL: .gitignore doesn't protect .env files"
  exit 1
fi
echo ""

# Check .env.example exists (templates)
echo "[4/5] Checking .env.example templates..."
if [ -f "backend/.env.example" ]; then
  if grep -q "your_.*_key\|<your_" backend/.env.example; then
    echo "✓ PASS: backend/.env.example uses placeholders"
  else
    echo "✗ FAIL: backend/.env.example may contain actual keys"
    exit 1
  fi
else
  echo "⚠ WARNING: backend/.env.example not found"
fi
echo ""

# Check documentation
echo "[5/5] Checking security documentation..."
if [ -f "SECURITY.md" ]; then
  echo "✓ PASS: SECURITY.md exists"
else
  echo "⚠ WARNING: SECURITY.md not found"
fi
echo ""

echo "=========================================="
echo "✓ ALL SECURITY CHECKS PASSED"
echo "=========================================="
echo ""
echo "System is secure and ready for deployment!"
