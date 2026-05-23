import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction, Budget, SavingsGoal } from '../types';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/api';

interface AppContextType {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showNotification } = useNotification();
  const { isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsSyncing(true);
    try {
      const [transactionsData, budgetsData, goalsData] = await Promise.all([
        apiFetch('/transactions'),
        apiFetch('/budgets'),
        apiFetch('/savings-goals')
      ]);
      setTransactions(transactionsData);
      setBudgets(budgetsData.length ? budgetsData : [
        { category: 'Food', limit: 0 },
        { category: 'Transport', limit: 0 },
        { category: 'Bills', limit: 0 },
        { category: 'Entertainment', limit: 0 },
        { category: 'Shopping', limit: 0 },
      ]);
      setSavingsGoals(goalsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    setIsSyncing(true);
    try {
      const newTransaction = await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
      setTransactions((prev) => [newTransaction, ...prev]);
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
          }
        }
      }
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [budgets, transactions, showNotification]);

  const deleteTransaction = async (id: string) => {
    setIsSyncing(true);
    try {
      await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateBudget = async (budget: Budget) => {
    setIsSyncing(true);
    try {
      await apiFetch('/budgets', {
        method: 'POST',
        body: JSON.stringify(budget),
      });
      setBudgets((prev) => {
        const index = prev.findIndex((b) => b.category === budget.category);
        if (index > -1) {
          const next = [...prev];
          next[index] = budget;
          return next;
        }
        return [...prev, budget];
      });
      showNotification(`${budget.category} budget updated`, 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    setIsSyncing(true);
    try {
      const newGoal = await apiFetch('/savings-goals', {
        method: 'POST',
        body: JSON.stringify(goal),
      });
      setSavingsGoals((prev) => [...prev, newGoal]);
      showNotification(`Savings goal "${goal.name}" created`, 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSavingsGoal = async (goal: SavingsGoal) => {
    setIsSyncing(true);
    try {
      await apiFetch(`/savings-goals/${goal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ currentAmount: goal.currentAmount }),
      });
      setSavingsGoals((prev) => prev.map(g => g.id === goal.id ? goal : g));
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setIsSyncing(false);
    }
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
