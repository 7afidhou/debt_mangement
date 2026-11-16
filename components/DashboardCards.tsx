'use client';

import React from 'react';
import { DashboardSummary } from '@/lib/types';
import { AlertCircle, CheckCircle2, Banknote, Users, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface DashboardCardsProps {
  summary: DashboardSummary;
}

export function DashboardCards({ summary }: DashboardCardsProps) {
  const settledRatio = summary.totalCustomers > 0 
    ? Math.round((summary.settledCustomersCount / summary.totalCustomers) * 100) 
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
      {/* 1. Total Outstanding Debt */}
      <div className="bg-white rounded-xl border border-rose-100 shadow-sm p-4 relative overflow-hidden group hover:border-rose-200 transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Outstanding Debt</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1 tracking-tight">
              {formatCurrency(summary.totalOutstandingDebt)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
              Store receivables pending
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Banknote className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* 2. Active Debtors */}
      <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4 relative overflow-hidden group hover:border-amber-200 transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customers in Debt</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1 tracking-tight">
              {summary.activeDebtorsCount}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {summary.totalCustomers > 0 ? `${Math.round((summary.activeDebtorsCount / summary.totalCustomers) * 100)}% of total clients` : 'No customers yet'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 3. Settled Customers (0 DZD Debt) */}
      <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4 relative overflow-hidden group hover:border-emerald-200 transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fully Settled (0 DZD)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 tracking-tight">
              {summary.settledCustomersCount}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {settledRatio}% clearance rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 4. Total Customers & 24h Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-600" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Customers</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1 tracking-tight">
              {summary.totalCustomers}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-indigo-500" />
              {summary.recentTransactionsCount} updates past 24h
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
