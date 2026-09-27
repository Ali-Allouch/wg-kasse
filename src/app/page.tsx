'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import type {
  Expense,
  ExpenseCategory,
  Roommate,
  Deposit,
} from '@/types/expense';
import {
  ROOMMATES,
  SEED_EXPENSES,
  MOCK_DEPOSITS,
} from '@/lib/mockData';
import PinGate from '@/components/PinGate';
import Navbar, { type ActiveTab } from '@/components/Navbar';
import KpiMetrics from '@/components/KpiMetrics';
import ExpenseModal from '@/components/ExpenseModal';
import DepositModal from '@/components/DepositModal';
import AnalyticsView from '@/components/AnalyticsView';

const CATEGORIES: ExpenseCategory[] = [
  'Groceries',
  'Household',
  'Utilities',
  'Drinks',
  'Repairs',
  'Other',
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Groceries: 'bg-emerald-500',
  Household: 'bg-blue-500',
  Utilities: 'bg-violet-500',
  Drinks: 'bg-amber-500',
  Repairs: 'bg-red-500',
  Other: 'bg-zinc-500',
};

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [expenses, setExpenses] = useState<Expense[]>(SEED_EXPENSES);
  const [deposits, setDeposits] = useState<Deposit[]>(MOCK_DEPOSITS);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] =
    useState<ExpenseCategory | 'All'>('All');

  const roommates: Roommate[] = ROOMMATES;

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleAddExpense = (expense: Expense): void => {
    setExpenses((prev: Expense[]): Expense[] => [expense, ...prev]);
  };

  const handleDeleteExpense = (id: string): void => {
    setExpenses(
      (prev: Expense[]): Expense[] =>
        prev.filter((e: Expense): boolean => e.id !== id),
    );
  };

  const handleAddDeposit = (deposit: Deposit): void => {
    setDeposits((prev: Deposit[]): Deposit[] => [deposit, ...prev]);
  };

  const handleLogout = (): void => {
    setIsUnlocked(false);
    setActiveTab('overview');
    setSearchQuery('');
    setActiveCategory('All');
  };

  /* ── Derived values ───────────────────────────────────────────── */

  const filteredExpenses: Expense[] = useMemo(
    (): Expense[] =>
      expenses.filter((exp: Expense): boolean => {
        const matchesSearch: boolean =
          searchQuery === '' ||
          exp.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory: boolean =
          activeCategory === 'All' || exp.category === activeCategory;
        return matchesSearch && matchesCategory;
      }),
    [expenses, searchQuery, activeCategory],
  );

  /* ── Helpers ──────────────────────────────────────────────────── */

  const getRoommateName = (id: string): string => {
    const r: Roommate | undefined = roommates.find(
      (rm: Roommate): boolean => rm.id === id,
    );
    return r ? r.name : 'Unknown';
  };

  const formatEur = (value: number): string =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

  const formatDate = (iso: string): string => {
    const d: Date = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('de-DE');
  };

  /* ── Render ───────────────────────────────────────────────────── */

  if (!isUnlocked) {
    return <PinGate onUnlock={(): void => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab: ActiveTab): void => setActiveTab(tab)}
        onLogout={handleLogout}
        onDeposit={(): void => setIsDepositModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {activeTab === 'overview' ? (
          <>
            {/* KPI Metrics */}
            <KpiMetrics
              expenses={expenses}
              roommates={roommates}
              deposits={deposits}
            />

            {/* Filters row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Category pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={(): void => setActiveCategory('All')}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === 'All'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat: ExpenseCategory) => (
                  <button
                    key={cat}
                    onClick={(): void => setActiveCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search + Deposit + Add */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                  ): void => setSearchQuery(e.target.value)}
                  placeholder="Search expenses…"
                  className="w-48 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={(): void => setIsDepositModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-emerald-600/50 bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  <Wallet className="h-4 w-4" />
                  Einzahlung
                </button>
                <button
                  onClick={(): void => setIsModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Transactions list */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900">
              <div className="border-b border-zinc-800 px-5 py-4">
                <h2 className="text-base font-semibold text-zinc-100">
                  Transactions
                </h2>
              </div>
              {filteredExpenses.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-zinc-500">
                  No expenses found.
                </div>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {filteredExpenses.map((exp: Expense) => (
                    <li
                      key={exp.id}
                      className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-zinc-800/40"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`h-3 w-3 shrink-0 rounded-full ${CATEGORY_COLORS[exp.category]}`}
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-100">
                            {exp.title}
                            {exp.paidFromKasse === true && (
                              <span className="ml-2 rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                Kasse
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {formatDate(exp.date)} · {exp.category} · Paid by{' '}
                            {getRoommateName(exp.paidById)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-zinc-100">
                          {formatEur(exp.amount)}
                        </span>
                        <button
                          onClick={(): void => handleDeleteExpense(exp.id)}
                          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-900/30 hover:text-red-400"
                          aria-label={`Delete ${exp.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <AnalyticsView
            expenses={expenses}
            roommates={roommates}
            deposits={deposits}
          />
        )}
      </main>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <ExpenseModal
          roommates={roommates}
          onAdd={handleAddExpense}
          onClose={(): void => setIsModalOpen(false)}
        />
      )}

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <DepositModal
          roommates={roommates}
          onAdd={handleAddDeposit}
          onClose={(): void => setIsDepositModalOpen(false)}
        />
      )}
    </div>
  );
}
