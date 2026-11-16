'use client';

import React, { useEffect, useState } from 'react';
import { Customer, DebtTransaction } from '@/lib/types';
import { X, History, Printer, ArrowUpRight, ArrowDownLeft, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { getCustomerTransactionsAction } from '@/app/actions';
import { formatCurrency } from '@/lib/currency';

interface CustomerHistoryModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerHistoryModal({ customer, isOpen, onClose }: CustomerHistoryModalProps) {
  const [transactions, setTransactions] = useState<DebtTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      setLoading(true);
      getCustomerTransactionsAction(customer.id)
        .then((txs) => setTransactions(txs))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Customer Debt Statement & Ledger</h2>
              <p className="text-xs text-slate-500">Chronological history for {customer.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Summary Bar (Also visible on print) */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{customer.name}</h3>
              {customer.phone && (
                <p className="text-xs text-slate-500 mt-0.5">Phone: {customer.phone}</p>
              )}
              {customer.notes && (
                <p className="text-xs text-slate-500 mt-0.5 italic">&ldquo;{customer.notes}&rdquo;</p>
              )}
            </div>
            <div className="sm:text-right">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Current Debt Balance</span>
              <span className={`text-2xl font-extrabold font-mono ${customer.current_debt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(customer.current_debt)}
              </span>
              <span className="block text-[11px] text-slate-400">
                {customer.current_debt > 0 ? 'Outstanding balance owed' : 'Account is fully settled'}
              </span>
            </div>
          </div>
        </div>

        {/* Transactions Ledger List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Transaction History</span>
            <span>{transactions.length} record{transactions.length === 1 ? '' : 's'}</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading customer ledger transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No transactions recorded yet.
            </div>
          ) : (
            transactions.map((tx) => {
              const isAdd = tx.type === 'ADD';
              const isSub = tx.type === 'SUBTRACT';
              const isClear = tx.type === 'CLEAR';
              const isInitial = tx.type === 'INITIAL';

              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          isAdd
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : isSub
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : isClear
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {isAdd && <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />}
                        {isSub && <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />}
                        {isClear && <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />}
                        {isInitial && <FileText className="w-5 h-5 stroke-[2.5]" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-slate-900">
                            {isAdd && 'Debt Added (Credit Sale)'}
                            {isSub && 'Payment Received (-)'}
                            {isClear && 'Debt Cleared to 0 DZD'}
                            {isInitial && 'Initial Account Debt'}
                          </span>
                        </div>
                        {tx.note && (
                          <p className="text-xs text-slate-600 mt-0.5">{tx.note}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-400">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>
                            Prev: {formatCurrency(tx.previous_debt)} → New: {formatCurrency(tx.new_debt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-base ${
                          isAdd
                            ? 'text-rose-600'
                            : isSub
                            ? 'text-emerald-600'
                            : isClear
                            ? 'text-indigo-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {isAdd && `+ ${formatCurrency(tx.amount)}`}
                        {isSub && `- ${formatCurrency(tx.amount)}`}
                        {isClear && `Cleared ${formatCurrency(tx.amount)}`}
                        {isInitial && `${formatCurrency(tx.amount)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
