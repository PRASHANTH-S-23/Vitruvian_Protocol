import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Zap, Flame, Trophy, AlertCircle, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
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
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-2 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: color }}
      />
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
          opacity={0.2}
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
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}30)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.span 
          className="text-4xl font-bold tracking-tight"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{ color: 'var(--text-primary)' }}
        >
          {Math.round(progress)}%
        </motion.span>
        <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Weekly Goal</span>
      </div>
    </div>
  );
}

function getDayTypeColor(type: DayType): string {
  const colors: Record<DayType, string> = {
    strength: '#FF9F0A',
    mobility: '#32D74B',
    conditioning: '#FF453A',
    skill: '#BF5AF2',
    rest: '#5AC8FA',
    off: '#98989D',
  };
  return colors[type];
}

function getDayTypeGradient(type: DayType): string {
  const gradients: Record<DayType, string> = {
    strength: 'linear-gradient(145deg, #FF9F0A 0%, #FF7A00 100%)',
    mobility: 'linear-gradient(145deg, #32D74B 0%, #00C7BE 100%)',
    conditioning: 'linear-gradient(145deg, #FF453A 0%, #FF6961 100%)',
    skill: 'linear-gradient(145deg, #BF5AF2 0%, #9D4EDD 100%)',
    rest: 'linear-gradient(145deg, #5AC8FA 0%, #64D2FF 100%)',
    off: 'linear-gradient(145deg, #98989D 0%, #6E6E73 100%)',
  };
  return gradients[type];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, logRestDay, isRestDayLogged } = useApp();
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7; // Monday = 0
  const schedule = state.settings.customSchedule || WEEKLY_SCHEDULE;
  const todaySchedule = schedule[dayIndex];
  const deloadActive = isDeloadWeek(today);
  const todayStr = formatDate(today);
  const isDark = state.settings.darkMode;
  
  // Check if today is a rest/off day
  const isRestOrOffDay = todaySchedule.type === 'rest' || todaySchedule.type === 'off';
  const restDayLogged = isRestDayLogged(todayStr);
  
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

  const handleLogRestDay = () => {
    triggerHaptic('medium');
    logRestDay(todayStr);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 md:px-6 lg:px-8 pt-12 pb-4 max-w-6xl mx-auto"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Decorative background gradient - brighter */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-70" />
      
      {/* Animated accent orbs */}
      <div 
        className="fixed top-20 left-10 w-64 h-64 rounded-full blur-3xl pointer-events-none animate-float"
        style={{ background: `${state.settings.accentColor}15`, opacity: 0.6 }}
      />
      <div 
        className="fixed bottom-40 right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(191, 90, 242, 0.1)', opacity: 0.5, animationDelay: '2s' }}
      />
      
      {/* Header */}
      <div className="mb-8 relative z-10">
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold tracking-wide uppercase"
          style={{ color: state.settings.accentColor }}
        >
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold mt-2 tracking-tight"
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
        style={{
          boxShadow: `0 8px 32px ${getDayTypeColor(todaySchedule.type)}15, 0 4px 16px rgba(0,0,0,0.1)`
        }}
      >
        {/* Decorative accents - brighter */}
        <div 
          className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-40"
          style={{ background: getDayTypeGradient(todaySchedule.type) }}
        />
        <div 
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-25"
          style={{ background: state.settings.accentColor }}
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

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={handleStartWorkout}
            className="btn-primary flex items-center justify-center gap-2 py-5 md:py-6 rounded-2xl font-bold text-white relative overflow-hidden"
            style={{ 
              background: `linear-gradient(145deg, ${state.settings.accentColor} 0%, ${state.settings.accentColor}cc 100%)`,
              boxShadow: `0 8px 24px ${state.settings.accentColor}40, 0 4px 12px ${state.settings.accentColor}30`
            }}
          >
            <Play size={22} fill="white" />
            Start Workout
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={handleLogSkill}
            className="flex items-center justify-center gap-2 py-5 md:py-6 rounded-2xl font-bold relative overflow-hidden"
            style={{ 
              color: 'var(--text-primary)',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}
          >
            <Zap size={22} style={{ color: state.settings.accentColor }} />
            Log Skill
          </motion.button>
        </div>

        {/* Rest Day Log Button - Only shown on rest/off days */}
        {isRestOrOffDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            {restDayLogged ? (
              <div 
                className="flex items-center justify-center gap-2 py-3 rounded-2xl"
                style={{ 
                  background: 'rgba(48, 209, 88, 0.15)',
                  border: '1px solid rgba(48, 209, 88, 0.3)'
                }}
              >
                <CheckCircle2 size={20} color="#30D158" />
                <span className="font-medium" style={{ color: '#30D158' }}>
                  Rest Day Logged for Streak!
                </span>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLogRestDay}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold"
                style={{ 
                  background: 'linear-gradient(135deg, #64D2FF 0%, #5AC8FA 100%)',
                  color: '#000'
                }}
              >
                <Flame size={18} />
                Log Rest Day for Streak
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Stats Row - Premium with brighter accents */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-4 relative overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(255, 159, 10, 0.1)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-40" style={{ background: '#FF9F0A' }} />
          <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full blur-xl opacity-30" style={{ background: '#FFD60A' }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255, 159, 10, 0.25) 0%, rgba(255, 214, 10, 0.15) 100%)' }}>
              <Flame size={20} color="#FF9F0A" />
            </div>
          </div>
          <p className="text-xs font-medium mb-1 tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Current Streak</p>
          <p className="text-3xl font-bold tracking-tight" style={{ color: '#FF9F0A' }}>{state.currentStreak}</p>
          <p className="text-xs font-medium" style={{ color: 'var(--text-quaternary)' }}>days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-4 relative overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(50, 215, 75, 0.1)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-40" style={{ background: '#32D74B' }} />
          <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full blur-xl opacity-30" style={{ background: '#00C7BE' }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(50, 215, 75, 0.25) 0%, rgba(0, 199, 190, 0.15) 100%)' }}>
              <Trophy size={20} color="#32D74B" />
            </div>
          </div>
          <p className="text-xs font-medium mb-1 tracking-wide" style={{ color: 'var(--text-tertiary)' }}>This Week</p>
          <p className="text-3xl font-bold tracking-tight" style={{ color: '#32D74B' }}>
            {completedDays}<span className="text-lg font-medium" style={{ color: 'var(--text-quaternary)' }}>/{workoutDays}</span>
          </p>
          <p className="text-xs font-medium" style={{ color: 'var(--text-quaternary)' }}>workouts</p>
        </motion.div>
      </div>

      {/* Quick Progress Bar - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5 mb-5 relative overflow-hidden"
        style={{ boxShadow: `0 4px 24px ${state.settings.accentColor}10` }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-30" style={{ background: state.settings.accentColor }} />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${state.settings.accentColor}20` }}>
              <TrendingUp size={18} style={{ color: state.settings.accentColor }} />
            </div>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Progress</span>
          </div>
          <span className="text-lg font-bold" style={{ color: state.settings.accentColor }}>
            {Math.round(weekProgress)}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden relative z-10" style={{ background: 'var(--bg-tertiary)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weekProgress}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${state.settings.accentColor} 0%, ${state.settings.accentColor}cc 100%)`,
              boxShadow: `0 0 20px ${state.settings.accentColor}60, 0 0 8px ${state.settings.accentColor}40`
            }}
          />
        </div>
      </motion.div>

      {/* Achievements Preview - Enhanced */}
      {state.achievements.some(a => a.unlocked) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-5 mb-5 relative overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(255, 214, 10, 0.08)' }}
        >
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full blur-3xl opacity-30" style={{ background: '#FFD60A' }} />
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 214, 10, 0.2)' }}>
              <Sparkles size={18} style={{ color: '#FFD60A' }} />
            </div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Achievements</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth relative z-10">
            {state.achievements
              .filter(a => a.unlocked)
              .slice(0, 4)
              .map(achievement => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="shrink-0 rounded-2xl p-4 text-center min-w-24"
                  style={{ 
                    background: isDark 
                      ? 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)' 
                      : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(250,250,252,0.7) 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <span className="text-3xl">{achievement.icon}</span>
                  <p className="text-xs font-medium mt-2" style={{ color: 'var(--text-secondary)' }}>{achievement.name}</p>
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
