import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, User as UserIcon, Lock, Loader2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Login: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await register(name, email, password);
        showNotification('Account created successfully!', 'success');
      } else {
        await login(email, password);
        showNotification('Logged in successfully!', 'success');
      }
      navigate('/');
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-[80vh] justify-center items-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-slate-500 mt-2">{isRegistering ? 'Join PocketPlan today' : 'Sign in to manage your budget'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 mt-4 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? 'Sign Up' : 'Get Started')}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-primary-600 font-medium"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-2 text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => showNotification('Google login not implemented in this demo', 'info')}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Google
          </button>
          <button
            type="button"
            onClick={() => showNotification('Apple login not implemented in this demo', 'info')}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <img src="https://www.apple.com/favicon.ico" alt="Apple" className="w-4 h-4" />
            Apple
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
