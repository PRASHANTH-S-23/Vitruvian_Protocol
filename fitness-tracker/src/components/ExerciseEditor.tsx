import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Check, X, GripVertical, Dumbbell, Calendar, ChevronLeft } from 'lucide-react';
import { triggerHaptic } from '../store';
import type { Exercise, DaySchedule, DayType } from '../types';
import { EXERCISES, WEEKLY_SCHEDULE } from '../types';

interface ExerciseEditorProps {
  customExercises?: Record<DayType, Exercise[]>;
  customSchedule?: DaySchedule[];
  accentColor: string;
  onSaveExercises: (exercises: Record<DayType, Exercise[]>) => void;
  onSaveSchedule: (schedule: DaySchedule[]) => void;
  onClose: () => void;
}

const DAY_TYPES: { type: DayType; label: string; color: string }[] = [
  { type: 'strength', label: 'Strength', color: '#FF453A' },
  { type: 'mobility', label: 'Mobility', color: '#30D158' },
  { type: 'conditioning', label: 'Conditioning', color: '#FF9F0A' },
  { type: 'skill', label: 'Skill', color: '#BF5AF2' },
  { type: 'rest', label: 'Rest', color: '#64D2FF' },
  { type: 'off', label: 'Off', color: '#8E8E93' },
];

