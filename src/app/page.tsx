"use client";

import { useAuth } from "@/hooks/useAuth";
import LoginCard from "@/components/features/LoginCard";
import Navbar from "@/components/features/Navbar";
import ExpenseTable from "@/components/features/ExpenseTable";
import AnalyticsDashboard from "@/components/features/AnalyticsDashboard";
import { useState } from "react";
import ExpenseModal from "@/components/features/ExpenseModal";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">(
    "overview"
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // If not authenticated, render only the login card centered with full page styling
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
        <LoginCard />
      </main>
    );
  }

  // If authenticated, render the full dashboard structure
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <Navbar onAddExpense={() => setIsExpenseModalOpen(true)} />
      <main className="flex flex-1 flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation for dashboard sections */}
        <nav className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Button
              variant={activeTab === "overview" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("overview")}
              className="px-4 py-2 text-sm"
              aria-label="Show expense overview"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "analytics" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("analytics")}
              className="px-4 py-2 text-sm"
              aria-label="Show detailed analytics"
            >
              Detailed Analytics
            </Button>
          </div>
        </nav>

        {/* Dynamically rendered content based on active tab */}
        {activeTab === "overview" && <ExpenseTable />}
        {activeTab === "analytics" && <AnalyticsDashboard />}
      </main>

      {/* Floating action button for adding expenses (mobile view) */}
      <Button
        className="fixed bottom-6 right-6 md:hidden rounded-full h-14 w-14 shadow-lg z-40"
        onClick={() => setIsExpenseModalOpen(true)}
      >
        <Plus size={24} />
        <span className="sr-only">Add Expense</span>
      </Button>

      {/* Modal for adding new expenses */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </div>
  );
}
