import { createClient } from '@supabase/supabase-js';
import type { AppState, WorkoutLog, SkillLog, ProgressData, Settings, Achievement } from './types';

// Replace these with your Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

// Auth functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: siteUrl,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database functions
export const saveUserData = async (userId: string, state: AppState) => {
  const { error } = await supabase
    .from('user_data')
    .upsert({
      user_id: userId,
      workout_logs: state.workoutLogs,
      skill_logs: state.skillLogs,
      login_logs: state.loginLogs,
      progress_data: state.progressData,
      settings: state.settings,
      achievements: state.achievements,
      current_streak: state.currentStreak,
      todays_activity: state.todaysActivity,
      last_activity_date: state.lastActivityDate,
      last_workout_date: state.lastWorkoutDate,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error saving user data:', error);
  }
  return { error };
};

export const loadUserData = async (userId: string): Promise<AppState | null> => {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading user data:', error);
    }
    return null;
  }

  if (data) {
    return {
      workoutLogs: data.workout_logs || [],
      skillLogs: data.skill_logs || [],
      loginLogs: data.login_logs || [],
      progressData: data.progress_data || [],
      settings: data.settings || {
        darkMode: true,
        accentColor: '#007AFF',
        soundEnabled: true,
        hapticEnabled: true,
      },
      achievements: data.achievements || [],
      currentStreak: data.current_streak || 0,
      todaysActivity: data.todays_activity || 0,
      lastActivityDate: data.last_activity_date || null,
      lastWorkoutDate: data.last_workout_date || null,
    };
  }

  return null;
};

export const deleteUserData = async (userId: string) => {
  const { error } = await supabase
    .from('user_data')
    .delete()
    .eq('user_id', userId);

  return { error };
};
