import { z } from 'zod';

// Review submission schema
export const ReviewSubmissionSchema = z.object({
  rating: z.number().int().min(1).max(5).describe('Star rating from 1 to 5'),
  review: z.string()
    .min(1, 'Review cannot be empty')
    .max(5000, 'Review too long (max 5000 characters)')
    .transform(val => val.trim())
    .refine(val => val.length > 0, 'Review cannot be only whitespace'),
});

export type ReviewSubmission = z.infer<typeof ReviewSubmissionSchema>;

// Query params for filtering
export const ReviewFilterSchema = z.object({
  rating: z.string().optional().transform(val => {
    if (!val) return undefined;
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  }).refine(val => val === undefined || (val >= 1 && val <= 5), {
    message: 'Rating must be between 1 and 5'
  }),
});

export type ReviewFilter = z.infer<typeof ReviewFilterSchema>;

