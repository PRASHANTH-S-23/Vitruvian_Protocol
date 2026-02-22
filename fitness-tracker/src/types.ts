export interface Exercise {
  id: string;
  name: string;
  sets: number;
  targetReps: number;
  description?: string;
}

export interface SetData {
  completed: boolean;
  reps: number;
  rpe: number;
  notes: string;
}

export interface WorkoutLog {
  date: string;
  dayType: DayType;
  exercises: {
    exerciseId: string;
    sets: SetData[];
  }[];
  completed: boolean;
  startTime?: string;
  endTime?: string;
}

export interface SkillLog {
  date: string;
  type: 'handstand' | 'lsit' | 'zone2';
  duration: number; // seconds
  notes?: string;
}

export interface ProgressData {
  date: string;
  pullUpMax: number;
  dipsMax: number;
}

export type DayType = 'strength' | 'mobility' | 'rest' | 'conditioning' | 'skill' | 'off';

export interface DaySchedule {
  day: string;
  shortDay: string;
  type: DayType;
  focus: string;
}

export interface Settings {
  darkMode: boolean;
  accentColor: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  geminiApiKey?: string;
  customExercises?: Record<DayType, Exercise[]>;
  customSchedule?: DaySchedule[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface AppState {
  workoutLogs: WorkoutLog[];
  skillLogs: SkillLog[];
  loginLogs: { date: string }[];
  progressData: ProgressData[];
  settings: Settings;
  achievements: Achievement[];
  currentStreak: number;
  lastWorkoutDate: string | null;
}

export const WEEKLY_SCHEDULE: DaySchedule[] = [
  { day: 'Monday', shortDay: 'Mon', type: 'strength', focus: 'Upper Body Push/Pull' },
  { day: 'Tuesday', shortDay: 'Tue', type: 'mobility', focus: 'Flexibility & Recovery' },
  { day: 'Wednesday', shortDay: 'Wed', type: 'strength', focus: 'Lower Body & Core' },
  { day: 'Thursday', shortDay: 'Thu', type: 'rest', focus: 'Active Recovery' },
  { day: 'Friday', shortDay: 'Fri', type: 'conditioning', focus: 'HIIT & Cardio' },
  { day: 'Saturday', shortDay: 'Sat', type: 'skill', focus: 'Skill Work & Zone 2' },
  { day: 'Sunday', shortDay: 'Sun', type: 'off', focus: 'Complete Rest' },
];

export const EXERCISES: Record<DayType, Exercise[]> = {
  strength: [
    { id: 'burpees', name: 'Burpees', sets: 3, targetReps: 10, description: 'Full body explosive movement' },
    { id: 'pullups', name: 'Pull-Ups', sets: 4, targetReps: 8, description: 'Overhand grip, full range of motion' },
    { id: 'dips', name: 'Dips', sets: 4, targetReps: 10, description: 'Parallel bars or rings' },
    { id: 'australian', name: 'Australian Pull-Ups', sets: 3, targetReps: 12, description: 'Inverted row variation' },
    { id: 'bulgarian', name: 'Bulgarian Split Squats', sets: 3, targetReps: 10, description: 'Each leg, rear foot elevated' },
    { id: 'glute-bridge', name: 'Glute Bridges', sets: 3, targetReps: 15, description: 'Single or double leg' },
    { id: 'knee-raises', name: 'Hanging Knee Raises', sets: 3, targetReps: 12, description: 'Controlled movement, no swing' },
    { id: 'fingertip-plank', name: 'Fingertip Plank', sets: 3, targetReps: 30, description: 'Hold for 30 seconds' },
    { id: 'superman', name: 'Superman Hold', sets: 3, targetReps: 20, description: 'Hold for 20 seconds' },
  ],
  mobility: [
    { id: 'hip-circles', name: 'Hip Circles', sets: 2, targetReps: 10, description: 'Each direction' },
    { id: 'cat-cow', name: 'Cat-Cow Stretch', sets: 2, targetReps: 10, description: 'Slow and controlled' },
    { id: 'world-greatest', name: 'World\'s Greatest Stretch', sets: 2, targetReps: 8, description: 'Each side' },
    { id: 'shoulder-pass', name: 'Shoulder Dislocates', sets: 2, targetReps: 10, description: 'With band or stick' },
    { id: 'deep-squat', name: 'Deep Squat Hold', sets: 3, targetReps: 30, description: 'Hold 30 seconds' },
    { id: 'pigeon', name: 'Pigeon Pose', sets: 2, targetReps: 45, description: 'Each side, 45 seconds' },
  ],
  conditioning: [
    { id: 'burpees-hiit', name: 'Burpees', sets: 4, targetReps: 15, description: 'Max effort' },
    { id: 'mountain-climbers', name: 'Mountain Climbers', sets: 4, targetReps: 30, description: 'Each side counts as 1' },
    { id: 'jump-squats', name: 'Jump Squats', sets: 4, targetReps: 15, description: 'Explosive' },
    { id: 'high-knees', name: 'High Knees', sets: 4, targetReps: 30, description: '30 seconds' },
    { id: 'plank-jacks', name: 'Plank Jacks', sets: 3, targetReps: 20, description: 'Controlled pace' },
  ],
  skill: [],
  rest: [],
  off: [],
};

export const ACCENT_COLORS = [
  { name: 'Blue', value: '#007AFF' },
  { name: 'Green', value: '#30D158' },
  { name: 'Purple', value: '#BF5AF2' },
  { name: 'Pink', value: '#FF375F' },
  { name: 'Orange', value: '#FF9F0A' },
  { name: 'Teal', value: '#64D2FF' },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: '7-day-streak', name: 'Week Warrior', description: 'Complete a 7-day workout streak', icon: '🔥', unlocked: false },
  { id: '30-workouts', name: 'Dedicated', description: 'Complete 30 workouts', icon: '💪', unlocked: false },
  { id: 'first-10-pullups', name: 'Pull-Up Pro', description: 'Do 10 pull-ups in one set', icon: '🏆', unlocked: false },
  { id: 'first-workout', name: 'Getting Started', description: 'Complete your first workout', icon: '⭐', unlocked: false },
  { id: 'skill-master', name: 'Skill Master', description: 'Log 10 skill sessions', icon: '🎯', unlocked: false },
  { id: 'consistency', name: 'Consistency King', description: '4 weeks without missing scheduled workouts', icon: '👑', unlocked: false },
];
