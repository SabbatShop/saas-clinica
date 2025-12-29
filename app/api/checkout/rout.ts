import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    // 1. Recebe os dados do usuário que quer pagar
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Dados do usuário faltando' }, { status: 400 });
    }

    // 2. Cria a Sessão de Checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Aceitar cartão
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // O ID que você pegou no painel (price_...)
          quantity: 1,
        },
      ],
      mode: 'subscription', // Modo Assinatura (Recorrente)
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      customer_email: email, // Já preenche o email do médico
      metadata: {
        userId: userId, // CRÍTICO: Isso permite a gente saber QUEM pagou depois
      },
    });

    // 3. Devolve o link de pagamento para o site
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Erro no Stripe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}