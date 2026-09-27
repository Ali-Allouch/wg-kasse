'use client';

import { useState } from 'react';
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
  const [error, setError] = useState<string>('');

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
    };

    onAdd(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">New Expense</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    paidById === r.id
                      ? 'border-emerald-500 bg-emerald-600/20 text-emerald-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}
