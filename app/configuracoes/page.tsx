'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  CameraIcon, 
  CheckCircleIcon,
  MapPinIcon // <--- NOVO ÍCONE
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [userId, setUserId] = useState<string>('');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState(''); // <--- NOVO ESTADO
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);

      // AGORA BUSCAMOS TAMBÉM A CIDADE (city)
      const { data } = await supabase
        .from('profiles')
        .select('clinic_name, avatar_url, city') 
        .eq('id', session.user.id)
        .single();

      if (data) {
        setClinicName(data.clinic_name || '');
        setCity(data.city || ''); // <--- PREENCHE O ESTADO
        if (data.avatar_url) {
          setAvatarUrl(`${data.avatar_url}?t=${new Date().getTime()}`);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const loadingToast = toast.loading('Enviando imagem...');
        
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
            toast.dismiss(loadingToast);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        finalAvatarUrl = publicUrl;
        toast.dismiss(loadingToast);
      }

      const cleanUrl = finalAvatarUrl?.split('?')[0];

      // SALVAMOS A CIDADE NO BANCO
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          clinic_name: clinicName,
          city: city, // <--- CAMPO NOVO
          avatar_url: cleanUrl,
          updated_at: new Date(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success('Perfil atualizado com sucesso!');
      
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao atualizar: ' + (error.message || 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="bg-white border-b border-gray-100 p-6 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Configurações</h1>
        </div>

        <div className="p-8 space-y-8">
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                {previewUrl || avatarUrl ? (
                  <img src={previewUrl || avatarUrl || ''} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-gray-300 font-bold">{clinicName?.charAt(0) || 'C'}</span>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <p className="text-sm text-gray-500">Clique para alterar a logo</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Clínica</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-gray-50 text-gray-900"
              placeholder="Minha Clínica"
            />
          </div>

          {/* NOVO CAMPO DE CIDADE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade (para documentos)</label>
            <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 pl-10 pr-4 bg-gray-50 text-gray-900"
                placeholder="Ex: São Paulo"
                />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-70"
          >
            {saving ? 'Salvando...' : <><CheckCircleIcon className="w-5 h-5" /> Salvar Alterações</>}
          </button>
        </div>
      </div>
    </div>
  );
}