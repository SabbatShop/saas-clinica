import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use a versão exata que o erro pediu:
  apiVersion: '2025-12-15.clover', 
  typescript: true,
});