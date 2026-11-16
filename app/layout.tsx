import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Store Debt Management System | Local Ledger',
  description: 'Manage store customer debt, record payments, and settle credit balances with a local SQLite database',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
