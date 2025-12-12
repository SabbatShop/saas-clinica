'use client';

import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  getDay,
  addMonths,
  subMonths,
  addYears,   // Novo
  subYears,   // Novo
  setMonth,   // Novo
  setYear,    // Novo
  getYear     // Novo
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '../services/appointmentService';
import { twMerge } from 'tailwind-merge';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'; // Adicionado ChevronDown
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarWidgetProps {
  appointments: Appointment[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}
 
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export function CalendarWidget({ 
  appointments, 
  currentDate, 
  onDateChange, 
  onSelectDate,
  selectedDate 
}: CalendarWidgetProps) {
  
  const [direction, setDirection] = useState(0);
  
  // --- NOVOS ESTADOS PARA O SELETOR ---
  const [viewMode, setViewMode] = useState<'days' | 'month-picker'>('days');
  const [pickerYearDate, setPickerYearDate] = useState(currentDate);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  const startingDayIndex = getDay(firstDayOfMonth);
  
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // --- NAVEGAÇÃO ---

  function handlePrev() {
    if (viewMode === 'days') {
      setDirection(-1);
      onDateChange(subMonths(currentDate, 1));
    } else {
      setPickerYearDate(subYears(pickerYearDate, 1));
    }
  }

  function handleNext() {
    if (viewMode === 'days') {
      setDirection(1);
      onDateChange(addMonths(currentDate, 1));
    } else {
      setPickerYearDate(addYears(pickerYearDate, 1));
    }
  }

  function handleSelectMonth(monthIndex: number) {
    const newDate = setMonth(setYear(currentDate, getYear(pickerYearDate)), monthIndex);
    onDateChange(newDate);
    setViewMode('days');
    setDirection(0); // Reseta animação lateral
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6 px-2 relative z-10">
        <button 
          onClick={handlePrev}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* Título Clicável */}
        <button 
          onClick={() => {
            if (viewMode === 'days') setPickerYearDate(currentDate);
            setViewMode(viewMode === 'days' ? 'month-picker' : 'days');
          }}
          className="flex items-center justify-center gap-2 px-3 py-1 hover:bg-gray-50 rounded-lg transition-all group"
        >
          <h2 className="text-lg font-bold text-gray-800 capitalize">
            {viewMode === 'days' 
               ? format(currentDate, 'MMMM yyyy', { locale: ptBR })
               : format(pickerYearDate, 'yyyy')
            }
          </h2>
          <ChevronDownIcon className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-transform ${viewMode === 'month-picker' ? 'rotate-180' : ''}`} />
        </button>

        <button 
          onClick={handleNext}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* --- CONTEÚDO --- */}
      {viewMode === 'days' ? (
        <>
          {/* Dias da Semana (Key Corrigida com Index 'i') */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
              <div key={i} className="text-xs font-medium text-gray-400 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Área Animada (Seu código original) */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentDate.toISOString()}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="grid grid-cols-7 gap-1"
            >
              {Array.from({ length: startingDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {days.map((day) => {
                const dayAppointments = appointments.filter(app => 
                  isSameDay(new Date(app.start_time), day)
                );
                
                const isSelected = isSameDay(day, selectedDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onSelectDate(day)}
                    className={twMerge(
                      "h-14 rounded-lg flex flex-col items-center justify-start pt-2 border transition-all relative",
                      "focus:ring-2 focus:ring-blue-500",
                      isSelected 
                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 z-10" 
                        : isToday(day) 
                          ? "bg-gray-50 border-gray-300" 
                          : "bg-white border-gray-50 hover:border-blue-200",
                    )}
                  >
                    <span className={twMerge(
                      "text-sm leading-none mb-1",
                      isSelected ? "font-bold text-blue-700" : "text-gray-600"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    <div className="flex flex-wrap justify-center gap-0.5 px-1 w-full content-start">
                      {dayAppointments.slice(0, 4).map((app, i) => {
                        let colorClass = 'bg-yellow-400'; 
                        if (app.status === 'confirmado') colorClass = 'bg-blue-500';
                        if (app.status === 'concluido') colorClass = 'bg-green-500';
                        if (app.status === 'cancelado') colorClass = 'bg-red-400';

                        return (
                          <div 
                              key={i} 
                              className={`w-1.5 h-1.5 rounded-full ${colorClass}`} 
                          />
                        )
                      })}
                      {dayAppointments.length > 4 && (
                          <span className="text-[8px] text-gray-400 leading-none self-center">+</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        /* --- MODO PICKER (NOVO) --- */
        <div className="grid grid-cols-3 gap-3 py-4 animate-in fade-in zoom-in duration-200">
          {months.map((month, idx) => {
            const isSelectedMonth = getYear(currentDate) === getYear(pickerYearDate) && idx === currentDate.getMonth();
            return (
              <button
                key={month}
                onClick={() => handleSelectMonth(idx)}
                className={twMerge(
                  "py-4 rounded-xl text-sm font-semibold transition-all border",
                  isSelectedMonth 
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" 
                    : "bg-white text-gray-700 border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                )}
              >
                {month.substring(0, 3)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}