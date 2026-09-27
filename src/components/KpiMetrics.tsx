'use client';

import { Wallet, Users, Tag } from 'lucide-react';
import type { Expense, Roommate } from '@/types/expense';

interface KpiMetricsProps {
  expenses: Expense[];
  roommates: Roommate[];
  kasseBalance: number;
}

export default function KpiMetrics({
  expenses,
  roommates,
  kasseBalance,
}: KpiMetricsProps) {
  const totalExpenses: number = expenses.reduce(
    (sum: number, exp: Expense): number => sum + exp.amount,
    0,
  );
  const fairShare: number =
    roommates.length > 0 ? totalExpenses / roommates.length : 0;
  const totalEntries: number = expenses.length;

  const formatEur = (value: number): string =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Expenses */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20">
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400 truncate">
              Total Expenses
            </p>
            <p className="text-lg sm:text-2xl font-bold text-zinc-100 truncate">
              {formatEur(totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* Fair Share */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/20">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400 truncate">
              Fair Share / Person
            </p>
            <p className="text-lg sm:text-2xl font-bold text-zinc-100 truncate">
              {formatEur(fairShare)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Entries */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600/20">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400 truncate">
              Total Entries
            </p>
            <p className="text-lg sm:text-2xl font-bold text-zinc-100">
              {totalEntries}
            </p>
          </div>
        </div>
      </div>

      {/* WG-Kasse Bestand */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${
              kasseBalance >= 0
                ? 'bg-emerald-600/20'
                : 'bg-rose-600/20'
            }`}
          >
            <Wallet
              className={`h-4 w-4 sm:h-5 sm:w-5 ${
                kasseBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400 truncate">
              WG-Kasse Bestand
            </p>
            <p
              className={`text-lg sm:text-2xl font-bold truncate ${
                kasseBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatEur(kasseBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
