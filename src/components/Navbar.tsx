'use client';

import { Wallet, LogOut, BarChart3, PieChart } from 'lucide-react';

export type ActiveTab = 'overview' | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export default function Navbar({
  activeTab,
  onTabChange,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Logo + WG Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100">WGKasse</h1>
            <p className="text-xs text-zinc-400">WG Lindenstraße 42</p>
          </div>
        </div>

        {/* Center: Tab Switcher */}
        <nav className="flex items-center gap-1 rounded-lg bg-zinc-800 p-1">
          <button
            onClick={() => onTabChange('overview')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Detailed Analytics</span>
          </button>
        </nav>

        {/* Right: Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
