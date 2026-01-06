import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool
// SSL configuration for Render / Neon / Supabase
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Database initialization
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Create reviews table (single table design)
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        user_response TEXT NOT NULL,
        admin_summary TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create index for faster filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
    `);
    
    // Create index for sorting by date
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
    `);
    
    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Review interface
export interface Review {
  id: number;
  rating: number;
  review_text: string;
  user_response: string;
  admin_summary: string;
  recommended_action: string;
  created_at: Date;
}

// Insert review
export async function insertReview(
  rating: number,
  reviewText: string,
  userResponse: string,
  adminSummary: string,
  recommendedAction: string
): Promise<Review> {
  const client = await pool.connect();
  
  try {
    const result = await client.query<Review>(
      `INSERT INTO reviews (rating, review_text, user_response, admin_summary, recommended_action)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [rating, reviewText, userResponse, adminSummary, recommendedAction]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting review:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all reviews (with optional rating filter)
export async function getReviews(ratingFilter?: number): Promise<Review[]> {
  const client = await pool.connect();
  
  try {
    let query = 'SELECT * FROM reviews ORDER BY created_at DESC';
    const params: any[] = [];
    
    if (ratingFilter !== undefined && ratingFilter >= 1 && ratingFilter <= 5) {
      query = 'SELECT * FROM reviews WHERE rating = $1 ORDER BY created_at DESC';
      params.push(ratingFilter);
    }
    
    const result = await client.query<Review>(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get review statistics
export async function getReviewStats(): Promise<{ [key: number]: number }> {
  const client = await pool.connect();
  
  try {
    const result = await client.query<{ rating: number; count: string }>(
      'SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating'
    );
    
    const stats: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      stats[i] = 0;
    }
    
    result.rows.forEach(row => {
      stats[row.rating] = parseInt(row.count, 10);
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  } finally {
    client.release();
  }
}

