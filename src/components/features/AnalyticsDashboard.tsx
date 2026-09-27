import React from "react";

export default function AnalyticsDashboard() {
  return (
    <section className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Detailed Analytics</h2>
      <p className="text-gray-700 dark:text-gray-300 text-center text-lg">
        This is where detailed charts and graphs for your expenses would go.
      </p>
      <div className="mt-6 text-gray-600 dark:text-gray-400">
        <p>
          <span className="font-bold">Total Expenses:</span> $2005.50
        </p>
        <p>
          <span className="font-bold">Highest Category:</span> Housing
        </p>
        <p>
          <span className="font-bold">Average Daily Spend:</span> $66.85
        </p>
      </div>
      {/* Placeholder for a chart or complex analytics component */}
      <div className="mt-8 w-full max-w-lg h-48 bg-gray-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-zinc-600">
        <p>Chart Placeholder</p>
      </div>
    </section>
  );
}
