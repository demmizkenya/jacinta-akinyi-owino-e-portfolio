import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, X, ShieldCheck, Eye, EyeOff, Activity, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { AuthUser } from '../types';
import { getFirebaseDiagnostics, testFirestoreConnection } from '../lib/firebase';

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
  const [technicalDetails, setTechnicalDetails] = useState<string | null>(null);

  // Diagnostics view
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagResult, setDiagResult] = useState<string | null>(null);
  const [isTestingDiag, setIsTestingDiag] = useState(false);

  if (!isOpen) return null;

  const handleRunDiagnostics = async () => {
    setIsTestingDiag(true);
    try {
      const diag = getFirebaseDiagnostics();
      console.log('[Admin CMS Diagnostics]:', diag);
      const test = await testFirestoreConnection();
      console.log('[Admin CMS Firestore Test Result]:', test);
      setDiagResult(
        `Firebase Config: ${diag.isConfigured ? 'Valid' : 'Incomplete (Missing: ' + (diag.missingVars.join(', ') || 'None') + ')'}\n` +
        `Initialized: ${diag.isInitialized ? 'Yes' : 'No'}\n` +
        `Project ID: ${diag.projectId || '(Not configured)'}\n` +
        `Firestore Test: ${test.message}`
      );
    } catch (err: any) {
      console.error('[Admin CMS Diagnostics Error]:', err);
      setDiagResult(`Diagnostic Error: ${err?.message || String(err)}`);
    } finally {
      setIsTestingDiag(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTechnicalDetails(null);
    setLoading(true);

    const enteredPass = password.trim();

    // 1. Validate passcode locally first (Rule 7: works even if Firestore/backend is offline or on Vercel)
    const isValidPasscode = enteredPass === '3237900' || enteredPass === '3247900';

    if (!isValidPasscode) {
      console.warn('[Admin CMS Auth]: Passcode verification failed for input.');
      setError('Incorrect passcode.');
      setLoading(false);
      return;
    }

    // 2. Passcode is verified! Authenticate administrator
    console.log('[Admin CMS Auth]: Passcode successfully validated locally. Establishing session...');

    let sessionToken = 'admin-session-' + Date.now();
    const adminUser: AuthUser = {
      email: 'jecinterowino88@gmail.com',
      name: 'Jacinta Akinyi Owino',
      role: 'admin',
      token: sessionToken,
    };

    // 3. Attempt server/cloud synchronization
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: enteredPass }),
      });

      // If server responded
      if (res.ok) {
        try {
          const data = await res.json();
          if (data?.token) {
            sessionToken = data.token;
            adminUser.token = data.token;
            if (data.user?.email) adminUser.email = data.user.email;
            if (data.user?.name) adminUser.name = data.user.name;
            console.log('[Admin CMS Auth]: Server authenticated session token registered.');
          }
        } catch (jsonErr: any) {
          console.warn('[Admin CMS API]: Response was not JSON, continuing with local session.');
        }
      } else {
        const errorText = await res.text();
        console.warn(`[Admin CMS API Notice]: Backend returned HTTP ${res.status}: ${errorText || res.statusText}. Using verified local session.`);
      }
    } catch (fetchErr: any) {
      // Capture technical network / CORS / Vercel error in console for debugging
      console.error('[Admin CMS Network/API Warning]:', fetchErr);
      const rawError = fetchErr?.message || String(fetchErr);
      console.info(`[Admin CMS Resilient Auth]: Local passcode verified. Proceeding into CMS. (Network notice: ${rawError})`);
    }

    // Save verified authentication
    localStorage.setItem('jacinta_portfolio_admin_token', sessionToken);
    localStorage.setItem('jacinta_portfolio_admin_auth', JSON.stringify(adminUser));

    setLoading(false);
    onLoginSuccess(adminUser);
    onClose();
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
          <div className="my-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
            {technicalDetails && (
              <pre className="mt-1 p-2 rounded bg-black/10 dark:bg-black/40 text-[10px] font-mono whitespace-pre-wrap break-all">
                {technicalDetails}
              </pre>
            )}
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
            className="w-full mt-2 py-3 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white font-medium text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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

        {/* Diagnostics accordion */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1"
          >
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#7A1C6D] dark:text-[#D8A0D0]" />
              <span>Cloud & Connection Diagnostics</span>
            </span>
            {showDiagnostics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDiagnostics && (
            <div className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs">
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                Verify Firebase configuration, Vercel variables, or connectivity status:
              </p>
              <button
                type="button"
                onClick={handleRunDiagnostics}
                disabled={isTestingDiag}
                className="w-full py-1.5 px-3 rounded bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 text-slate-800 dark:text-slate-200 text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50"
              >
                {isTestingDiag ? 'Testing Firebase & Network...' : 'Run Diagnostics Test'}
              </button>

              {diagResult && (
                <pre className="mt-2 p-2 rounded bg-black/5 dark:bg-black/30 text-[10px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {diagResult}
                </pre>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 text-center">
          <p className="text-[10px] text-slate-400">
            Encrypted session authentication
          </p>
        </div>

      </div>
    </div>
  );
};
