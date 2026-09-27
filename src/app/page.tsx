'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Wallet, RefreshCw, AlertCircle } from 'lucide-react';
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

const STORAGE_KEY_EXPENSES = 'wgkasse_expenses';
const STORAGE_KEY_DEPOSITS = 'wgkasse_deposits';

export default function Home() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const roommates: Roommate[] = ROOMMATES;

  /* ── LocalStorage Hydration ─────────────────────────────────── */

  useEffect((): void => {
    try {
      const storedExpenses: string | null = localStorage.getItem(
        STORAGE_KEY_EXPENSES,
      );
      const storedDeposits: string | null = localStorage.getItem(
        STORAGE_KEY_DEPOSITS,
      );
      if (storedExpenses) {
        const parsed: unknown = JSON.parse(storedExpenses);
        if (Array.isArray(parsed)) {
          setExpenses(parsed as Expense[]);
        }
      }
      if (storedDeposits) {
        const parsed: unknown = JSON.parse(storedDeposits);
        if (Array.isArray(parsed)) {
          setDeposits(parsed as Deposit[]);
        }
      }
    } catch {
      // fall back to seed data silently
    }
    setIsMounted(true);
  }, []);

  useEffect((): void => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEY_DEPOSITS, JSON.stringify(deposits));
    } catch {
      // storage full or unavailable – ignore
    }
  }, [expenses, deposits, isMounted]);

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleAddExpense = (expense: Expense): void => {
    setExpenses((prev: Expense[]): Expense[] => [expense, ...prev]);
  };

  const handleRequestDelete = (id: string): void => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = (): void => {
    if (deleteConfirmId !== null) {
      const idToRemove: string = deleteConfirmId;
      setDeleteConfirmId(null);
      setDeletingId(idToRemove);
      setTimeout((): void => {
        setExpenses(
          (prev: Expense[]): Expense[] =>
            prev.filter((e: Expense): boolean => e.id !== idToRemove),
        );
        setDeletingId(null);
      }, 300);
    }
  };

  const handleCancelDelete = (): void => {
    setDeleteConfirmId(null);
  };

  const handleAddDeposit = (deposit: Deposit): void => {
    setDeposits((prev: Deposit[]): Deposit[] => [deposit, ...prev]);
  };

  const handleSettle = (
    fromId: string,
    toId: string,
    amount: number,
  ): void => {
    const newExpense: Expense = {
      id: `exp-settle-${Date.now()}`,
      title: 'Ausgleichszahlung',
      amount: Math.round(amount * 100) / 100,
      category: 'Other',
      paidById: fromId,
      date: new Date().toISOString().slice(0, 10),
      splitWith: [toId],
    };
    setExpenses((prev: Expense[]): Expense[] => [newExpense, ...prev]);
  };

  const handleReset = (): void => {
    setExpenses(SEED_EXPENSES);
    setDeposits(MOCK_DEPOSITS);
    setSearchQuery('');
    setActiveCategory('All');
    setDeleteConfirmId(null);
    setDeletingId(null);
    try {
      localStorage.removeItem(STORAGE_KEY_EXPENSES);
      localStorage.removeItem(STORAGE_KEY_DEPOSITS);
    } catch {
      // ignore
    }
  };

  const handleLogout = (): void => {
    setIsUnlocked(false);
    setActiveTab('overview');
    setSearchQuery('');
    setActiveCategory('All');
    setDeleteConfirmId(null);
    setDeletingId(null);
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

  /* ── Unified Kasse Balance (single source of truth) ──────────── */

  const kasseBalance: number = useMemo(
    (): number => {
      const totalDeposits: number = deposits.reduce(
        (sum: number, dep: Deposit): number => sum + dep.amount,
        0,
      );
      const kasseExpenses: number = expenses.reduce(
        (sum: number, exp: Expense): number =>
          exp.paidFromKasse === true ? sum + exp.amount : sum,
        0,
      );
      return totalDeposits - kasseExpenses;
    },
    [deposits, expenses],
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab: ActiveTab): void => setActiveTab(tab)}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 sm:space-y-6 px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'overview' ? (
          <>
            {/* KPI Metrics */}
            <KpiMetrics
              expenses={expenses}
              roommates={roommates}
              kasseBalance={kasseBalance}
            />

            {/* Filters row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Category pills – horizontal scroll on mobile */}
              <div className="overflow-x-auto no-scrollbar flex space-x-2 pb-1">
                <button
                  onClick={(): void => setActiveCategory('All')}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] ${
                    activeCategory === 'All'
                      ? 'bg-emerald-600 text-white shadow-sm hover:shadow-emerald-500/10'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat: ExpenseCategory) => (
                  <button
                    key={cat}
                    onClick={(): void => setActiveCategory(cat)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] ${
                      activeCategory === cat
                        ? 'bg-emerald-600 text-white shadow-sm hover:shadow-emerald-500/10'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search + Action buttons */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                  ): void => setSearchQuery(e.target.value)}
                  placeholder="Search expenses…"
                  className="w-full sm:w-48 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors duration-150"
                />
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                  <button
                    onClick={(): void => setIsDepositModalOpen(true)}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-emerald-600/50 bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] hover:brightness-110 shadow-sm hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  >
                    <Wallet className="h-4 w-4" />
                    Einzahlung
                  </button>
                  <button
                    onClick={(): void => setIsModalOpen(true)}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] hover:brightness-110 shadow-sm hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  >
                    <Plus className="h-4 w-4" />
                    Ausgabe
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions list */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900">
              <div className="border-b border-zinc-800 px-4 sm:px-5 py-3 sm:py-4">
                <h2 className="text-base font-semibold text-zinc-100">
                  Transactions
                </h2>
              </div>
              {filteredExpenses.length === 0 ? (
                <div className="px-4 sm:px-5 py-10 text-center text-sm text-zinc-500">
                  No expenses found.
                </div>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {filteredExpenses.map((exp: Expense) => {
                    const isDeleting: boolean = deletingId === exp.id;
                    const isConfirming: boolean = deleteConfirmId === exp.id;
                    return (
                      <li
                        key={exp.id}
                        className={`transition-all duration-300 ease-out overflow-hidden ${
                          isDeleting
                            ? 'max-h-0 py-0 my-0 opacity-0 translate-x-4'
                            : 'max-h-20 py-3 sm:py-4 opacity-100 translate-x-0'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 transition-colors duration-150 hover:bg-zinc-800/40">
                          {/* Left: dot + title + subtitle */}
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <span
                              className={`h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 rounded-full ${CATEGORY_COLORS[exp.category]}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-zinc-100">
                                {exp.title}
                                {exp.paidFromKasse === true && (
                                  <span className="ml-1.5 sm:ml-2 inline-block rounded-full bg-emerald-600/20 px-1.5 sm:px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                    Kasse
                                  </span>
                                )}
                              </p>
                              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-zinc-400">
                                <span>{formatDate(exp.date)}</span>
                                <span className="text-zinc-600">·</span>
                                <span>{exp.category}</span>
                                <span className="text-zinc-600">·</span>
                                <span>
                                  Paid by {getRoommateName(exp.paidById)}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Right: amount + delete / confirm */}
                          {isConfirming ? (
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="hidden sm:flex items-center gap-1 text-xs text-amber-400">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Löschen bestätigen?
                              </span>
                              <button
                                onClick={handleConfirmDelete}
                                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] hover:brightness-110 shadow-sm hover:shadow-red-500/10"
                              >
                                Ja
                              </button>
                              <button
                                onClick={handleCancelDelete}
                                className="rounded-lg border border-zinc-600 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] hover:bg-zinc-700"
                              >
                                Nein
                              </button>
                            </div>
                          ) : (
                            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                              <span className="text-sm font-bold text-zinc-100 whitespace-nowrap">
                                {formatEur(exp.amount)}
                              </span>
                              <button
                                onClick={(): void => handleRequestDelete(exp.id)}
                                className="rounded-lg p-1.5 sm:p-2 text-zinc-500 transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] hover:bg-red-900/30 hover:text-red-400"
                                aria-label={`Delete ${exp.title}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        ) : (
          <AnalyticsView
            expenses={expenses}
            roommates={roommates}
            deposits={deposits}
            onSettle={handleSettle}
          />
        )}
      </main>

      {/* Footer with Reset */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6">
          <p className="text-xs text-zinc-500">
            WGKasse · WG Lindenstraße 42
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] hover:bg-zinc-700 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset to Demo Data
          </button>
        </div>
      </footer>

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
