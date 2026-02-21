import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Palette, Download, Trash2, Volume2, Smartphone, Check, AlertTriangle, LogOut, User, Cloud, CloudOff, Dumbbell, Bot, Key, ChevronRight } from 'lucide-react';
import { useApp } from '../App';
import { ACCENT_COLORS } from '../types';
import { exportData, triggerHaptic } from '../store';
import { isSupabaseConfigured } from '../supabase';
import ExerciseEditor from '../components/ExerciseEditor';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ icon, label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--card-bg)' }}>
          {icon}
        </div>
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
          {description && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, color }: { value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        triggerHaptic('light');
        onChange(!value);
      }}
      className={`w-12 h-7 rounded-full p-1 transition-colors ${
        value ? '' : 'bg-white/20'
      }`}
      style={{ backgroundColor: value ? color : undefined }}
    >
      <motion.div
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-5 h-5 bg-white rounded-full shadow-md"
      />
    </motion.button>
  );
}

export default function Settings() {
  const { state, user, isOnline, updateSettings, resetState, logout } = useApp();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExerciseEditor, setShowExerciseEditor] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleExport = () => {
    triggerHaptic('medium');
    exportData(state);
  };

  const handleReset = () => {
    triggerHaptic('heavy');
    resetState();
    setShowResetConfirm(false);
  };

  const handleLogout = async () => {
    triggerHaptic('medium');
    await logout();
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 pt-12 pb-4 container-app"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Background gradient */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-30" />
      
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-2 relative z-10"
        style={{ color: 'var(--text-primary)' }}
      >
        Settings
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 relative z-10"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Customize your experience
      </motion.p>

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl px-4 mb-5 relative z-10"
      >
        <h2 className="text-xs uppercase tracking-wide pt-4 pb-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Appearance</h2>
        
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          <SettingRow
            icon={state.settings.darkMode ? <Moon size={18} style={{ color: 'var(--text-secondary)' }} /> : <Sun size={18} style={{ color: '#FF9F0A' }} />}
            label="Dark Mode"
            description="Switch theme appearance"
          >
            <Toggle
              value={state.settings.darkMode}
              onChange={(v) => updateSettings({ darkMode: v })}
              color={state.settings.accentColor}
            />
          </SettingRow>

          <SettingRow
            icon={<Palette size={18} style={{ color: state.settings.accentColor }} />}
            label="Accent Color"
            description="App highlight color"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                triggerHaptic('light');
                setShowColorPicker(!showColorPicker);
              }}
              className="w-8 h-8 rounded-full ring-2"
              style={{ backgroundColor: state.settings.accentColor, ['--tw-ring-color' as string]: `${state.settings.accentColor}50` }}
            />
          </SettingRow>
        </div>

        {/* Color Picker */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pb-4 pt-2">
                <div className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <motion.button
                      key={color.value}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        triggerHaptic('medium');
                        updateSettings({ accentColor: color.value });
                        setShowColorPicker(false);
                      }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform"
                      style={{ backgroundColor: color.value }}
                    >
                      {state.settings.accentColor === color.value && (
                        <Check size={20} color="white" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Coach Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.21 }}
        className="glass rounded-2xl px-4 mb-5 relative z-10"
      >
        <h2 className="text-xs uppercase tracking-wide pt-4 pb-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>AI Coach</h2>
        
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          <button 
            onClick={() => {
              triggerHaptic('light');
              setShowApiKeyInput(true);
            }}
            className="w-full"
          >
            <SettingRow
              icon={<Key size={18} style={{ color: state.settings.geminiApiKey ? 'var(--color-ios-green)' : 'var(--text-tertiary)' }} />}
              label="Gemini API Key"
              description={state.settings.geminiApiKey ? 'Key configured' : 'Set up AI assistant'}
            >
              <div className="flex items-center gap-2">
                {state.settings.geminiApiKey && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(48, 209, 88, 0.2)', color: '#30D158' }}>
                    Active
                  </span>
                )}
                <ChevronRight size={16} style={{ color: 'var(--text-quaternary)' }} />
              </div>
            </SettingRow>
          </button>
        </div>
      </motion.div>

      {/* Workout Customization Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.215 }}
        className="glass rounded-2xl px-4 mb-5 relative z-10"
      >
        <h2 className="text-xs uppercase tracking-wide pt-4 pb-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Workout</h2>
        
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          <button 
            onClick={() => {
              triggerHaptic('light');
              setShowExerciseEditor(true);
            }}
            className="w-full"
          >
            <SettingRow
              icon={<Dumbbell size={18} style={{ color: state.settings.accentColor }} />}
              label="Customize Exercises"
              description="Edit exercises & schedule"
            >
              <ChevronRight size={16} style={{ color: 'var(--text-quaternary)' }} />
            </SettingRow>
          </button>
        </div>
      </motion.div>

      {/* Account Section */}
      {isSupabaseConfigured() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="glass rounded-2xl px-4 mb-5 relative z-10"
        >
          <h2 className="text-xs uppercase tracking-wide pt-4 pb-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Account</h2>
          
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <SettingRow
              icon={<User size={18} style={{ color: state.settings.accentColor }} />}
              label={user?.email || 'Not signed in'}
              description="Signed in account"
            >
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Cloud size={16} className="text-green-400" />
                ) : (
                  <CloudOff size={16} className="text-yellow-400" />
                )}
              </div>
            </SettingRow>

            <button onClick={handleLogout} className="w-full">
              <SettingRow
                icon={<LogOut size={18} color="#FF453A" />}
                label="Sign Out"
                description="Log out of your account"
              >
                <span style={{ color: 'var(--text-quaternary)' }} className="text-sm">→</span>
              </SettingRow>
            </button>
          </div>
        </motion.div>
      )}

      {/* Local Mode Indicator */}
      {!isSupabaseConfigured() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="glass rounded-2xl px-4 mb-5 relative z-10"
        >
          <h2 className="text-xs uppercase tracking-wide pt-4 pb-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Storage</h2>
          <SettingRow
            icon={<CloudOff size={18} style={{ color: 'var(--text-quaternary)' }} />}
            label="Local Storage Only"
            description="Data stored on this device only"
          >
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--card-bg)', color: 'var(--text-tertiary)' }}>Local</span>
          </SettingRow>
        </motion.div>
      )}

      {/* Feedback Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-2xl px-4 mb-5 relative z-10"
      >
        <h2 className="text-xs uppercase tracking-wide pt-4 pb-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Feedback</h2>
        
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          <SettingRow
            icon={<Volume2 size={18} style={{ color: 'var(--text-secondary)' }} />}
            label="Sound Effects"
            description="Completion sounds"
          >
            <Toggle
              value={state.settings.soundEnabled}
              onChange={(v) => updateSettings({ soundEnabled: v })}
              color={state.settings.accentColor}
            />
          </SettingRow>

          <SettingRow
            icon={<Smartphone size={18} style={{ color: 'var(--text-secondary)' }} />}
            label="Haptic Feedback"
            description="Vibration on actions"
          >
            <Toggle
              value={state.settings.hapticEnabled}
              onChange={(v) => updateSettings({ hapticEnabled: v })}
              color={state.settings.accentColor}
            />
          </SettingRow>
        </div>
      </motion.div>

      {/* Data Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl px-4 mb-5 relative z-10"
      >
        <h2 className="text-xs uppercase tracking-wide pt-4 pb-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Data</h2>
        
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          <button 
            onClick={handleExport}
            className="w-full"
          >
            <SettingRow
              icon={<Download size={18} style={{ color: state.settings.accentColor }} />}
              label="Export Data"
              description="Save as JSON file"
            >
              <span style={{ color: 'var(--text-quaternary)' }} className="text-sm">→</span>
            </SettingRow>
          </button>

          <button 
            onClick={() => setShowResetConfirm(true)}
            className="w-full"
          >
            <SettingRow
              icon={<Trash2 size={18} color="#FF453A" />}
              label="Reset All Data"
              description="This cannot be undone"
            >
              <span style={{ color: 'var(--text-quaternary)' }} className="text-sm">→</span>
            </SettingRow>
          </button>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass rounded-2xl p-4 mb-5 relative z-10"
      >
        <h2 className="text-xs uppercase tracking-wide mb-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>Summary</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl p-3" style={{ background: 'var(--card-bg)' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>Workouts Logged</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{state.workoutLogs.length}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--card-bg)' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>Skill Sessions</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{state.skillLogs.length}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--card-bg)' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>Achievements</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {state.achievements.filter(a => a.unlocked).length}/{state.achievements.length}
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--card-bg)' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>Current Streak</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{state.currentStreak} days</p>
          </div>
        </div>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm relative z-10"
        style={{ color: 'var(--text-quaternary)' }}
      >
        <p>Vitruvian Protocol v1.0.0</p>
        <p className="mt-1">Built with ❤️ for fitness</p>
      </motion.div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-premium rounded-3xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle size={30} color="#FF453A" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>Reset All Data?</h3>
              <p className="text-center text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
                This will permanently delete all your workout logs, progress data, and achievements. This action cannot be undone.
              </p>
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="w-full py-3.5 bg-red-500 rounded-2xl font-semibold text-white"
                >
                  Yes, Reset Everything
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-3.5 glass rounded-2xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowApiKeyInput(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-premium rounded-3xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `${state.settings.accentColor}20` }}
                >
                  <Bot size={32} style={{ color: state.settings.accentColor }} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
                Gemini API Key
              </h3>
              <p className="text-center text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Enter your Google Gemini API key to enable the AI fitness coach.
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block mt-2"
                  style={{ color: state.settings.accentColor }}
                >
                  Get your free API key →
                </a>
              </p>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={state.settings.geminiApiKey ? '••••••••••••••••' : 'AIza...'}
                className="w-full px-4 py-3 rounded-xl mb-4 outline-none"
                style={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (apiKeyInput.trim()) {
                      triggerHaptic('medium');
                      updateSettings({ geminiApiKey: apiKeyInput.trim() });
                    }
                    setShowApiKeyInput(false);
                    setApiKeyInput('');
                  }}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white"
                  style={{ background: state.settings.accentColor }}
                >
                  {apiKeyInput.trim() ? 'Save API Key' : 'Done'}
                </motion.button>
                {state.settings.geminiApiKey && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic('heavy');
                      updateSettings({ geminiApiKey: undefined });
                      setShowApiKeyInput(false);
                      setApiKeyInput('');
                    }}
                    className="w-full py-3.5 rounded-2xl font-semibold"
                    style={{ background: 'rgba(255, 69, 58, 0.15)', color: '#FF453A' }}
                  >
                    Remove API Key
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Editor */}
      <AnimatePresence>
        {showExerciseEditor && (
          <ExerciseEditor
            customExercises={state.settings.customExercises}
            customSchedule={state.settings.customSchedule}
            accentColor={state.settings.accentColor}
            onSaveExercises={(exercises) => updateSettings({ customExercises: exercises })}
            onSaveSchedule={(schedule) => updateSettings({ customSchedule: schedule })}
            onClose={() => setShowExerciseEditor(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
