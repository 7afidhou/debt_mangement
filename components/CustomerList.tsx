'use client';

import React, { useState, useMemo } from 'react';
import { Customer } from '@/lib/types';
import { CustomerCard } from './CustomerCard';
import { CustomerRow } from './CustomerRow';
import { Search, SlidersHorizontal, LayoutGrid, List, AlertTriangle, UserPlus, Filter } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onModifyDebt: (customer: Customer, mode: 'add' | 'subtract' | 'clear') => void;
  onViewHistory: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onOpenAddModal: () => void;
}

export function CustomerList({
  customers,
  onModifyDebt,
  onViewHistory,
  onEdit,
  onDelete,
  onOpenAddModal,
}: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debt' | 'settled'>('all');
  const [sortBy, setSortBy] = useState<'highest' | 'lowest' | 'name' | 'recent'>('highest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter & sort logic
  const filteredAndSortedCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Status filter
        if (filterType === 'debt' && c.current_debt <= 0) return false;
        if (filterType === 'settled' && c.current_debt > 0) return false;

        // Search term
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.notes && c.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'highest') {
          return b.current_debt - a.current_debt;
        } else if (sortBy === 'lowest') {
          return a.current_debt - b.current_debt;
        } else if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'recent') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        return 0;
      });
  }, [customers, searchTerm, filterType, sortBy]);

  // Counts
  const activeDebtCount = customers.filter((c) => c.current_debt > 0).length;
  const settledCount = customers.filter((c) => c.current_debt === 0).length;

  return (
    <div className="space-y-4">
      {/* Control Bar: Search, Filters, Sorters, View Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 no-print">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by customer name, phone, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-4 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setFilterType('debt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === 'debt'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Owes Debt ({activeDebtCount})
            </button>
            <button
              onClick={() => setFilterType('settled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === 'settled'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Settled 0 DZD ({settledCount})
            </button>
          </div>

          {/* Right Sorter and View Mode */}
          <div className="flex items-center space-x-2 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            {/* Sort Select */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs font-medium bg-slate-100 hover:bg-slate-200 border-none text-slate-700 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="highest">Highest Debt First</option>
                <option value="lowest">Lowest Debt First</option>
                <option value="name">Name (A-Z)</option>
                <option value="recent">Recently Active</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table Ledger View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Customer Content Area */}
      {filteredAndSortedCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Customers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm
              ? `No records match your query "${searchTerm}". Try resetting your search filter.`
              : 'There are no customer records matching this category.'}
          </p>
          <div className="flex items-center justify-center space-x-2">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Customer</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onModifyDebt={onModifyDebt}
              onViewHistory={onViewHistory}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Customer</th>
                  <th scope="col" className="px-6 py-3.5">Phone</th>
                  <th scope="col" className="px-6 py-3.5">Current Debt</th>
                  <th scope="col" className="px-6 py-3.5">Last Active</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredAndSortedCustomers.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onModifyDebt={onModifyDebt}
                    onViewHistory={onViewHistory}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