export default function ExerciseEditor({
  customExercises,
  customSchedule,
  accentColor,
  onSaveExercises,
  onSaveSchedule,
  onClose
}: ExerciseEditorProps) {
  const [activeTab, setActiveTab] = useState<'exercises' | 'schedule'>('exercises');
  const [selectedDayType, setSelectedDayType] = useState<DayType | null>(null);
  const [exercises, setExercises] = useState<Record<DayType, Exercise[]>>(() => 
    customExercises || { ...EXERCISES }
  );
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => 
    customSchedule || [...WEEKLY_SCHEDULE]
  );
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingScheduleDay, setEditingScheduleDay] = useState<number | null>(null);

  const handleSaveAndClose = () => {
    triggerHaptic('medium');
    onSaveExercises(exercises);
    onSaveSchedule(schedule);
    onClose();
  };

  const addExercise = (dayType: DayType) => {
    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: 'New Exercise',
      sets: 3,
      targetReps: 10,
      description: ''
    };
    setExercises(prev => ({
      ...prev,
      [dayType]: [...prev[dayType], newExercise]
    }));
    setEditingExercise(newExercise);
    triggerHaptic('light');
  };

  const updateExercise = (dayType: DayType, exerciseId: string, updates: Partial<Exercise>) => {
    setExercises(prev => ({
      ...prev,
      [dayType]: prev[dayType].map(ex => 
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      )
    }));
  };

  const deleteExercise = (dayType: DayType, exerciseId: string) => {
    triggerHaptic('heavy');
    setExercises(prev => ({
      ...prev,
      [dayType]: prev[dayType].filter(ex => ex.id !== exerciseId)
    }));
  };

  const updateScheduleDay = (index: number, updates: Partial<DaySchedule>) => {
    setSchedule(prev => prev.map((day, i) => 
      i === index ? { ...day, ...updates } : day
    ));
  };

  const resetToDefaults = () => {
    triggerHaptic('heavy');
    setExercises({ ...EXERCISES });
    setSchedule([...WEEKLY_SCHEDULE]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-12 pb-4 backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {selectedDayType ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDayType(null)}
                className="w-10 h-10 rounded-xl flex items-center justify-center glass"
              >
                <ChevronLeft size={22} style={{ color: 'var(--text-primary)' }} />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center glass"
              >
                <X size={22} style={{ color: 'var(--text-primary)' }} />
              </motion.button>
            )}
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {selectedDayType 
                ? DAY_TYPES.find(d => d.type === selectedDayType)?.label + ' Exercises'
                : 'Customize Workout'}
            </h1>
          </div>
          {!selectedDayType && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveAndClose}
              className="px-4 py-2 rounded-xl font-semibold text-white"
              style={{ background: accentColor }}
            >
              Save
            </motion.button>
          )}
        </div>

        {/* Tabs */}
        {!selectedDayType && (
          <div className="flex rounded-xl p-1 glass">
            <button
              onClick={() => setActiveTab('exercises')}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{ 
                background: activeTab === 'exercises' ? accentColor : 'transparent',
                color: activeTab === 'exercises' ? 'white' : 'var(--text-tertiary)'
              }}
            >
              <Dumbbell size={16} />
              Exercises
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{ 
                background: activeTab === 'schedule' ? accentColor : 'transparent',
                color: activeTab === 'schedule' ? 'white' : 'var(--text-tertiary)'
              }}
            >
              <Calendar size={16} />
              Schedule
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {/* Day Type Selection */}
          {activeTab === 'exercises' && !selectedDayType && (
            <motion.div
              key="day-types"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Select a workout type to edit its exercises
              </p>
              {DAY_TYPES.filter(d => ['strength', 'mobility', 'conditioning'].includes(d.type)).map((dayType) => (
                <motion.button
                  key={dayType.type}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDayType(dayType.type)}
                  className="w-full glass rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${dayType.color}20` }}
                    >
                      <Dumbbell size={20} style={{ color: dayType.color }} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {dayType.label}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {exercises[dayType.type]?.length || 0} exercises
                      </p>
                    </div>
                  </div>
                  <ChevronLeft 
                    size={20} 
                    className="rotate-180" 
                    style={{ color: 'var(--text-quaternary)' }} 
                  />
                </motion.button>
              ))}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={resetToDefaults}
                className="w-full mt-6 py-3 rounded-xl text-sm font-medium"
                style={{ 
                  background: 'rgba(255, 69, 58, 0.15)', 
                  color: '#FF453A' 
                }}
              >
                Reset to Defaults
              </motion.button>
            </motion.div>
          )}

          {/* Exercise List */}
          {activeTab === 'exercises' && selectedDayType && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {exercises[selectedDayType]?.map((exercise) => (
                <motion.div
                  key={exercise.id}
                  layout
                  className="glass rounded-2xl p-4"
                >
                  {editingExercise?.id === exercise.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingExercise.name}
                        onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                        placeholder="Exercise name"
                        className="w-full px-3 py-2 rounded-xl outline-none"
                        style={{ 
                          background: 'var(--bg-secondary)', 
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sets</label>
                          <input
                            type="number"
                            value={editingExercise.sets}
                            onChange={(e) => setEditingExercise({ ...editingExercise, sets: parseInt(e.target.value) || 1 })}
                            min={1}
                            max={10}
                            className="w-full px-3 py-2 rounded-xl outline-none mt-1"
                            style={{ 
                              background: 'var(--bg-secondary)', 
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-color)'
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Target Reps</label>
                          <input
                            type="number"
                            value={editingExercise.targetReps}
                            onChange={(e) => setEditingExercise({ ...editingExercise, targetReps: parseInt(e.target.value) || 1 })}
                            min={1}
                            max={100}
                            className="w-full px-3 py-2 rounded-xl outline-none mt-1"
                            style={{ 
                              background: 'var(--bg-secondary)', 
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-color)'
                            }}
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editingExercise.description || ''}
                        onChange={(e) => setEditingExercise({ ...editingExercise, description: e.target.value })}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 rounded-xl outline-none"
                        style={{ 
                          background: 'var(--bg-secondary)', 
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            updateExercise(selectedDayType, exercise.id, editingExercise);
                            setEditingExercise(null);
                            triggerHaptic('medium');
                          }}
                          className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-white"
                          style={{ background: accentColor }}
                        >
                          <Check size={16} />
                          Save
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingExercise(null)}
                          className="px-4 py-2 rounded-xl glass"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <X size={16} />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <GripVertical size={18} style={{ color: 'var(--text-quaternary)' }} />
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {exercise.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {exercise.sets} sets × {exercise.targetReps} reps
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingExercise(exercise)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--bg-secondary)' }}
                      >
                        <Edit3 size={16} style={{ color: 'var(--text-secondary)' }} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteExercise(selectedDayType, exercise.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255, 69, 58, 0.15)' }}
                      >
                        <Trash2 size={16} color="#FF453A" />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => addExercise(selectedDayType)}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 border-2 border-dashed"
                style={{ 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-secondary)' 
                }}
              >
                <Plus size={20} />
                Add Exercise
              </motion.button>
            </motion.div>
          )}

          {/* Schedule Editor */}
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Customize your weekly workout schedule
              </p>
              {schedule.map((day, index) => (
                <motion.div
                  key={day.day}
                  layout
                  className="glass rounded-2xl p-4"
                >
                  {editingScheduleDay === index ? (
                    <div className="space-y-3">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {day.day}
                      </p>
                      <div>
                        <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          Workout Type
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {DAY_TYPES.map((dt) => (
                            <motion.button
                              key={dt.type}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateScheduleDay(index, { type: dt.type })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{ 
                                background: day.type === dt.type ? dt.color : 'var(--bg-secondary)',
                                color: day.type === dt.type ? 'white' : 'var(--text-secondary)'
                              }}
                            >
                              {dt.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          Focus Description
                        </label>
                        <input
                          type="text"
                          value={day.focus}
                          onChange={(e) => updateScheduleDay(index, { focus: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl outline-none mt-1"
                          style={{ 
                            background: 'var(--bg-secondary)', 
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingScheduleDay(null);
                          triggerHaptic('light');
                        }}
                        className="w-full py-2 rounded-xl flex items-center justify-center gap-2 text-white"
                        style={{ background: accentColor }}
                      >
                        <Check size={16} />
                        Done
                      </motion.button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setEditingScheduleDay(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ 
                            background: `${DAY_TYPES.find(d => d.type === day.type)?.color}20`
                          }}
                        >
                          <span className="font-bold text-sm" style={{ 
                            color: DAY_TYPES.find(d => d.type === day.type)?.color 
                          }}>
                            {day.shortDay}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {day.day}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {DAY_TYPES.find(d => d.type === day.type)?.label} • {day.focus}
                          </p>
                        </div>
                      </div>
                      <Edit3 size={18} style={{ color: 'var(--text-quaternary)' }} />
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={resetToDefaults}
                className="w-full mt-4 py-3 rounded-xl text-sm font-medium"
                style={{ 
                  background: 'rgba(255, 69, 58, 0.15)', 
                  color: '#FF453A' 
                }}
              >
                Reset to Default Schedule
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
