import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Zap, Flame, Trophy, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { useApp } from '../App';
import { WEEKLY_SCHEDULE, type DayType } from '../types';
import { isDeloadWeek, formatDate, triggerHaptic } from '../store';

function ProgressRing({ progress, size = 140, strokeWidth = 10, color }: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-30"
        style={{ backgroundColor: color }}
      />
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="ring-glow"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.span 
          className="text-4xl font-bold"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: 'var(--text-primary)' }}
        >
          {Math.round(progress)}%
        </motion.span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Weekly Goal</span>
      </div>
    </div>
  );
}

function getDayTypeColor(type: DayType): string {
  const colors: Record<DayType, string> = {
    strength: '#FF9F0A',
    mobility: '#30D158',
    conditioning: '#FF453A',
    skill: '#BF5AF2',
    rest: '#64D2FF',
    off: '#8e8e93',
  };
  return colors[type];
}

function getDayTypeGradient(type: DayType): string {
  const gradients: Record<DayType, string> = {
    strength: 'linear-gradient(135deg, #FF9F0A 0%, #FF6B35 100%)',
    mobility: 'linear-gradient(135deg, #30D158 0%, #34C759 100%)',
    conditioning: 'linear-gradient(135deg, #FF453A 0%, #FF6B6B 100%)',
    skill: 'linear-gradient(135deg, #BF5AF2 0%, #AF52DE 100%)',
    rest: 'linear-gradient(135deg, #64D2FF 0%, #5AC8FA 100%)',
    off: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
  };
  return gradients[type];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useApp();
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7; // Monday = 0
  const schedule = state.settings.customSchedule || WEEKLY_SCHEDULE;
  const todaySchedule = schedule[dayIndex];
  const deloadActive = isDeloadWeek(today);
  const todayStr = formatDate(today);
  const isDark = state.settings.darkMode;
  
  // Calculate weekly progress
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayIndex);
  const weekLogs = state.workoutLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= weekStart && logDate <= today && log.completed;
  });
  
  const workoutDays = schedule.filter(d => d.type !== 'rest' && d.type !== 'off').length;
  const completedDays = weekLogs.length;
  const weekProgress = workoutDays > 0 ? (completedDays / workoutDays) * 100 : 0;
  
  // Check if today's workout is completed
  const todayCompleted = state.workoutLogs.some(
    log => log.date === todayStr && log.completed
  );

  const handleStartWorkout = () => {
    triggerHaptic('medium');
    navigate('/workout');
  };

  const handleLogSkill = () => {
    triggerHaptic('light');
    navigate('/skill');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 pt-12 pb-4 container-app"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Decorative background gradient */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-50" />
      
      {/* Header */}
      <div className="mb-6 relative z-10">
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mt-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Good {today.getHours() < 12 ? 'Morning' : today.getHours() < 18 ? 'Afternoon' : 'Evening'} 👋
        </motion.h1>
      </div>

      {/* Deload Alert */}
      {deloadActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 159, 10, 0.15) 0%, rgba(255, 159, 10, 0.05) 100%)',
            borderColor: 'rgba(255, 159, 10, 0.3)',
            borderWidth: 1 
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255, 159, 10, 0.2)' }}>
            <AlertCircle size={22} color="#FF9F0A" />
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Deload Week Active</p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Reduce volume to 60% for recovery</p>
          </div>
        </motion.div>
      )}

      {/* Today's Focus Card - Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-premium rounded-3xl p-6 mb-5 relative overflow-hidden"
      >
        {/* Decorative accent */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: getDayTypeGradient(todaySchedule.type) }}
        />
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Today&apos;s Focus</p>
            <h2 
              className="text-2xl font-bold"
              style={{ 
                background: getDayTypeGradient(todaySchedule.type),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {todaySchedule.type.charAt(0).toUpperCase() + todaySchedule.type.slice(1)}
            </h2>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{todaySchedule.focus}</p>
          </div>
          {todayCompleted && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-2xl p-3"
              style={{ background: 'rgba(48, 209, 88, 0.15)' }}
            >
              <Trophy size={24} color="#30D158" />
            </motion.div>
          )}
        </div>

        <div className="flex justify-center mb-6">
          <ProgressRing 
            progress={weekProgress} 
            color={state.settings.accentColor}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartWorkout}
            className="btn-primary flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${state.settings.accentColor} 0%, ${state.settings.accentColor}dd 100%)` }}
          >
            <Play size={20} fill="white" />
            Start Workout
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogSkill}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold glass haptic"
            style={{ color: 'var(--text-primary)' }}
          >
            <Zap size={20} style={{ color: state.settings.accentColor }} />
            Log Skill
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row - Premium */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20" style={{ background: '#FF9F0A' }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 159, 10, 0.15)' }}>
              <Flame size={18} color="#FF9F0A" />
            </div>
          </div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Current Streak</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{state.currentStreak}</p>
          <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20" style={{ background: '#30D158' }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(48, 209, 88, 0.15)' }}>
              <Trophy size={18} color="#30D158" />
            </div>
          </div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>This Week</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {completedDays}<span className="text-lg font-normal" style={{ color: 'var(--text-quaternary)' }}>/{workoutDays}</span>
          </p>
          <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>workouts</p>
        </motion.div>
      </div>

      {/* Quick Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-4 mb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} style={{ color: state.settings.accentColor }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Weekly Progress</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: state.settings.accentColor }}>
            {Math.round(weekProgress)}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weekProgress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${state.settings.accentColor} 0%, ${state.settings.accentColor}aa 100%)`,
              boxShadow: `0 0 10px ${state.settings.accentColor}50`
            }}
          />
        </div>
      </motion.div>

      {/* Achievements Preview */}
      {state.achievements.some(a => a.unlocked) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-4 mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} style={{ color: '#FFD60A' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Achievements</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
            {state.achievements
              .filter(a => a.unlocked)
              .slice(0, 4)
              .map(achievement => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.05 }}
                  className="shrink-0 rounded-xl p-3 text-center min-w-20"
                  style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{achievement.name}</p>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* AI Insight - Premium */}
      {state.progressData.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-4 relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${state.settings.accentColor}10 0%, transparent 100%)`,
            borderLeft: `3px solid ${state.settings.accentColor}` 
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: state.settings.accentColor }} />
            <p className="text-sm font-semibold" style={{ color: state.settings.accentColor }}>
              AI Insight
            </p>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {(() => {
              const recent = state.progressData.slice(-2);
              if (recent.length >= 2) {
                const diff = recent[1].pullUpMax - recent[0].pullUpMax;
                if (diff > 0) return `Great progress! You improved ${diff} pull-up reps since last session. Keep pushing! 💪`;
                if (diff < 0) return "Focus on recovery. Your numbers suggest you might need more rest. Listen to your body! 🧘";
              }
              return "Keep logging your progress to see personalized insights! 📊";
            })()}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
