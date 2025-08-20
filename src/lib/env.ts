import { z } from 'zod';

// Define the environment variable schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Sanity CMS
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().min(1),
  SANITY_API_READ_TOKEN: z.string().min(1),
  SANITY_API_WRITE_TOKEN: z.string().min(1),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  
  // App
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  
  // Analytics
  UMAMI_WEBSITE_ID: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Function to load environment variables with fallbacks
function loadEnv() {
  // Check if we're in a build context
  if (typeof process === 'undefined' || !process.env) {
    console.warn('Environment not available, using fallbacks');
    return {
      DATABASE_URL: 'postgresql://placeholder',
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'i10ney18',
      NEXT_PUBLIC_SANITY_DATASET: 'production',
      NEXT_PUBLIC_SANITY_API_VERSION: '2024-12-06',
      SANITY_API_READ_TOKEN: 'skpMtinf7QlJ771QH9sPOnpgZFbciHHoMO22lSgNvHZqQa72XXFpr82gcl9p8QfMwNsvXnQfQFKkg8VNyRyesdXu7VI3dX7xWKyjSHsWNyPnjj6CPScj96WqjIdS3v3B5E20ABFaP3phWMST2PyE51uDRDLjbCBy8zWLvNPGatGKagPgFIIw',
      SANITY_API_WRITE_TOKEN: 'skjbY0rFoMPGkV3MulNRiAy7FU9HQcIQM0Ul0r7nPz8hY6iVAfe3TKcPXDz5mdBRB8tyDOWvbpCyw5zBj9X8ZIJrRrBVb8Bx7IwhOysi7Y3HIwl0kR41kVEyy4CgLK4F5gb5afGb9iIKGFyf18YFuzbhLCJAs2T1xrcvsYSrMLq7v1ql1HRM',
      STRIPE_SECRET_KEY: 'sk_test_placeholder',
      STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
      NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
      UMAMI_WEBSITE_ID: 'placeholder',
      NODE_ENV: 'development' as const,
    };
  }

  const env = {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'i10ney18',
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-12-06',
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN || 'skpMtinf7QlJ771QH9sPOnpgZFbciHHoMO22lSgNvHZqQa72XXFpr82gcl9p8QfMwNsvXnQfQFKkg8VNyRyesdXu7VI3dX7xWKyjSHsWNyPnjj6CPScj96WqjIdS3v3B5E20ABFaP3phWMST2PyE51uDRDLjbCBy8zWLvNPGatGKagPgFIIw',
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN || 'skjbY0rFoMPGkV3MulNRiAy7FU9HQcIQM0Ul0r7nPz8hY6iVAfe3TKcPXDz5mdBRB8tyDOWvbpCyw5zBj9X8ZIJrRrBVb8Bx7IwhOysi7Y3HIwl0kR41kVEyy4CgLK4F5gb5afGb9iIKGFyf18YFuzbhLCJAs2T1xrcvsYSrMLq7v1ql1HRM',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID || 'placeholder',
    NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  };

  // Validate environment variables
  try {
    return envSchema.parse(env);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Environment validation failed:', error);
      throw new Error('Environment validation failed');
    }
    
    // In development, return with fallbacks
    console.warn('Environment validation failed, using fallbacks:', error);
    return env;
  }
}

// Export the validated environment
export const env = loadEnv();

// Export individual values for convenience
export const {
  DATABASE_URL,
  NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION,
  SANITY_API_READ_TOKEN,
  SANITY_API_WRITE_TOKEN,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_BASE_URL,
  UMAMI_WEBSITE_ID,
  NODE_ENV,
} = env; 