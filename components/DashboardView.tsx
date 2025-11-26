import React from 'react';
import { Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Task, Project, User, Language } from '../types';
import { isToday, isOverdue, formatTime, priorityStyles, t, formatDate } from '../services/utils';

interface DashboardViewProps {
  tasks: Task[];
  projects: Project[];
  currentUser: User;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  lang: Language;
}

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, projects, currentUser, onTaskClick, onAddTask, lang }) => {
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'done');
  const todaysTasks = myTasks.filter(t => t.dueAt && isToday(t.dueAt));
  const overdueTasks = myTasks.filter(t => t.dueAt && isOverdue(t.dueAt) && !isToday(t.dueAt));

  const StatCard = ({ label, count, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <div>
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</div>
        <div className="text-2xl font-bold text-slate-800 dark:text-white">{count}</div>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24 md:pb-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('hello', lang)}, {currentUser.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('whatsUp', lang)}</p>
        </div>
        <button 
            onClick={onAddTask}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex-shrink-0"
        >
            <Plus size={18} /> <span className="hidden sm:inline">{t('newTask', lang)}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('myTasks', lang)} count={myTasks.length} icon={CheckCircle} color="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label={t('today', lang)} count={todaysTasks.length} icon={Clock} color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <StatCard label={t('overdue', lang)} count={overdueTasks.length} icon={AlertCircle} color="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
        <StatCard label={t('projects', lang)} count={projects.length} icon={CheckCircle} color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Today's Focus */}
        <section className="min-w-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-indigo-500" /> {t('today', lang)}
          </h2>
          {todaysTasks.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-400">
                {t('noTasksToday', lang)}
            </div>
          ) : (
            <div className="space-y-3">
              {todaysTasks.map(task => (
                <div 
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group gap-4"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-grow">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityStyles[task.priority].dot}`} />
                        <div className="min-w-0 flex-grow">
                            <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{task.title}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 truncate">
                                <span className="truncate">{projects.find(p => p.id === task.projectId)?.name}</span>
                                {task.dueAt && <span className="flex-shrink-0">• {formatTime(task.dueAt, lang)}</span>}
                            </div>
                        </div>
                    </div>
                    <div className={`text-[10px] px-2 py-1 rounded font-bold uppercase whitespace-nowrap ${priorityStyles[task.priority].badge}`}>
                        {task.priority}
                    </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Overdue / High Priority */}
        <section className="min-w-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" /> {t('attention', lang)}
          </h2>
          {overdueTasks.length === 0 ? (
             <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-400">
                {t('noOverdue', lang)}
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map(task => (
                <div 
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-red-400 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                    <div className="flex justify-between items-start gap-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate min-w-0 flex-grow">{task.title}</div>
                        <span className="text-xs font-bold text-red-500 whitespace-nowrap">{t('overdue', lang)}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                        {t('deadline', lang)} {formatDate(task.dueAt!, lang)}
                    </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardView;