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
  const signature = (await (await headers()).get('Stripe-Signature')) as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`❌ Erro de Assinatura Webhook: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // Função auxiliar para formatar a data de forma segura
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return new Date().toISOString(); // Fallback para agora se não vier data
    try {
      return new Date(timestamp * 1000).toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };

  try {
    // 1. CHECKOUT COMPLETADO
    if (event.type === 'checkout.session.completed') {
      const subscriptionId = session.subscription as string;
      if (!subscriptionId) throw new Error("Subscription ID missing");

      const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = session.metadata.userId;

      if (!userId) return new NextResponse('UserID Missing', { status: 400 });

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          plan_type: 'pro',
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscriptionId,
          current_period_end: formatDate(subscription.current_period_end),
        })
        .eq('id', userId);

        if (error) throw error;
        console.log(`✅ Checkout processado para o usuário ${userId}`);
    }

    // 2. ATUALIZAÇÃO OU RENOVAÇÃO
    if (event.type === 'customer.subscription.updated' || event.type === 'invoice.payment_succeeded') {
      const subscriptionId = (event.type === 'invoice.payment_succeeded' ? session.subscription : session.id) as string;

      if (subscriptionId) {
        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
        
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            current_period_end: formatDate(subscription.current_period_end),
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        if (error) console.error('❌ Erro Supabase Update:', error.message);
      }
    }

    // 3. CANCELAMENTO
    if (event.type === 'customer.subscription.deleted') {
      const subscriptionId = session.id as string;

      await supabaseAdmin
        .from('profiles')
        .update({ 
            subscription_status: 'canceled',
            plan_type: 'basic'
        })
        .eq('stripe_subscription_id', subscriptionId);
    }

    return new NextResponse(null, { status: 200 });

  } catch (err: any) {
    console.error('❌ Erro Geral no Webhook:', err.message);
    return new NextResponse(`Server Error: ${err.message}`, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Webhook Online!" });
}