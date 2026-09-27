'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';

interface PinGateProps {
  onUnlock: () => void;
}

export default function PinGate({ onUnlock }: PinGateProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (pin === 'wg2026') {
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleDemoUnlock = (): void => {
    onUnlock();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
            <Wallet className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">WGKasse</h1>
          <p className="text-sm text-zinc-400">Bitte PIN eingeben</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPin(e.target.value);
              setError(false);
            }}
            placeholder="PIN"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-center text-lg tracking-widest text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-center text-sm text-red-400">
              Falsche PIN. Bitte erneut versuchen.
            </p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Entsperren
          </button>
        </form>

        <button
          onClick={handleDemoUnlock}
          className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          Demo Unlock
        </button>
      </div>
    </div>
  );
}
