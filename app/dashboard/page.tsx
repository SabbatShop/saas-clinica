'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Services
import { getMonthlyAppointments, Appointment } from '../services/appointmentService';
import { getTransactions, Transaction } from '../services/transactionService';

// Componentes
import { CalendarWidget } from '../componentes/CalendarWidget';
import { NewAppointmentModal } from '../componentes/NewAppointmentModal';
import { NewTransactionModal } from '../componentes/NewTransactionModal';
import { RevenueChart } from '../componentes/RevenueChart';
import { SearchBar } from '../componentes/SearchBar';
import { PatientHistoryModal } from '../componentes/PatientHistoryModal';
import { FinancialKPIs } from '../componentes/FinancialKPIs';
import { DocumentModal } from '../componentes/DocumentModal';

// Utils
import { format, isSameDay, getYear, getMonth, getHours, differenceInDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { 
  ArrowRightOnRectangleIcon, 
  Cog6ToothIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  PrinterIcon,
  LockClosedIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const router = useRouter();
  
  // --- ESTADOS DE DADOS ---
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([]);
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);
  
  // Datas
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  
  // Busca
  const [searchTerm, setSearchTerm] = useState('');

  // Usuário e Perfil
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState<{ clinic_name: string, avatar_url: string | null, city: string } | null>(null);
  
  // Estado da Assinatura
  const [subscription, setSubscription] = useState<{ isActive: boolean, endDate: string | null } | null>(null);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [historyPatientName, setHistoryPatientName] = useState<string | null>(null);
  const [documentPatient, setDocumentPatient] = useState<string | null>(null);

  // Saudação
  const hour = getHours(new Date());
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // --- EFEITOS (Data Fetching) ---
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      } 
      
      setUserId(session.user.id);
      
      // Busca Perfil + Dados de Assinatura
      const { data: profileData } = await supabase
        .from('profiles')
        .select('clinic_name, avatar_url, city, subscription_status, current_period_end')
        .eq('id', session.user.id)
        .single();
      
      if (profileData) {
        setProfile({
            clinic_name: profileData.clinic_name,
            avatar_url: profileData.avatar_url,
            city: profileData.city || 'Sua Cidade'
        });

        // CORREÇÃO: Verifica se a data existe e é válida
        const expiryDate = profileData.current_period_end ? profileData.current_period_end : null;

        setSubscription({
            isActive: ['active', 'trialing'].includes(profileData.subscription_status),
            endDate: expiryDate
        });
      } else {
        setProfile({ clinic_name: 'Minha Clínica', avatar_url: null, city: 'Sua Cidade' });
      }

      if (profileData && ['active', 'trialing'].includes(profileData.subscription_status)) {
          fetchData(currentMonthDate, session.user.id);
      } else {
          setLoading(false); 
      }
    }
    checkUser();
  }, [router, currentMonthDate]);

  useEffect(() => {
    if (userId && subscription?.isActive) {
      fetchData(currentMonthDate, userId);
    }
  }, [currentMonthDate, userId, subscription]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleSubscribe() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email
        })
      });

      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else toast.error("Erro ao iniciar pagamento.");
      
    } catch (error) {
      toast.error("Erro de conexão.");
    }
  }

  async function fetchData(dateToFetch: Date, uid: string) {
    if (!uid) return;
    setLoading(true);
    const year = getYear(dateToFetch);
    const month = getMonth(dateToFetch) + 1;

    try {
      const [appointmentsData, transactionsData] = await Promise.all([
        getMonthlyAppointments(year, month, uid),
        getTransactions(month, year, uid)
      ]);

      setAgendamentos(appointmentsData || []);
      setTransacoes(transactionsData || []);

    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleMonthChange(newDate: Date) {
    setCurrentMonthDate(newDate);
  }

  const financialTotals = useMemo(() => {
    const revenueFromAppointments = agendamentos
      .filter(app => app.status === 'concluido')
      .reduce((acc, curr) => acc + curr.price, 0);

    const otherIncome = transacoes
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const expenses = transacoes
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalRevenue: revenueFromAppointments + otherIncome,
      totalExpenses: expenses
    };
  }, [agendamentos, transacoes]);

  const todayAppointments = agendamentos.filter(app => isSameDay(new Date(app.start_time), selectedDate));
  
  const displayedAppointments = searchTerm 
    ? agendamentos.filter(app => app.patient_name.toLowerCase().includes(searchTerm.toLowerCase()))
    : todayAppointments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'concluido': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-blue-500';
      case 'concluido': return 'bg-green-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-amber-400';
    }
  };

  function openWhatsApp(e: React.MouseEvent, phone: string | undefined, patientName: string, startTime: string) {
    e.stopPropagation(); 
    if (!phone) {
        toast.error("Paciente sem telefone cadastrado.");
        return;
    }
    const cleanPhone = phone.replace(/\D/g, ''); 
    const dateFormatted = format(new Date(selectedDate), "dd/MM", { locale: ptBR });
    const clinicName = profile?.clinic_name || 'Consultório';
    const message = `Olá, *${patientName}*! Tudo bem? 👋%0a%0aAqui é da *${clinicName}*.%0a%0aGostaríamos de confirmar sua consulta para:%0a📅 Data: *${dateFormatted}*%0a⏰ Horário: *${startTime}*%0a%0aPodemos confirmar?`;
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  }

  if (!loading && subscription && !subscription.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
         <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <LockClosedIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Assinatura Expirada</h1>
            <p className="text-gray-500 mb-8">Para continuar gerenciando seus pacientes e financeiro, reative sua assinatura Premium.</p>
            <button onClick={handleSubscribe} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg">
               <CreditCardIcon className="w-5 h-5" /> Assinar Agora
            </button>
            <button onClick={handleLogout} className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline">Sair da conta</button>
         </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen font-sans text-gray-900 pb-10">
      <header className="bg-white sticky top-0 z-30 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative bg-gray-100">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover"/>
               ) : (
                 <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold">{profile?.clinic_name?.charAt(0) || 'C'}</div>
               )}
             </div>
             <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">{profile?.clinic_name || 'Minha Clínica'}</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Painel Médico</p>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-gray-700">{greeting}</span>
                <span className="text-xs text-gray-400">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
             </div>
             <button title="Gestão Financeira" onClick={() => router.push('/financeiro')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"><BanknotesIcon className="w-6 h-6" /></button>
             <button title="Configurações" onClick={() => router.push('/configuracoes')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"><Cog6ToothIcon className="w-6 h-6" /></button>
             <button title="Sair" onClick={handleLogout} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"><ArrowRightOnRectangleIcon className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {subscription && (
            <div className="bg-slate-900 rounded-xl p-4 text-white mb-6 flex items-center justify-between shadow-lg">
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sua Assinatura</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-emerald-400">
                        {/* CORREÇÃO NO CÁLCULO DOS DIAS: Força o uso do início do dia para comparação justa */}
                        {subscription?.endDate ? Math.max(0, differenceInDays(startOfDay(new Date(subscription.endDate)), startOfDay(new Date()))) : 0}
                    </span>
                    <span className="text-sm text-slate-300">dias restantes</span>
                </div>
            </div>
            <button 
                onClick={async () => {
                    const toastId = toast.loading('Carregando portal...');
                    try {
                        const res = await fetch('/api/portal', { method: 'POST' });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                        else toast.error(data.error || 'Erro ao abrir portal', { id: toastId });
                    } catch (e) {
                        toast.error('Erro de conexão', { id: toastId });
                    }
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 rounded-lg transition-colors border border-white/10 flex items-center gap-2"
            >
                <CreditCardIcon className="w-4 h-4"/> Gerenciar
            </button>
            </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[360px] flex-shrink-0 space-y-6">
            <CalendarWidget 
              appointments={agendamentos} 
              currentDate={currentMonthDate}
              onDateChange={handleMonthChange}
              selectedDate={selectedDate}
              onSelectDate={(date) => { setSelectedDate(date); setSearchTerm(''); }} 
            />
            <RevenueChart appointments={agendamentos} currentDate={currentMonthDate} />
          </div>

          <div className="flex-1 min-w-0">
            {!searchTerm && <FinancialKPIs totalRevenue={financialTotals.totalRevenue} totalExpenses={financialTotals.totalExpenses} />}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{searchTerm ? 'Resultados da busca' : format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</h2>
                <p className="text-gray-500 text-sm mt-1">{searchTerm ? `Filtrando por "${searchTerm}"` : 'Visão geral do dia.'}</p>
              </div>
              <div className="flex w-full sm:w-auto gap-2 flex-wrap sm:flex-nowrap">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar paciente..." />
                <button onClick={() => setIsTransactionModalOpen(true)} className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-semibold shadow-sm text-sm">$ Lançar Conta</button>
                <button onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-sm"><span>+ Agendar</span></button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] p-6 relative">
              {loading ? (
                <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : displayedAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <CheckBadgeIcon className="w-16 h-16 text-gray-200 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Agenda Livre</h3>
                  <p className="text-gray-500 text-sm mt-2">{searchTerm ? "Nenhum resultado." : "Nenhum paciente para este dia."}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedAppointments.map((item) => (
                    <div key={item.id} className="relative flex flex-col sm:flex-row group animate-in slide-in-from-bottom-2 duration-500">
                      <div className="sm:w-16 flex-shrink-0 flex sm:flex-col items-center sm:items-end sm:pr-6 mb-2 sm:mb-0 gap-2 sm:gap-0">
                        <span className="text-sm font-bold text-gray-900">{format(new Date(item.start_time), 'HH:mm')}</span>
                        <span className="text-xs text-gray-400">{format(new Date(item.end_time), 'HH:mm')}</span>
                      </div>
                      <div onClick={() => { setEditingAppointment(item); setIsModalOpen(true); }} className="flex-1 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg flex flex-wrap items-center gap-2">
                              {item.patient_name}
                              {item.patient_phone && (
                                <button onClick={(e) => openWhatsApp(e, item.patient_phone, item.patient_name, format(new Date(item.start_time), 'HH:mm'))} className="text-green-700 bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">WhatsApp</button>
                              )}
                            </h3>
                            <div className="mt-3 flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); setHistoryPatientName(item.patient_name); }} className="text-xs font-medium text-blue-600 hover:underline">Ver Prontuário &rarr;</button>
                              <button onClick={(e) => { e.stopPropagation(); setDocumentPatient(item.patient_name); }} className="text-xs font-medium text-gray-500 hover:underline flex items-center gap-1"><PrinterIcon className="w-3 h-3" /> Documentos</button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusColor(item.status)}`}>{item.status}</span>
                            <span className="text-sm font-semibold text-gray-600">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <NewAppointmentModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAppointment(null); }} selectedDate={selectedDate} appointmentToEdit={editingAppointment} onSuccess={() => fetchData(currentMonthDate, userId)} currentUserId={userId} />
      <NewTransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onSuccess={() => fetchData(currentMonthDate, userId)} currentUserId={userId} />
      <PatientHistoryModal isOpen={!!historyPatientName} onClose={() => setHistoryPatientName(null)} patientName={historyPatientName || ''} currentUserId={userId} />
      <DocumentModal isOpen={!!documentPatient} onClose={() => setDocumentPatient(null)} patientName={documentPatient || ''} clinicName={profile?.clinic_name || 'Minha Clínica'} city={profile?.city || 'Cidade'} />
    </main>
  );
}