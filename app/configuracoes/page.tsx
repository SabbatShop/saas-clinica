'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  CameraIcon, 
  CheckCircleIcon,
  MapPinIcon,
  LockClosedIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Perfil
  const [userId, setUserId] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Segurança
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [savingSecurity, setSavingSecurity] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);

      const { data } = await supabase
        .from('profiles')
        .select('clinic_name, avatar_url, city')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setClinicName(data.clinic_name || '');
        setCity(data.city || '');
        if (data.avatar_url) setAvatarUrl(`${data.avatar_url}?t=${new Date().getTime()}`);
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  // --- SALVAR PERFIL ---
  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const loadingToast = toast.loading('Enviando imagem...');
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
        if (uploadError) { toast.dismiss(loadingToast); throw uploadError; }
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalAvatarUrl = publicUrl;
        toast.dismiss(loadingToast);
      }
      const cleanUrl = finalAvatarUrl?.split('?')[0];

      const { error } = await supabase.from('profiles').update({
          clinic_name: clinicName,
          city: city,
          avatar_url: cleanUrl,
          updated_at: new Date(),
      }).eq('id', userId);

      if (error) throw error;
      toast.success('Perfil atualizado!');
      setTimeout(() => { router.push('/'); router.refresh(); }, 1000);
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setSavingProfile(false);
    }
  }

  // --- ALTERAR SENHA ---
  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) return toast.error('Senha muito curta.');
    setSavingSecurity(true);
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast.success('Senha alterada com sucesso!');
        setNewPassword('');
    } catch (error: any) {
        toast.error('Erro ao mudar senha.');
    } finally {
        setSavingSecurity(false);
    }
  }

  // --- ALTERAR EMAIL ---
  async function handleChangeEmail() {
    if (!newEmail || !newEmail.includes('@')) return toast.error('E-mail inválido.');
    setSavingSecurity(true);
    try {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw error;
        toast.success('Verifique o NOVO e o ANTIGO e-mail para confirmar a troca!');
        setNewEmail('');
    } catch (error: any) {
        toast.error('Erro ao mudar e-mail.');
    } finally {
        setSavingSecurity(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
        setAvatarFile(e.target.files[0]);
        setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="w-full max-w-2xl space-y-6">
        
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><ArrowLeftIcon className="w-5 h-5" /></button>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        </div>

        {/* --- CARD PERFIL --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Perfil da Clínica</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="flex flex-col items-center gap-2">
                <div className="relative group cursor-pointer w-24 h-24">
                  <div className="w-24 h-24 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {previewUrl || avatarUrl ? <img src={previewUrl || avatarUrl || ''} className="w-full h-full object-cover" /> : <span className="text-2xl text-gray-300 font-bold">{clinicName?.charAt(0) || 'C'}</span>}
                  </div>
                  <label className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"><CameraIcon className="w-8 h-8" /><input type="file" hidden accept="image/*" onChange={handleFileSelect} /></label>
                </div>
                <span className="text-xs text-gray-400">Alterar Logo</span>
             </div>

             <div className="flex-1 w-full space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Clínica</label>
                    <input type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 py-2.5 px-4 bg-gray-50" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade (para documentos)</label>
                    <div className="relative">
                        <MapPinIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 py-2.5 pl-10 pr-4 bg-gray-50" />
                    </div>
                </div>
                <div className="pt-2 flex justify-end">
                    <button onClick={handleSaveProfile} disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all disabled:opacity-70">
                        {savingProfile ? 'Salvando...' : 'Salvar Dados'}
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* --- CARD SEGURANÇA --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <LockClosedIcon className="w-5 h-5 text-gray-500" /> Segurança da Conta
            </h2>

            <div className="space-y-6">
                {/* Trocar Senha */}
                <div className="pb-6 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Redefinir Senha</label>
                    <div className="flex gap-3">
                        <input type="password" placeholder="Nova senha segura" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="flex-1 rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 py-2.5 px-4 bg-gray-50" />
                        <button onClick={handleChangePassword} disabled={savingSecurity || !newPassword} className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50">Atualizar</button>
                    </div>
                </div>

                {/* Trocar Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alterar E-mail de Acesso</label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                             <EnvelopeIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                             <input type="email" placeholder="Novo e-mail" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 py-2.5 pl-10 px-4 bg-gray-50" />
                        </div>
                        <button onClick={handleChangeEmail} disabled={savingSecurity || !newEmail} className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50">Alterar</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Você receberá um link de confirmação no e-mail novo e no antigo.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}