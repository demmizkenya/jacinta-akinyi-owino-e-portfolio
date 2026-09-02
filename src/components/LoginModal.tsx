import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { AuthUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const userObj: AuthUser = {
          email: data.user?.email || 'admin@maseno.ac.ke',
          name: data.user?.name || 'Jacinta Akinyi Owino',
          role: 'admin',
          token: data.token,
        };
        localStorage.setItem('jacinta_portfolio_admin_token', data.token);
        onLoginSuccess(userObj);
        onClose();
      } else {
        setError(data.error || 'Authentication failed. Incorrect passcode.');
      }
    } catch (err) {
      setError('Connection error. Please check your network and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#18181B] rounded-xl max-w-sm w-full p-6 sm:p-7 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7A1C6D] text-white flex items-center justify-center shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Admin CMS Access
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrator Verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="my-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Security badge notice */}
        <div className="my-4 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] shrink-0" />
          <span>Restricted to Authorized Site Administrator</span>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Enter passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-[#7A1C6D] focus:ring-1 focus:ring-[#7A1C6D] focus:outline-none text-slate-900 dark:text-white text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full mt-2 py-3 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white font-medium text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Verifying Passcode...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to Admin CMS</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-center">
          <p className="text-[11px] text-slate-400">
            Encrypted session authentication
          </p>
        </div>

      </div>
    </div>
  );
};
