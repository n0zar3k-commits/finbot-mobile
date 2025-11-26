import React, { useState, useRef, useEffect } from 'react';
import { Clock, Repeat, MoreHorizontal, Trash2, ArrowRight, Zap, Check, Flag } from 'lucide-react';
import { Task, RRule } from '../types';
import { formatTime, isOverdue, isToday } from '../services/utils';

interface TaskRowProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (task: Task) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onUpdate, onDelete, onComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editText, setEditText] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate({ ...task, title: editText.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  const snooze = (minutes: number) => {
    const base = task.dueAt ? new Date(task.dueAt) : new Date();
    base.setMinutes(base.getMinutes() + minutes);
    onUpdate({ ...task, dueAt: base.toISOString() });
    setShowMenu(false);
  };

  const moveToTomorrow = () => {
    const base = task.dueAt ? new Date(task.dueAt) : new Date();
    base.setDate(base.getDate() + 1);
    onUpdate({ ...task, dueAt: base.toISOString() });
    setShowMenu(false);
  };

  const setRecurring = (freq: RRule['freq']) => {
    const rule: RRule = { ver: 1, freq };
    onUpdate({ ...task, rrule: rule });
    setShowMenu(false);
  };

  const togglePriority = () => {
    const map: Record<string, any> = { low: 'normal', normal: 'high', high: 'urgent', urgent: 'low' };
    onUpdate({ ...task, priority: map[task.priority] });
  };

  const priorityColors = {
    low: 'text-slate-300',
    normal: 'text-blue-400',
    high: 'text-orange-400',
    urgent: 'text-red-500'
  };

  const overdue = task.dueAt && isOverdue(task.dueAt) && task.status === 'pending';
  const isDone = task.status === 'done';

  return (
    <div className={`group relative bg-surface p-4 mb-3 rounded-2xl transition-all duration-300 border border-transparent ${isDone ? 'opacity-50 grayscale-[0.5] shadow-none bg-slate-50' : 'shadow-soft hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-50/50'}`}>
      
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button 
          onClick={() => onComplete(task)}
          className={`relative flex-shrink-0 w-6 h-6 rounded-full border-[2px] mt-0.5 flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-primary border-primary' : 'border-slate-200 hover:border-primary/60 bg-white'}`}
        >
          <Check size={14} className={`text-white transition-all duration-200 ${isDone ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} strokeWidth={3} />
        </button>

        {/* Content */}
        <div className="flex-grow min-w-0">
          {isEditing ? (
            <input 
              ref={inputRef}
              className="w-full bg-transparent outline-none text-textMain font-medium placeholder:text-slate-300"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div className="flex flex-col cursor-pointer" onClick={() => setIsEditing(true)}>
              <span className={`text-[15px] font-medium leading-relaxed transition-colors ${isDone ? 'text-textSec line-through decoration-slate-300' : 'text-textMain'}`}>
                {task.title}
              </span>
              
              <div className="flex items-center flex-wrap gap-3 mt-1.5 min-h-[1.25rem]">
                {task.dueAt && (
                  <span className={`flex items-center text-xs font-semibold ${overdue ? 'text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md' : 'text-textSec'}`}>
                    <Clock size={11} className="mr-1.5" />
                    {isToday(task.dueAt) ? formatTime(task.dueAt) : new Date(task.dueAt).toLocaleDateString(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                  </span>
                )}
                {task.rrule && (
                  <span className="flex items-center text-xs text-indigo-500 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-md">
                    <Repeat size={10} className="mr-1" />
                    <span className="capitalize">{task.rrule.freq}</span>
                  </span>
                )}
                 {task.priority !== 'low' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); togglePriority(); }}
                    className={`flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors ${priorityColors[task.priority]}`}
                  >
                    <Flag size={10} className="mr-1 fill-current" />
                    <span className="capitalize">{task.priority}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Trigger */}
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          className="p-1.5 text-slate-300 hover:text-textMain hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-10 mt-1 w-48 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-black/5 rounded-xl z-30 overflow-hidden text-sm transform origin-top-right animate-fade-in">
            <div className="p-1">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</div>
              <button onClick={() => snooze(15)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-2.5 transition-colors">
                <Clock size={14} className="text-slate-400" /> Snooze 15m
              </button>
              <button onClick={() => snooze(60)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-2.5 transition-colors">
                <Zap size={14} className="text-slate-400" /> +1 Hour
              </button>
              <button onClick={moveToTomorrow} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-2.5 transition-colors">
                <ArrowRight size={14} className="text-slate-400" /> Tomorrow
              </button>
              <div className="h-px bg-slate-100 my-1 mx-2" />
              <button onClick={() => setRecurring('daily')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-2.5 transition-colors">
                <Repeat size={14} className="text-slate-400" /> Repeat Daily
              </button>
              <button onClick={() => onDelete(task.id)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-500 flex items-center gap-2.5 mt-1 transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(TaskRow);