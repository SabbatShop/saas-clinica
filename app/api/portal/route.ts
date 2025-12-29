import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Busca o ID do cliente Stripe no banco
    const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

    if (!profile?.stripe_customer_id) {
        return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 });
    }

    // Cria a sessão do Portal de Faturamento
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (error: any) {
    console.error('Erro Portal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}