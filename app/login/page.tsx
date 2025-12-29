'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ArrowLeftIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  
  // Dados do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // --- FUNÇÃO DE RECUPERAÇÃO DE SENHA ---
  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) throw error;

      toast.success('Conta criada com sucesso!.');
      setIsRecovery(false); 
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÃO DE LOGIN/CADASTRO ---
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // --- VALIDAÇÕES ---
    if (isSignUp) {
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            setLoading(false);
            return;
        }
        if (!city.trim()) {
            toast.error("Por favor, informe sua cidade.");
            setLoading(false);
            return;
        }
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // --- CADASTRO ---
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
            throw new Error("Este e-mail já está cadastrado.");
        }

        if (authData.user) {
          // Salva perfil e cidade
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              clinic_name: clinicName,
              city: city,
            }, { onConflict: 'id' });

          if (profileError) console.error(profileError);

          toast.success('Conta criada! Verifique seu e-mail.'); 
        }

      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast.success('Bem-vindo de volta!');
        
        // CORREÇÃO UX: Força atualização e ida para Dashboard
        router.refresh(); 
        router.push('/dashboard'); 
      }
    } catch (error: any) {
      let msg = error.message;
      if (msg === 'User already registered') msg = 'Este e-mail já possui cadastro.';
      if (msg === 'Invalid login credentials') msg = 'E-mail ou senha incorretos.';
      toast.error(msg || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm";

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* LADO ESQUERDO (Formulário) */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          <div className="mb-10">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isRecovery ? 'Recuperar Senha' : (isSignUp ? 'Comece sua jornada' : 'Bem-vindo de volta')}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {isRecovery 
                ? 'Digite seu e-mail para receber o link de redefinição.' 
                : (isSignUp ? 'Gerencie sua clínica com inteligência.' : 'Acesse seu painel e verifique seus agendamentos.')}
            </p>
          </div>

          <div>
            <form onSubmit={isRecovery ? handleRecovery : handleAuth} className="space-y-6">
              
              {/* CAMPOS EXTRAS DE CADASTRO */}
              {isSignUp && !isRecovery && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Clínica</label>
                    <input type="text" required={isSignUp} value={clinicName} onChange={e => setClinicName(e.target.value)} className={inputClasses} placeholder="Ex: Clínica Saúde Total" />
                  </div>
                  
                  {/* CAMPO CIDADE */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cidade</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            required={isSignUp} 
                            value={city} 
                            onChange={e => setCity(e.target.value)} 
                            className={`${inputClasses} pl-10`} 
                            placeholder="Ex: São Paulo" 
                        />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail Corporativo</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} placeholder="doutor@clinica.com" />
              </div>

              {!isRecovery && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-semibold text-gray-700">Senha</label>
                    {!isSignUp && (
                      <button 
                        type="button" 
                        onClick={() => setIsRecovery(true)} 
                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  
                  {/* CAMPO DE SENHA COM OLHINHO */}
                  <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        required={!isRecovery} 
                        minLength={6} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className={`${inputClasses} pr-10`} 
                        placeholder="••••••••" 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* CAMPO CONFIRMAR SENHA */}
              {isSignUp && !isRecovery && (
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
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all">
                  {loading ? 'Processando...' : (isRecovery ? 'Enviar Link de Recuperação' : (isSignUp ? 'Criar Conta Gratuita' : 'Entrar no Sistema'))}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              {isRecovery ? (
                <button onClick={() => setIsRecovery(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 mx-auto">
                  <ArrowLeftIcon className="w-4 h-4" /> Voltar para o Login
                </button>
              ) : (
                <p className="text-sm text-gray-600">
                  {isSignUp ? 'Já possui cadastro?' : 'Ainda não tem conta?'} {' '}
                  <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                    {isSignUp ? 'Fazer Login' : 'Testar Grátis'}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO (Imagem/Marketing) */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-900">
        <img className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Medical Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-20 text-white">
          <h2 className="text-4xl font-bold mb-4 leading-tight">Gestão inteligente para<br/>clínicas modernas.</h2>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">Organize agendamentos, prontuários e pacientes em um único lugar. Simples, rápido e seguro.</p>
        </div>
      </div>
    </div>
  );
}