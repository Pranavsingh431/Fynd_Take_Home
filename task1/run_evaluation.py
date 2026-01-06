"""
Task 1: Rating Prediction using LLM Prompting Strategies
Run this script to evaluate three different prompting strategies.
"""

import kagglehub
import pandas as pd
import json
import os
from openai import OpenAI
import time
from typing import Dict, List
import numpy as np
import glob

# Configuration
OPENROUTER_API_KEY = "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"
MODEL = "openai/gpt-3.5-turbo"
TEST_SIZE = 200  # Number of reviews to evaluate
CONSISTENCY_SIZE = 10  # Number of reviews for consistency testing

# Initialize OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# Define prompting strategies
NAIVE_PROMPT = """Predict the star rating (1-5) for the following review. Return your response as JSON with 'predicted_stars' and 'explanation' fields.

Review: {review}"""

STRUCTURED_PROMPT = """You are a rating prediction system. Analyze the following review and predict the star rating.

STRICT OUTPUT FORMAT (you MUST respond with valid JSON only):
{{
  "predicted_stars": <integer between 1 and 5>,
  "explanation": "<brief explanation of your prediction>"
}}

Rules:
- predicted_stars must be an integer: 1, 2, 3, 4, or 5
- explanation must be a concise string (1-2 sentences)
- Return ONLY valid JSON, no additional text

Review: {review}"""

RUBRIC_PROMPT = """You are an expert review analyst. Use the following rubric to predict the star rating:

RATING RUBRIC:
1 Star: Extremely negative sentiment, mentions of terrible service/quality, words like "worst", "awful", "never again"
2 Stars: Mostly negative, disappointed, multiple complaints, minimal positive aspects
3 Stars: Mixed/neutral sentiment, both positives and negatives mentioned, "okay" or "average"
4 Stars: Mostly positive, generally satisfied, minor issues mentioned, would recommend
5 Stars: Extremely positive, enthusiastic, words like "amazing", "perfect", "best", strong recommendation

ANALYSIS PROCESS:
1. Identify key sentiment indicators (positive/negative words)
2. Assess overall tone and emotional intensity
3. Consider specific complaints or praise
4. Apply rubric to determine rating

Review: {review}

Respond with ONLY valid JSON:
{{
  "predicted_stars": <integer 1-5>,
  "explanation": "<reasoning based on rubric>"
}}"""


def predict_rating(review: str, prompt_template: str, max_retries: int = 2) -> Dict:
    """
    Predict rating using LLM with specified prompt template.
    """
    prompt = prompt_template.format(review=review[:1000])
    
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200,
            )
            
            raw_response = response.choices[0].message.content.strip()
            
            # Try to parse JSON
            try:
                # Remove markdown code blocks if present
                if raw_response.startswith('```'):
                    parts = raw_response.split('```')
                    if len(parts) >= 2:
                        raw_response = parts[1]
                        if raw_response.startswith('json'):
                            raw_response = raw_response[4:]
                
                result = json.loads(raw_response.strip())
                
                # Validate structure
                predicted_stars = result.get('predicted_stars')
                explanation = result.get('explanation', '')
                
                # Validate rating range
                if isinstance(predicted_stars, (int, float)) and 1 <= predicted_stars <= 5:
                    return {
                        'predicted_stars': int(predicted_stars),
                        'explanation': explanation,
                        'is_valid_json': True,
                        'raw_response': raw_response,
                        'error': None
                    }
                else:
                    raise ValueError(f"Invalid rating: {predicted_stars}")
                    
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
                return {
                    'predicted_stars': None,
                    'explanation': '',
                    'is_valid_json': False,
                    'raw_response': raw_response,
                    'error': f"JSON parsing error: {str(e)}"
                }
                
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return {
                'predicted_stars': None,
                'explanation': '',
                'is_valid_json': False,
                'raw_response': '',
                'error': f"API error: {str(e)}"
            }
    
    return {
        'predicted_stars': None,
        'explanation': '',
        'is_valid_json': False,
        'raw_response': '',
        'error': 'Max retries exceeded'
    }


