import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast'; // <--- 1. IMPORTAR

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Meu SaaS Médico',
  description: 'Gestão de consultório',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* <--- 2. ADICIONAR O COMPONENTE AQUI, ANTES DO CHILDREN */}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        {children}
      </body>
    </html>
  );
}