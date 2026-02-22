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

export const calculateStreak = (
  workoutLogs: { date: string; completed: boolean }[],
  loginLogs: { date: string }[],
  schedule: DaySchedule[] = WEEKLY_SCHEDULE
): number => {

  const completedWorkouts = new Set(
    workoutLogs.filter(l => l.completed).map(l => l.date)
  );

  const activeDays = new Set(loginLogs.map(l => l.date));

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const dateStr = formatDate(currentDate);
    const dayIndex = (currentDate.getDay() + 6) % 7;
    const dayType = schedule[dayIndex].type;

    if (dayType === 'rest' || dayType === 'off') {
      if (!activeDays.has(dateStr)) break;
      streak++;
    } else {
      if (!completedWorkouts.has(dateStr)) break;
      streak++;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
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
