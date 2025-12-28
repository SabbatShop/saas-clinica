'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getTransactions, deleteTransaction, Transaction } from '../services/transactionService';
import { getMonthlyAppointments } from '../services/appointmentService'; // <--- IMPORTADO
import { NewTransactionModal } from '../componentes/NewTransactionModal';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  TrashIcon, 
  PencilIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CalendarDaysIcon // <--- Ícone para identificar consultas
} from '@heroicons/react/24/outline';

// Estendemos o tipo Transaction para saber se é uma consulta vinda da agenda
type FinancialItem = Transaction & { isAppointment?: boolean };

export default function FinanceiroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [financialItems, setFinancialItems] = useState<FinancialItem[]>([]); // <--- MUDADO NOME
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userId, setUserId] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      fetchData(currentDate, session.user.id);
    }
    init();
  }, []);

  useEffect(() => {
    if (userId) fetchData(currentDate, userId);
  }, [currentDate, userId]); // Adicionado userId na dependência

  async function fetchData(date: Date, uid: string) {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // Buscamos Transações E Agendamentos simultaneamente
      const [transactionsData, appointmentsData] = await Promise.all([
        getTransactions(month, year, uid),
        getMonthlyAppointments(year, month, uid)
      ]);

      // 1. Prepara as transações manuais
      const manualTransactions: FinancialItem[] = (transactionsData || []).map(t => ({
        ...t,
        isAppointment: false
      }));

      // 2. Prepara os agendamentos CONCLUÍDOS como se fossem entradas
      const appointmentTransactions: FinancialItem[] = (appointmentsData || [])
        .filter(app => app.status === 'concluido')
        .map(app => ({
          id: `app-${app.id}`, // ID fictício para a lista
          doctor_id: app.doctor_id,
          description: `Consulta: ${app.patient_name}`,
          amount: app.price,
          type: 'income',
          category: 'Consulta',
          date: app.start_time,
          isAppointment: true
        }));

      // 3. Junta tudo e ordena por data (mais recente primeiro)
      const combined = [...manualTransactions, ...appointmentTransactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setFinancialItems(combined);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item: FinancialItem) {
    if (item.isAppointment) {
      toast.error('Gerencie esta consulta pela Agenda no Dashboard.');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
    try {
      await deleteTransaction(item.id);
      toast.success('Lançamento excluído.');
      fetchData(currentDate, userId); 
    } catch (error) {
      toast.error('Erro ao excluir.');
    }
  }

  function handleEdit(item: FinancialItem) {
    if (item.isAppointment) {
      toast('Edite o valor desta consulta pela Agenda.', { icon: '📅' });
      return;
    }
    setEditingTransaction(item);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }

  // Cálculos unificados
  const totals = useMemo(() => {
    const income = financialItems.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = financialItems.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, balance: income - expense };
  }, [financialItems]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      <NewTransactionModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => fetchData(currentDate, userId)}
        currentUserId={userId}
        transactionToEdit={editingTransaction}
      />

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Gestão Financeira</h1>
          </div>
          <button 
             onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
             className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <BanknotesIcon className="w-4 h-4"/>
            Novo Lançamento
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* NAVEGAÇÃO */}
        <div className="flex items-center justify-between mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronLeftIcon className="w-5 h-5"/></button>
          <h2 className="text-lg font-bold text-gray-800 capitalize w-40 text-center select-none">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronRightIcon className="w-5 h-5"/></button>
        </div>

        {/* CARDS RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-green-600">
               <ArrowTrendingUpIcon className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-wider">Entradas (Total)</span>
             </div>
             <p className="text-2xl font-bold text-gray-900">{totals.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-red-500">
               <ArrowTrendingDownIcon className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-wider">Despesas</span>
             </div>
             <p className="text-2xl font-bold text-gray-900">{totals.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm ${totals.balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
             <div className={`flex items-center gap-2 mb-2 ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
               <BanknotesIcon className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-wider">Saldo do Mês</span>
             </div>
             <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{totals.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Extrato Detalhado</h3>
          </div>
          
          {loading ? (
             <div className="p-10 text-center text-gray-400">Carregando...</div>
          ) : financialItems.length === 0 ? (
             <div className="p-10 text-center text-gray-400 flex flex-col items-center">
                <BanknotesIcon className="w-10 h-10 mb-2 text-gray-200" />
                <p>Nenhuma movimentação neste mês.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                    <th className="px-6 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {financialItems.map((t) => (
                    <tr key={t.id} className={`hover:bg-gray-50 transition-colors group ${t.isAppointment ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(t.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                        {t.isAppointment && <CalendarDaysIcon className="w-4 h-4 text-blue-400" title="Origem: Agenda" />}
                        {t.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            t.isAppointment 
                            ? 'bg-blue-50 text-blue-700 ring-blue-600/20' 
                            : 'bg-gray-100 text-gray-600 ring-gray-500/10'
                        }`}>
                          {t.category || 'Geral'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'expense' ? '-' : '+'} 
                        {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-center flex justify-center gap-3">
                        <button 
                          onClick={() => handleEdit(t)}
                          className={`${t.isAppointment ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:text-blue-600'} transition-colors p-1`}
                          title={t.isAppointment ? "Gerencie esta consulta na Agenda" : "Editar"}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(t)}
                          className={`${t.isAppointment ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:text-red-600'} transition-colors p-1`}
                          title={t.isAppointment ? "Gerencie esta consulta na Agenda" : "Excluir"}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}