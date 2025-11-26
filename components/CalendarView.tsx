
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, Language } from '../types';
import { getMonthGrid, isToday, priorityStyles, t } from '../services/utils';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newDate: Date) => void;
  lang: Language;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick, onTaskDrop, lang }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const days = getMonthGrid(year, month);
  const weekDays = lang === 'ru' 
    ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
        const newDate = new Date(date);
        newDate.setHours(12, 0, 0, 0);
        onTaskDrop(taskId, newDate);
    }
  };

  const monthName = currentDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden m-4 md:m-6">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {capitalizedMonth}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">{t('today', lang)}</button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="flex-grow grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-r border-slate-100 dark:border-slate-700" />;

          const dateStr = date.toISOString();
          const dayTasks = tasks.filter(t => {
            if (!t.dueAt) return false;
            const d = new Date(t.dueAt);
            return d.getDate() === date.getDate() && 
                   d.getMonth() === date.getMonth() && 
                   d.getFullYear() === date.getFullYear();
          });

          const isCurrentDay = isToday(dateStr);

          return (
            <div 
                key={dateStr}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
                className={`min-h-[100px] p-2 border-b border-r border-slate-100 dark:border-slate-700 transition-colors ${isCurrentDay ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
              <div className={`text-xs font-medium mb-2 w-6 h-6 flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-500 dark:text-slate-400'}`}>
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayTasks.map(task => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                    className={`text-[10px] px-1.5 py-1 rounded border truncate cursor-move shadow-sm active:cursor-grabbing hover:opacity-80 ${priorityStyles[task.priority].badge} bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-600`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;