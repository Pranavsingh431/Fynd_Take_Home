import { Router, Request, Response } from 'express';
import { ReviewSubmissionSchema, ReviewFilterSchema } from '../schemas/validation';
import { insertReview, getReviews, getReviewStats } from '../db/database';
import { generateReviewResponses } from '../services/llm';

const router = Router();

/**
 * POST /api/reviews
 * Submit a new review
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = ReviewSubmissionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    
    const { rating, review } = validation.data;
    
    // Check for empty review after trimming
    if (review.length === 0) {
      return res.status(400).json({
        error: 'Review cannot be empty or contain only whitespace',
      });
    }
    
    // Generate AI responses
    console.log(`Generating AI responses for ${rating}-star review...`);
    const { userResponse, adminSummary, recommendedAction } = await generateReviewResponses(
      rating,
      review
    );
    
    // Save to database
    const savedReview = await insertReview(
      rating,
      review,
      userResponse,
      adminSummary,
      recommendedAction
    );
    
    console.log(`✓ Review saved with ID: ${savedReview.id}`);
    
    // Return user-facing response
    return res.status(201).json({
      success: true,
      data: {
        id: savedReview.id,
        rating: savedReview.rating,
        userResponse: savedReview.user_response,
        createdAt: savedReview.created_at,
      },
    });
    
  } catch (error) {
    console.error('Error processing review:', error);
    
    return res.status(500).json({
      error: 'Failed to process review',
      message: 'An error occurred while processing your review. Please try again later.',
    });
  }
});

/**
 * GET /api/reviews
 * Get all reviews (with optional rating filter)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Validate query params
    const validation = ReviewFilterSchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validation.error.errors,
      });
    }
    
    const { rating } = validation.data;
    
    // Fetch reviews from database
    const reviews = await getReviews(rating);
    
    // Get statistics
    const stats = await getReviewStats();
    
    return res.status(200).json({
      success: true,
      data: {
        reviews: reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          reviewText: r.review_text,
          userResponse: r.user_response,
          adminSummary: r.admin_summary,
          recommendedAction: r.recommended_action,
          createdAt: r.created_at,
        })),
        stats,
        total: reviews.length,
      },
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch reviews',
      message: 'An error occurred while fetching reviews. Please try again later.',
    });
  }
});

/**
 * GET /api/reviews/stats
 * Get review statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getReviewStats();
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    return res.status(200).json({
      success: true,
      data: {
        byRating: stats,
        total,
      },
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch statistics',
    });
  }
});

export default router;

