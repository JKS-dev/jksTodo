import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  signUpWithEmail,
  signInWithEmail,
  signInGuest,
  signInWithGoogle,
  logOutUser
} from '../lib/firebase';
import { X, Mail, Lock, User, LogOut, CheckCircle2, Shield, Laptop, Smartphone, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  isOnline: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  isOnline,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        msg = 'Sign-in method disabled: Please go to your Firebase Console (my-smart-devices-c123b) -> Authentication -> Sign-in method and enable "Email/Password" and "Anonymous".';
      } else if (err.code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        msg = 'Unauthorized Domain: In your Firebase Console (my-smart-devices-c123b) -> Authentication -> Settings -> Authorized Domains, add this app domain.';
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. If you do not have an account yet, click "Create Account" above.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please switch to "Sign In".';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters long.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      let msg = err.message || 'Google sign-in failed.';
      if (err.code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        msg = 'Google provider is disabled in Firebase Console (my-smart-devices-c123b) -> Authentication -> Sign-in method.';
      } else if (err.code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        msg = 'Domain not authorized in Firebase Console -> Authentication -> Settings -> Authorized Domains.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGuest();
      onClose();
    } catch (err: any) {
      console.error('Guest Auth error:', err);
      let msg = err.message || 'Guest login failed.';
      if (err.code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        msg = 'Anonymous sign-in is disabled in Firebase Console (my-smart-devices-c123b) -> Authentication -> Sign-in method. Please enable Anonymous sign-in or create an email account above.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logOutUser();
      onClose();
    } catch (err) {
      setError('Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        id="auth-modal-container"
        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden transition-all max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {user && !user.isAnonymous ? 'Account & Devices' : 'Sync Workspace'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {user && !user.isAnonymous
                ? 'Your tasks sync live across all your logged-in devices.'
                : 'Sign in to sync your tasks across phone, tablet & desktop.'}
            </p>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isOnline && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>You are currently offline. Authentication requires an active connection.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* User is logged in */}
          {user && !user.isAnonymous ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.email}</p>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cloud Sync Active</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                  <p><strong>Account ID:</strong> <code className="bg-slate-200/80 px-1.5 py-0.5 rounded-md text-slate-800 font-mono">{user.uid}</code></p>
                  <p>Changes on this device update instantly across all signed-in browsers.</p>
                </div>
              </div>

              <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200/80 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-indigo-600" /> Multi-Device Synchronization
                </p>
                <p className="text-slate-600">
                  Open this app on your smartphone or second laptop, sign in as <strong className="text-slate-900">{user.email}</strong>, and your task list will sync in real time.
                </p>
              </div>

              <button
                id="auth-logout-btn"
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            /* Authentication Form */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/70">
                <button
                  id="tab-signin-btn"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'signin' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  id="tab-signup-btn"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'signup' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={loading || !isOnline}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  {loading ? 'Processing...' : mode === 'signin' ? 'Sign In to Sync' : 'Create & Sync Account'}
                </button>
              </form>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400 font-semibold">or continue with</span>
                </div>
              </div>

              {/* Social / Guest Options */}
              <div className="space-y-2">
                <button
                  id="google-auth-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading || !isOnline}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Account</span>
                </button>

                <button
                  id="guest-auth-btn"
                  onClick={handleGuestSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Continue as Guest (Local Mode)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

