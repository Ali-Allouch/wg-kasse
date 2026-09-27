'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Expense, ExpenseCategory, Roommate } from '@/types/expense';

interface ExpenseModalProps {
  roommates: Roommate[];
  onAdd: (expense: Expense) => void;
  onClose: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Groceries',
  'Household',
  'Utilities',
  'Drinks',
  'Repairs',
  'Other',
];

export default function ExpenseModal({
  roommates,
  onAdd,
  onClose,
}: ExpenseModalProps) {
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Groceries');
  const [paidById, setPaidById] = useState<string>(
    roommates.length > 0 ? roommates[0].id : '',
  );
  const [paidFromKasse, setPaidFromKasse] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect((): void => {
    const frame: number = requestAnimationFrame((): void => {
      setMounted(true);
    });
    return (): void => cancelAnimationFrame(frame);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const trimmedTitle: string = title.trim();
    const parsedAmount: number = parseFloat(amount);

    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!paidById) {
      setError('Please select who paid.');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: trimmedTitle,
      amount: Math.round(parsedAmount * 100) / 100,
      category,
      paidById,
      date: new Date().toISOString().slice(0, 10),
      splitWith: roommates.map((r: Roommate): string => r.id),
      paidFromKasse: paidFromKasse || undefined,
    };

    onAdd(newExpense);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-200 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-modal-title"
        className={`w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl transition-all duration-200 ease-out ${
          mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="expense-modal-title"
            className="text-lg font-bold text-zinc-100"
          >
            New Expense
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="exp-title"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Title
            </label>
            <input
              id="exp-title"
              type="text"
              value={title}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>,
              ): void => setTitle(e.target.value)}
              placeholder="e.g. Supermarkt"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors duration-150"
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="exp-amount"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Amount (€)
            </label>
            <input
              id="exp-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>,
              ): void => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors duration-150"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="exp-category"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Category
            </label>
            <select
              id="exp-category"
              value={category}
              onChange={(
                e: React.ChangeEvent<HTMLSelectElement>,
              ): void => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors duration-150 cursor-pointer"
            >
              {CATEGORIES.map((cat: ExpenseCategory) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Paid By */}
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Paid by
            </span>
            <div className="grid grid-cols-2 gap-2">
              {roommates.map((r: Roommate) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={(): void => setPaidById(r.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] ${
                    paidById === r.id
                      ? 'border-emerald-500 bg-emerald-600/20 text-emerald-300 shadow-sm'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700/50'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Paid from Kasse */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300 select-none">
            <input
              type="checkbox"
              checked={paidFromKasse}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>,
              ): void => setPaidFromKasse(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 transition-colors duration-150 cursor-pointer"
            />
            Paid from WG-Kasse
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] hover:brightness-110 shadow-sm hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}
