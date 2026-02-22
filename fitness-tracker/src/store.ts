import type { AppState, DaySchedule } from './types';
import { DEFAULT_ACHIEVEMENTS, WEEKLY_SCHEDULE } from './types';

const STORAGE_KEY = 'vitruvian-fitness-tracker';

const defaultState: AppState = {
  workoutLogs: [],
  skillLogs: [],
  loginLogs: [],
  progressData: [],
  settings: {
    darkMode: true,
    accentColor: '#007AFF',
    soundEnabled: true,
    hapticEnabled: true,
  },
  achievements: DEFAULT_ACHIEVEMENTS,
  currentStreak: 0,
  todaysActivity: 0,
  lastActivityDate: null,
  lastWorkoutDate: null,
};

export const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure new fields are added
      return {
        ...defaultState,
        ...parsed,
        settings: { ...defaultState.settings, ...parsed.settings },
        achievements: parsed.achievements?.length ? parsed.achievements : DEFAULT_ACHIEVEMENTS,
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return defaultState;
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

export const exportData = (state: AppState): void => {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vitruvian-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const resetData = (): AppState => {
  localStorage.removeItem(STORAGE_KEY);
  return defaultState;
};

export const getWeekNumber = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

export const isDeloadWeek = (date: Date = new Date()): boolean => {
  const weekNum = getWeekNumber(date);
  return weekNum % 4 === 0;
};

export const formatDate = (date: Date): string => {
  // Use local date to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Check if a date string is yesterday
export const isYesterday = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday) === dateStr;
};

// Check if a date string is today
export const isToday = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  return formatDate(new Date()) === dateStr;
};

// Process streak at start of new day (midnight transition)
// Returns updated state values
export const processStreakNewDay = (
  currentStreak: number,
  todaysActivity: number,
  lastActivityDate: string | null
): { currentStreak: number; todaysActivity: number; lastActivityDate: string | null } => {
  const todayStr = formatDate(new Date());
  
  // If lastActivityDate is today, no change needed (already logged today)
  if (lastActivityDate === todayStr) {
    return { currentStreak, todaysActivity, lastActivityDate };
  }
  
  // If lastActivityDate was yesterday, yesterday was logged - streak continues
  if (isYesterday(lastActivityDate)) {
    return {
      currentStreak: currentStreak + 1, // Yesterday's activity becomes part of streak
      todaysActivity: 0, // New day starts fresh
      lastActivityDate: null // Clear since it's now counted in currentStreak
    };
  }
  
  // lastActivityDate is older than yesterday or null - yesterday wasn't logged
  // Streak is broken, reset to 0
  return {
    currentStreak: 0,
    todaysActivity: 0,
    lastActivityDate: null
  };
};

// Get the active streak to display (currentStreak + todaysActivity)
export const getActiveStreak = (currentStreak: number, todaysActivity: number): number => {
  return currentStreak + todaysActivity;
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light'): void => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[type]);
  }
};
