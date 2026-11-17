export type TransactionType = 'ADD' | 'SUBTRACT' | 'CLEAR' | 'INITIAL';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash?: string | null;
  avatar_url?: string | null;
  provider: 'credentials' | 'google';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  user_id?: number | null;
  name: string;
  phone: string | null;
  notes: string | null;
  current_debt: number;
  created_at: string;
  updated_at: string;
}

export interface DebtTransaction {
  id: number;
  person_id: number;
  type: TransactionType;
  amount: number;
  previous_debt: number;
  new_debt: number;
  note: string | null;
  created_at: string;
}

export interface CustomerWithTransactions extends Customer {
  transactions?: DebtTransaction[];
}

export interface DashboardSummary {
  totalOutstandingDebt: number;
  totalCustomers: number;
  activeDebtorsCount: number;
  settledCustomersCount: number;
  recentTransactionsCount: number;
}
