import { useState, useEffect, createContext, useContext, useRef, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Calendar, Dumbbell, BarChart3, Settings, Timer, Loader2, MessageCircle } from 'lucide-react';
import { loadState, saveState, resetData, formatDate, processStreakNewDay, getActiveStreak } from './store';
import { supabase, isSupabaseConfigured, loadUserData, saveUserData, deleteUserData, signOut } from './supabase';
import type { AppState, WorkoutLog, SkillLog, ProgressData, Settings as SettingsType, Achievement } from './types';
import { WEEKLY_SCHEDULE } from './types';
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
  activeStreak: number;
  updateSettings: (settings: Partial<SettingsType>) => void;
  addWorkoutLog: (log: WorkoutLog) => void;
  addSkillLog: (log: SkillLog) => void;
  addProgressData: (data: ProgressData) => void;
  updateAchievements: (achievements: Achievement[]) => void;
  logRestDay: (dateStr?: string) => void;
  isRestDayLogged: (dateStr?: string) => boolean;
  isTodayActive: () => boolean;
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
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
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
      setIsInitialLoadComplete(true);
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

  // Process streak at app load and when day changes
  useEffect(() => {
    if (!isInitialLoadComplete) return;
    
    const { currentStreak, todaysActivity, lastActivityDate } = processStreakNewDay(
      state.currentStreak,
      state.todaysActivity,
      state.lastActivityDate
    );
    
    // Only update if values changed
    if (
      currentStreak !== state.currentStreak ||
      todaysActivity !== state.todaysActivity ||
      lastActivityDate !== state.lastActivityDate
    ) {
      setState(prev => ({
        ...prev,
        currentStreak,
        todaysActivity,
        lastActivityDate
      }));
    }
  }, [isInitialLoadComplete]);

  // Get today's date string
  const getDateStr = (date?: Date) => {
    return formatDate(date || new Date());
  };

  // Check if today's activity is logged
  const isTodayActive = () => {
    return state.todaysActivity === 1;
  };

  // Check if rest day is logged (for display purposes)
  const isRestDayLogged = (dateStr?: string) => {
    const date = dateStr || getDateStr();
    return state.loginLogs.some(l => l.date === date);
  };

  // Activate today's streak
  const activateTodaysStreak = () => {
    const todayStr = getDateStr();
    setState(prev => ({
      ...prev,
      todaysActivity: 1,
      lastActivityDate: todayStr
    }));
  };

  // Manual log for rest days - activates today's streak
  const logRestDay = (dateStr?: string) => {
    const date = dateStr || getDateStr();
    const alreadyLogged = state.loginLogs.some(l => l.date === date);
    if (!alreadyLogged) {
      setState(prev => ({
        ...prev,
        loginLogs: [...prev.loginLogs, { date }],
        todaysActivity: 1,
        lastActivityDate: date
      }));
    }
  };

  // Calculate the active streak to display
  const activeStreak = getActiveStreak(state.currentStreak, state.todaysActivity);

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
      
      // If workout is completed, activate today's streak
      const streakUpdates = log.completed ? {
        todaysActivity: 1,
        lastActivityDate: log.date
      } : {};
      
      return {
        ...prev,
        workoutLogs: newLogs,
        lastWorkoutDate: log.completed ? log.date : prev.lastWorkoutDate,
        ...streakUpdates
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
      activeStreak,
      isTodayActive,
      updateSettings,
      addWorkoutLog,
      addSkillLog,
      addProgressData,
      updateAchievements,
      logRestDay,
      isRestDayLogged,
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
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom mobile-tabbar lg:hidden"
      style={{ 
        background: 'var(--tabbar-bg)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderTop: '1px solid var(--glass-border)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="flex justify-around items-center h-18 max-w-lg mx-auto px-3">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 relative"
              style={{
                color: isActive ? state.settings.accentColor : 'var(--text-quaternary)',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute inset-0 rounded-2xl"
                  style={{ 
                    background: `${state.settings.accentColor}12`,
                    boxShadow: `inset 0 0 0 1px ${state.settings.accentColor}20`
                  }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} className="relative z-10" />
              <span className="text-[10px] mt-1.5 font-medium relative z-10 tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, activeStreak } = useApp();
  
  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/week', icon: Calendar, label: 'Weekly View' },
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/chat', icon: MessageCircle, label: 'AI Coach' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="hidden lg:block desktop-sidebar">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Vitruvian
        </h1>
        <p className="text-xs font-medium tracking-wider uppercase mt-0.5" style={{ color: 'var(--text-quaternary)' }}>Protocol</p>
      </div>
      
      <nav className="space-y-1.5">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="desktop-nav-item w-full text-left group"
              style={{
                color: isActive ? state.settings.accentColor : 'var(--text-secondary)',
                background: isActive ? `${state.settings.accentColor}10` : 'transparent',
                boxShadow: isActive ? `inset 0 0 0 1px ${state.settings.accentColor}15` : 'none',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="font-medium tracking-tight">{label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-8 left-5 right-5">
        <div 
          className="rounded-2xl p-4"
          style={{ 
            background: 'var(--card-bg)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-quaternary)' }}>Current Streak</p>
          <p className="text-3xl font-bold tracking-tight" style={{ color: state.settings.accentColor }}>
            {activeStreak} <span className="text-sm font-medium" style={{ color: 'var(--text-quaternary)' }}>days</span>
          </p>
        </div>
      </div>
    </aside>
  );
}

function AppContent() {
  const location = useLocation();
  const { isOnline, state } = useApp();
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Main Content */}
      <div className="lg:ml-60 pb-24 lg:pb-8">
        {/* Grid Background */}
        <div className="grid-background" />
        <div className="grid-fade" />
        
        {/* Offline indicator */}
        {!isOnline && (
          <motion.div 
            initial={{ y: -30 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 lg:left-60 text-black text-xs text-center py-1.5 z-50 font-medium"
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
      </div>
      
      {/* Mobile TabBar */}
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
