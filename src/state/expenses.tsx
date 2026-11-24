import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { SEED_EXPENSES, sortExpenses } from '../domain/seed';
import type { Expense } from '../domain/types';

interface ExpensesContextValue {
  expenses: Expense[];
  addExpense: (e: Expense) => void;
}

const Ctx = createContext<ExpensesContextValue | null>(null);

type Action = { type: 'add'; expense: Expense };

function reducer(state: Expense[], action: Action): Expense[] {
  switch (action.type) {
    case 'add':
      return sortExpenses([action.expense, ...state]);
  }
}

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, dispatch] = useReducer(reducer, SEED_EXPENSES, sortExpenses);
  const addExpense = useCallback((expense: Expense) => dispatch({ type: 'add', expense }), []);
  const value = useMemo(() => ({ expenses, addExpense }), [expenses, addExpense]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExpenses(): ExpensesContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useExpenses must be used inside <ExpensesProvider>');
  return v;
}
