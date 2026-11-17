import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { Customer, DebtTransaction, DashboardSummary, TransactionType, User } from './types';

// Ensure data folder exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'store_debt.db');
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      avatar_url TEXT,
      provider TEXT DEFAULT 'credentials',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Customers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      phone TEXT,
      notes TEXT,
      current_debt REAL NOT NULL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Check if user_id column exists on customers (for database backwards compatibility)
  const columns = db.prepare("PRAGMA table_info(customers)").all() as { name: string }[];
  const hasUserId = columns.some((col) => col.name === 'user_id');
  if (!hasUserId) {
    db.exec(`ALTER TABLE customers ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;`);
  }

  // 3. Transactions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      previous_debt REAL NOT NULL,
      new_debt REAL NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (person_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
    CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_person_id ON transactions(person_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
  `);

  // 4. Default Admin User
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password_hash, provider)
      VALUES (?, ?, ?, ?)
    `).run('Store Manager', 'admin@store.dz', defaultPasswordHash, 'credentials');
  }

  // Check if we need to insert sample demo records
  const countRow = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  if (countRow.count === 0) {
    seedDemoData(db);
  }
}

function seedDemoData(db: Database.Database) {
  const adminUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get() as { id: number } | undefined;
  const ownerId = adminUser ? adminUser.id : 1;

  const insertCustomer = db.prepare(`
    INSERT INTO customers (user_id, name, phone, notes, current_debt, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
  `);

  const insertTx = db.prepare(`
    INSERT INTO transactions (person_id, type, amount, previous_debt, new_debt, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const seed = db.transaction(() => {
    // 1. Karim Bensalem - owes 4,500 DZD
    const res1 = insertCustomer.run(ownerId, 'Karim Bensalem', '+213 551 23 45 67', 'Neighborhood regular - pays bi-weekly', 4500.00, '-5 days', '-1 days');
    const id1 = res1.lastInsertRowid;
    insertTx.run(id1, 'INITIAL', 2000.00, 0, 2000.00, 'Initial store credit for groceries', '-5 days');
    insertTx.run(id1, 'ADD', 3500.00, 2000.00, 5500.00, 'Purchased 2 bags of semolina & cooking oil', '-3 days');
    insertTx.run(id1, 'SUBTRACT', 1000.00, 5500.00, 4500.00, 'Cash installment payment', '-1 days');

    // 2. Amina Hadj - owes 12,800 DZD
    const res2 = insertCustomer.run(ownerId, 'Amina Hadj', '+213 662 87 65 43', 'Corner Bakery owner', 12800.00, '-7 days', '-2 hours');
    const id2 = res2.lastInsertRowid;
    insertTx.run(id2, 'INITIAL', 8000.00, 0, 8000.00, 'Baking supplies wholesale credit', '-7 days');
    insertTx.run(id2, 'ADD', 4800.00, 8000.00, 12800.00, '50kg sugar sack & yeast boxes', '-2 hours');

    // 3. Youcef Belkacem - Settled 0 DZD
    const res3 = insertCustomer.run(ownerId, 'Youcef Belkacem', '+213 773 45 98 76', 'Preferred cash payer', 0.00, '-10 days', '-4 hours');
    const id3 = res3.lastInsertRowid;
    insertTx.run(id3, 'INITIAL', 3200.00, 0, 3200.00, 'Monthly household pantry pack', '-10 days');
    insertTx.run(id3, 'CLEAR', 3200.00, 3200.00, 0.00, 'Paid in full in cash - cleared to 0 DZD', '-4 hours');

    // 4. Fatima Al-Mansoor - owes 2,650 DZD
    const res4 = insertCustomer.run(ownerId, 'Fatima Al-Mansoor', '+213 554 32 10 98', 'Building #4 apartment 2B', 2650.00, '-2 days', '-1 day');
    const id4 = res4.lastInsertRowid;
    insertTx.run(id4, 'INITIAL', 2650.00, 0, 2650.00, 'Weekend produce and dairy', '-2 days');
  });

  seed();
}

// ================= USER & AUTH OPERATIONS =================

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim()) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(
  name: string,
  email: string,
  passwordHash?: string | null,
  avatarUrl?: string | null,
  provider: 'credentials' | 'google' = 'credentials'
): User {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, avatar_url, provider, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const info = stmt.run(
    name.trim(),
    email.toLowerCase().trim(),
    passwordHash || null,
    avatarUrl || null,
    provider
  );

  return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid) as User;
}

export function findOrCreateGoogleUser(name: string, email: string, avatarUrl?: string | null): User {
  const db = getDb();
  const existing = getUserByEmail(email);
  if (existing) {
    if (avatarUrl && !existing.avatar_url) {
      db.prepare('UPDATE users SET avatar_url = ?, updated_at = datetime("now") WHERE id = ?').run(avatarUrl, existing.id);
      return { ...existing, avatar_url: avatarUrl };
    }
    return existing;
  }

  return createUser(name, email, null, avatarUrl, 'google');
}

export function verifyUserPassword(email: string, plainText: string): User | null {
  const user = getUserByEmail(email);
  if (!user || !user.password_hash) {
    return null;
  }

  const matches = bcrypt.compareSync(plainText, user.password_hash);
  if (!matches) {
    return null;
  }

  return user;
}

// ================= CUSTOMER OPERATIONS =================

export function getCustomers(userId?: number, search?: string, filter?: 'all' | 'debt' | 'settled'): Customer[] {
  const db = getDb();
  let query = 'SELECT * FROM customers WHERE 1=1';
  const params: any[] = [];

  if (userId) {
    query += ' AND (user_id = ? OR user_id IS NULL)';
    params.push(userId);
  }

  if (search && search.trim()) {
    query += ' AND (name LIKE ? OR phone LIKE ? OR notes LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (filter === 'debt') {
    query += ' AND current_debt > 0';
  } else if (filter === 'settled') {
    query += ' AND current_debt = 0';
  }

  query += ' ORDER BY current_debt DESC, updated_at DESC';

  return db.prepare(query).all(...params) as Customer[];
}

export function getCustomerById(id: number): Customer | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer | undefined;
}

export function getCustomerTransactions(personId: number): DebtTransaction[] {
  const db = getDb();
  return db.prepare('SELECT * FROM transactions WHERE person_id = ? ORDER BY created_at DESC, id DESC').all(personId) as DebtTransaction[];
}

export function addCustomer(
  name: string,
  initialDebt: number = 0,
  phone?: string,
  notes?: string,
  userId?: number
): Customer {
  const db = getDb();
  const roundedDebt = Math.round((Math.max(0, initialDebt || 0)) * 100) / 100;

  const insertTx = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO customers (user_id, name, phone, notes, current_debt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    const info = stmt.run(userId || null, name.trim(), phone?.trim() || null, notes?.trim() || null, roundedDebt);
    const newId = Number(info.lastInsertRowid);

    if (roundedDebt > 0) {
      db.prepare(`
        INSERT INTO transactions (person_id, type, amount, previous_debt, new_debt, note, created_at)
        VALUES (?, 'INITIAL', ?, 0, ?, 'Account created with initial debt', datetime('now'))
      `).run(newId, roundedDebt, roundedDebt);
    }

    return db.prepare('SELECT * FROM customers WHERE id = ?').get(newId) as Customer;
  });

  return insertTx();
}

export function updateCustomerDetails(id: number, name: string, phone?: string, notes?: string): boolean {
  const db = getDb();
  const res = db.prepare(`
    UPDATE customers 
    SET name = ?, phone = ?, notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(name.trim(), phone?.trim() || null, notes?.trim() || null, id);

  return res.changes > 0;
}

export function modifyDebt(
  customerId: number,
  action: 'add' | 'subtract' | 'clear',
  amount: number,
  note?: string
): { success: boolean; customer?: Customer; transaction?: DebtTransaction; message?: string } {
  const db = getDb();

  const runModify = db.transaction(() => {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId) as Customer | undefined;
    if (!customer) {
      throw new Error('Customer not found');
    }

    const prevDebt = Math.round(customer.current_debt * 100) / 100;
    let newDebt = prevDebt;
    let txType: TransactionType = 'ADD';
    let txAmount = Math.round(Math.abs(amount) * 100) / 100;
    let defaultNote = note?.trim() || '';

    if (action === 'add') {
      if (txAmount <= 0) throw new Error('Amount to add must be greater than 0');
      newDebt = Math.round((prevDebt + txAmount) * 100) / 100;
      txType = 'ADD';
      if (!defaultNote) defaultNote = 'Debt added / credit purchase';
    } else if (action === 'subtract') {
      if (txAmount <= 0) throw new Error('Payment amount must be greater than 0');
      newDebt = Math.round(Math.max(0, prevDebt - txAmount) * 100) / 100;
      txType = 'SUBTRACT';
      if (!defaultNote) defaultNote = 'Debt payment / reduction';
    } else if (action === 'clear') {
      if (prevDebt === 0) {
        throw new Error('Debt is already 0');
      }
      txAmount = prevDebt;
      newDebt = 0.0;
      txType = 'CLEAR';
      if (!defaultNote) defaultNote = 'Full debt settlement - balance cleared to 0 DZD';
    }

    // Update customer debt
    db.prepare(`
      UPDATE customers 
      SET current_debt = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newDebt, customerId);

    // Record transaction
    const txStmt = db.prepare(`
      INSERT INTO transactions (person_id, type, amount, previous_debt, new_debt, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const txInfo = txStmt.run(customerId, txType, txAmount, prevDebt, newDebt, defaultNote);

    const updatedCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId) as Customer;
    const recordedTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txInfo.lastInsertRowid) as DebtTransaction;

    return { updatedCustomer, recordedTx };
  });

  try {
    const { updatedCustomer, recordedTx } = runModify();
    return { success: true, customer: updatedCustomer, transaction: recordedTx };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export function deleteCustomer(customerId: number): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM customers WHERE id = ?').run(customerId);
  return res.changes > 0;
}

export function getDashboardSummary(userId?: number): DashboardSummary {
  const db = getDb();
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (userId) {
    where += ' AND (user_id = ? OR user_id IS NULL)';
    params.push(userId);
  }

  const totalRow = db.prepare(`
    SELECT 
      COALESCE(SUM(current_debt), 0) as totalOutstandingDebt,
      COUNT(*) as totalCustomers,
      SUM(CASE WHEN current_debt > 0 THEN 1 ELSE 0 END) as activeDebtorsCount,
      SUM(CASE WHEN current_debt = 0 THEN 1 ELSE 0 END) as settledCustomersCount
    FROM customers
    ${where}
  `).get(...params) as any;

  const txCountRow = db.prepare(`
    SELECT COUNT(*) as count FROM transactions 
    WHERE created_at >= datetime('now', '-24 hours')
  `).get() as { count: number };

  return {
    totalOutstandingDebt: Math.round(Number(totalRow.totalOutstandingDebt || 0) * 100) / 100,
    totalCustomers: Number(totalRow.totalCustomers || 0),
    activeDebtorsCount: Number(totalRow.activeDebtorsCount || 0),
    settledCustomersCount: Number(totalRow.settledCustomersCount || 0),
    recentTransactionsCount: Number(txCountRow?.count || 0),
  };
}
