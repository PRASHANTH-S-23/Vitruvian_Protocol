import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, X } from 'lucide-react';
import { useApp } from '../App';
import { WEEKLY_SCHEDULE, EXERCISES, type DaySchedule, type DayType } from '../types';
import { formatDate, triggerHaptic } from '../store';

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

function getDayTypeIcon(type: DayType): string {
  const icons: Record<DayType, string> = {
    strength: '💪',
    mobility: '🧘',
    conditioning: '🔥',
    skill: '🎯',
    rest: '💤',
    off: '😴',
  };
  return icons[type];
}

interface DayCardProps {
  schedule: DaySchedule;
  isToday: boolean;
  isCompleted: boolean;
  onTap: () => void;
  accentColor: string;
}

function DayCard({ schedule, isToday, isCompleted, onTap, accentColor }: DayCardProps) {
  const color = getDayTypeColor(schedule.type);
  
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        triggerHaptic('light');
        onTap();
      }}
      className={`shrink-0 w-32 md:w-auto glass rounded-2xl p-4 relative overflow-hidden ${
        isToday ? 'ring-2' : ''
      }`}
      style={{ 
        borderColor: isToday ? accentColor : 'transparent',
        ['--tw-ring-color' as string]: isToday ? accentColor : 'transparent',
      }}
    >
      {/* Gradient glow */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20"
        style={{ background: color }}
      />
      
      {isCompleted && (
        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg" style={{ boxShadow: '0 0 10px #30D15850' }}>
          <Check size={12} color="white" />
        </div>
      )}
      
      <span className="text-2xl">{getDayTypeIcon(schedule.type)}</span>
      
      <p className="text-xs mt-3" style={{ color: 'var(--text-quaternary)' }}>{schedule.shortDay}</p>
      <p className="font-semibold mt-1" style={{ color }}>
        {schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)}
      </p>
      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>{schedule.focus}</p>
      
      <div className="flex items-center justify-between mt-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isCompleted 
            ? 'bg-green-500/20 text-green-400' 
            : ''
        }`} style={{ background: isCompleted ? undefined : 'var(--card-bg)', color: isCompleted ? undefined : 'var(--text-tertiary)' }}>
          {isCompleted ? 'Done' : 'Pending'}
        </span>
        <ChevronRight size={16} style={{ color: 'var(--text-quaternary)' }} />
      </div>
    </motion.div>
  );
}

interface DayDetailProps {
  schedule: DaySchedule;
  isCompleted: boolean;
  onClose: () => void;
  accentColor: string;
  exercisesByType: typeof EXERCISES;
}

function DayDetail({ schedule, isCompleted, onClose, accentColor, exercisesByType }: DayDetailProps) {
  const exercises = exercisesByType[schedule.type];
  const color = getDayTypeColor(schedule.type);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 backdrop-blur-md flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-h-[85vh] rounded-t-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{schedule.day}</p>
            <h2 className="text-xl font-bold" style={{ color }}>
              {schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full glass"
          >
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCompleted 
                ? 'bg-green-500/20 text-green-400' 
                : ''
            }`} style={{ background: isCompleted ? undefined : 'var(--card-bg)', color: isCompleted ? undefined : 'var(--text-tertiary)' }}>
              {isCompleted ? '✓ Completed' : 'Pending'}
            </span>
          </div>
          
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{schedule.focus}</p>
          
          {exercises.length > 0 ? (
            <>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Exercises</h3>
              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl p-4"
                    style={{ background: 'var(--card-bg)' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{exercise.name}</p>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{exercise.description}</p>
                      </div>
                      <span 
                        className="text-sm px-2 py-1 rounded-lg font-medium"
                        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                      >
                        {exercise.sets} × {exercise.targetReps}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">{getDayTypeIcon(schedule.type)}</span>
              <p className="mt-4" style={{ color: 'var(--text-tertiary)' }}>
                {schedule.type === 'rest' 
                  ? 'Light activity or stretching recommended'
                  : schedule.type === 'off'
                  ? 'Take the day completely off'
                  : 'Use the Skill mode for this day'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WeeklyView() {
  const { state } = useApp();
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7; // Monday = 0
  
  const schedule = state.settings.customSchedule || WEEKLY_SCHEDULE;
  const exercisesByType = state.settings.customExercises || EXERCISES;
  
  // Get dates for the week
  const weekDates = schedule.map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - dayIndex + i);
    return formatDate(date);
  });
  
  const completedDays = new Set(
    state.workoutLogs.filter(log => log.completed).map(log => log.date)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 md:px-6 lg:px-8 pt-12 pb-4 max-w-6xl mx-auto"
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
        Weekly Plan
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 relative z-10"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Your 7-day training schedule
      </motion.p>

      {/* Day Cards - Horizontal scroll on mobile, grid on desktop */}
      <div className="overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-4 scroll-smooth relative z-10">
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
          {schedule.map((daySchedule, index) => (
            <DayCard
              key={daySchedule.day}
              schedule={daySchedule}
              isToday={index === dayIndex}
              isCompleted={completedDays.has(weekDates[index])}
              onTap={() => setSelectedDay(daySchedule)}
              accentColor={state.settings.accentColor}
            />
          ))}
        </div>
      </div>

      {/* This Week Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-premium rounded-2xl p-5 mt-6 relative z-10"
      >
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>This Week Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Workouts</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {weekDates.filter(d => completedDays.has(d)).length}
              <span className="text-base font-normal" style={{ color: 'var(--text-quaternary)' }}>/5</span>
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Day</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {dayIndex + 1}
              <span className="text-base font-normal" style={{ color: 'var(--text-quaternary)' }}>/7</span>
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: 'var(--text-tertiary)' }}>Weekly Progress</span>
            <span className="font-semibold" style={{ color: state.settings.accentColor }}>{Math.round((weekDates.filter(d => completedDays.has(d)).length / 5) * 100)}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(weekDates.filter(d => completedDays.has(d)).length / 5) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${state.settings.accentColor} 0%, ${state.settings.accentColor}aa 100%)`,
                boxShadow: `0 0 10px ${state.settings.accentColor}50`
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Day Type Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 relative z-10"
      >
        <h3 className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>Day Types</h3>
        <div className="flex flex-wrap gap-2">
          {['strength', 'mobility', 'conditioning', 'skill', 'rest'].map(type => (
            <div 
              key={type}
              className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: 'var(--glass-bg)' }}
            >
              <span className="text-sm">{getDayTypeIcon(type as DayType)}</span>
              <span className="text-xs capitalize font-medium" style={{ color: getDayTypeColor(type as DayType) }}>
                {type}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <DayDetail
            schedule={selectedDay}
            isCompleted={completedDays.has(weekDates[schedule.indexOf(selectedDay)])}
            onClose={() => setSelectedDay(null)}
            accentColor={state.settings.accentColor}
            exercisesByType={exercisesByType}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
