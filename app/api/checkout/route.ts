import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Dados faltando' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      
      // CONFIGURAÇÃO DO TRIAL (7 DIAS)
      subscription_data: {
        trial_period_days: 7, 
      },
      
      // Removido 'payment_settings' para corrigir o erro de TypeScript.
      // No modo 'subscription', o Stripe já gerencia o salvamento do cartão automaticamente.

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      customer_email: email,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Erro Checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}