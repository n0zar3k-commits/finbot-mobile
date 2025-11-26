import React, { useState } from 'react';
import { Plus, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import { Task, Project, User, Language } from '../types';
import { formatDate, priorityStyles, t } from '../services/utils';

interface KanbanBoardProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onTaskMove: (taskId: string, newColumnId: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  lang: Language;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  project, 
  tasks, 
  users,
  onTaskMove, 
  onTaskClick,
  onAddTask,
  lang
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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

  return (
    // Updated container: scroll snap and fixed min-widths for mobile to prevent squishing
    <div className="flex h-full overflow-x-auto overflow-y-hidden pb-4 gap-4 px-4 snap-x snap-mandatory md:px-6">
      {project.columns.sort((a, b) => a.order - b.order).map(column => {
        const columnTasks = tasks.filter(t => t.columnId === column.id);
        
        return (
          <div 
            key={column.id}
            // Mobile: 85vw width ensures it takes up most of screen. Desktop: fixed 80/20rem
            className="flex-shrink-0 w-[85vw] md:w-80 flex flex-col h-full snap-center"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-4 px-1 group">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-textMain dark:text-white truncate max-w-[150px]">{column.title}</h3>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  {columnTasks.length}
                </span>
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
              <div className="flex flex-col gap-3 pb-20 p-1">
                {columnTasks.map(task => {
                  const assignee = getUser(task.assigneeId);
                  const commentsCount = task.comments.length;
                  const checklistTotal = task.checklist.length;
                  const checklistDone = task.checklist.filter(i => i.isChecked).length;
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onTaskClick(task)}
                      className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:shadow-md hover:border-indigo-100 dark:hover:border-slate-600 transition-all active:cursor-grabbing group min-h-[100px] flex flex-col ${isDone ? 'opacity-60' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex flex-wrap gap-1.5 mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${priorityStyles[task.priority].badge}`}>
                              {task.priority}
                            </span>
                         </div>
                      </div>

                      <h4 className={`text-sm font-medium text-textMain dark:text-white mb-3 leading-snug break-words line-clamp-2 ${isDone ? 'line-through decoration-slate-400' : ''}`}>
                        {task.title}
                      </h4>

                      <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                          {task.dueAt && (
                            <div className={`flex items-center gap-1 text-xs ${new Date(task.dueAt) < new Date() && !isDone ? 'text-red-500 font-medium' : ''}`}>
                              <Calendar size={12} />
                              <span>{formatDate(task.dueAt, lang)}</span>
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

                        {assignee && (
                          <div 
                            className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-slate-700 flex-shrink-0"
                            title={assignee.name}
                          >
                            {assignee.initials}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                <button 
                  onClick={() => onAddTask(column.id)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 rounded-lg text-sm transition-colors text-left"
                >
                  <Plus size={16} />
                  <span>{t('newTask', lang)}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;