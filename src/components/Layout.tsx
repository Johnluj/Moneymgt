import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, PieChart, LogOut, CloudSync } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC = () => {
  const { logout, user } = useAuth();
  const { isSyncing } = useAppContext();
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: Receipt, label: 'History' },
    { to: '/budget', icon: Wallet, label: 'Budget' },
    { to: '/analytics', icon: PieChart, label: 'Analytics' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 max-w-md mx-auto relative overflow-hidden shadow-xl border-x">
      <header className="px-4 py-4 bg-white border-b sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-primary-600">PocketPlan</h1>
          <p className="text-[10px] text-slate-400 font-medium">Hello, {user?.name}</p>
        </div>
        {isSyncing && (
          <div className="flex items-center gap-1 text-primary-400 animate-pulse mr-2">
            <CloudSync size={16} />
            <span className="text-[10px] font-bold">Syncing</span>
          </div>
        )}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t px-6 py-3 flex justify-between items-center z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
              )
            }
          >
            <Icon size={24} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
