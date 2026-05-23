import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction, Budget, SavingsGoal } from '../types';
import { useNotification } from './NotificationContext';

interface AppContextType {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (budget: Budget) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showNotification } = useNotification();
  const [isSyncing, setIsSyncing] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [
      { category: 'Food', limit: 0 },
      { category: 'Transport', limit: 0 },
      { category: 'Bills', limit: 0 },
      { category: 'Entertainment', limit: 0 },
      { category: 'Shopping', limit: 0 },
    ];
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };

    // Simulate API sync
    setIsSyncing(true);
    setTimeout(() => {
      setTransactions((prev) => [newTransaction, ...prev]);
      setIsSyncing(false);
      showNotification(`${transaction.type === 'income' ? 'Income' : 'Expense'} added successfully`, 'success');

      // Check budget limits
      if (transaction.type === 'expense') {
        const budget = budgets.find(b => b.category === transaction.category);
        if (budget && budget.limit > 0) {
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category === transaction.category)
            .reduce((acc, t) => acc + t.amount, 0) + transaction.amount;

          if (spent > budget.limit) {
            showNotification(`Warning: You have exceeded your budget for ${transaction.category}!`, 'warning');
          } else if (spent > budget.limit * 0.8) {
            showNotification(`Heads up: You've used 80% of your ${transaction.category} budget.`, 'info');
          }
        }
      }
    }, 800);
  }, [budgets, transactions, showNotification]);

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateBudget = (budget: Budget) => {
    setBudgets((prev) => {
      const index = prev.findIndex((b) => b.category === budget.category);
      let next;
      if (index > -1) {
        const newBudgets = [...prev];
        newBudgets[index] = budget;
        next = newBudgets;
      } else {
        next = [...prev, budget];
      }
      return next;
    });
    showNotification(`${budget.category} budget updated`, 'success');
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal = { ...goal, id: crypto.randomUUID() };
    setSavingsGoals((prev) => [...prev, newGoal]);
    showNotification(`Savings goal "${goal.name}" created`, 'success');
  };

  const updateSavingsGoal = (goal: SavingsGoal) => {
    setSavingsGoals((prev) => prev.map(g => g.id === goal.id ? goal : g));
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <AppContext.Provider
      value={{
        transactions,
        budgets,
        savingsGoals,
        addTransaction,
        deleteTransaction,
        updateBudget,
        addSavingsGoal,
        updateSavingsGoal,
        totalIncome,
        totalExpenses,
        balance,
        isSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
