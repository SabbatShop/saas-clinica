import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 1. Configura o cliente Supabase para o Servidor (com acesso aos cookies)
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignora erros de escrita de cookies em Server Components/Rotas se já tratados no Middleware
            }
          },
        },
      }
    );

    // 2. Verifica autenticação do usuário (Mais seguro que pegar userId do body)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 3. Busca o ID do cliente Stripe no banco usando o ID do usuário logado
    const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

    if (!profile?.stripe_customer_id) {
        return NextResponse.json({ error: 'Cliente Stripe não encontrado. O usuário possui assinatura?' }, { status: 404 });
    }

    // 4. Cria a sessão do Portal de Faturamento
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