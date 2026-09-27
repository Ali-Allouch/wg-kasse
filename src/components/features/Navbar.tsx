"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Plus, LogOut } from "lucide-react"; // Assuming lucide-react is installed

interface NavbarProps {
  onAddExpense: () => void;
}

export default function Navbar({ onAddExpense }: NavbarProps) {
  const { logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-zinc-900 shadow-md p-4 flex items-center justify-between w-full">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
      <div className="flex items-center space-x-4">
        <Button
          onClick={onAddExpense}
          variant="default"
          className="hidden md:flex items-center gap-2 px-4 py-2"
          aria-label="Add New Expense"
        >
          <Plus size={18} />
          Add Expense
        </Button>
        <Button
          onClick={logout}
          variant="outline"
          className="flex items-center gap-2 px-4 py-2"
          aria-label="Logout"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </nav>
  );
}
