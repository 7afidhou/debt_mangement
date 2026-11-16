# 🏪 Store Debt Management System (Khata & Ledger) - DZD Edition

A Next.js 14 web application designed for retail shops, grocery stores, pharmacies, and small businesses to manage customer debts, credit purchases, repayments, and full settlements in **Algerian Dinars (DZD / د.ج)** with a **local SQLite database**.

---

## ✨ Key Features (DZD Currency)

1. **Algerian Dinar (DZD) Formatted**:
   - All balances, debt cards, receipts, and inputs are formatted in **DZD** (e.g. `4,500.00 DZD`, `12,800.00 DZD`).
   - Quick increment and deduction chips tailored to Algerian cash denominations: `+100 DZD`, `+200 DZD`, `+500 DZD`, `+1,000 DZD`, `+2,000 DZD`, `+5,000 DZD`.

2. **Customer Management**:
   - Add new customers with **Name**, **Phone**, **Notes**, and **Initial Debt Balance (DZD)**.
   - Edit customer contact details and notes.
   - Delete customers with confirmation and debt warning guards.

3. **Debt Modification (Add, Subtract, Clear)**:
   - ➕ **Add Debt (+)**: Record credit purchases with item descriptions, invoice notes, and quick increment chips.
   - ➖ **Subtract / Repay (-)**: Record cash, card, or CCP / BaridiMob repayments with balance deduction and quick payment presets.
   - 0️⃣ **Clear to 0 DZD**: Settle the remaining debt completely down to **0.00 DZD** with a single click and log the settlement note.

4. **Full Audit Ledger & Statement History**:
   - Every single balance alteration (initial, add, subtract, clear) is saved as an atomic transaction record.
   - View chronological history for any customer with timestamp, previous balance, delta, new balance, and notes.
   - Print customer statements with built-in print styling (`@media print`).

5. **Dashboard Metrics & Search**:
   - Real-time summary cards: **Total Store Outstanding Debt (DZD)**, **Active Debtors**, **Settled (0 DZD) Accounts**, and **Total Customers**.
   - Live search by customer name, phone number, or notes.
   - Filter tabs: *All*, *Owes Debt*, *Settled 0 DZD*.
   - View mode toggle: *Grid Cards View* vs *Dense Table Ledger View*.

6. **Local Database (SQLite)**:
   - Uses `better-sqlite3` with SQLite WAL (Write-Ahead Logging) mode and foreign key constraints.
   - Database file stored locally at `data/store_debt.db`.
   - 100% offline-ready, no cloud database credentials required.

---

## 🚀 Running the App

The server is currently running on:
👉 **[http://localhost:3000](http://localhost:3000)**

To run manually in development mode:
```powershell
cd "C:\Users\PROBOOK\.gemini\antigravity\scratch\store-debt-manager"
npm run dev
```

To run in production mode:
```powershell
npm run build
npm start
```
