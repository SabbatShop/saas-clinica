import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Alterado para uma versão estável recente
  typescript: true,
});