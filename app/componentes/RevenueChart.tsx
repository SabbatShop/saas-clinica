'use client';

import { useMemo } from 'react'; // <--- IMPORTADO
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Appointment } from '../services/appointmentService';
import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RevenueChartProps {
  appointments: Appointment[];
  currentDate: Date;
}

export function RevenueChart({ appointments, currentDate }: RevenueChartProps) {
  
  // Otimização: Só recalcula se 'appointments' ou 'currentDate' mudarem
  const data = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      // Somar apenas os CONCLUÍDOS daquele dia
      const dailyTotal = appointments
        .filter(app => isSameDay(new Date(app.start_time), day) && app.status === 'concluido')
        .reduce((acc, curr) => acc + curr.price, 0);

      return {
        day: format(day, 'dd'),
        fullDate: format(day, "d 'de' MMMM", { locale: ptBR }),
        value: dailyTotal,
      };
    });
  }, [appointments, currentDate]);

  // Total também memorizado ou calculado levemente após os dados
  const totalMonth = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[320px]">
      
      {/* Cabeçalho do Gráfico com o Total */}
      <div className="mb-6">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
          Receita em {format(currentDate, 'MMMM', { locale: ptBR })}
        </h3>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {totalMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
      
      {/* O Gráfico em si */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10, fill: '#9ca3af' }} 
              axisLine={false} 
              tickLine={false} 
              interval={2} 
            />
            
            <YAxis 
              tick={{ fontSize: 10, fill: '#9ca3af' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => `R$${value}`}
            />
            
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-xl">
                      <p className="font-bold mb-1 text-gray-300">{payload[0].payload.fullDate}</p>
                      <p className="font-bold text-lg text-white">
                        {payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={30}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value > 0 ? '#2563eb' : '#f3f4f6'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}