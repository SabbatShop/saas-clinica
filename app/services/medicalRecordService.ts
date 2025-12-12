// services/medicalRecordService.ts
import { supabase } from '@/lib/supabase';

export interface MedicalRecord {
  id: string;
  created_at: string;
  patient_name: string;
  content: string;
}

// Busca histórico pelo nome do paciente (exato)
export async function getPatientHistory(patientName: string) {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_name', patientName)
    .order('created_at', { ascending: false }); // Mais recentes primeiro

  if (error) throw error;
  return data as MedicalRecord[];
}

// Cria uma nova anotação
export async function createMedicalRecord(patientName: string, content: string, doctorId: string) {
  const { data, error } = await supabase
    .from('medical_records')
    .insert([
      { patient_name: patientName, content, doctor_id: doctorId }
    ])
    .select();

  if (error) throw error;
  return data;
}