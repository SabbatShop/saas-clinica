import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Inicializa o Supabase com a chave de serviço (ADMIN)
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

  try {
    // 1. CHECKOUT COMPLETADO (Criação da Assinatura com ou sem Trial)
    if (event.type === 'checkout.session.completed') {
      // Usamos : any para evitar o erro de propriedade inexistente no tipo Response
      const subscription: any = await stripe.subscriptions.retrieve(session.subscription as string);
      const userId = session.metadata.userId;

      console.log(`🔔 Checkout recebido para UserID: ${userId} | Status: ${subscription.status}`);

      if (!userId) {
         return new NextResponse('UserID Missing', { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: subscription.status, // Salva 'trialing' ou 'active'
          plan_type: 'pro',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', userId);

        if (error) {
            console.error('❌ Erro ao salvar no Supabase:', error);
            return new NextResponse(`Database Error: ${error.message}`, { status: 500 });
        }
    }

    // 2. MUDANÇA DE STATUS (Ex: De 'trialing' para 'active' quando o trial acaba)
    if (event.type === 'customer.subscription.updated') {
        const subscription: any = await stripe.subscriptions.retrieve(session.id as string);
        
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', session.id);
    }

    // 3. RENOVAÇÃO (Pagamento da Fatura)
    if (event.type === 'invoice.payment_succeeded') {
      const subscription: any = await stripe.subscriptions.retrieve(session.subscription as string);
      
      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', session.subscription);
    }

    // 4. CANCELAMENTO
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

  } catch (err: any) {
    console.error('❌ Erro Geral no Webhook:', err);
    return new NextResponse(`Server Error: ${err.message}`, { status: 500 });
  }
}

// Rota de teste para navegador
export async function GET() {
  return NextResponse.json({ message: "Webhook Online!" });
}