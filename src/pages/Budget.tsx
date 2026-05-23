import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Wallet, Edit2 } from 'lucide-react';

const Budget: React.FC = () => {
  const { budgets, transactions, updateBudget } = useAppContext();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [limitValue, setLimitValue] = useState('');

  const getSpentAmount = (category: string) => {
    return transactions
      .filter((t) => t.type === 'expense' && t.category === category)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const handleUpdate = (category: string) => {
    updateBudget({
      category,
      limit: parseFloat(limitValue) || 0
    });
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary-100 text-primary-600 p-3 rounded-2xl">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Monthly Budget</h2>
            <p className="text-xs text-slate-500">Plan your spending</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {budgets.map((budget) => {
          const spent = getSpentAmount(budget.category);
          const percent = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0;
          const isOver = budget.limit > 0 && spent > budget.limit;

          return (
            <div key={budget.category} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{budget.category}</span>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(budget.category);
                    setLimitValue(budget.limit.toString());
                  }}
                  className="text-primary-600"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {editingCategory === budget.category ? (
                <div className="flex gap-2 mb-4">
                  <input
                    type="number"
                    value={limitValue}
                    onChange={(e) => setLimitValue(e.target.value)}
                    className="flex-1 bg-slate-50 border-none rounded-xl p-2 text-sm focus:ring-2 focus:ring-primary-500"
                    placeholder="Set limit"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(budget.category)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                  >
                    Set
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm text-slate-500">
                    <span className={`font-bold ${isOver ? 'text-red-500' : 'text-slate-800'}`}>
                      ₦{spent.toLocaleString()}
                    </span>
                    {' '}/ ₦{budget.limit.toLocaleString()}
                  </p>
                  <p className="text-xs font-medium text-slate-400">{Math.round(percent)}%</p>
                </div>
              )}

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-primary-500'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;
