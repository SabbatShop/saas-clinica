'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getMonthlyAppointments, Appointment } from './services/appointmentService';
import { getTransactions, Transaction } from './services/transactionService';

// Componentes
import { CalendarWidget } from './componentes/CalendarWidget';
import { NewAppointmentModal } from './componentes/NewAppointmentModal';
import { NewTransactionModal } from './componentes/NewTransactionModal';
import { RevenueChart } from './componentes/RevenueChart';
import { SearchBar } from './componentes/SearchBar';
import { PatientHistoryModal } from './componentes/PatientHistoryModal';
import { FinancialKPIs } from './componentes/FinancialKPIs';
import { DocumentModal } from './componentes/DocumentModal'; // <--- MODAL DE DOCUMENTOS

import { format, isSameDay, getYear, getMonth, getHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { 
  ArrowRightOnRectangleIcon, 
  Cog6ToothIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  PrinterIcon 
} from '@heroicons/react/24/outline';

export default function Home() {
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

  // Usuário e Perfil (Agora com cidade)
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState<{ clinic_name: string, avatar_url: string | null, city: string } | null>(null);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [historyPatientName, setHistoryPatientName] = useState<string | null>(null);
  const [documentPatient, setDocumentPatient] = useState<string | null>(null); // Estado para o modal de documentos

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
      
      // Busca perfil (incluindo a cidade)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('clinic_name, avatar_url, city')
        .eq('id', session.user.id)
        .single();
      
      if (profileData) {
        setProfile({
            clinic_name: profileData.clinic_name,
            avatar_url: profileData.avatar_url,
            city: profileData.city || 'Sua Cidade'
        });
      } else {
        setProfile({ clinic_name: 'Minha Clínica', avatar_url: null, city: 'Sua Cidade' });
      }

      fetchData(currentMonthDate, session.user.id);
    }
    checkUser();
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchData(currentMonthDate, userId);
    }
  }, [currentMonthDate, userId]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
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

  // --- CÁLCULOS FINANCEIROS (MENSAL) ---
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


  // --- HELPERS VISUAIS (Diário) ---
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

  // --- FUNÇÃO DO WHATSAPP MELHORADA ---
  function openWhatsApp(e: React.MouseEvent, phone: string | undefined, patientName: string, startTime: string) {
    e.stopPropagation(); 
    
    if (!phone) {
        toast.error("Paciente sem telefone cadastrado.");
        return;
    }
    
    const cleanPhone = phone.replace(/\D/g, ''); 
    const dateFormatted = format(new Date(selectedDate), "dd/MM", { locale: ptBR });
    const clinicName = profile?.clinic_name || 'Consultório';

    const message = `Olá, *${patientName}*! Tudo bem? 👋` +
      `%0a%0a` + 
      `Aqui é da *${clinicName}*.` +
      `%0a%0a` +
      `Gostaríamos de confirmar sua consulta para:` +
      `%0a📅 Data: *${dateFormatted}*` +
      `%0a⏰ Horário: *${startTime}*` +
      `%0a%0a` +
      `Podemos confirmar?`;

    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  }

  return (
    <main className="bg-gray-50 min-h-screen font-sans text-gray-900 pb-10">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-30 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative bg-gray-100">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover"/>
               ) : (
                 <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold">
                   {profile?.clinic_name?.charAt(0) || 'C'}
                 </div>
               )}
             </div>
             <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">
                  {profile?.clinic_name || 'Minha Clínica'}
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Painel Médico</p>
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-gray-700">{greeting}</span>
                <span className="text-xs text-gray-400">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
             </div>
             
             {/* Botão Financeiro */}
             <button title="Gestão Financeira" onClick={() => router.push('/financeiro')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                <BanknotesIcon className="w-6 h-6" />
             </button>

             <button title="Configurações" onClick={() => router.push('/configuracoes')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <Cog6ToothIcon className="w-6 h-6" />
             </button>
             <button title="Sair" onClick={handleLogout} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
             </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MODAIS */}
        <NewAppointmentModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingAppointment(null); }}
          selectedDate={selectedDate}
          appointmentToEdit={editingAppointment}
          onSuccess={() => fetchData(currentMonthDate, userId)}
          currentUserId={userId}
        />
        
        <NewTransactionModal 
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSuccess={() => fetchData(currentMonthDate, userId)}
          currentUserId={userId}
        />

        <PatientHistoryModal 
          isOpen={!!historyPatientName}
          onClose={() => setHistoryPatientName(null)}
          patientName={historyPatientName || ''}
          currentUserId={userId}
        />

        {/* --- MODAL DE DOCUMENTOS --- */}
        <DocumentModal 
          isOpen={!!documentPatient} 
          onClose={() => setDocumentPatient(null)} 
          patientName={documentPatient || ''}
          clinicName={profile?.clinic_name || 'Minha Clínica'}
          city={profile?.city || 'Cidade'}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* COLUNA ESQUERDA */}
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

          {/* COLUNA DIREITA */}
          <div className="flex-1 min-w-0">
            
            {/* KPI FINANCEIRO */}
            {!searchTerm && (
              <FinancialKPIs 
                totalRevenue={financialTotals.totalRevenue} 
                totalExpenses={financialTotals.totalExpenses} 
              />
            )}

            {/* CONTROLES */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? 'Resultados da busca' : format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {searchTerm ? `Filtrando por "${searchTerm}"` : 'Visão geral do dia.'}
                </p>
              </div>
              
              <div className="flex w-full sm:w-auto gap-2 flex-wrap sm:flex-nowrap">
                <div className="w-full sm:w-auto">
                    <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar paciente..." />
                </div>
                
                <button 
                  onClick={() => setIsTransactionModalOpen(true)}
                  className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-semibold shadow-sm transition-all text-sm whitespace-nowrap"
                >
                  $ Lançar Conta
                </button>

                <button 
                  onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                >
                  <span>+ Agendar</span>
                </button>
              </div>
            </div>

            {/* LISTA (TIMELINE) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] p-6 relative">
              
              {loading ? (
                <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : displayedAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <CheckBadgeIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Agenda Livre</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">
                    {searchTerm ? "Nenhum resultado." : "Nenhum paciente para este dia."}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[59px] top-4 bottom-4 w-0.5 bg-gray-100 hidden sm:block"></div>
                  <div className="space-y-6">
                    {displayedAppointments.map((item) => {
                       const statusColor = getStatusColor(item.status);
                       const dotColor = getStatusDot(item.status);

                       return (
                        <div key={item.id} className="relative flex flex-col sm:flex-row group animate-in slide-in-from-bottom-2 duration-500">
                          
                          <div className="sm:w-16 flex-shrink-0 flex sm:flex-col items-center sm:items-end sm:pr-6 mb-2 sm:mb-0 gap-2 sm:gap-0">
                            <span className="text-sm font-bold text-gray-900">
                              {format(new Date(item.start_time), 'HH:mm')}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(item.end_time), 'HH:mm')}
                            </span>
                          </div>

                          <div className={`absolute left-[55px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-1 ring-gray-200 hidden sm:block z-10 ${dotColor}`}></div>

                          <div 
                            onClick={() => { setEditingAppointment(item); setIsModalOpen(true); }}
                            className="flex-1 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group-hover:translate-x-1"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                  {item.patient_name}
                                  {item.patient_phone && (
                                    <button
                                      onClick={(e) => openWhatsApp(e, item.patient_phone, item.patient_name, format(new Date(item.start_time), 'HH:mm'))}
                                      className="text-green-500 hover:text-green-600 bg-green-50 p-1 rounded-full transition-colors"
                                      title="Chamar no WhatsApp"
                                    >
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
                                    </button>
                                  )}
                                </h3>
                                
                                {item.notes && (
                                  <p className="text-sm text-gray-500 mt-1 bg-gray-50 inline-block px-2 py-1 rounded-md border border-gray-100">
                                    📝 {item.notes}
                                  </p>
                                )}
                                
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setHistoryPatientName(item.patient_name); }}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                  >
                                    Ver Prontuário &rarr;
                                  </button>

                                  {/* --- BOTÃO DE IMPRIMIR --- */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setDocumentPatient(item.patient_name); }}
                                    className="text-xs font-medium text-gray-500 hover:text-gray-800 hover:underline flex items-center gap-1"
                                  >
                                    <PrinterIcon className="w-3 h-3" />
                                    Documentos
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full border ${statusColor}`}>
                                  {item.status}
                                </span>
                                <span className="text-sm font-semibold text-gray-600">
                                  {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                       );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}