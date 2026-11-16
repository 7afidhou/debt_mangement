'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { PlusCircle, MinusCircle, CheckCircle, X, Banknote, AlertCircle, ArrowRight } from 'lucide-react';
import { modifyDebtAction } from '@/app/actions';
import { formatCurrency, CURRENCY_LABEL } from '@/lib/currency';

interface ModifyDebtModalProps {
  customer: Customer | null;
  initialMode?: 'add' | 'subtract' | 'clear';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModifyDebtModal({
  customer,
  initialMode = 'add',
  isOpen,
  onClose,
  onSuccess,
}: ModifyDebtModalProps) {
  const [mode, setMode] = useState<'add' | 'subtract' | 'clear'>(initialMode);
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAmount('');
      setNote('');
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen || !customer) return null;

  const currentDebt = customer.current_debt;
  const numAmount = parseFloat(amount) || 0;

  // Calculate projected new debt
  let projectedDebt = currentDebt;
  if (mode === 'add') {
    projectedDebt = Math.round((currentDebt + numAmount) * 100) / 100;
  } else if (mode === 'subtract') {
    projectedDebt = Math.max(0, Math.round((currentDebt - numAmount) * 100) / 100);
  } else if (mode === 'clear') {
    projectedDebt = 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode !== 'clear' && (numAmount <= 0 || isNaN(numAmount))) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (mode === 'clear' && currentDebt === 0) {
      setError('Customer balance is already 0 DZD');
      return;
    }

    setIsLoading(true);
    try {
      const res = await modifyDebtAction({
        customerId: customer.id,
        action: mode,
        amount: mode === 'clear' ? currentDebt : numAmount,
        note: note.trim() || undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to update debt');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const setPreset = (val: number) => {
    setAmount(val.toString());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Modify Customer Debt</h2>
            <p className="text-xs text-slate-500">
              Customer: <span className="font-semibold text-slate-700">{customer.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Current Debt Balance:</span>
          <span className={`font-mono font-bold text-base ${currentDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatCurrency(currentDebt)}
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => { setMode('add'); setError(null); }}
              className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === 'add'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Debt (+)</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('subtract'); setError(null); }}
              className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === 'subtract'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>Subtract (-)</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('clear'); setError(null); }}
              className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === 'clear'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Clear to 0 DZD</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount input (for Add and Subtract) */}
            {mode !== 'clear' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {mode === 'add' ? 'Amount to Add (DZD)' : 'Payment / Deduction (DZD)'}
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-10 pr-14 py-2.5 text-base font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                    DZD
                  </div>
                </div>

                {/* DZD Preset chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {mode === 'add' ? (
                    <>
                      {[100, 200, 500, 1000, 2000, 5000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPreset(preset)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          +{preset.toLocaleString('fr-DZ')} DZD
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {currentDebt > 0 && (
                        <button
                          type="button"
                          onClick={() => setPreset(currentDebt)}
                          className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                        >
                          Full Debt ({formatCurrency(currentDebt, false)})
                        </button>
                      )}
                      {currentDebt > 10 && (
                        <button
                          type="button"
                          onClick={() => setPreset(Math.round(currentDebt / 2))}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Half ({formatCurrency(Math.round(currentDebt / 2), false)})
                        </button>
                      )}
                      {[200, 500, 1000, 2000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPreset(preset)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          {preset.toLocaleString('fr-DZ')} DZD
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Clear to 0 explanation box */
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white mt-0.5">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Clear Entire Debt Balance</h4>
                    <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                      This will reset <strong className="font-semibold">{customer.name}&apos;s</strong> current debt of{' '}
                      <strong className="underline font-bold">{formatCurrency(currentDebt)}</strong> down to{' '}
                      <strong className="underline font-bold text-emerald-700">0.00 DZD</strong> and log a full settlement entry in the ledger.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Note / Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Note / Description (Optional)
              </label>
              <input
                type="text"
                placeholder={
                  mode === 'add'
                    ? 'e.g. Purchased items on credit'
                    : mode === 'subtract'
                    ? 'e.g. Paid in cash at counter'
                    : 'e.g. Cleared full balance to 0 DZD'
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="block w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Balance Preview Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Balance Preview</span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(currentDebt)} {mode === 'add' ? `+ ${formatCurrency(numAmount)}` : mode === 'subtract' ? `- ${formatCurrency(numAmount)}` : '→ 0.00 DZD'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className={`font-mono font-bold text-sm ${projectedDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatCurrency(projectedDebt)}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-lg text-white font-medium text-sm shadow-md transition-all ${
                  mode === 'add'
                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/20'
                    : mode === 'subtract'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/20'
                }`}
              >
                {isLoading ? (
                  <span>Updating...</span>
                ) : (
                  <>
                    {mode === 'add' && <PlusCircle className="w-4 h-4" />}
                    {mode === 'subtract' && <MinusCircle className="w-4 h-4" />}
                    {mode === 'clear' && <CheckCircle className="w-4 h-4" />}
                    <span>
                      {mode === 'add' ? 'Confirm Add Debt' : mode === 'subtract' ? 'Record Payment' : 'Confirm Clear to 0 DZD'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
