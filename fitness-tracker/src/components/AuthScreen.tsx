import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, User } from 'lucide-react';
import { signIn, signUp } from '../supabase';
import { triggerHaptic } from '../store';

interface AuthScreenProps {
  onSuccess: () => void;
  accentColor: string;
}

export default function AuthScreen({ onSuccess, accentColor }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    triggerHaptic('medium');

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email to confirm your account!');
          setMode('signin');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          triggerHaptic('heavy');
          onSuccess();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Grid Background */}
      <div className="grid-background" />
      <div className="grid-fade" />
      
      {/* Background gradient */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-40" />
      
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 text-center relative z-10"
      >
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <div className="absolute inset-0 rounded-2xl blur-xl opacity-40" style={{ background: accentColor }} />
          <span className="text-4xl relative z-10">💪</span>
        </div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Vitruvian</h1>
        <p className="mt-1" style={{ color: 'var(--text-tertiary)' }}>Your fitness companion</p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm glass-premium rounded-3xl p-6 relative z-10"
      >
        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--card-bg)' }}>
          <button
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ 
              background: mode === 'signin' ? 'var(--glass-bg)' : 'transparent',
              color: mode === 'signin' ? 'var(--text-primary)' : 'var(--text-tertiary)'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ 
              background: mode === 'signup' ? 'var(--glass-bg)' : 'transparent',
              color: mode === 'signup' ? 'var(--text-primary)' : 'var(--text-tertiary)'
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-quaternary)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 transition-all"
                style={{ 
                  background: 'var(--card-bg)', 
                  color: 'var(--text-primary)',
                  ['--tw-ring-color' as string]: accentColor 
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-quaternary)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 transition-all"
                style={{ 
                  background: 'var(--card-bg)', 
                  color: 'var(--text-primary)',
                  ['--tw-ring-color' as string]: accentColor 
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl p-3"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 rounded-xl p-3"
              >
                <User size={16} />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ 
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
              boxShadow: `0 4px 15px ${accentColor}40`
            }}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs mt-6 text-center relative z-10"
        style={{ color: 'var(--text-quaternary)' }}
      >
        Your data syncs across all devices
      </motion.p>
    </motion.div>
  );
}
