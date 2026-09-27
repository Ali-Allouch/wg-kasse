'use client';

import { useState } from 'react';
import { PieChart, Users } from 'lucide-react';
import type {
  Expense,
  ExpenseCategory,
  Roommate,
  Deposit,
} from '@/types/expense';

interface AnalyticsViewProps {
  expenses: Expense[];
  roommates: Roommate[];
  deposits: Deposit[];
}

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

const MONTH_NAMES: string[] = [
  'Jan',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dez',
];

export default function AnalyticsView({
  expenses,
  roommates,
  deposits,
}: AnalyticsViewProps) {
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const years: number[] = expenses.map(
      (exp: Expense): number =>
        new Date(exp.date + 'T00:00:00').getFullYear(),
    );
    return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  /* ── Derived: available years ───────────────────────────────── */

  const availableYears: number[] = Array.from(
    new Set(
      expenses.map(
        (exp: Expense): number =>
          new Date(exp.date + 'T00:00:00').getFullYear(),
      ),
    ),
  ).sort((a: number, b: number): number => a - b);

  /* ── Derived: year-filtered expenses (for bar chart) ────────── */

  const yearExpenses: Expense[] = expenses.filter(
    (exp: Expense): boolean =>
      new Date(exp.date + 'T00:00:00').getFullYear() === selectedYear,
  );

  /* ── Derived: year + month filtered ─────────────────────────── */

  const filteredExpenses: Expense[] = yearExpenses.filter(
    (exp: Expense): boolean => {
      if (selectedMonth === 'all') return true;
      const monthIdx: number = parseInt(selectedMonth, 10);
      return new Date(exp.date + 'T00:00:00').getMonth() === monthIdx;
    },
  );

  const filteredDeposits: Deposit[] = deposits.filter(
    (dep: Deposit): boolean => {
      const d: Date = new Date(dep.date + 'T00:00:00');
      if (d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== 'all') {
        return d.getMonth() === parseInt(selectedMonth, 10);
      }
      return true;
    },
  );

  /* ── Derived: monthly totals for bar chart ──────────────────── */

  const monthlyTotals: number[] = Array(12).fill(0) as number[];
  for (const exp of yearExpenses) {
    const m: number = new Date(exp.date + 'T00:00:00').getMonth();
    monthlyTotals[m] += exp.amount;
  }
  const maxMonthlyTotal: number = Math.max(...monthlyTotals, 1);

  /* ── Derived: category distribution ─────────────────────────── */

  const categoryTotals: Map<ExpenseCategory, number> = new Map<
    ExpenseCategory,
    number
  >();
  for (const cat of CATEGORIES) {
    categoryTotals.set(cat, 0);
  }
  for (const exp of filteredExpenses) {
    categoryTotals.set(
      exp.category,
      (categoryTotals.get(exp.category) ?? 0) + exp.amount,
    );
  }
  const filteredTotal: number = filteredExpenses.reduce(
    (sum: number, exp: Expense): number => sum + exp.amount,
    0,
  );

  /* ── Derived: roommate net balances ─────────────────────────── */

  const balances: Map<string, number> = new Map<string, number>();
  for (const r of roommates) {
    balances.set(r.id, 0);
  }
  for (const exp of filteredExpenses) {
    const share: number = exp.amount / exp.splitWith.length;
    balances.set(
      exp.paidById,
      (balances.get(exp.paidById) ?? 0) + exp.amount,
    );
    for (const id of exp.splitWith) {
      balances.set(id, (balances.get(id) ?? 0) - share);
    }
  }

  /* ── Derived: deposits vs kasse expenses ────────────────────── */

  const totalDeposits: number = filteredDeposits.reduce(
    (sum: number, dep: Deposit): number => sum + dep.amount,
    0,
  );
  const totalKasseExpenses: number = filteredExpenses.reduce(
    (sum: number, exp: Expense): number =>
      exp.paidFromKasse === true ? sum + exp.amount : sum,
    0,
  );
  const maxDepositExpense: number = Math.max(
    totalDeposits,
    totalKasseExpenses,
    1,
  );

  /* ── Helpers ────────────────────────────────────────────────── */

  const formatEur = (value: number): string =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Year & Month Selectors */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-400">Year:</span>
          <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
            {availableYears.map((year: number) => (
              <button
                key={year}
                onClick={(): void => setSelectedYear(year)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedYear === year
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-400">Month:</span>
          <select
            value={selectedMonth}
            onChange={(
              e: React.ChangeEvent<HTMLSelectElement>,
            ): void => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Year</option>
            {MONTH_NAMES.map((name: string, idx: number) => (
              <option key={idx} value={String(idx)}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Spending Bar Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-zinc-100">
            Monthly Spending — {selectedYear}
          </h2>
        </div>
        <div className="flex items-end gap-1 sm:gap-2" style={{ height: '10rem' }}>
          {monthlyTotals.map((total: number, monthIdx: number) => {
            const heightPct: number = (total / maxMonthlyTotal) * 100;
            const isSelected: boolean =
              selectedMonth === 'all' ||
              selectedMonth === String(monthIdx);
            return (
              <div
                key={monthIdx}
                className="group relative flex flex-1 flex-col items-center"
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-700 px-2 py-1 text-xs font-medium text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {formatEur(total)}
                </div>
                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-colors ${
                    isSelected
                      ? 'bg-emerald-500'
                      : 'bg-zinc-700 group-hover:bg-zinc-600'
                  }`}
                  style={{
                    height: `${Math.max(heightPct, 2)}%`,
                    minHeight: '4px',
                  }}
                />
                {/* Label */}
                <span className="mt-2 text-[10px] font-medium text-zinc-500 sm:text-xs">
                  {MONTH_NAMES[monthIdx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deposits vs Expenses Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-zinc-100">
            Deposits vs Kasse Expenses
          </h2>
        </div>
        <div className="space-y-4">
          {/* Deposits bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-zinc-300">Deposits</span>
              <span className="font-semibold text-emerald-400">
                {formatEur(totalDeposits)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${(totalDeposits / maxDepositExpense) * 100}%`,
                }}
              />
            </div>
          </div>
          {/* Kasse Expenses bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-zinc-300">Kasse Expenses</span>
              <span className="font-semibold text-rose-400">
                {formatEur(totalKasseExpenses)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-rose-500 transition-all"
                style={{
                  width: `${(totalKasseExpenses / maxDepositExpense) * 100}%`,
                }}
              />
            </div>
          </div>
          {/* Net */}
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3">
            <span className="text-sm text-zinc-400">Net Kasse Balance</span>
            <span
              className={`text-sm font-bold ${
                totalDeposits - totalKasseExpenses >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {formatEur(totalDeposits - totalKasseExpenses)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-zinc-100">
            Spending by Category
          </h2>
        </div>
        <div className="space-y-3">
          {CATEGORIES.map((cat: ExpenseCategory) => {
            const amount: number = categoryTotals.get(cat) ?? 0;
            const pct: number =
              filteredTotal > 0 ? (amount / filteredTotal) * 100 : 0;
            return (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{cat}</span>
                  <span className="text-zinc-400">
                    {formatEur(amount)} · {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${CATEGORY_COLORS[cat]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roommate Balances */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-zinc-100">
            Roommate Balances
          </h2>
        </div>
        <div className="space-y-3">
          {roommates.map((r: Roommate) => {
            const balance: number = balances.get(r.id) ?? 0;
            const isPositive: boolean = balance > 0.005;
            const isNegative: boolean = balance < -0.005;
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${r.color}`} />
                  <span className="text-sm font-medium text-zinc-200">
                    {r.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    isPositive
                      ? 'text-emerald-400'
                      : isNegative
                        ? 'text-red-400'
                        : 'text-zinc-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {formatEur(balance)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
