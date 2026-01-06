import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = 'openai/gpt-3.5-turbo';

// Rubric-based prompt (from Task 1 findings)
const RATING_ANALYSIS_SYSTEM_PROMPT = `You are an expert review analyst. Use the following rubric to understand customer sentiment:

RATING RUBRIC:
★ 1 Star: Extremely negative sentiment, mentions of terrible service/quality, words like "worst", "awful", "never again"
★★ 2 Stars: Mostly negative, disappointed, multiple complaints, minimal positive aspects
★★★ 3 Stars: Mixed/neutral sentiment, both positives and negatives mentioned, "okay" or "average"
★★★★ 4 Stars: Mostly positive, generally satisfied, minor issues mentioned, would recommend
★★★★★ 5 Stars: Extremely positive, enthusiastic, words like "amazing", "perfect", "best", strong recommendation`;

interface LLMResponse {
  userResponse: string;
  adminSummary: string;
  recommendedAction: string;
}

/**
 * Generate AI responses for a review submission
 */
export async function generateReviewResponses(
  rating: number,
  reviewText: string
): Promise<LLMResponse> {
  try {
    // Generate user-facing response
    const userResponse = await generateUserResponse(rating, reviewText);
    
    // Generate admin summary and recommendation
    const { summary, action } = await generateAdminAnalysis(rating, reviewText);
    
    return {
      userResponse,
      adminSummary: summary,
      recommendedAction: action,
    };
  } catch (error) {
    console.error('LLM API error:', error);
    
    // Fallback responses for graceful degradation
    return {
      userResponse: getFallbackUserResponse(rating),
      adminSummary: `Customer gave ${rating} stars. Review: "${reviewText.substring(0, 100)}..."`,
      recommendedAction: getFallbackRecommendedAction(rating),
    };
  }
}

/**
 * Generate personalized response to user
 */
async function generateUserResponse(rating: number, reviewText: string): Promise<string> {
  const prompt = `${RATING_ANALYSIS_SYSTEM_PROMPT}

A customer left a ${rating}-star review: "${reviewText}"

Generate a personalized, empathetic response (2-3 sentences) that:
- Thanks them for their feedback
- Acknowledges their specific experience
- ${rating <= 2 ? 'Apologizes and offers to resolve issues' : rating >= 4 ? 'Expresses gratitude for positive feedback' : 'Acknowledges both positives and areas for improvement'}

Response:`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0].message.content?.trim() || getFallbackUserResponse(rating);
}

/**
 * Generate admin summary and recommended action
 */
async function generateAdminAnalysis(
  rating: number,
  reviewText: string
): Promise<{ summary: string; action: string }> {
  const prompt = `${RATING_ANALYSIS_SYSTEM_PROMPT}

Review: ${rating} stars - "${reviewText}"

Provide:
1. SUMMARY: One sentence summarizing the key points and sentiment
2. ACTION: One specific, actionable recommendation for the business

Format:
SUMMARY: [your summary]
ACTION: [your recommendation]`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 200,
  });

  const content = response.choices[0].message.content?.trim() || '';
  
  // Parse response
  const summaryMatch = content.match(/SUMMARY:\s*(.+?)(?=ACTION:|$)/s);
  const actionMatch = content.match(/ACTION:\s*(.+)/s);
  
  return {
    summary: summaryMatch?.[1]?.trim() || `${rating}-star review: ${reviewText.substring(0, 100)}...`,
    action: actionMatch?.[1]?.trim() || getFallbackRecommendedAction(rating),
  };
}

/**
 * Fallback user responses when LLM fails
 */
function getFallbackUserResponse(rating: number): string {
  if (rating <= 2) {
    return "Thank you for your feedback. We sincerely apologize for your experience and would like to make things right. Please contact our support team so we can address your concerns.";
  } else if (rating === 3) {
    return "Thank you for your feedback. We appreciate you taking the time to share your experience and will use your input to improve our service.";
  } else {
    return "Thank you so much for your positive feedback! We're thrilled to hear about your experience and look forward to serving you again soon.";
  }
}

/**
 * Fallback recommended actions when LLM fails
 */
function getFallbackRecommendedAction(rating: number): string {
  if (rating <= 2) {
    return "Contact customer immediately to resolve issues and prevent churn.";
  } else if (rating === 3) {
    return "Follow up to understand areas for improvement.";
  } else {
    return "Thank customer and encourage them to share their positive experience.";
  }
}

/**
 * Validate LLM API connection
 */
export async function validateLLMConnection(): Promise<boolean> {
  try {
    await openai.models.list();
    console.log('✓ OpenRouter API connection validated');
    return true;
  } catch (error) {
    console.error('✗ OpenRouter API connection failed:', error);
    return false;
  }
}

