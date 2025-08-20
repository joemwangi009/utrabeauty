import { z } from 'zod';

// Define the environment variable schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
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
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  
  // Analytics
  UMAMI_WEBSITE_ID: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Function to load environment variables with fallbacks
function loadEnv() {
  // Try to load from .env file first (for local development)
  try {
    require('dotenv').config();
  } catch (error) {
    // dotenv not available, continue with process.env
  }

  const env = {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-12-06',
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN || 'placeholder_token',
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN || 'placeholder_token',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID || 'placeholder',
    NODE_ENV: process.env.NODE_ENV || 'development',
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