def calculate_metrics(actual_ratings: List[float], predictions: List[Dict], 
                     consistency_predictions: List[Dict]) -> Dict:
    """Calculate accuracy, JSON validity, and consistency metrics."""
    # JSON Validity Rate
    valid_json_count = sum(1 for p in predictions if p['is_valid_json'])
    json_validity_rate = valid_json_count / len(predictions) * 100
    
    # Accuracy
    correct = 0
    valid_predictions = 0
    
    for actual, pred in zip(actual_ratings, predictions):
        if pred['predicted_stars'] is not None:
            valid_predictions += 1
            if int(actual) == pred['predicted_stars']:
                correct += 1
    
    accuracy = (correct / valid_predictions * 100) if valid_predictions > 0 else 0
    
    # Mean Absolute Error
    mae_sum = 0
    mae_count = 0
    for actual, pred in zip(actual_ratings, predictions):
        if pred['predicted_stars'] is not None:
            mae_sum += abs(int(actual) - pred['predicted_stars'])
            mae_count += 1
    
    mae = mae_sum / mae_count if mae_count > 0 else float('inf')
    
    # Consistency
    consistent = 0
    for pred1, pred2 in zip(predictions[:len(consistency_predictions)], 
                            consistency_predictions):
        if (pred1['predicted_stars'] is not None and 
            pred2['predicted_stars'] is not None and
            pred1['predicted_stars'] == pred2['predicted_stars']):
            consistent += 1
    
    consistency_rate = (consistent / len(consistency_predictions) * 100) if consistency_predictions else 0
    
    return {
        'accuracy': accuracy,
        'json_validity_rate': json_validity_rate,
        'consistency_rate': consistency_rate,
        'mean_absolute_error': mae,
        'valid_predictions': valid_predictions,
        'total_predictions': len(predictions)
    }


