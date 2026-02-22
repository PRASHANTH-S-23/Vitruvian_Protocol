import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { useApp } from '../App';
import { formatDate, triggerHaptic } from '../store';

type SkillType = 'handstand' | 'lsit' | 'zone2';

interface SkillOption {
  id: SkillType;
  name: string;
  icon: string;
  description: string;
  defaultDuration: number; // seconds
}

const SKILL_OPTIONS: SkillOption[] = [
  {
    id: 'handstand',
    name: 'Handstand',
    icon: '🤸',
    description: 'Wall-assisted or freestanding practice',
    defaultDuration: 60,
  },
  {
    id: 'lsit',
    name: 'L-Sit',
    icon: '🧘',
    description: 'Floor or parallettes hold',
    defaultDuration: 30,
  },
  {
    id: 'zone2',
    name: 'Zone 2 Cardio',
    icon: '🏃',
    description: '20-30 minute steady-state cardio',
    defaultDuration: 1200, // 20 minutes
  },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface TimerProps {
  skill: SkillOption;
  onComplete: (duration: number) => void;
  onBack: () => void;
  accentColor: string;
}

function Timer({ skill, onComplete, onBack, accentColor }: TimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [targetTime, setTargetTime] = useState(skill.defaultDuration);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Haptic feedback at certain milestones
  useEffect(() => {
    if (time > 0 && time === targetTime) {
      triggerHaptic('heavy');
    } else if (time > 0 && time % 60 === 0) {
      triggerHaptic('light');
    }
  }, [time, targetTime]);

  const progress = Math.min((time / targetTime) * 100, 100);
  const radius = 100;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const handleToggle = () => {
    triggerHaptic('medium');
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    triggerHaptic('light');
    setIsRunning(false);
    setTime(0);
  };

  const handleComplete = () => {
    setIsRunning(false);
    onComplete(time);
  };

  const timerColor = time >= targetTime ? '#30D158' : accentColor;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh]"
    >
      {/* Skill Info */}
      <div className="text-center mb-8">
        <span className="text-5xl">{skill.icon}</span>
        <h2 className="text-2xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>{skill.name}</h2>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{skill.description}</p>
      </div>

      {/* Timer Ring */}
      <div className="relative mb-8">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-20"
          style={{ background: timerColor }}
        />
        <svg width={240} height={240} className="transform -rotate-90 relative z-10">
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={timerColor} />
              <stop offset="100%" stopColor={timerColor} stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <circle
            cx={120}
            cy={120}
            r={radius}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth={12}
            opacity={0.3}
          />
          <motion.circle
            cx={120}
            cy={120}
            r={radius}
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5 }}
            style={{ filter: `drop-shadow(0 0 10px ${timerColor}50)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className="text-5xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {formatTime(time)}
          </span>
          <span className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Target: {formatTime(targetTime)}
          </span>
        </div>
      </div>

      {/* Target Time Adjustment */}
      {skill.id !== 'zone2' && (
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setTargetTime(Math.max(15, targetTime - 15))}
            className="w-12 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
            style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}
          >
            -15s
          </button>
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Target</span>
          <button
            onClick={() => setTargetTime(targetTime + 15)}
            className="w-12 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
            style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}
          >
            +15s
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="w-14 h-14 rounded-full flex items-center justify-center glass"
        >
          <RotateCcw size={24} style={{ color: 'var(--text-secondary)' }} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          className="w-20 h-20 rounded-full flex items-center justify-center text-white"
          style={{ 
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
            boxShadow: `0 0 25px ${accentColor}50`
          }}
        >
          {isRunning ? (
            <Pause size={32} fill="white" />
          ) : (
            <Play size={32} fill="white" className="ml-1" />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          disabled={time === 0}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            time === 0 ? 'opacity-50' : ''
          }`}
          style={{ 
            background: time === 0 ? 'var(--glass-bg)' : '#30D158',
            boxShadow: time > 0 ? '0 0 15px rgba(48, 209, 88, 0.3)' : undefined
          }}
        >
          <Check size={24} color="white" />
        </motion.button>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="mt-8 text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        ← Back to Skills
      </button>
    </motion.div>
  );
}

export default function SkillMode() {
  const { state, addSkillLog } = useApp();
  const [selectedSkill, setSelectedSkill] = useState<SkillOption | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [completedDuration, setCompletedDuration] = useState(0);

  const handleSkillSelect = (skill: SkillOption) => {
    triggerHaptic('light');
    setSelectedSkill(skill);
  };

  const handleComplete = (duration: number) => {
    if (!selectedSkill) return;
    
    addSkillLog({
      date: formatDate(new Date()),
      type: selectedSkill.id,
      duration,
    });

    setCompletedDuration(duration);
    setShowComplete(true);
    triggerHaptic('heavy');
  };

  // Completion screen
  if (showComplete && selectedSkill) {
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
          🎯
        </motion.div>
        <h1 className="text-3xl font-bold text-center mb-2 relative z-10" style={{ color: 'var(--text-primary)' }}>
          Skill Complete!
        </h1>
        <p className="text-center mb-8 relative z-10" style={{ color: 'var(--text-tertiary)' }}>
          You practiced {selectedSkill.name} for {formatTime(completedDuration)}
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setShowComplete(false);
            setSelectedSkill(null);
          }}
          className="px-8 py-3.5 rounded-full font-semibold text-white relative z-10"
          style={{ background: `linear-gradient(135deg, ${state.settings.accentColor} 0%, ${state.settings.accentColor}dd 100%)` }}
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  // Timer view
  if (selectedSkill) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen px-4 md:px-6 lg:px-8 pt-12 pb-4 max-w-4xl mx-auto"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-30" />
        <AnimatePresence mode="wait">
          <Timer
            key={selectedSkill.id}
            skill={selectedSkill}
            onComplete={handleComplete}
            onBack={() => setSelectedSkill(null)}
            accentColor={state.settings.accentColor}
          />
        </AnimatePresence>
      </motion.div>
    );
  }

  // Skill selection view
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
      
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-2 relative z-10"
        style={{ color: 'var(--text-primary)' }}
      >
        Skill Mode
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 relative z-10"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Choose a skill to practice
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 relative z-10">
        {SKILL_OPTIONS.map((skill, index) => (
          <motion.button
            key={skill.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSkillSelect(skill)}
            className="w-full glass rounded-2xl p-5 flex md:flex-col items-center md:items-start gap-4 text-left"
          >
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${state.settings.accentColor}15` }}
            >
              {skill.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{skill.name}</h3>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{skill.description}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-quaternary)' }}>
                Default: {formatTime(skill.defaultDuration)}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Recent Skills */}
      {state.skillLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 relative z-10"
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Sessions</h2>
          <div className="space-y-2">
            {state.skillLogs.slice(-5).reverse().map((log, index) => {
              const skill = SKILL_OPTIONS.find(s => s.id === log.type);
              return (
                <div
                  key={index}
                  className="rounded-xl p-3 flex items-center justify-between"
                  style={{ background: 'var(--card-bg)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{skill?.icon}</span>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{skill?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{log.date}</p>
                    </div>
                  </div>
                  <span 
                    className="text-sm px-3 py-1 rounded-full font-medium"
                    style={{ 
                      backgroundColor: `${state.settings.accentColor}15`,
                      color: state.settings.accentColor
                    }}
                  >
                    {formatTime(log.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
