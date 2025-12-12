import { supabase } from '@/lib/supabase';

export interface Transaction {
  id: string;
  doctor_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  date: string;
}

export async function getTransactions(month: number, year: number, userId: string) {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('doctor_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return data as Transaction[];
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select();

  if (error) throw error;
  return data;
}

// --- NOVA FUNÇÃO DE EDIÇÃO ---
export async function updateTransaction(id: string, transaction: Partial<Transaction>) {
  const { error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}