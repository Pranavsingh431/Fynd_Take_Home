# Task 1: Rating Prediction using LLM Prompting

Evaluates three different prompting strategies for Yelp review rating prediction.

## Setup

### Prerequisites
```bash
pip install kagglehub openai pandas numpy jupyter
```

### Set API Key (Required)

**Option 1: Export environment variable (Recommended)**
```bash
export OPENROUTER_API_KEY=your_key_here
```

**Option 2: Add to shell profile (Persistent)**
```bash
# Add to ~/.zshrc or ~/.bashrc
echo 'export OPENROUTER_API_KEY=your_key_here' >> ~/.zshrc
source ~/.zshrc
```

**Verify it's set:**
```bash
echo $OPENROUTER_API_KEY
```

## Run Evaluation

### Option 1: Jupyter Notebook (Interactive)
```bash
jupyter notebook rating_prediction.ipynb
```
- Open the notebook in your browser
- Run cells sequentially
- Change `TEST_SIZE = 20` to `TEST_SIZE = 200` for full evaluation

### Option 2: Python Script (Automated)
```bash
python run_evaluation.py
```

This will:
- Download Yelp dataset (~200 reviews)
- Test all 3 prompting strategies
- Generate `evaluation_results.csv`
- Print comparison metrics

**Note:** Full evaluation (200 reviews) takes ~30 minutes and costs ~$1 in API credits.

## Output Files

- `evaluation_results.csv` - Detailed predictions for each review
- `comparison_metrics.csv` - Summary statistics by strategy

## Prompting Strategies

1. **Naive Prompt** - Simple baseline
2. **Structured JSON Prompt** - Enforced output format
3. **Rubric-Based Prompt** - Explicit rating criteria (best performance)

See `prompts.md` for detailed documentation.

## Troubleshooting

**"OPENROUTER_API_KEY environment variable is required"**
- Set the environment variable: `export OPENROUTER_API_KEY=your_key`
- Get your key from: https://openrouter.ai/

**"No module named 'kagglehub'"**
- Install dependencies: `pip install kagglehub openai pandas numpy`

**"Dataset download failed"**
- Check internet connection
- Kagglehub may require authentication on first use

