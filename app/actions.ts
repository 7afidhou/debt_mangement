'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getCustomers,
  getCustomerById,
  getCustomerTransactions,
  addCustomer,
  updateCustomerDetails,
  modifyDebt,
  deleteCustomer,
  getDashboardSummary
} from '@/lib/db';
import { Customer, DebtTransaction, DashboardSummary } from '@/lib/types';

async function getCurrentUserId(): Promise<number | undefined> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user && (session.user as any).id) {
      return parseInt((session.user as any).id, 10);
    }
  } catch (err) {
    // If running outside session context
  }
  return undefined;
}

export async function getCustomersAction(search?: string, filter?: 'all' | 'debt' | 'settled'): Promise<Customer[]> {
  const userId = await getCurrentUserId();
  return getCustomers(userId, search, filter);
}

export async function getDashboardSummaryAction(): Promise<DashboardSummary> {
  const userId = await getCurrentUserId();
  return getDashboardSummary(userId);
}

export async function getCustomerTransactionsAction(customerId: number): Promise<DebtTransaction[]> {
  return getCustomerTransactions(customerId);
}

export async function addCustomerAction(data: {
  name: string;
  phone?: string;
  notes?: string;
  initialDebt?: number;
}): Promise<{ success: boolean; customer?: Customer; error?: string }> {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Customer name is required' };
    }
    const userId = await getCurrentUserId();
    const customer = addCustomer(data.name, data.initialDebt || 0, data.phone, data.notes, userId);
    revalidatePath('/');
    return { success: true, customer };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add customer' };
  }
}

export async function modifyDebtAction(data: {
  customerId: number;
  action: 'add' | 'subtract' | 'clear';
  amount: number;
  note?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const result = modifyDebt(data.customerId, data.action, data.amount, data.note);
    if (!result.success) {
      return { success: false, message: result.message || 'Failed to update debt' };
    }
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to modify debt' };
  }
}

export async function updateCustomerAction(data: {
  id: number;
  name: string;
  phone?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Customer name is required' };
    }
    const ok = updateCustomerDetails(data.id, data.name, data.phone, data.notes);
    revalidatePath('/');
    return { success: ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCustomerAction(customerId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = deleteCustomer(customerId);
    revalidatePath('/');
    return { success: ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
