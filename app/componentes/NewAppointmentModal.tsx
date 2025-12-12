'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, BanknotesIcon, UserIcon, DocumentTextIcon, TrashIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { createAppointment, updateAppointment, deleteAppointment, Appointment } from '../services/appointmentService';
import { format } from 'date-fns';
import toast from 'react-hot-toast'; // <--- IMPORTADO

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
  appointmentToEdit?: Appointment | null;
  currentUserId: string; 
}

export function NewAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  selectedDate, 
  appointmentToEdit,
  currentUserId 
}: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [price, setPrice] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'agendado' | 'confirmado' | 'concluido' | 'cancelado'>('agendado');

  useEffect(() => {
    if (isOpen) {
      if (appointmentToEdit) {
        setName(appointmentToEdit.patient_name);
        setPhone(appointmentToEdit.patient_phone || '');
        setPrice(appointmentToEdit.price.toString());
        setNotes(appointmentToEdit.notes || '');
        setStatus(appointmentToEdit.status);
        setStartTime(format(new Date(appointmentToEdit.start_time), 'HH:mm'));
        setEndTime(format(new Date(appointmentToEdit.end_time), 'HH:mm'));
      } else {
        setName('');
        setPhone('');
        setPrice('');
        setNotes('');
        setStatus('agendado');
        setStartTime('09:00');
        setEndTime('10:00');
      }
    }
  }, [isOpen, appointmentToEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const baseDate = selectedDate || new Date();
      const dateString = baseDate.toISOString().split('T')[0];
      const startIso = new Date(`${dateString}T${startTime}:00`).toISOString();
      const endIso = new Date(`${dateString}T${endTime}:00`).toISOString();

      const payload = {
        patient_name: name,
        patient_phone: phone,
        price: parseFloat(price.replace(',', '.')),
        start_time: startIso,
        end_time: endIso,
        notes: notes,
        status: status,
        doctor_id: currentUserId, 
        clinic_id: currentUserId, 
      };

      if (appointmentToEdit) {
        await updateAppointment(appointmentToEdit.id, payload);
        toast.success('Agendamento atualizado!'); // <--- TOAST
      } else {
        await createAppointment(payload);
        toast.success('Agendamento criado com sucesso!'); // <--- TOAST
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar agendamento.'); // <--- TOAST DE ERRO
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!appointmentToEdit) return;
    if (!confirm('Tem certeza?')) return;
    setLoading(true);
    try {
      await deleteAppointment(appointmentToEdit.id);
      toast.success('Agendamento excluído.'); // <--- TOAST
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao excluir.'); // <--- TOAST
      setLoading(false);
    }
  }

  const inputClass = "block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 bg-white text-gray-900 placeholder:text-gray-400";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
             <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    {appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
                  </Dialog.Title>
                  <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                  
                  {appointmentToEdit && (
                    <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                      {(['agendado', 'confirmado', 'concluido', 'cancelado'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={`flex-1 py-2 px-1 text-[10px] sm:text-xs font-bold uppercase rounded border transition-colors whitespace-nowrap
                            ${status === s 
                              ? (s === 'concluido' ? 'bg-green-100 text-green-700 border-green-200' 
                                : s === 'cancelado' ? 'bg-red-100 text-red-700 border-red-200' 
                                : s === 'confirmado' ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200')
                              : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <div className="relative"><UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/><input type="text" required className={`${inputClass} pl-10`} value={name} onChange={e => setName(e.target.value)}/></div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <div className="relative"><DevicePhoneMobileIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/><input type="tel" className={`${inputClass} pl-10`} value={phone} onChange={e => setPhone(e.target.value)}/></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Início</label><input type="time" required className={`${inputClass} pl-4`} value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Fim</label><input type="time" required className={`${inputClass} pl-4`} value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
                   </div>

                   <div><label className="block text-sm font-medium text-gray-700 mb-1">Valor</label><div className="relative"><BanknotesIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/><input type="number" step="0.01" required className={`${inputClass} pl-10`} value={price} onChange={e => setPrice(e.target.value)} /></div></div>
                   <div><label className="block text-sm font-medium text-gray-700 mb-1">Obs</label><div className="relative"><DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400"/><textarea rows={3} className={`${inputClass} pl-10`} value={notes} onChange={e => setNotes(e.target.value)} /></div></div>

                   <div className="mt-6 flex justify-between items-center">
                        <div>{appointmentToEdit && <button type="button" onClick={handleDelete} className="text-red-500 text-sm flex items-center gap-1"><TrashIcon className="w-4 h-4"/> Excluir</button>}</div>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="text-gray-700 text-sm">Cancelar</button>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700">Salvar</button>
                        </div>
                   </div>

                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}