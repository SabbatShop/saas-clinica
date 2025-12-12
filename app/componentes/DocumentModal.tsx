'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PrinterIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  clinicName: string; 
  city: string;
}

type DocType = 'receita' | 'atestado' | 'declaracao';

export function DocumentModal({ isOpen, onClose, patientName, clinicName, city }: DocumentModalProps) {
  const [type, setType] = useState<DocType>('receita');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (type === 'receita') {
        setContent(
          `Uso Oral:\n\n1. Dipirona Sódica 500mg ---------------- 1 cx\n   Tomar 1 comprimido a cada 6 horas em caso de dor.\n\n2. Amoxicilina 500mg -------------------- 1 cx\n   Tomar 1 cápsula a cada 8 horas por 7 dias.`
        );
      } else if (type === 'atestado') {
        setContent(
          `Atesto para os devidos fins que o(a) Sr(a). ${patientName} foi atendido(a) nesta data e necessita de 03 (três) dias de repouso por motivo de doença (CID Z00.0).`
        );
      } else if (type === 'declaracao') {
        setContent(
          `Declaro para fins de comprovação junto ao trabalho/escola que o(a) Sr(a). ${patientName} esteve em atendimento em nossa clínica nesta data, no período das ____ às ____ horas.`
        );
      }
    }
  }, [isOpen, type, patientName]);

  function handlePrint() {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      const date = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
      const cityName = city || 'Cidade'; 

      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir Documento</title>
            <style>
              body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
              .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
              .content { font-size: 16px; line-height: 1.6; white-space: pre-wrap; min-height: 400px;}
              .footer { text-align: center; margin-top: 60px; border-top: 1px solid #ccc; padding-top: 10px; }
              .date { text-align: right; margin-top: 40px; margin-bottom: 60px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${clinicName}</h1>
              <p>Documento de Saúde</p>
            </div>
            
            <div class="content">
              ${content}
            </div>

            <div class="date">
              ${cityName}, ${date}.
            </div>

            <div class="footer">
              <p>__________________________________________</p>
              <p>Assinatura e Carimbo do Profissional</p>
            </div>
            
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        
        {/* Animação do Fundo Escuro (Overlay) */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            
            {/* Animação do Painel (Zoom + Fade) */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600"/>
                    Gerador de Documentos
                  </Dialog.Title>
                  <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
                  <button onClick={() => setType('receita')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'receita' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Receita</button>
                  <button onClick={() => setType('atestado')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'atestado' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Atestado</button>
                  <button onClick={() => setType('declaracao')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'declaracao' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Declaração</button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Conteúdo do Documento</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-64 p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all resize-none font-mono text-sm leading-relaxed shadow-inner"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                  <button onClick={handlePrint} className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-gray-200 flex items-center gap-2 transition-transform active:scale-95">
                    <PrinterIcon className="w-5 h-5" /> Imprimir
                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}