'use client';

import React from 'react';
import { Customer } from '@/lib/types';
import { PlusCircle, MinusCircle, CheckCircle2, History, Phone, FileText, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface CustomerCardProps {
  customer: Customer;
  onModifyDebt: (customer: Customer, mode: 'add' | 'subtract' | 'clear') => void;
  onViewHistory: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerCard({
  customer,
  onModifyDebt,
  onViewHistory,
  onEdit,
  onDelete,
}: CustomerCardProps) {
  const isSettled = customer.current_debt === 0;

  // Get initials for avatar
  const initials = customer.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      
      {/* Top Section */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm tracking-wide ${
                isSettled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {initials || 'C'}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                {customer.name}
              </h3>
              {customer.phone ? (
                <a
                  href={`tel:${customer.phone}`}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center mt-0.5 transition-colors"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  {customer.phone}
                </a>
              ) : (
                <span className="text-xs text-slate-400">No phone provided</span>
              )}
            </div>
          </div>

          {/* Quick options menu */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(customer)}
              title="Edit details"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(customer)}
              title="Delete customer"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Note / Tag */}
        {customer.notes && (
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center space-x-1.5">
            <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{customer.notes}</span>
          </div>
        )}
      </div>

      {/* Middle Section: Debt Badge */}
      <div className="px-5 py-3">
        <div
          className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
            isSettled
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-rose-50/60 border-rose-200'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              {isSettled ? 'Account Status' : 'Outstanding Debt'}
            </span>
            <span
              className={`font-mono text-xl font-extrabold tracking-tight ${
                isSettled ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatCurrency(customer.current_debt)}
            </span>
          </div>
          <div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                isSettled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isSettled ? 'Settled' : 'Owes Store'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: 4 Main Debt Actions */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 grid grid-cols-4 gap-1.5 text-xs">
        {/* + Add Debt */}
        <button
          onClick={() => onModifyDebt(customer, 'add')}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 font-semibold shadow-2xs transition-all active:scale-95"
          title="Add credit / new debt"
        >
          <PlusCircle className="w-4 h-4 text-rose-600 mb-0.5" />
          <span>+ Add</span>
        </button>

        {/* - Subtract / Repay */}
        <button
          onClick={() => onModifyDebt(customer, 'subtract')}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 font-semibold shadow-2xs transition-all active:scale-95"
          title="Record repayment / subtract from debt"
        >
          <MinusCircle className="w-4 h-4 text-emerald-600 mb-0.5" />
          <span>- Pay</span>
        </button>

        {/* ✓ Clear to 0 DZD */}
        <button
          onClick={() => onModifyDebt(customer, 'clear')}
          disabled={isSettled}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border font-semibold shadow-2xs transition-all active:scale-95 ${
            isSettled
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              : 'bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700'
          }`}
          title="Clear remaining debt completely to 0 DZD"
        >
          <CheckCircle2 className={`w-4 h-4 mb-0.5 ${isSettled ? 'text-slate-400' : 'text-indigo-600'}`} />
          <span>Clear 0</span>
        </button>

        {/* 📜 Ledger */}
        <button
          onClick={() => onViewHistory(customer)}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold shadow-2xs transition-all active:scale-95"
          title="View full debt transaction statement"
        >
          <History className="w-4 h-4 text-slate-600 mb-0.5" />
          <span>Ledger</span>
        </button>
      </div>

    </div>
  );
}
