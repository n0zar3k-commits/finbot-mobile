import React, { useState, useEffect, useRef } from 'react';
import { X, CheckSquare, Trash2, Clock, Send, Flag, AlignLeft, Save, CheckCircle } from 'lucide-react';
import { Task, Comment, User, ChecklistItem, Priority, Language } from '../types';
import { formatDateTime, priorityStyles, generateId, formatDate, priorityConfig, t } from '../services/utils';

interface TaskDetailModalProps {
  task: Task | null;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  currentUser?: User;
  lang: Language;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  task, 
  users, 
  isOpen, 
  onClose, 
  onUpdate,
  onDelete,
  currentUser,
  lang
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedTask(task);
    if (task) {
        setLocalTitle(task.title);
        setLocalDesc(task.description || '');
    }
  }, [task]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [editedTask?.comments.length]);

  if (!isOpen || !editedTask) return null;

  const handleSaveField = (field: keyof Task, value: any) => {
    const updated = { ...editedTask, [field]: value, updatedAt: new Date().toISOString() };
    setEditedTask(updated);
    onUpdate(updated);
  };

  const handleBlurTitle = () => {
    if (localTitle.trim() !== editedTask.title) handleSaveField('title', localTitle.trim());
  };

  const handleBlurDesc = () => {
    if (localDesc.trim() !== (editedTask.description || '')) handleSaveField('description', localDesc.trim());
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUser) return;
    const comment: Comment = {
      id: generateId(),
      userId: currentUser.id,
      text: newComment,
      createdAt: new Date().toISOString()
    };
    handleSaveField('comments', [...editedTask.comments, comment]);
    setNewComment('');
  };

  const handleAddCheckItem = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newCheckItem.trim()) {
      const item: ChecklistItem = { id: generateId(), text: newCheckItem, isChecked: false };
      handleSaveField('checklist', [...editedTask.checklist, item]);
      setNewCheckItem('');
    }
  };

  const toggleCheckItem = (itemId: string) => {
    const updatedChecklist = editedTask.checklist.map(item => 
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );
    handleSaveField('checklist', updatedChecklist);
  };

  const deleteCheckItem = (itemId: string) => {
    const updatedChecklist = editedTask.checklist.filter(item => item.id !== itemId);
    handleSaveField('checklist', updatedChecklist);
  };

  const toggleComplete = () => {
    handleSaveField('status', editedTask.status === 'done' ? 'pending' : 'done');
    onClose();
  };

  const activeUser = currentUser || users[0];
  const isDone = editedTask.status === 'done';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-start overflow-y-auto pt-10 pb-20 animate-fade-in">
      {/* Container to handle mobile scrolling properly */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[80vh] mx-4 relative ring-1 ring-white/10">
        
        {/* Main Content (Left/Top) */}
        <div className="flex-grow p-6 md:p-8 flex flex-col gap-6">
          {/* Header Input */}
          <div className="flex items-start gap-4">
            <button 
              onClick={toggleComplete} 
              className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-[2px] flex items-center justify-center transition-colors ${isDone ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}`}
            >
               {isDone && <CheckCircle size={14} className="text-white" />}
            </button>
            <input 
              className={`text-2xl font-bold bg-transparent w-full outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 ${isDone ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleBlurTitle}
              placeholder={t('newTask', lang)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
               <span className="text-xs font-bold uppercase">Status</span> 
               <span className={`font-semibold ${isDone ? 'text-green-600' : 'text-slate-700 dark:text-slate-300'}`}>
                 {isDone ? 'Done' : 'Pending'}
               </span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1">
               <Clock size={14} /> {formatDate(editedTask.createdAt, lang)}
            </span>
          </div>

          {/* Description */}
          <div className="group">
            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                <AlignLeft size={16} /> {t('description', lang)}
            </div>
            <textarea
                className="w-full min-h-[120px] p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm leading-relaxed transition-all dark:text-slate-200"
                placeholder={lang === 'ru' ? "Добавить описание..." : "Add description..."}
                value={localDesc}
                onChange={(e) => setLocalDesc(e.target.value)}
                onBlur={handleBlurDesc}
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    <CheckSquare size={16} /> {t('checklist', lang)}
                 </div>
                 {editedTask.checklist.length > 0 && (
                     <div className="text-xs text-slate-400 font-medium">
                        {Math.round((editedTask.checklist.filter(i=>i.isChecked).length / editedTask.checklist.length) * 100)}%
                     </div>
                 )}
            </div>
            
            <div className="space-y-2 mb-3">
                {editedTask.checklist.map(item => (
                    <div key={item.id} className="flex items-start gap-3 group/item">
                        <input 
                            type="checkbox" 
                            checked={item.isChecked}
                            onChange={() => toggleCheckItem(item.id)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary bg-transparent"
                        />
                        <span className={`flex-grow text-sm transition-all ${item.isChecked ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.text}
                        </span>
                        <button 
                            onClick={() => deleteCheckItem(item.id)}
                            className="text-slate-300 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
            
            <input 
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:text-slate-200"
                placeholder={lang === 'ru' ? "Добавить элемент..." : "Add item..."}
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={handleAddCheckItem}
            />
          </div>

          {/* Activity/Comments */}
          <div className="flex-grow flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                <Flag size={16} /> {t('activity', lang)}
            </div>
            
            <div className="flex-grow space-y-4 mb-4 overflow-y-auto max-h-60 pr-2">
                {editedTask.comments.map(comment => {
                    const author = users.find(u => u.id === comment.userId) || users[0];
                    return (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {author?.initials}
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-sm font-bold text-textMain dark:text-slate-200">{author?.name}</span>
                                    <span className="text-xs text-slate-400">{formatDateTime(comment.createdAt, lang)}</span>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-bl-xl rounded-br-xl rounded-tr-xl">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={commentsEndRef} />
            </div>

            <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {activeUser?.initials}
                </div>
                <div className="flex-grow relative">
                    <textarea 
                        className="w-full p-3 pr-10 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none shadow-sm dark:text-slate-200"
                        rows={2}
                        placeholder={lang === 'ru' ? "Комментарий..." : "Write a comment..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }}}
                    />
                    <button 
                        onClick={handleAddComment}
                        className="absolute right-2 bottom-2.5 p-1.5 text-primary hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                        disabled={!newComment.trim()}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls (Right/Bottom) */}
        <div className="w-full md:w-80 bg-slate-50/80 dark:bg-slate-800/50 p-6 flex flex-col gap-6 border-l border-slate-100 dark:border-slate-800">
           <div className="flex justify-between md:hidden items-center border-b border-slate-200 dark:border-slate-700 pb-4">
              <span className="font-bold text-slate-400">ACTIONS</span>
              <button onClick={onClose}><X size={24} className="text-slate-500" /></button>
           </div>
           
           <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
             <X size={20} />
           </button>

           <div className="space-y-6 mt-2 md:mt-8">
              
              {/* Assignee */}
              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t('assignee', lang)}</label>
                  <select 
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-slate-200"
                    value={editedTask.assigneeId || ''}
                    onChange={(e) => handleSaveField('assigneeId', e.target.value || undefined)}
                  >
                      <option value="">--</option>
                      {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
              </div>

              {/* Priority - Expanded with grid */}
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t('priority', lang)}</label>
                  <div className="grid grid-cols-3 gap-2">
                      {(['low', 'normal', 'medium', 'high', 'urgent', 'critical'] as Priority[]).map(p => (
                          <button
                            key={p}
                            onClick={() => handleSaveField('priority', p)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${editedTask.priority === p ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          >
                              <div className={`w-3 h-3 rounded-full mb-1 ${priorityStyles[p].dot}`} />
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{lang === 'ru' ? priorityConfig[p].labelRu : priorityConfig[p].labelEn}</span>
                          </button>
                      ))}
                  </div>
                  <p className="text-xs text-slate-400 italic mt-1">
                    {lang === 'ru' ? priorityConfig[editedTask.priority].descRu : priorityConfig[editedTask.priority].descEn}
                  </p>
              </div>

              {/* Date */}
              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t('deadline', lang)}</label>
                  <input 
                    type="date"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-slate-200"
                    value={editedTask.dueAt ? editedTask.dueAt.split('T')[0] : ''}
                    onChange={(e) => handleSaveField('dueAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />

              {/* Action Buttons */}
              <div className="flex gap-2">
                  <button 
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                      <Save size={16} /> {t('saveTask', lang)}
                  </button>
              </div>

              <div className="flex gap-2">
                   <button 
                    onClick={toggleComplete}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-colors ${isDone ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400'}`}
                  >
                      <CheckCircle size={16} /> {isDone ? 'Reopen' : t('complete', lang)}
                  </button>
                  <button 
                    onClick={() => { if (confirm(t('delete', lang) + '?')) { onDelete(editedTask.id); onClose(); }}}
                    className="px-3 py-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                      <Trash2 size={18} />
                  </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;