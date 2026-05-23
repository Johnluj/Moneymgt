import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { balance, totalIncome, totalExpenses, transactions, savingsGoals } = useAppContext();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-primary-600 rounded-3xl p-6 text-white shadow-lg shadow-primary-200">
        <p className="text-primary-100 text-sm font-medium">Total Balance</p>
        <h2 className="text-3xl font-bold mt-1">₦{balance.toLocaleString()}</h2>

        <div className="flex justify-between mt-6">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <ArrowDownLeft size={16} />
            </div>
            <div>
              <p className="text-primary-100 text-xs">Income</p>
              <p className="font-semibold">₦{totalIncome.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <ArrowUpRight size={16} />
            </div>
            <div>
              <p className="text-primary-100 text-xs">Expenses</p>
              <p className="font-semibold">₦{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Progress */}
      {savingsGoals.length > 0 && (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-3 text-sm">Savings Progress</h3>
          <div className="space-y-4">
            {savingsGoals.slice(0, 2).map(goal => {
              const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{goal.name}</span>
                    <span className="text-slate-400">₦{goal.currentAmount.toLocaleString()} / ₦{goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/transactions?type=income"
          className="flex items-center justify-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 font-medium text-slate-700 active:scale-95 transition-transform"
        >
          <div className="bg-green-100 text-green-600 p-1 rounded-lg">
            <Plus size={18} />
          </div>
          Add Income
        </Link>
        <Link
          to="/transactions?type=expense"
          className="flex items-center justify-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 font-medium text-slate-700 active:scale-95 transition-transform"
        >
          <div className="bg-red-100 text-red-600 p-1 rounded-lg">
            <Plus size={18} />
          </div>
          Add Expense
        </Link>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <Link to="/transactions" className="text-primary-600 text-sm font-medium">View All</Link>
        </div>

        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400 text-sm">No transactions yet</p>
            </div>
          ) : (
            recentTransactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{t.category}</p>
                    <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}₦{t.amount.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
