import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import { Plus, X, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Transactions: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAdding, setIsAdding] = useState(searchParams.get('type') !== null);

  const [formData, setFormData] = useState({
    amount: '',
    category: searchParams.get('type') === 'income' ? 'Salary' : 'Food',
    type: (searchParams.get('type') as 'income' | 'expense') || 'expense',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const categories = {
    expense: ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Other'],
    income: ['Salary', 'Freelance', 'Business', 'Gifts', 'Other']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;

    addTransaction({
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: formData.date,
      note: formData.note
    });
    setIsAdding(false);
    setSearchParams({});
    setFormData({
      amount: '',
      category: 'Food',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Transactions</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary-600 text-white p-2 rounded-full shadow-lg shadow-primary-200 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0"
            onClick={() => {
              setIsAdding(false);
              setSearchParams({});
            }}
          />
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 z-10 animate-slide-up sm:animate-none">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Add Transaction</h3>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setSearchParams({});
                }}
                className="text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'expense', category: 'Food'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.type === 'expense' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income', category: 'Salary'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.type === 'income' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 pl-8 focus:ring-2 focus:ring-primary-500 font-bold text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary-500"
                >
                  {categories[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary-500"
                  placeholder="What was this for?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 mt-2 active:scale-95 transition-transform"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4 pb-10">
        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400">No transactions recorded yet.</p>
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-50 group active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{t.category}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    {t.note && ` • ${t.note}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}₦{t.amount.toLocaleString()}
                </p>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
