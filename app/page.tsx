'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Customer, DashboardSummary } from '@/lib/types';
import { getCustomersAction, getDashboardSummaryAction } from './actions';
import { Header } from '@/components/Header';
import { DashboardCards } from '@/components/DashboardCards';
import { CustomerList } from '@/components/CustomerList';
import { AddCustomerModal } from '@/components/AddCustomerModal';
import { ModifyDebtModal } from '@/components/ModifyDebtModal';
import { CustomerHistoryModal } from '@/components/CustomerHistoryModal';
import { EditCustomerModal } from '@/components/EditCustomerModal';
import { DeleteCustomerModal } from '@/components/DeleteCustomerModal';
import { Info, Sparkles } from 'lucide-react';

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalOutstandingDebt: 0,
    totalCustomers: 0,
    activeDebtorsCount: 0,
    settledCustomersCount: 0,
    recentTransactionsCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Modify Debt Modal state
  const [modifyTarget, setModifyTarget] = useState<{
    customer: Customer;
    mode: 'add' | 'subtract' | 'clear';
  } | null>(null);

  // History Modal state
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

  // Edit Modal state
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  // Delete Modal state
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  // Data fetching
  const refreshData = useCallback(async (showSpin = true) => {
    if (showSpin) setIsRefreshing(true);
    try {
      const [fetchedCustomers, fetchedSummary] = await Promise.all([
        getCustomersAction(),
        getDashboardSummaryAction(),
      ]);
      setCustomers(fetchedCustomers);
      setSummary(fetchedSummary);
    } catch (err) {
      console.error('Failed to load store debt data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshData(false);
  }, [refreshData]);

  const handleModifyDebt = (customer: Customer, mode: 'add' | 'subtract' | 'clear') => {
    setModifyTarget({ customer, mode });
  };

  const handleViewHistory = (customer: Customer) => {
    setHistoryCustomer(customer);
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
  };

  const handleDelete = (customer: Customer) => {
    setDeleteCustomer(customer);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <Header
        onOpenAddModal={() => setIsAddOpen(true)}
        onRefresh={() => refreshData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome & Info Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-md relative overflow-hidden no-print">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-200" />
                <h2 className="text-lg font-bold">Store Customer Credit & Debt Tracker</h2>
              </div>
              <p className="text-xs text-emerald-100 mt-1 max-w-2xl leading-relaxed">
                Add customers, track initial balances, add to debts for credit purchases, record partial or full repayments, or clear remaining debt to 0 DZD with a single click. All data is securely stored in your local SQLite database.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-medium border border-white/20">
                SQLite WAL Active
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <DashboardCards summary={summary} />

        {/* Customer List / Table */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-3"></div>
            <p className="text-sm font-semibold text-slate-700">Loading store ledger...</p>
          </div>
        ) : (
          <CustomerList
            customers={customers}
            onModifyDebt={handleModifyDebt}
            onViewHistory={handleViewHistory}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenAddModal={() => setIsAddOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Store Debt Management System • Local SQLite Edition</p>
          <div className="flex items-center space-x-4">
            <span>Fast Ledger & Audit Trails</span>
            <span>•</span>
            <span>Zero Cloud Dependency</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddCustomerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => refreshData(false)}
      />

      <ModifyDebtModal
        isOpen={!!modifyTarget}
        customer={modifyTarget?.customer || null}
        initialMode={modifyTarget?.mode || 'add'}
        onClose={() => setModifyTarget(null)}
        onSuccess={() => refreshData(false)}
      />

      <CustomerHistoryModal
        isOpen={!!historyCustomer}
        customer={historyCustomer}
        onClose={() => setHistoryCustomer(null)}
      />

      <EditCustomerModal
        isOpen={!!editCustomer}
        customer={editCustomer}
        onClose={() => setEditCustomer(null)}
        onSuccess={() => refreshData(false)}
      />

      <DeleteCustomerModal
        isOpen={!!deleteCustomer}
        customer={deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
        onSuccess={() => refreshData(false)}
      />
    </div>
  );
}
