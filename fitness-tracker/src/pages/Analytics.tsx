import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { useApp } from '../App';

export default function Analytics() {
  const { state } = useApp();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalWorkouts = state.workoutLogs.filter(l => l.completed).length;
    
    // Average RPE
    const allSets = state.workoutLogs.flatMap(l => 
      l.exercises.flatMap(e => e.sets)
    );
    const avgRPE = allSets.length > 0
      ? allSets.reduce((acc, s) => acc + s.rpe, 0) / allSets.length
      : 0;

    // Weekly completion rate (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentLogs = state.workoutLogs.filter(l => 
      new Date(l.date) >= fourWeeksAgo && l.completed
    );
    const consistencyRate = Math.min((recentLogs.length / 20) * 100, 100); // 20 workout days in 4 weeks

    return {
      totalWorkouts,
      avgRPE: avgRPE.toFixed(1),
      consistencyRate: consistencyRate.toFixed(0),
      totalSkillSessions: state.skillLogs.length,
    };
  }, [state.workoutLogs, state.skillLogs]);

  // Prepare chart data
  const progressChartData = useMemo(() => {
    return state.progressData
      .slice(-10)
      .map(p => ({
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pullUps: p.pullUpMax,
        dips: p.dipsMax,
      }));
  }, [state.progressData]);

  // Weekly completion chart data
  const weeklyData = useMemo(() => {
    const weeks: { week: string; completed: number }[] = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const completed = state.workoutLogs.filter(l => {
        const logDate = new Date(l.date);
        return logDate >= weekStart && logDate <= weekEnd && l.completed;
      }).length;
      
      weeks.push({
        week: `Week ${4 - i}`,
        completed,
      });
    }
    
    return weeks;
  }, [state.workoutLogs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 pt-12 pb-4 container-app"
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
        Analytics
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 relative z-10"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Track your progress over time
      </motion.p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20" style={{ background: state.settings.accentColor }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${state.settings.accentColor}20` }}>
              <Award size={16} style={{ color: state.settings.accentColor }} />
            </div>
          </div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Workouts</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalWorkouts}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20" style={{ background: '#FF9F0A' }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 159, 10, 0.15)' }}>
              <Target size={16} color="#FF9F0A" />
            </div>
          </div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Avg RPE</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.avgRPE}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20" style={{ background: '#30D158' }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(48, 209, 88, 0.15)' }}>
              <TrendingUp size={16} color="#30D158" />
            </div>
          </div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Consistency</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.consistencyRate}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20" style={{ background: '#FF453A' }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 69, 58, 0.15)' }}>
              <Flame size={16} color="#FF453A" />
            </div>
          </div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Streak</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{state.currentStreak}</p>
          <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>days</p>
        </motion.div>
      </div>

      {/* Pull-Up Progression Chart */}
      {progressChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-premium rounded-2xl p-4 mb-5 relative z-10"
        >
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Pull-Up Progression</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressChartData}>
                <defs>
                  <linearGradient id="pullUpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={state.settings.accentColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={state.settings.accentColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-quaternary)" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-quaternary)" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    backdropFilter: 'blur(20px)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pullUps"
                  stroke={state.settings.accentColor}
                  fill="url(#pullUpGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Dips Progression Chart */}
      {progressChartData.length > 0 && progressChartData.some(d => d.dips > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-premium rounded-2xl p-4 mb-5 relative z-10"
        >
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Dips Progression</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressChartData}>
                <defs>
                  <linearGradient id="dipsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#30D158" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#30D158" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-quaternary)" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-quaternary)" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    backdropFilter: 'blur(20px)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="dips"
                  stroke="#30D158"
                  fill="url(#dipsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Weekly Completion Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-4 mb-5 relative z-10"
      >
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Completion</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <XAxis 
                dataKey="week" 
                stroke="var(--text-quaternary)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="var(--text-quaternary)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#FF9F0A"
                strokeWidth={2}
                dot={{ fill: '#FF9F0A', strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass rounded-2xl p-4 relative z-10"
      >
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {state.achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`text-center p-3 rounded-xl transition-all ${
                achievement.unlocked ? '' : 'opacity-40'
              }`}
              style={{ background: achievement.unlocked ? 'var(--card-bg)' : 'var(--glass-bg)' }}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{achievement.name}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Empty State */}
      {progressChartData.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 relative z-10"
        >
          <span className="text-5xl">📊</span>
          <p className="mt-4" style={{ color: 'var(--text-tertiary)' }}>
            Complete workouts to see your progress charts!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
