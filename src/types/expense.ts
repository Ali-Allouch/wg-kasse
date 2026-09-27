export type ExpenseCategory =
  | 'Groceries'
  | 'Household'
  | 'Utilities'
  | 'Drinks'
  | 'Repairs'
  | 'Other';

export interface Roommate {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidById: string;
  date: string;
  splitWith: string[];
}
