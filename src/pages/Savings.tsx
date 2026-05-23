import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Target, Plus, X, Edit2 } from 'lucide-react';

const Savings: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    addSavingsGoal({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount)
    });

    setIsAdding(false);
    setFormData({ name: '', targetAmount: '', currentAmount: '0' });
  };

  const handleUpdateAmount = (id: string, amount: string) => {
    const goal = savingsGoals.find(g => g.id === id);
    if (goal) {
      updateSavingsGoal({
        ...goal,
        currentAmount: parseFloat(amount) || 0
      });
    }
    setEditingGoal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Savings Goals</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-600 text-white p-2 rounded-full shadow-lg shadow-green-100 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0" onClick={() => setIsAdding(false)} />
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 z-10 animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">New Savings Goal</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. New Laptop"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Target Amount</label>
                <input
                  type="number"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold">Create Goal</button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4 pb-10">
        {savingsGoals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <Target className="mx-auto text-slate-200 mb-2" size={48} />
            <p className="text-slate-400">No savings goals yet. Start saving for something special!</p>
          </div>
        ) : (
          savingsGoals.map((goal) => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <div key={goal.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 text-green-600 p-2 rounded-xl">
                      <Target size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{goal.name}</h4>
                      <p className="text-xs text-slate-500">Target: ₦{goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingGoal(goal.id)} className="text-slate-300 hover:text-green-600">
                    <Edit2 size={16} />
                  </button>
                </div>

                {editingGoal === goal.id ? (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="number"
                      defaultValue={goal.currentAmount}
                      className="flex-1 bg-slate-50 border-none rounded-xl p-2 text-sm focus:ring-2 focus:ring-green-500"
                      onBlur={(e) => handleUpdateAmount(goal.id, e.target.value)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">₦{goal.currentAmount.toLocaleString()}</span>
                      <span className="text-slate-400">{Math.round(percent)}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Savings;
