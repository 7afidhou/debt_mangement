'use client';

import React from 'react';
import { Customer } from '@/lib/types';
import { PlusCircle, MinusCircle, CheckCircle2, History, Edit, Trash2, Phone } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface CustomerRowProps {
  customer: Customer;
  onModifyDebt: (customer: Customer, mode: 'add' | 'subtract' | 'clear') => void;
  onViewHistory: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerRow({
  customer,
  onModifyDebt,
  onViewHistory,
  onEdit,
  onDelete,
}: CustomerRowProps) {
  const isSettled = customer.current_debt === 0;

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      {/* Customer Name & Notes */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
              isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{customer.name}</div>
            {customer.notes && (
              <div className="text-xs text-slate-400 max-w-xs truncate">{customer.notes}</div>
            )}
          </div>
        </div>
      </td>

      {/* Phone */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
        {customer.phone ? (
          <a href={`tel:${customer.phone}`} className="flex items-center hover:text-slate-800">
            <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {customer.phone}
          </a>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Current Debt */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span
            className={`font-mono font-bold text-base ${
              isSettled ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(customer.current_debt)}
          </span>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              isSettled ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {isSettled ? 'Settled' : 'Owes'}
          </span>
        </div>
      </td>

      {/* Last Updated */}
      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
        {new Date(customer.updated_at).toLocaleDateString()}
      </td>

      {/* Action Buttons */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-1.5">
          <button
            onClick={() => onModifyDebt(customer, 'add')}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
            title="Add Debt (+)"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          <button
            onClick={() => onModifyDebt(customer, 'subtract')}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
            title="Record Repayment (-)"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Pay</span>
          </button>

          <button
            onClick={() => onModifyDebt(customer, 'clear')}
            disabled={isSettled}
            className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isSettled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
            title="Clear debt to 0 DZD"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Clear 0</span>
          </button>

          <button
            onClick={() => onViewHistory(customer)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="View statement & ledger"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(customer)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit customer"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(customer)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
