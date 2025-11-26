
import React, { useState, useMemo, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Plus, Calendar, Filter, X, Search, ChevronDown, Edit2 } from 'lucide-react';
import { Task, Project, User, Language, Priority } from '../types';
import { isToday, isOverdue, formatTime, priorityStyles, t, formatDate, getPriorityLabel } from '../services/utils';

interface DashboardViewProps {
  tasks: Task[];
  projects: Project[];
  currentUser: User;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  onUpdateTask: (task: Task) => void;
  lang: Language;
  initialFilter?: string | null;
}

type FilterType = 'all' | 'today' | 'overdue' | 'myTasks' | string; // string for project IDs

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, projects, currentUser, onTaskClick, onAddTask, onUpdateTask, lang, initialFilter }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync initial filter from props (e.g. from Analytics drill down)
  useEffect(() => {
      if (initialFilter) {
          setActiveFilter(initialFilter);
      }
  }, [initialFilter]);

  // Base Data
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'done');
  const todaysTasksRaw = myTasks.filter(t => t.dueAt && isToday(t.dueAt));
  const overdueTasksRaw = myTasks.filter(t => t.dueAt && isOverdue(t.dueAt) && !isToday(t.dueAt));

  // Next 7 Days Calculation
  const nextWeekTasks = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return myTasks.filter(t => {
        if (!t.dueAt) return false;
        const d = new Date(t.dueAt);
        return d > today && d <= nextWeek;
    }).sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());
  }, [myTasks]);

  // Main Filtering Logic
  const filteredTasks = useMemo(() => {
      let result = myTasks;
      if (activeFilter === 'today') result = todaysTasksRaw;
      else if (activeFilter === 'overdue') result = overdueTasksRaw;
      else if (activeFilter === 'myTasks') result = myTasks;
      else if (activeFilter.startsWith('project-')) {
          const pid = activeFilter.replace('project-', '');
          result = myTasks.filter(t => t.projectId === pid);
      } else if (activeFilter === 'all') {
          result = tasks; // Show all tasks for all users if 'all' is explicitly selected via project dropdown
      }
      
      // Apply Search
      if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          result = result.filter(t => 
             t.title.toLowerCase().includes(q) || 
             t.tags.some(tag => tag.name.toLowerCase().includes(q))
          );
      }

      return result;
  }, [activeFilter, myTasks, todaysTasksRaw, overdueTasksRaw, searchQuery, tasks]);

  const StatCard = ({ label, count, icon: Icon, color, filterKey, isActive }: any) => (
    <button 
        onClick={() => setActiveFilter(filterKey)}
        className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border text-left transition-all ${isActive ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}
    >
      <div>
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</div>
        <div className="text-2xl font-bold text-slate-800 dark:text-white">{count}</div>
      </div>
      <div className={`p-3 rounded-xl mt-2 inline-flex ${color}`}>
        <Icon size={20} />
      </div>
    </button>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24 md:pb-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('hello', lang)}, {currentUser.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('whatsUp', lang)}</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-grow md:flex-grow-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    className="w-full md:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all placeholder:text-slate-400"
                    placeholder={t('searchPlaceholder', lang) + " (Ctrl+K)"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
            <button 
                onClick={onAddTask}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex-shrink-0"
            >
                <Plus size={18} /> <span className="hidden sm:inline">{t('newTask', lang)}</span>
            </button>
        </div>
      </div>

      {/* Stats / Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('myTasks', lang)} count={myTasks.length} icon={CheckCircle} color="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" filterKey="myTasks" isActive={activeFilter === 'myTasks'} />
        <StatCard label={t('today', lang)} count={todaysTasksRaw.length} icon={Clock} color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" filterKey="today" isActive={activeFilter === 'today'} />
        <StatCard label={t('overdue', lang)} count={overdueTasksRaw.length} icon={AlertCircle} color="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" filterKey="overdue" isActive={activeFilter === 'overdue'} />
        <StatCard label={t('projects', lang)} count={projects.length} icon={CheckCircle} color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" filterKey="all" isActive={activeFilter === 'all'} />
      </div>

      {/* Project Filter (Dropdown style for many projects) */}
      <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('filterByProject', lang)}:</span>
          <div className="flex gap-2">
            <button 
                onClick={() => setActiveFilter('all')} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === 'all' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
            >
                {t('all', lang)}
            </button>
            <div className="relative">
                <select 
                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer hover:border-indigo-300 dark:text-slate-300 ${activeFilter.startsWith('project') ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500' : ''}`}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    value={activeFilter.startsWith('project') ? activeFilter : ''}
                >
                    <option value="" disabled>{t('selectProject', lang)}</option>
                    {projects.map(p => (
                        <option key={p.id} value={`project-${p.id}`}>{p.name}</option>
                    ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Main Task List (Based on Filter) */}
        <section className="min-w-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 capitalize">
             {activeFilter === 'today' && <Clock size={20} className="text-indigo-500" />}
             {activeFilter === 'overdue' && <AlertCircle size={20} className="text-red-500" />}
             {activeFilter.startsWith('project') && <Filter size={20} className="text-emerald-500" />}
             {activeFilter === 'today' ? t('today', lang) : activeFilter === 'overdue' ? t('overdue', lang) : activeFilter === 'myTasks' ? t('myTasks', lang) : t('all', lang)}
          </h2>
          
          {filteredTasks.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-400">
                <p className="mb-2">{activeFilter === 'overdue' ? t('noOverdue', lang) : t('noTasksToday', lang)}</p>
                {activeFilter !== 'overdue' && (
                    <button onClick={onAddTask} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">{t('newTask', lang)}</button>
                )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div 
                    key={task.id}
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex items-center justify-between group gap-4 relative"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-grow cursor-pointer" onClick={() => onTaskClick(task)}>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onUpdateTask({...task, status: 'done', completedAt: new Date().toISOString()}); }}
                            className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex-shrink-0"
                         />
                        <div className="min-w-0 flex-grow">
                            <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{task.title}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 truncate">
                                {task.projectId && <span className="bg-slate-100 dark:bg-slate-700 px-1.5 rounded text-[10px]">{projects.find(p => p.id === task.projectId)?.name}</span>}
                                {task.dueAt && <span className={`flex-shrink-0 ${isOverdue(task.dueAt) ? 'text-red-500 font-bold' : ''}`}>• {formatTime(task.dueAt, lang)}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`text-[10px] px-2 py-1 rounded font-bold uppercase whitespace-nowrap ${priorityStyles[task.priority].badge}`}>
                            {getPriorityLabel(task.priority, lang)}
                        </div>
                        <button 
                            onClick={() => onTaskClick(task)}
                            className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                        >
                            <Edit2 size={14} />
                        </button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Next 7 Days or Overdue (if not filtered) */}
        <section className="min-w-0 space-y-8">
            {activeFilter !== 'overdue' && overdueTasksRaw.length > 0 && (
                <div>
                     <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-500" /> {t('attention', lang)}
                    </h2>
                    <div className="space-y-3">
                        {overdueTasksRaw.slice(0, 3).map(task => (
                            <div key={task.id} onClick={() => onTaskClick(task)} className="bg-white dark:bg-slate-800 p-3 rounded-xl border-l-4 border-red-400 shadow-sm hover:shadow-md cursor-pointer">
                                <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{task.title}</div>
                                <div className="text-xs text-red-500 font-bold mt-1">{t('overdue', lang)} {formatDate(task.dueAt!, lang)}</div>
                            </div>
                        ))}
                         <button 
                            onClick={() => setActiveFilter('overdue')} 
                            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"
                         >
                            Show all {overdueTasksRaw.length} overdue
                         </button>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-500" /> {t('next7Days', lang)}
                </h2>
                {nextWeekTasks.length === 0 ? (
                    <div className="text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-center">{t('noUpcomingTasks', lang)}</div>
                ) : (
                    <div className="space-y-3">
                        {nextWeekTasks.map(task => (
                             <div 
                                key={task.id}
                                onClick={() => onTaskClick(task)}
                                className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center"
                            >
                                <div className="min-w-0">
                                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate text-sm">{task.title}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{formatDate(task.dueAt!, lang)} • {formatTime(task.dueAt!, lang)}</div>
                                </div>
                                 <div className={`w-2 h-2 rounded-full ${priorityStyles[task.priority].dot}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardView;