'use client';

import { useState } from 'react'; // Removi o useEffect pois o toast gerencia o tempo sozinho
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // <--- IMPORTADO
import { 
  EyeIcon, 
  EyeSlashIcon, 
  // Removi CheckCircleIcon e XCircleIcon pois não são mais usados
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Dados do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  
  // Controle Visual
  const [showPassword, setShowPassword] = useState(false);
  
  // --- REMOVIDOS OS ESTADOS E O EFFECT DE ERRO/SUCESSO MANUAL ---

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // --- VALIDAÇÕES COM TOAST ---
    if (isSignUp && password !== confirmPassword) {
      toast.error("As senhas não coincidem."); // <--- TOAST
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres."); // <--- TOAST
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // --- CADASTRAR ---
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
            throw new Error("Este e-mail já está cadastrado.");
        }

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              clinic_name: clinicName,
            }, { onConflict: 'id' });

          if (profileError) {
            console.error("Erro ao salvar perfil:", profileError);
          }

          toast.success('Conta criada com sucesso! Entrando...'); // <--- TOAST
          
          setTimeout(() => {
             router.push('/');
             router.refresh();
          }, 1500);
        }

      } else {
        // --- ENTRAR ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast.success('Login realizado com sucesso!'); // <--- TOAST
        router.push('/'); 
        router.refresh(); 
      }
    } catch (error: any) {
      let msg = error.message;
      if (msg === 'User already registered') msg = 'Este e-mail já possui cadastro.';
      if (msg === 'Invalid login credentials') msg = 'E-mail ou senha incorretos.';
      toast.error(msg || 'Ocorreu um erro desconhecido.'); // <--- TOAST DE ERRO
    } finally {
      setLoading(false);
    }
  }

  // Classe base para os inputs
  const inputClasses = "appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm";

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* --- LADO ESQUERDO: FORMULÁRIO --- */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          {/* Header do Form */}
          <div className="mb-10">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isSignUp ? 'Comece sua jornada' : 'Bem-vindo de volta'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {isSignUp ? 'Gerencie sua clínica com inteligência e praticidade.' : 'Acesse seu painel e verifique seus agendamentos.'}
            </p>
          </div>

          {/* --- AQUI EU REMOVI O BLOCO ANTIGO DE ERRO/SUCESSO, POIS O TOAST APARECE FLUTUANDO --- */}

          <div>
            <form onSubmit={handleAuth} className="space-y-6">
              
              {isSignUp && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Clínica</label>
                  <input 
                    type="text" 
                    required={isSignUp}
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    className={inputClasses}
                    placeholder="Ex: Clínica Saúde Total"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail Corporativo</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="doutor@clinica.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`${inputClasses} pr-10`}
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                 <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Senha</label>
                   <input 
                     type="password"
                     required={isSignUp}
                     value={confirmPassword}
                     onChange={e => setConfirmPassword(e.target.value)}
                     className={inputClasses}
                     placeholder="Repita a senha"
                   />
                 </div>
              )}

              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </span>
                  ) : (isSignUp ? 'Criar Conta Gratuita' : 'Entrar no Sistema')}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Já possui cadastro?' : 'Ainda não tem conta?'}
                {' '}
                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    // Removido reset de ErrorMsg pois o toast some sozinho
                    setConfirmPassword('');
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {isSignUp ? 'Fazer Login' : 'Testar Grátis'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- LADO DIREITO: IMAGEM/BRANDING (MANTIDO EXATAMENTE IGUAL) --- */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Medical Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-20 text-white">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Gestão inteligente para<br/>clínicas modernas.
          </h2>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            Organize agendamentos, prontuários e pacientes em um único lugar. 
            Simples, rápido e seguro.
          </p>

          <div className="mt-8 flex items-center gap-4 pt-8 border-t border-white/10">
            <div className="flex -space-x-2">
              <img className="inline-block h-10 w-10 rounded-full ring-2 ring-gray-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile 1" />
              <img className="inline-block h-10 w-10 rounded-full ring-2 ring-gray-900 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="Profile 2" />
              <img className="inline-block h-10 w-10 rounded-full ring-2 ring-gray-900 object-cover" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile 3" />
            </div>
            <p className="text-sm font-medium text-gray-300">Junte-se a outros especialistas</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}