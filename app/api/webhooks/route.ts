import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // 1. CHECKOUT COMPLETADO
  if (event.type === 'checkout.session.completed') {
    // --- CORREÇÃO AQUI: Adicionamos ': any' para corrigir o erro de tipo ---
    const subscription: any = await stripe.subscriptions.retrieve(session.subscription as string);
    
    const userId = session.metadata.userId;

    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        plan_type: 'pro',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', userId);
  }

  // 2. RENOVAÇÃO
  if (event.type === 'invoice.payment_succeeded') {
    // --- CORREÇÃO AQUI TAMBÉM ---
    const subscription: any = await stripe.subscriptions.retrieve(session.subscription as string);
    
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', session.subscription);
  }

  // 3. CANCELAMENTO
  if (event.type === 'customer.subscription.deleted') {
    await supabaseAdmin
      .from('profiles')
      .update({ 
          subscription_status: 'canceled',
          plan_type: 'basic'
      })
      .eq('stripe_subscription_id', session.subscription);
  }

  return new NextResponse(null, { status: 200 });
}
// Adicione isso no final do arquivo para testarmos no navegador
export async function GET() {
  return NextResponse.json({ message: "Webhook funcionando! O método GET foi aceito." });
}