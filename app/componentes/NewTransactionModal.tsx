'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { createTransaction, updateTransaction, Transaction } from '../services/transactionService';
import toast from 'react-hot-toast'; // <--- IMPORTADO

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string;
  transactionToEdit?: Transaction | null;
}

export function NewTransactionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  currentUserId,
  transactionToEdit 
}: NewTransactionModalProps) {
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setDescription(transactionToEdit.description);
        setAmount(transactionToEdit.amount.toString());
        setType(transactionToEdit.type);
      } else {
        setDescription('');
        setAmount('');
        setType('expense');
      }
    }
  }, [isOpen, transactionToEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        description,
        amount: parseFloat(amount.replace(',', '.')),
        type,
        date: transactionToEdit ? transactionToEdit.date : new Date().toISOString(),
        category: 'Geral'
      };

      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.id, payload);
        toast.success('Lançamento atualizado!'); // <--- TOAST
      } else {
        await createTransaction({
            ...payload, 
            doctor_id: currentUserId,
        });
        toast.success('Lançamento salvo!'); // <--- TOAST
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar transação'); // <--- TOAST
    } finally {
      setLoading(false);
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-5">
                  <Dialog.Title className="text-lg font-bold text-gray-900">
                    {transactionToEdit ? 'Editar Lançamento' : 'Nova Movimentação'}
                  </Dialog.Title>
                  <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Saída (Despesa)
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Entrada Extra
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                    <input required type="text" placeholder="Ex: Conta de Luz..." className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-900 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-gray-400" value={description} onChange={e => setDescription(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor</label>
                    <div className="relative">
                      <BanknotesIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input required type="number" step="0.01" placeholder="0,00" className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-gray-400" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                  </div>

                  <button disabled={loading} type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center">
                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Salvar'}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}