import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, MessageSquare, X, Trophy } from 'lucide-react';
import { useApp } from '../App';
import { WEEKLY_SCHEDULE, EXERCISES, type Exercise, type SetData, type WorkoutLog, type DayType } from '../types';
import { formatDate, isDeloadWeek, triggerHaptic } from '../store';

function RPESlider({ value, onChange, accentColor }: { 
  value: number; 
  onChange: (v: number) => void;
  accentColor: string;
}) {
  const getRPEColor = (rpe: number): string => {
    if (rpe <= 3) return '#30D158';
    if (rpe <= 5) return '#FFD60A';
    if (rpe <= 7) return '#FF9F0A';
    return '#FF453A';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>RPE</span>
        <span 
          className="text-sm font-semibold px-2 py-0.5 rounded-full"
          style={{ 
            backgroundColor: `${getRPEColor(value)}20`,
            color: getRPEColor(value)
          }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${(value - 1) * 11.11}%, var(--border-color) ${(value - 1) * 11.11}%, var(--border-color) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs" style={{ color: 'var(--text-quaternary)' }}>
        <span>Easy</span>
        <span>Max</span>
      </div>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  sets: SetData[];
  onSetUpdate: (setIndex: number, data: Partial<SetData>) => void;
  isExpanded: boolean;
  onToggle: () => void;
  deloadActive: boolean;
  accentColor: string;
}

function ExerciseCard({ 
  exercise, 
  sets, 
  onSetUpdate, 
  isExpanded,
  onToggle,
  deloadActive,
  accentColor
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState(sets[0]?.notes || '');
  
  const completedSets = sets.filter(s => s.completed).length;
  const targetReps = deloadActive ? Math.round(exercise.targetReps * 0.6) : exercise.targetReps;
  const isComplete = completedSets === exercise.sets;

  return (
    <motion.div
      layout
      className={`glass rounded-2xl overflow-hidden ${isComplete ? 'ring-1 ring-green-500/50' : ''}`}
      style={{ boxShadow: isComplete ? '0 0 20px rgba(48, 209, 88, 0.1)' : undefined }}
    >
      {/* Header */}
      <motion.div
        layout
        onClick={onToggle}
        className="p-4 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: isComplete ? [1, 1.2, 1] : 1 }}
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ 
              background: isComplete ? '#30D158' : 'var(--card-bg)',
              boxShadow: isComplete ? '0 0 15px rgba(48, 209, 88, 0.3)' : undefined
            }}
          >
            {isComplete ? (
              <Check size={20} color="white" />
            ) : (
              <span className="text-lg font-bold" style={{ color: 'var(--text-tertiary)' }}>
                {completedSets}/{exercise.sets}
              </span>
            )}
          </motion.div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{exercise.name}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {exercise.sets} sets × {targetReps} {deloadActive && '(deload)'}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Description */}
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{exercise.description}</p>

              {/* Sets */}
              {sets.map((set, index) => (
                <div 
                  key={index}
                  className="rounded-xl p-3"
                  style={{ background: 'var(--card-bg)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Set {index + 1}</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        triggerHaptic(set.completed ? 'light' : 'medium');
                        onSetUpdate(index, { completed: !set.completed });
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                      style={{ 
                        background: set.completed ? '#30D158' : 'var(--glass-bg)',
                        border: set.completed ? 'none' : '1px solid var(--border-color)'
                      }}
                    >
                      {set.completed && <Check size={16} color="white" />}
                    </motion.button>
                  </div>

                  {/* Reps Input */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs w-12" style={{ color: 'var(--text-tertiary)' }}>Reps</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSetUpdate(index, { reps: Math.max(0, set.reps - 1) })}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => onSetUpdate(index, { reps: parseInt(e.target.value) || 0 })}
                        className="w-16 h-8 rounded-lg text-center font-medium"
                        style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                      />
                      <button
                        onClick={() => onSetUpdate(index, { reps: set.reps + 1 })}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* RPE Slider */}
                  <RPESlider 
                    value={set.rpe} 
                    onChange={(rpe) => onSetUpdate(index, { rpe })}
                    accentColor={accentColor}
                  />
                </div>
              ))}

              {/* Notes */}
              <div className="pt-2">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <MessageSquare size={16} />
                  {showNotes ? 'Hide Notes' : 'Add Notes'}
                </button>
                
                <AnimatePresence>
                  {showNotes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <textarea
                        value={noteText}
                        onChange={(e) => {
                          setNoteText(e.target.value);
                          sets.forEach((_, i) => onSetUpdate(i, { notes: e.target.value }));
                        }}
                        placeholder="Add notes for this exercise..."
                        className="w-full mt-2 p-3 rounded-xl text-sm resize-none h-20"
                        style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Workout() {
  const { state, addWorkoutLog, addProgressData } = useApp();
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [exerciseData, setExerciseData] = useState<Record<string, SetData[]>>({});

  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7;
  const schedule = state.settings.customSchedule || WEEKLY_SCHEDULE;
  const exercisesByType = state.settings.customExercises || EXERCISES;
  const todaySchedule = schedule[dayIndex];
  const exercises = exercisesByType[todaySchedule.type];
  const deloadActive = isDeloadWeek(today);
  const todayStr = formatDate(today);

  // Initialize exercise data
  useEffect(() => {
    const existingLog = state.workoutLogs.find(log => log.date === todayStr);
    
    const initialData: Record<string, SetData[]> = {};
    exercises.forEach(ex => {
      const existingExData = existingLog?.exercises.find(e => e.exerciseId === ex.id);
      initialData[ex.id] = existingExData?.sets || Array(ex.sets).fill(null).map(() => ({
        completed: false,
        reps: deloadActive ? Math.round(ex.targetReps * 0.6) : ex.targetReps,
        rpe: 5,
        notes: '',
      }));
    });
    setExerciseData(initialData);
  }, [exercises, todayStr, deloadActive]);

  const handleSetUpdate = (exerciseId: string, setIndex: number, data: Partial<SetData>) => {
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) => 
        i === setIndex ? { ...set, ...data } : set
      ),
    }));
  };

  const handleCompleteWorkout = () => {
    const log: WorkoutLog = {
      date: todayStr,
      dayType: todaySchedule.type,
      exercises: Object.entries(exerciseData).map(([exerciseId, sets]) => ({
        exerciseId,
        sets,
      })),
      completed: true,
      endTime: new Date().toISOString(),
    };

    addWorkoutLog(log);

    // Update progress data for tracked exercises
    const pullUpData = exerciseData['pullups'];
    const dipsData = exerciseData['dips'];
    
    if (pullUpData || dipsData) {
      const maxPullUps = pullUpData ? Math.max(...pullUpData.map(s => s.reps)) : 0;
      const maxDips = dipsData ? Math.max(...dipsData.map(s => s.reps)) : 0;
      
      addProgressData({
        date: todayStr,
        pullUpMax: maxPullUps,
        dipsMax: maxDips,
      });
    }

    triggerHaptic('heavy');
    setWorkoutComplete(true);
  };

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = Object.values(exerciseData).flat().filter(s => s?.completed).length;
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // Workout complete celebration
  if (workoutComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-40" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          className="text-6xl mb-6 relative z-10"
        >
          🎉
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-2 relative z-10"
          style={{ color: 'var(--text-primary)' }}
        >
          Workout Complete!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8 relative z-10"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Great job crushing your {todaySchedule.type} workout!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-premium rounded-2xl p-6 w-full max-w-sm relative z-10"
        >
          <div className="flex items-center justify-between mb-4">
            <span style={{ color: 'var(--text-tertiary)' }}>Sets Completed</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{completedSets}/{totalSets}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span style={{ color: 'var(--text-tertiary)' }}>Avg RPE</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              {(Object.values(exerciseData).flat().reduce((acc, s) => acc + (s?.rpe || 0), 0) / completedSets || 0).toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-tertiary)' }}>Streak</span>
            <span className="font-bold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              <Trophy size={16} color="#FFD60A" />
              {state.currentStreak + 1} days
            </span>
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setWorkoutComplete(false)}
          className="mt-6 px-8 py-3.5 rounded-full font-semibold text-white relative z-10"
          style={{ background: `linear-gradient(135deg, ${state.settings.accentColor} 0%, ${state.settings.accentColor}dd 100%)` }}
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  // Rest/Off day view
  if (exercises.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-30" />
        <span className="text-6xl mb-6 relative z-10">
          {todaySchedule.type === 'skill' ? '🎯' : todaySchedule.type === 'rest' ? '💤' : '😴'}
        </span>
        <h1 className="text-2xl font-bold text-center mb-2 relative z-10" style={{ color: 'var(--text-primary)' }}>
          {todaySchedule.type === 'skill' 
            ? 'Skill Day' 
            : todaySchedule.type === 'rest' 
            ? 'Rest Day' 
            : 'Day Off'}
        </h1>
        <p className="text-center relative z-10" style={{ color: 'var(--text-tertiary)' }}>
          {todaySchedule.type === 'skill'
            ? 'Head to Skill Mode for today\'s practice'
            : todaySchedule.type === 'rest'
            ? 'Light stretching or walking recommended'
            : 'Take the day completely off'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 md:px-6 lg:px-8 pt-12 pb-4 max-w-4xl mx-auto"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Background gradient */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-30" />
      
      {/* Header */}
      <div className="mb-6 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold capitalize"
          style={{ color: 'var(--text-primary)' }}
        >
          {todaySchedule.type}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ color: 'var(--text-tertiary)' }}
        >
          {todaySchedule.focus}
          {deloadActive && ' (Deload)'}
        </motion.p>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-premium rounded-2xl p-4 mb-5 relative z-10"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Workout Progress</span>
          <span className="text-sm font-semibold" style={{ color: state.settings.accentColor }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${state.settings.accentColor} 0%, ${state.settings.accentColor}aa 100%)`,
              boxShadow: `0 0 10px ${state.settings.accentColor}50`
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-quaternary)' }}>
          <span>{completedSets} sets done</span>
          <span>{totalSets - completedSets} remaining</span>
        </div>
      </motion.div>

      {/* Exercise List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-6 relative z-10">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <ExerciseCard
              exercise={exercise}
              sets={exerciseData[exercise.id] || []}
              onSetUpdate={(setIndex, data) => handleSetUpdate(exercise.id, setIndex, data)}
              isExpanded={expandedExercise === exercise.id}
              onToggle={() => setExpandedExercise(
                expandedExercise === exercise.id ? null : exercise.id
              )}
              deloadActive={deloadActive}
              accentColor={state.settings.accentColor}
            />
          </motion.div>
        ))}
      </div>

      {/* Complete Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleCompleteWorkout}
        disabled={completedSets === 0}
        className={`w-full py-4 rounded-2xl font-semibold text-white transition-opacity relative z-10 ${
          completedSets === 0 ? 'opacity-50' : ''
        }`}
        style={{ background: `linear-gradient(135deg, ${state.settings.accentColor} 0%, ${state.settings.accentColor}dd 100%)` }}
      >
        Complete Workout
      </motion.button>
    </motion.div>
  );
}
