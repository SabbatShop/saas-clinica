'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getPatientHistory, createMedicalRecord, MedicalRecord } from '../services/medicalRecordService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  currentUserId: string;
}

export function PatientHistoryModal({ isOpen, onClose, patientName, currentUserId }: PatientHistoryModalProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && patientName) {
      fetchHistory();
    }
  }, [isOpen, patientName]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const data = await getPatientHistory(patientName);
      setRecords(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      await createMedicalRecord(patientName, newNote, currentUserId);
      setNewNote('');
      fetchHistory();
    } catch (error) {
      alert('Erro ao salvar anotação.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100 h-[600px] flex flex-col">
                
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Prontuário Eletrônico</h3>
                    <p className="text-sm text-gray-500">Paciente: <span className="font-semibold text-blue-600">{patientName}</span></p>
                  </div>
                  <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
                </div>

                {/* Body - Lista de Histórico */}
                <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                  ) : records.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-100 rounded-xl">
                      <p>Nenhuma anotação encontrada para este paciente.</p>
                      <p className="text-xs mt-2">Use o campo abaixo para adicionar a primeira.</p>
                    </div>
                  ) : (
                    <ul className="space-y-6">
                      {records.map((rec) => (
                        <li key={rec.id} className="relative pl-6 border-l-2 border-gray-200 hover:border-blue-300 transition-colors">
                          <div className="absolute -left-[9px] top-0 bg-white">
                            <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                          </div>
                          <div className="mb-1 flex items-center gap-2">
                             <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                               {format(new Date(rec.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                             </span>
                          </div>
                          {/* Correção aqui também: Garante que o texto histórico seja cinza escuro */}
                          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {rec.content}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer - Adicionar Nova Nota */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 shrink-0">
                  <form onSubmit={handleAddNote} className="flex gap-2 items-start">
                    {/* CORREÇÃO AQUI: Adicionei text-gray-900 e bg-white */}
                    <textarea 
                      required
                      placeholder="Escreva a evolução clínica, sintomas ou observações..."
                      className="flex-1 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 resize-none h-20 bg-white text-gray-900 placeholder-gray-400"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-sm transition-all flex flex-col items-center justify-center h-20 w-20 gap-1 disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <PlusIcon className="w-6 h-6" />
                          <span className="text-[10px] font-bold uppercase">Salvar</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}