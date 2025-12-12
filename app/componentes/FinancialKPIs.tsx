'use client';

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface FinancialKPIsProps {
  totalRevenue: number;
  totalExpenses: number;
}

export function FinancialKPIs({ totalRevenue, totalExpenses }: FinancialKPIsProps) {
  const balance = totalRevenue - totalExpenses;
  const isPositive = balance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Card Receitas */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entradas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-full">
          <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
        </div>
      </div>

      {/* Card Despesas */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Despesas</p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-full">
          <ArrowTrendingDownIcon className="w-6 h-6 text-red-500" />
        </div>
      </div>

      {/* Card Saldo Líquido (CORRIGIDO: Removido o círculo decorativo) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo Líquido</p>
          <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-blue-600' : 'text-red-600'}`}>
            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className={`p-3 rounded-full ${isPositive ? 'bg-blue-50' : 'bg-red-50'}`}>
          <CurrencyDollarIcon className={`w-6 h-6 ${isPositive ? 'text-blue-600' : 'text-red-600'}`} />
        </div>
      </div>
    </div>
  );
}