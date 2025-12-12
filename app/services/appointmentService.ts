import { supabase } from '@/lib/supabase';

// --- TIPAGEM ---

export interface Appointment {
  id: number;
  clinic_id: string;
  doctor_id: string; // <--- O CAMPO NOVO
  patient_name: string;
  patient_phone?: string;
  start_time: string;
  end_time: string;
  notes?: string;
  price: number;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
}

export interface CreateAppointmentDTO {
  clinic_id: string;
  doctor_id: string; // <--- OBRIGATÓRIO AGORA
  patient_name: string;
  patient_phone?: string;
  start_time: string;
  end_time: string;
  notes?: string;
  price: number;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
}

// --- FUNÇÕES ---

// 1. Buscar (Agora pede o ID do usuário para filtrar)
export async function getMonthlyAppointments(year: number, month: number, userId: string) {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', userId) // <--- O FILTRO MÁGICO (Só traz o seus dados)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }

  return data as Appointment[];
}

// 2. Criar
export async function createAppointment(data: CreateAppointmentDTO) {
  const { error } = await supabase
    .from('appointments')
    .insert([data]);

  if (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
}

// 3. Atualizar
export async function updateAppointment(id: number, data: Partial<CreateAppointmentDTO>) {
  const { error } = await supabase
    .from('appointments')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar:', error);
    throw error;
  }
}

// 4. Deletar
export async function deleteAppointment(id: number) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar:', error);
    throw error;
  }
}