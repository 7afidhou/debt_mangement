'use client';

import React from 'react';
import { Store, UserPlus, Database, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({ onOpenAddModal, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Store Debt Ledger</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database className="w-3 h-3 mr-1 text-emerald-600" />
                  Local SQLite
                </span>
              </div>
              <p className="text-xs text-slate-500">Customer credit & debt management system</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh ledger data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
