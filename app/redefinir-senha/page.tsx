'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // 1. Escuta o evento de login
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        setIsVerifying(false);
      }
    });

    // 2. Fallback de segurança
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
         toast.error('Link inválido ou expirado.');
         router.push('/login');
      } else {
         setIsVerifying(false);
      }
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!');
      router.push('/'); 
    } catch (error: any) {
      console.error(error);
      
      // --- TRADUÇÃO DE ERROS ---
      let msg = error.message;

      if (msg.includes('New password should be different from the old password')) {
        msg = 'A nova senha não pode ser igual à antiga.';
      } else if (msg.includes('Password should be at least 6 characters')) {
        msg = 'A senha deve ter no mínimo 6 caracteres.';
      } else if (msg.includes('weak_password')) {
        msg = 'A senha é muito fraca. Escolha uma mais segura.';
      } else {
        msg = 'Erro ao atualizar senha. Tente novamente.';
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">
         <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Verificando segurança...</span>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Criar Nova Senha</h2>
        <p className="text-sm text-gray-500 mb-6">Digite sua nova senha abaixo para recuperar o acesso.</p>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <input 
              type="password" 
              required
              minLength={6}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-gray-50 text-gray-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}