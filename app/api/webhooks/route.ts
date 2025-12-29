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
  const signature = (await headers()).get('stripe-signature') as string;

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
    if (!timestamp) return null;
    try {
      return new Date(timestamp * 1000).toISOString();
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return null;
    }
  };

  try {
    // 1. CHECKOUT COMPLETADO
    if (event.type === 'checkout.session.completed') {
      const subscriptionId = session.subscription as string;
      if (!subscriptionId) {
        console.log('⚠️ Checkout sem subscription ID');
        return new NextResponse('No subscription', { status: 200 });
      }

      const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error('❌ UserID ausente no metadata');
        return new NextResponse('UserID Missing', { status: 400 });
      }

      console.log('📦 Checkout completado:', {
        userId,
        subscriptionId,
        status: subscription.status,
        trial_end: subscription.trial_end,
        current_period_end: subscription.current_period_end
      });

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: subscription.status, // 'trialing' ou 'active'
          plan_type: 'pro',
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscriptionId,
          current_period_end: formatDate(subscription.current_period_end),
        })
        .eq('id', userId);

      if (error) throw error;
      console.log(`✅ Checkout processado para o usuário ${userId}`);
    }

    // 2. SUBSCRIPTION CRIADA (IMPORTANTE PARA TRIALS!)
    if (event.type === 'customer.subscription.created') {
      const subscription = session as any;
      
      console.log('🆕 Nova subscription criada:', {
        id: subscription.id,
        status: subscription.status,
        trial_end: subscription.trial_end,
        current_period_end: subscription.current_period_end
      });

      // Busca o userId pelo customer_id
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .single();

      if (profile) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            current_period_end: formatDate(subscription.current_period_end),
          })
          .eq('id', profile.id);

        if (error) console.error('❌ Erro ao atualizar subscription criada:', error);
        else console.log(`✅ Subscription criada atualizada para usuário ${profile.id}`);
      }
    }

    // 3. ATUALIZAÇÃO OU RENOVAÇÃO
    if (event.type === 'customer.subscription.updated') {
      const subscription = session as any;

      console.log('🔄 Subscription atualizada:', {
        id: subscription.id,
        status: subscription.status,
        trial_end: subscription.trial_end,
        current_period_end: subscription.current_period_end
      });

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          current_period_end: formatDate(subscription.current_period_end),
        })
        .eq('stripe_subscription_id', subscription.id);
      
      if (error) console.error('❌ Erro Supabase Update:', error.message);
      else console.log(`✅ Subscription ${subscription.id} atualizada`);
    }

    // 4. PAGAMENTO BEM-SUCEDIDO (Renovação)
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = session as any;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        console.log('💳 Pagamento bem-sucedido:', subscriptionId);

        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
        
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            current_period_end: formatDate(subscription.current_period_end),
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        if (error) console.error('❌ Erro ao atualizar pagamento:', error.message);
        else console.log(`✅ Pagamento processado para ${subscriptionId}`);
      }
    }

    // 5. CANCELAMENTO
    if (event.type === 'customer.subscription.deleted') {
      const subscription = session as any;
      const subscriptionId = subscription.id as string;

      console.log('🗑️ Subscription cancelada:', subscriptionId);

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_status: 'canceled',
          plan_type: 'basic',
          current_period_end: null,
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (error) console.error('❌ Erro ao cancelar:', error);
      else console.log(`✅ Cancelamento processado: ${subscriptionId}`);
    }

    // 6. TRIAL TERMINANDO (Opcional - para notificar usuário)
    if (event.type === 'customer.subscription.trial_will_end') {
      const subscription = session as any;
      console.log('⏰ Trial terminando em 3 dias:', subscription.id);
      // Aqui você pode enviar email ou notificação
    }

    return new NextResponse(null, { status: 200 });

  } catch (err: any) {
    console.error('❌ Erro Geral no Webhook:', err.message, err);
    return new NextResponse(`Server Error: ${err.message}`, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Webhook Online!",
    eventos_monitorados: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'customer.subscription.trial_will_end'
    ]
  });
}