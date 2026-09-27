'use client';

import { useState } from 'react';
import { PieChart, Users, ArrowRightLeft, CheckCircle } from 'lucide-react';
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
  onSettle: (fromId: string, toId: string, amount: number) => void;
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

interface Settlement {
  fromId: string;
  toId: string;
  amount: number;
}

export default function AnalyticsView({
  expenses,
  roommates,
  deposits,
  onSettle,
}: AnalyticsViewProps) {
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const years: number[] = expenses.map(
      (exp: Expense): number =>
        new Date(exp.date + 'T00:00:00').getFullYear(),
    );
    return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [settledIds, setSettledIds] = useState<Set<string>>(new Set());

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

  /* ── Derived: year + month filtered (synchronized) ──────────── */

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

  /* ── Derived: category distribution (synced to filter) ──────── */

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

  /* ── Derived: roommate net balances (synced to filter) ──────── */

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

  /* ── Derived: debt settlements (greedy matching) ────────────── */

  const settlements: Settlement[] = (() => {
    const creditors: { id: string; amount: number }[] = [];
    const debtors: { id: string; amount: number }[] = [];

    for (const r of roommates) {
      const bal: number = balances.get(r.id) ?? 0;
      if (bal > 0.005) {
        creditors.push({ id: r.id, amount: bal });
      } else if (bal < -0.005) {
        debtors.push({ id: r.id, amount: -bal });
      }
    }

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const result: Settlement[] = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const pay: number = Math.min(creditors[i].amount, debtors[j].amount);
      result.push({
        fromId: debtors[j].id,
        toId: creditors[i].id,
        amount: Math.round(pay * 100) / 100,
      });
      creditors[i].amount -= pay;
      debtors[j].amount -= pay;
      if (creditors[i].amount < 0.005) i++;
      if (debtors[j].amount < 0.005) j++;
    }

    return result;
  })();

  /* ── Derived: deposits vs kasse expenses (synced to filter) ─── */

  const totalDeposits: number = filteredDeposits.reduce(
    (sum: number, dep: Deposit): number => sum + dep.amount,
    0,
  );
  const totalKasseExpenses: number = filteredExpenses.reduce(
    (sum: number, exp: Expense): number =>
      exp.paidFromKasse === true ? sum + exp.amount : sum,
    0,
  );
  const netKasseBalance: number = totalDeposits - totalKasseExpenses;
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

  const getRoommateName = (id: string): string => {
    const r: Roommate | undefined = roommates.find(
      (rm: Roommate): boolean => rm.id === id,
    );
    return r ? r.name : 'Unknown';
  };

  const handleSettleClick = (s: Settlement): void => {
    const key: string = `${s.fromId}-${s.toId}-${s.amount}`;
    onSettle(s.fromId, s.toId, s.amount);
    setSettledIds((prev: Set<string>): Set<string> => {
      const next: Set<string> = new Set(prev);
      next.add(key);
      return next;
    });
  };

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
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] ${
                  selectedYear === year
                    ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
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
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors duration-150 cursor-pointer"
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
        <div className="h-64 border-b border-zinc-700 flex items-end gap-1 sm:gap-2">
          {monthlyTotals.map((total: number, monthIdx: number) => {
            const heightPct: number =
              maxMonthlyTotal > 0 ? (total / maxMonthlyTotal) * 100 : 0;
            const isSelected: boolean =
              selectedMonth === 'all' ||
              selectedMonth === String(monthIdx);
            return (
              <div
                key={monthIdx}
                className="group relative flex flex-1 flex-col justify-end h-full items-center"
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-700 px-2 py-1 text-xs font-medium text-zinc-100 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  {formatEur(total)}
                </div>
                {/* Bar */}
                <div
                  className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out ${
                    isSelected
                      ? 'bg-emerald-500 hover:bg-emerald-400'
                      : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                  style={{ height: `${Math.max(heightPct, 1)}%` }}
                />
              </div>
            );
          })}
        </div>
        {/* Month labels */}
        <div className="flex gap-1 sm:gap-2 mt-2">
          {MONTH_NAMES.map((name: string, idx: number) => (
            <span
              key={idx}
              className={`flex-1 text-center text-[10px] font-medium sm:text-xs transition-colors duration-300 ${
                selectedMonth === String(idx)
                  ? 'text-emerald-400'
                  : 'text-zinc-500'
              }`}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Wer zahlt an wen? – Debt Settlement */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-semibold text-zinc-100">
            Wer zahlt an wen?
          </h2>
        </div>
        {settlements.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-900/20 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">
              Alles ausgeglichen – niemand muss jemandem etwas zahlen.
            </span>
          </div>
        ) : (
          <ul className="space-y-3">
            {settlements.map((s: Settlement, idx: number) => {
              const key: string = `${s.fromId}-${s.toId}-${s.amount}`;
              const isSettled: boolean = settledIds.has(key);
              return (
                <li
                  key={idx}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 ${
                    isSettled
                      ? 'bg-emerald-900/20 border border-emerald-800/40'
                      : 'bg-zinc-800/50 hover:bg-zinc-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-300 ${
                        isSettled ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-sm text-zinc-200 truncate">
                      <span className="font-semibold">
                        {getRoommateName(s.fromId)}
                      </span>{' '}
                      zahlt{' '}
                      <span className="font-semibold">
                        {getRoommateName(s.toId)}
                      </span>
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`text-sm font-bold transition-colors duration-300 ${
                        isSettled
                          ? 'text-emerald-400 line-through'
                          : 'text-zinc-100'
                      }`}
                    >
                      {formatEur(s.amount)}
                    </span>
                    {!isSettled && (
                      <button
                        onClick={(): void => handleSettleClick(s)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] hover:brightness-110 shadow-sm hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                      >
                        Begleichen
                      </button>
                    )}
                    {isSettled && (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
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
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
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
                className="h-full rounded-full bg-rose-500 transition-all duration-500 ease-out"
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
              className={`text-sm font-bold transition-colors duration-300 ${
                netKasseBalance >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {formatEur(netKasseBalance)}
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
                    className={`h-full rounded-full ${CATEGORY_COLORS[cat]} transition-all duration-500 ease-out`}
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
                className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3 transition-colors duration-200 hover:bg-zinc-800/70"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${r.color}`} />
                  <span className="text-sm font-medium text-zinc-200">
                    {r.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold transition-colors duration-300 ${
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
