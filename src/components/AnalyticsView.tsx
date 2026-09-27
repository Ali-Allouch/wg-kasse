'use client';

import { PieChart, Users } from 'lucide-react';
import type { Expense, ExpenseCategory, Roommate } from '@/types/expense';

interface AnalyticsViewProps {
  expenses: Expense[];
  roommates: Roommate[];
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

export default function AnalyticsView({
  expenses,
  roommates,
}: AnalyticsViewProps) {
  const totalExpenses: number = expenses.reduce(
    (sum: number, exp: Expense): number => sum + exp.amount,
    0,
  );

  // Category distribution
  const categoryTotals: Map<ExpenseCategory, number> = new Map<
    ExpenseCategory,
    number
  >();
  for (const cat of CATEGORIES) {
    categoryTotals.set(cat, 0);
  }
  for (const exp of expenses) {
    categoryTotals.set(
      exp.category,
      (categoryTotals.get(exp.category) ?? 0) + exp.amount,
    );
  }

  // Roommate net balances (paid - owed)
  const balances: Map<string, number> = new Map<string, number>();
  for (const r of roommates) {
    balances.set(r.id, 0);
  }
  for (const exp of expenses) {
    const share: number = exp.amount / exp.splitWith.length;
    balances.set(
      exp.paidById,
      (balances.get(exp.paidById) ?? 0) + exp.amount,
    );
    for (const id of exp.splitWith) {
      balances.set(id, (balances.get(id) ?? 0) - share);
    }
  }

  const formatEur = (value: number): string =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

  return (
    <div className="space-y-6">
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
              totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
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
