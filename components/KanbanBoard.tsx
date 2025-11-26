
import React, { useState } from 'react';
import { Plus, Calendar, CheckSquare, MessageSquare, AlertCircle, ArrowDownWideNarrow, User as UserIcon, Filter, X } from 'lucide-react';
import { Task, Project, User, Language, Priority } from '../types';
import { formatDate, priorityStyles, t, isOverdue, getPriorityLabel } from '../services/utils';

interface KanbanBoardProps {
  project: Project;
  tasks: Task[];
  users: User[];
  currentUser?: User;
  onTaskMove: (taskId: string, newColumnId: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  onCreateTask: (title: string, columnId: string) => void; // Inline create
  onUpdateTask: (task: Task) => void;
  lang: Language;
}

type SortOption = 'default' | 'date' | 'priority';

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  project, 
  tasks, 
  users,
  currentUser,
  onTaskMove, 
  onTaskClick,
  onAddTask,
  onCreateTask,
  onUpdateTask,
  lang
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  
  // Filters
  const [activeAssignee, setActiveAssignee] = useState<string | 'all'>('all');
  const [activePriorities, setActivePriorities] = useState<Priority[]>([]);

  // Inline Create
  const [inlineColId, setInlineColId] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState('');

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTaskId) {
      onTaskMove(draggedTaskId, columnId);
      setDraggedTaskId(null);
    }
  };

  const getUser = (id?: string) => users.find(u => u.id === id);

  const cyclePriority = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const priorities: Priority[] = ['low', 'normal', 'medium', 'high', 'urgent', 'critical'];
    const idx = priorities.indexOf(task.priority);
    const next = priorities[(idx + 1) % priorities.length];
    onUpdateTask({ ...task, priority: next });
  };

  const cycleAssignee = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (users.length === 0) return;
    
    const currentIdx = users.findIndex(u => u.id === task.assigneeId);
    let nextAssigneeId: string | undefined;

    if (currentIdx === -1) {
        nextAssigneeId = users[0].id;
    } else if (currentIdx === users.length - 1) {
        nextAssigneeId = undefined; 
    } else {
        nextAssigneeId = users[currentIdx + 1].id;
    }
    
    onUpdateTask({ ...task, assigneeId: nextAssigneeId });
  };

  const handleInlineSubmit = (columnId: string) => {
      if (inlineTitle.trim()) {
          onCreateTask(inlineTitle.trim(), columnId);
      }
      setInlineTitle('');
      setInlineColId(null);
  };

  const getFilteredTasks = (columnTasks: Task[]) => {
      let filtered = columnTasks;

      // Filter by Assignee
      if (activeAssignee !== 'all') {
          filtered = filtered.filter(t => t.assigneeId === activeAssignee);
      }

      // Filter by Priority
      if (activePriorities.length > 0) {
          filtered = filtered.filter(t => activePriorities.includes(t.priority));
      }

      return filtered;
  };

  const getSortedTasks = (columnTasks: Task[]) => {
      if (sortBy === 'default') return columnTasks;
      
      const sorted = [...columnTasks];
      if (sortBy === 'date') {
          sorted.sort((a, b) => {
              if (!a.dueAt) return 1;
              if (!b.dueAt) return -1;
              return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
          });
      } else if (sortBy === 'priority') {
          const weight: Record<string, number> = { critical: 5, urgent: 4, high: 3, medium: 2, normal: 1, low: 0 };
          sorted.sort((a, b) => weight[b.priority] - weight[a.priority]);
      }
      return sorted;
  };

  const getColumnTitle = (title: string) => {
    if (title === 'Backlog') return t('backlog', lang);
    if (title === 'In Progress') return t('inProgress', lang);
    if (title === 'Done') return t('done', lang);
    return title;
  };

  const togglePriorityFilter = (p: Priority) => {
      setActivePriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  return (
    <div className="flex flex-col h-full">
        {/* Toolbar: Filters & Sort */}
        <div className="px-6 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Filters */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                 {/* Assignee Filter */}
                 <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{t('filterByAssignee', lang)}</span>
                     <select 
                        className="bg-slate-100 dark:bg-slate-800 text-xs font-medium px-2 py-1 rounded-lg border-none outline-none text-slate-700 dark:text-slate-300"
                        value={activeAssignee}
                        onChange={(e) => setActiveAssignee(e.target.value)}
                     >
                         <option value="all">{t('all', lang)}</option>
                         {currentUser && <option value={currentUser.id}>{t('me', lang)}</option>}
                         {users.filter(u => u.id !== currentUser?.id).map(u => (
                             <option key={u.id} value={u.id}>{u.name}</option>
                         ))}
                     </select>
                 </div>

                 <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

                 {/* Priority Filter */}
                 <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{t('filterByPriority', lang)}</span>
                     <div className="flex gap-1">
                        {(['high', 'urgent', 'critical'] as Priority[]).map(p => (
                            <button
                                key={p}
                                onClick={() => togglePriorityFilter(p)}
                                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${activePriorities.includes(p) ? 'border-indigo-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            >
                                <div className={`w-3 h-3 rounded-full ${priorityStyles[p].dot}`} />
                            </button>
                        ))}
                     </div>
                 </div>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ArrowDownWideNarrow size={14} /> {t('sortBy', lang)}:
                </span>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                    <button onClick={() => setSortBy('default')} className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${sortBy === 'default' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500'}`}>{t('sortDefault', lang)}</button>
                    <button onClick={() => setSortBy('date')} className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${sortBy === 'date' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500'}`}>{t('sortDate', lang)}</button>
                    <button onClick={() => setSortBy('priority')} className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${sortBy === 'priority' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500'}`}>{t('sortPriority', lang)}</button>
                </div>
            </div>
        </div>

        {/* Board Container */}
        <div className="flex-grow flex overflow-x-auto overflow-y-hidden pb-4 gap-4 px-4 snap-x snap-mandatory md:px-6">
        {project.columns.sort((a, b) => a.order - b.order).map(column => {
            const rawTasks = tasks.filter(t => t.columnId === column.id);
            const filteredTasks = getFilteredTasks(rawTasks);
            const columnTasks = getSortedTasks(filteredTasks);
            const hasOverdueTasks = rawTasks.some(t => t.dueAt && isOverdue(t.dueAt) && t.status !== 'done');
            
            const isLimitExceeded = column.wipLimit && rawTasks.length > column.wipLimit;

            return (
            <div 
                key={column.id}
                className="flex-shrink-0 w-[85vw] md:w-80 flex flex-col h-full snap-center"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
            >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-4 px-1 group">
                <div className="flex items-center gap-2">
                    <h3 className={`font-semibold truncate max-w-[150px] ${isLimitExceeded ? 'text-red-500' : 'text-textMain dark:text-white'}`}>
                        {getColumnTitle(column.title)}
                    </h3>
                    <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLimitExceeded ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                           {rawTasks.length} {column.wipLimit ? `/ ${column.wipLimit}` : ''}
                        </span>
                        {isLimitExceeded && (
                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter" title={t('limitExceeded', lang)}>(!)</span>
                        )}
                        {hasOverdueTasks && (
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1" title="Contains overdue tasks" />
                        )}
                    </div>
                </div>
                <button 
                    onClick={() => onAddTask(column.id)}
                    className="p-1 text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition-colors"
                >
                    <Plus size={18} />
                </button>
                </div>

                {/* Column Drop Zone */}
                <div className={`flex-grow rounded-2xl transition-colors duration-200 overflow-y-auto ${draggedTaskId ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-100 dark:border-indigo-900' : ''}`}>
                <div className="flex flex-col gap-3 pb-20 p-1 min-h-[150px]">
                    
                    {/* Inline Task Creator */}
                    {inlineColId === column.id && (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-md border-2 border-indigo-500 animate-slide-up">
                            <input 
                                autoFocus
                                className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400"
                                placeholder={t('quickAddPlaceholder', lang)}
                                value={inlineTitle}
                                onChange={(e) => setInlineTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleInlineSubmit(column.id);
                                    if (e.key === 'Escape') setInlineColId(null);
                                }}
                                onBlur={() => { if (!inlineTitle) setInlineColId(null); }}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onMouseDown={() => setInlineColId(null)} className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1">{t('cancel', lang)}</button>
                                <button onMouseDown={() => handleInlineSubmit(column.id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-bold hover:bg-indigo-700">{t('create', lang)}</button>
                            </div>
                        </div>
                    )}

                    {columnTasks.length === 0 && !inlineColId && (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl m-2 p-6 text-center group/empty">
                            <span className="text-slate-300 dark:text-slate-600 text-sm font-medium mb-2">{t('dragTaskHere', lang)}</span>
                            <button 
                                onClick={() => { setInlineColId(column.id); setInlineTitle(''); }}
                                className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg opacity-0 group-hover/empty:opacity-100 transition-opacity"
                            >
                                + {t('newTask', lang)}
                            </button>
                        </div>
                    )}

                    {columnTasks.map(task => {
                    const assignee = getUser(task.assigneeId);
                    const commentsCount = task.comments.length;
                    const checklistTotal = task.checklist.length;
                    const checklistDone = task.checklist.filter(i => i.isChecked).length;
                    const isDone = task.status === 'done';
                    const isTaskOverdue = task.dueAt && isOverdue(task.dueAt) && !isDone;

                    return (
                        <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onTaskClick(task)}
                        className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:shadow-md hover:border-indigo-100 dark:hover:border-slate-600 transition-all active:cursor-grabbing group min-h-[100px] flex flex-col ${isDone ? 'opacity-60' : ''}`}
                        >
                        <div className="flex justify-between items-start mb-2">
                            {/* Quick Priority Toggle */}
                            <button 
                                onClick={(e) => cyclePriority(e, task)}
                                className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider hover:opacity-80 transition-opacity ${priorityStyles[task.priority].badge}`}
                                title="Click to cycle priority"
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${priorityStyles[task.priority].dot}`} />
                                {getPriorityLabel(task.priority, lang)}
                            </button>
                        </div>

                        <h4 className={`text-sm font-medium text-textMain dark:text-white mb-3 leading-snug break-words line-clamp-2 ${isDone ? 'line-through decoration-slate-400' : ''}`}>
                            {task.title}
                        </h4>

                        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50 dark:border-slate-700/50">
                            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                            {task.dueAt && (
                                <div className={`flex items-center gap-1 text-xs ${isTaskOverdue ? 'text-red-500 font-bold' : ''}`}>
                                    {isTaskOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                                    <span>
                                        {formatDate(task.dueAt, lang)}
                                        {isTaskOverdue && <span className="hidden sm:inline"> ({t('overdue', lang)})</span>}
                                    </span>
                                </div>
                            )}
                            {(checklistTotal > 0) && (
                                <div className="flex items-center gap-1 text-xs">
                                <CheckSquare size={12} />
                                <span>{checklistDone}/{checklistTotal}</span>
                                </div>
                            )}
                            {(commentsCount > 0) && (
                                <div className="flex items-center gap-1 text-xs">
                                <MessageSquare size={12} />
                                <span>{commentsCount}</span>
                                </div>
                            )}
                            </div>

                            <button 
                                onClick={(e) => cycleAssignee(e, task)}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-1 ring-white dark:ring-slate-700 transition-transform hover:scale-110 ${assignee ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`} 
                                title={assignee ? `Assignee: ${assignee.name} (Click to change)` : "Unassigned (Click to assign)"}
                            >
                                {assignee ? assignee.initials : <UserIcon size={12} />}
                            </button>
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
            </div>
            );
        })}
        </div>
    </div>
  );
};

export default KanbanBoard;