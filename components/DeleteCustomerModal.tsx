'use client';

import React, { useState } from 'react';
import { Customer } from '@/lib/types';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { deleteCustomerAction } from '@/app/actions';
import { formatCurrency } from '@/lib/currency';

interface DeleteCustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteCustomerModal({
  customer,
  isOpen,
  onClose,
  onSuccess,
}: DeleteCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteCustomerAction(customer.id);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Failed to delete customer');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-bold text-base">Delete Customer Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="font-bold text-slate-900">{customer.name}</strong>?
          </p>

          {customer.current_debt > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Warning:</strong> This customer currently has an active outstanding debt of{' '}
                <strong>{formatCurrency(customer.current_debt)}</strong>. Deleting them will also erase all their transaction ledger records!
              </span>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end space-x-2.5">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium text-sm shadow-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Deleting...' : 'Delete Customer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
