import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Cria a resposta base
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 2. Configura o cliente do Supabase para lidar com Cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 3. Verifica o usuário
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Lógica de Proteção de Rotas
  
  // Lista de rotas que exigem login
  const protectedPaths = ['/dashboard', '/configuracoes', '/financeiro'];
  
  // Verifica se a rota atual começa com alguma das protegidas
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Se for rota protegida e NÃO tiver usuário -> Manda pro Login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se for Login ou Home e JÁ tiver usuário -> Manda pro Dashboard
  if ((request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  // Define onde o middleware roda
  matcher: [
    '/', 
    '/login', 
    '/dashboard/:path*', 
    '/configuracoes/:path*', 
    '/financeiro/:path*'
  ],
}