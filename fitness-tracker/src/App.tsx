import { useState, useEffect, createContext, useContext, useRef, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Calendar, Dumbbell, BarChart3, Settings, Timer, Loader2, MessageCircle } from 'lucide-react';
import { loadState, saveState, calculateStreak, resetData } from './store';
import { supabase, isSupabaseConfigured, loadUserData, saveUserData, deleteUserData, signOut } from './supabase';
import type { AppState, WorkoutLog, SkillLog, ProgressData, Settings as SettingsType, Achievement } from './types';
import type { User } from '@supabase/supabase-js';
import Dashboard from './pages/Dashboard';
import WeeklyView from './pages/WeeklyView';
import Workout from './pages/Workout';
import SkillMode from './pages/SkillMode';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/Settings';
import Chat from './pages/Chat';
import AuthScreen from './components/AuthScreen';

interface AppContextType {
  state: AppState;
  user: User | null;
  isOnline: boolean;
  updateSettings: (settings: Partial<SettingsType>) => void;
  addWorkoutLog: (log: WorkoutLog) => void;
  addSkillLog: (log: SkillLog) => void;
  addProgressData: (data: ProgressData) => void;
  updateAchievements: (achievements: Achievement[]) => void;
  resetState: () => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

function AppProvider({ children, user }: { children: ReactNode; user: User | null }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const saveTimeoutRef = useRef<number | null>(null);
  const isInitialLoad = useRef(true);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      if (user && isSupabaseConfigured()) {
        const cloudData = await loadUserData(user.id);
        if (cloudData) {
          setState(cloudData);
          saveState(cloudData); // Sync to local storage
        }
      }
      isInitialLoad.current = false;
    };
    loadData();
  }, [user]);

  // Save to localStorage immediately, debounce cloud saves
  useEffect(() => {
    if (isInitialLoad.current) return;
    
    saveState(state);

    // Debounce cloud save
    if (user && isSupabaseConfigured()) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = window.setTimeout(() => {
        saveUserData(user.id, state);
      }, 2000); // Save to cloud after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, user]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const logsWithCompleted = [
      ...state.workoutLogs.map(l => ({ date: l.date, completed: l.completed })),
      ...state.skillLogs.map(l => ({ date: l.date, completed: true })),
    ];
    const streak = calculateStreak(logsWithCompleted);
    if (streak !== state.currentStreak) {
      setState(prev => ({ ...prev, currentStreak: streak }));
    }
  }, [state.workoutLogs, state.skillLogs]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      state.settings.darkMode ? 'dark' : 'light'
    );
  }, [state.settings.darkMode]);

  const updateSettings = (settings: Partial<SettingsType>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  const addWorkoutLog = (log: WorkoutLog) => {
    setState(prev => {
      const existingIndex = prev.workoutLogs.findIndex(l => l.date === log.date);
      const newLogs = existingIndex >= 0
        ? prev.workoutLogs.map((l, i) => i === existingIndex ? log : l)
        : [...prev.workoutLogs, log];
      
      return {
        ...prev,
        workoutLogs: newLogs,
        lastWorkoutDate: log.completed ? log.date : prev.lastWorkoutDate,
      };
    });
  };

  const addSkillLog = (log: SkillLog) => {
    setState(prev => ({
      ...prev,
      skillLogs: [...prev.skillLogs, log],
    }));
  };

  const addProgressData = (data: ProgressData) => {
    setState(prev => {
      const existingIndex = prev.progressData.findIndex(p => p.date === data.date);
      const newData = existingIndex >= 0
        ? prev.progressData.map((p, i) => i === existingIndex ? data : p)
        : [...prev.progressData, data];
      
      return { ...prev, progressData: newData };
    });
  };

  const updateAchievements = (achievements: Achievement[]) => {
    setState(prev => ({ ...prev, achievements }));
  };

  const resetStateHandler = async () => {
    const defaultState = resetData();
    setState(defaultState);
    if (user && isSupabaseConfigured()) {
      await deleteUserData(user.id);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await signOut();
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      user,
      isOnline,
      updateSettings,
      addWorkoutLog,
      addSkillLog,
      addProgressData,
      updateAchievements,
      resetState: resetStateHandler,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  
  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/week', icon: Calendar, label: 'Week' },
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/chat', icon: MessageCircle, label: 'Coach' },
    { path: '/analytics', icon: BarChart3, label: 'Stats' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{ 
        background: 'var(--tabbar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-color)' 
      }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 relative"
              style={{
                color: isActive ? state.settings.accentColor : 'var(--text-quaternary)',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `${state.settings.accentColor}15` }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
              <span className="text-[10px] mt-1 font-medium relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const { isOnline, state } = useApp();
  
  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      {/* Grid Background */}
      <div className="grid-background" />
      <div className="grid-fade" />
      
      {/* Offline indicator */}
      {!isOnline && (
        <motion.div 
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 text-black text-xs text-center py-1.5 z-50 font-medium"
          style={{ background: 'linear-gradient(90deg, #FFD60A 0%, #FF9F0A 100%)' }}
        >
          Offline - changes will sync when connected
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/week" element={<WeeklyView />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/skill" element={<SkillMode />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AnimatePresence>
      <TabBar />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accentColor] = useState('#007AFF');

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      // No Supabase - run in local-only mode
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  // If Supabase is configured but no user, show auth screen
  if (isSupabaseConfigured() && !user) {
    return (
      <AuthScreen 
        onSuccess={() => {}} 
        accentColor={accentColor}
      />
    );
  }

  // Either no Supabase (local mode) or authenticated user
  return (
    <BrowserRouter>
      <AppProvider user={user}>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
