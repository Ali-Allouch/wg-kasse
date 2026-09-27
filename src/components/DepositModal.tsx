'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Deposit, Roommate } from '@/types/expense';

interface DepositModalProps {
  roommates: Roommate[];
  onAdd: (deposit: Deposit) => void;
  onClose: () => void;
}

export default function DepositModal({
  roommates,
  onAdd,
  onClose,
}: DepositModalProps) {
  const [roommateId, setRoommateId] = useState<string>(
    roommates.length > 0 ? roommates[0].id : '',
  );
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const parsedAmount: number = parseFloat(amount);

    if (!roommateId) {
      setError('Please select a roommate.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    const newDeposit: Deposit = {
      id: `dep-${Date.now()}`,
      roommateId,
      amount: Math.round(parsedAmount * 100) / 100,
      date,
      note: note.trim() || undefined,
    };

    onAdd(newDeposit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deposit-modal-title"
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="deposit-modal-title"
            className="text-lg font-bold text-zinc-100"
          >
            Einzahlung
          </h2>
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

          {/* Roommate */}
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Roommate
            </span>
            <div className="grid grid-cols-2 gap-2">
              {roommates.map((r: Roommate) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={(): void => setRoommateId(r.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    roommateId === r.id
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

          {/* Amount */}
          <div>
            <label
              htmlFor="dep-amount"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Amount (€)
            </label>
            <input
              id="dep-amount"
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

          {/* Date */}
          <div>
            <label
              htmlFor="dep-date"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Date
            </label>
            <input
              id="dep-date"
              type="date"
              value={date}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>,
              ): void => setDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Note (optional) */}
          <div>
            <label
              htmlFor="dep-note"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Note <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              id="dep-note"
              type="text"
              value={note}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>,
              ): void => setNote(e.target.value)}
              placeholder="e.g. Monatsbeitrag"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <Plus className="h-4 w-4" />
            Einzahlung erfassen
          </button>
        </form>
      </div>
    </div>
  );
}