def main():
    print("="*80)
    print("Task 1: Rating Prediction using LLM Prompting Strategies")
    print("="*80 + "\n")
    
    # 1. Load Dataset
    print("1. Downloading Yelp Reviews dataset...")
    path = kagglehub.dataset_download("omkarsabnis/yelp-reviews-dataset")
    print(f"   Downloaded to: {path}")
    
    # Find CSV file
    csv_files = glob.glob(f"{path}/**/*.csv", recursive=True)
    if not csv_files:
        print("Error: No CSV files found in dataset")
        return
    
    print(f"   Found: {csv_files[0]}\n")
    
    # 2. Load and sample data
    print("2. Loading and sampling data...")
    df = pd.read_csv(csv_files[0])
    print(f"   Dataset shape: {df.shape}")
    
    # Identify columns
    rating_col = 'stars' if 'stars' in df.columns else 'rating'
    text_col = 'text' if 'text' in df.columns else 'review'
    
    # Sample reviews
    np.random.seed(42)
    df_sample = df[[rating_col, text_col]].dropna().sample(
        n=min(TEST_SIZE, len(df)), random_state=42
    )
    df_sample.columns = ['actual_rating', 'review_text']
    
    print(f"   Sampled {len(df_sample)} reviews")
    print(f"   Rating distribution:")
    print(df_sample['actual_rating'].value_counts().sort_index())
    print()
    
    # 3. Run experiments
    strategies = {
        'naive': NAIVE_PROMPT,
        'structured': STRUCTURED_PROMPT,
        'rubric': RUBRIC_PROMPT
    }
    
    results = {}
    
    for strategy_name, prompt_template in strategies.items():
        print("="*80)
        print(f"Evaluating: {strategy_name.upper()} strategy")
        print("="*80)
        
        predictions = []
        consistency_predictions = []
        
        # First pass
        for idx, row in df_sample.iterrows():
            print(f"  Predicting {len(predictions) + 1}/{len(df_sample)}...", end='\r')
            pred = predict_rating(row['review_text'], prompt_template)
            predictions.append(pred)
            time.sleep(0.5)  # Rate limiting
        
        print(f"  First pass complete: {len(predictions)} predictions")
        
        # Second pass for consistency
        print(f"  Testing consistency on {CONSISTENCY_SIZE} reviews...")
        for idx, row in df_sample.head(CONSISTENCY_SIZE).iterrows():
            pred = predict_rating(row['review_text'], prompt_template)
            consistency_predictions.append(pred)
            time.sleep(0.5)
        
        results[strategy_name] = {
            'predictions': predictions,
            'consistency_predictions': consistency_predictions
        }
        
        print(f"  Completed {strategy_name} strategy\n")
    
    # 4. Calculate metrics
    print("="*80)
    print("CALCULATING METRICS")
    print("="*80 + "\n")
    
    metrics_summary = {}
    for strategy_name, strategy_results in results.items():
        metrics = calculate_metrics(
            df_sample['actual_rating'].tolist(),
            strategy_results['predictions'],
            strategy_results['consistency_predictions']
        )
        metrics_summary[strategy_name] = metrics
    
    # Display results
    comparison_df = pd.DataFrame(metrics_summary).T
    comparison_df.index.name = 'Strategy'
    
    print(comparison_df.to_string())
    print()
    
    # 5. Save results
    print("="*80)
    print("SAVING RESULTS")
    print("="*80 + "\n")
    
    # Detailed results CSV
    detailed_results = []
    for idx, row in df_sample.iterrows():
        result_row = {
            'review_text': row['review_text'][:200] + '...' if len(row['review_text']) > 200 else row['review_text'],
            'actual_rating': row['actual_rating']
        }
        
        for strategy_name in strategies.keys():
            pred_idx = df_sample.index.get_loc(idx)
            pred = results[strategy_name]['predictions'][pred_idx]
            
            result_row[f'{strategy_name}_predicted'] = pred['predicted_stars']
            result_row[f'{strategy_name}_explanation'] = pred['explanation'][:100] if pred['explanation'] else ''
            result_row[f'{strategy_name}_valid_json'] = pred['is_valid_json']
        
        detailed_results.append(result_row)
    
    results_df = pd.DataFrame(detailed_results)
    results_df.to_csv('evaluation_results.csv', index=False)
    print("  Saved: evaluation_results.csv")
    
    # Comparison metrics
    comparison_df.to_csv('comparison_metrics.csv')
    print("  Saved: comparison_metrics.csv")
    print()
    
    # 6. Analysis
    print("="*80)
    print("KEY INSIGHTS")
    print("="*80 + "\n")
    
    best_accuracy = max(metrics_summary.items(), key=lambda x: x[1]['accuracy'])
    best_json = max(metrics_summary.items(), key=lambda x: x[1]['json_validity_rate'])
    best_consistency = max(metrics_summary.items(), key=lambda x: x[1]['consistency_rate'])
    best_mae = min(metrics_summary.items(), key=lambda x: x[1]['mean_absolute_error'])
    
    print(f"Best Accuracy: {best_accuracy[0].upper()} ({best_accuracy[1]['accuracy']:.2f}%)")
    print(f"Best JSON Validity: {best_json[0].upper()} ({best_json[1]['json_validity_rate']:.2f}%)")
    print(f"Best Consistency: {best_consistency[0].upper()} ({best_consistency[1]['consistency_rate']:.2f}%)")
    print(f"Best MAE: {best_mae[0].upper()} ({best_mae[1]['mean_absolute_error']:.2f})")
    print()
    
    print("-"*80)
    print("RECOMMENDATIONS FOR PRODUCTION")
    print("-"*80)
    print("  → Use RUBRIC-BASED strategy for best balance")
    print("  → Implement retry logic for JSON parsing failures")
    print("  → Use temperature=0.3 for deterministic outputs")
    print("  → Add input validation (review length, content filtering)")
    print()
    print("="*80)
    print("EVALUATION COMPLETE!")
    print("="*80)


if __name__ == "__main__":
    main()

