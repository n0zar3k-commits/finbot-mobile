
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, YAxis, Legend } from 'recharts';
import { Task, Language, Project, User } from '../types';
import { t, priorityConfig, getDayStart, getDayEnd, isOverdue } from '../services/utils';
import { PieChart, Activity, CheckCircle2, Circle, AlertCircle, Filter } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  currentUser: User;
  lang: Language;
  onNavigateToTasks: (filter: string) => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, projects, users, currentUser, lang, onNavigateToTasks }) => {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  const stats = useMemo(() => {
    // 1. Filter base tasks by Project and Assignee
    let filteredTasks = tasks;
    if (selectedProject !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.projectId === selectedProject);
    }
    if (selectedAssignee !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.assigneeId === selectedAssignee);
    }

    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'done').length;
    const pending = total - completed;
    const overdueCount = filteredTasks.filter(t => t.dueAt && isOverdue(t.dueAt) && t.status !== 'done').length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    // 2. Trend Data (Created vs Completed)
    const days = parseInt(timeRange);
    const activityData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = getDayStart(d);
      const end = getDayEnd(d);
      
      // Created on this day
      const createdCount = filteredTasks.filter(t => {
          const c = new Date(t.createdAt);
          return c >= start && c <= end;
      }).length;

      // Completed on this day
      const completedCount = filteredTasks.filter(t => {
          if (t.status === 'done' && t.completedAt) {
              const c = new Date(t.completedAt);
              return c >= start && c <= end;
          }
          return false;
      }).length;
      
      activityData.push({
        name: d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' }),
        created: createdCount,
        completed: completedCount
      });
    }

    // 3. Priority Distribution
    const priorityData = Object.keys(priorityConfig).map(p => {
        const count = filteredTasks.filter(t => t.priority === p && t.status !== 'done').length;
        return {
            name: lang === 'ru' ? priorityConfig[p as keyof typeof priorityConfig].labelRu : priorityConfig[p as keyof typeof priorityConfig].labelEn,
            count: count,
            color: priorityConfig[p as keyof typeof priorityConfig].dot.replace('bg-', ''),
            key: p
        };
    }).filter(d => d.count > 0);

    // Map tailwind classes to hex for charts
    const priorityColors: Record<string, string> = {
        'slate-400': '#94a3b8',
        'emerald-500': '#10b981',
        'blue-500': '#3b82f6',
        'orange-500': '#f97316',
        'red-500': '#ef4444',
        'purple-600': '#9333ea'
    };

    return { total, completed, pending, overdueCount, rate, activityData, priorityData, priorityColors };
  }, [tasks, timeRange, selectedProject, selectedAssignee, lang]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-24 md:pb-6">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <PieChart className="text-indigo-500" /> {t('analytics', lang)}
          </h1>
          
          <div className="flex flex-wrap gap-2">
              {/* Time Range */}
              <select 
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none dark:text-slate-200"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
              >
                  <option value="7">{t('last7Days', lang)}</option>
                  <option value="30">{t('last30Days', lang)}</option>
                  <option value="90">{t('last90Days', lang)}</option>
              </select>

              {/* Project Filter */}
              <select 
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none dark:text-slate-200 max-w-[150px]"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                  <option value="all">{t('all', lang)} {t('projects', lang).toLowerCase()}</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              {/* Assignee Filter */}
               <select 
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none dark:text-slate-200 max-w-[150px]"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
              >
                  <option value="all">{t('all', lang)} {t('filterByAssignee', lang).toLowerCase()}</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div onClick={() => onNavigateToTasks('all')} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-indigo-200 transition-colors group">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t('totalTasks', lang)}</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-default">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t('completionRate', lang)}</div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.rate}%</div>
        </div>
        <div onClick={() => onNavigateToTasks('overdue')} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-red-200 transition-colors group">
            <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><AlertCircle size={14}/> {t('overdue', lang)}</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white group-hover:text-red-500">{stats.overdueCount}</div>
        </div>
        <div onClick={() => onNavigateToTasks('myTasks')} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-emerald-200 transition-colors group">
            <div className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">{t('completed', lang)}</div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Created vs Completed Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" /> {t('createdVsCompleted', lang)}
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.activityData}>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#94a3b8'}} 
                            dy={10}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar name={t('created', lang)} dataKey="created" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar name={t('completed', lang)} dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Priority Breakdown (Drill Down) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Circle size={18} className="text-orange-500" /> {t('tasksByPriority', lang)} (Pending)
            </h3>
            <div className="h-64">
                 {stats.priorityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.priorityData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false}
                                width={100}
                                tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 500}} 
                            />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                {stats.priorityData.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={stats.priorityColors[entry.color] || '#6366f1'} 
                                      className="cursor-pointer hover:opacity-80"
                                      onClick={() => {
                                          // Note: Drilling down to specific priority isn't directly supported by dashboard simple filter yet without complex logic,
                                          // but we can at least take them to the board. 
                                          // For now, let's keep it visually interactive but maybe just go to dashboard.
                                          onNavigateToTasks('all'); 
                                      }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 ) : (
                     <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                         No pending tasks
                     </div>
                 )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsView;