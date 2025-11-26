
import React, { useState, useEffect, useRef } from 'react';
import { X, CheckSquare, Trash2, Clock, Send, Flag, AlignLeft, Save, CheckCircle, Hash, Tag as TagIcon, Bell, Repeat, Folder, History, Activity, Calendar } from 'lucide-react';
import { Task, Comment, User, ChecklistItem, Priority, Language, Project, Tag, HistoryItem } from '../types';
import { formatDateTime, priorityStyles, generateId, formatDate, priorityConfig, t } from '../services/utils';

interface TaskDetailModalProps {
  task: Task | null;
  users: User[];
  projects: Project[];
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
  projects,
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
  const [newTag, setNewTag] = useState('');
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
  }, [editedTask?.comments.length, editedTask?.history?.length]);

  if (!isOpen || !editedTask) return null;

  const addHistory = (action: HistoryItem['action'], details: string) => {
    if (!currentUser) return [];
    const item: HistoryItem = {
        id: generateId(),
        userId: currentUser.id,
        action,
        details,
        createdAt: new Date().toISOString()
    };
    return [...(editedTask.history || []), item];
  };

  const handleSaveField = (field: keyof Task, value: any, historyDetails?: string) => {
    const history = historyDetails ? addHistory('status_change', historyDetails) : editedTask.history;
    const updated = { ...editedTask, [field]: value, history, updatedAt: new Date().toISOString() };
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

  const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newTag.trim()) {
          const tag: Tag = { id: generateId(), name: newTag.trim(), color: 'bg-indigo-100 text-indigo-700' };
          handleSaveField('tags', [...(editedTask.tags || []), tag]);
          setNewTag('');
      }
  };

  const removeTag = (tagId: string) => {
      handleSaveField('tags', (editedTask.tags || []).filter(t => t.id !== tagId));
  };

  const toggleComplete = () => {
    const newStatus: 'pending' | 'done' = editedTask.status === 'done' ? 'pending' : 'done';
    const updated: Task = {
        ...editedTask,
        status: newStatus,
        completedAt: newStatus === 'done' ? new Date().toISOString() : null,
        history: addHistory('status_change', `changed status to ${newStatus}`),
        updatedAt: new Date().toISOString()
    };
    setEditedTask(updated);
    onUpdate(updated);
    onClose();
  };

  const activeUser = currentUser || users[0];
  const isDone = editedTask.status === 'done';

  // Merge History and Comments for the feed
  const activityFeed = [
      ...editedTask.comments.map(c => ({ type: 'comment', date: new Date(c.createdAt), data: c })),
      ...(editedTask.history || []).map(h => ({ type: 'history', date: new Date(h.createdAt), data: h }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-start overflow-y-auto pt-4 md:pt-10 pb-20 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[85vh] mx-4 relative ring-1 ring-white/10">
        
        {/* Main Content (Left) */}
        <div className="flex-grow p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
          {/* Header Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
                <button 
                onClick={toggleComplete} 
                className={`mt-1.5 flex-shrink-0 w-6 h-6 rounded-full border-[2px] flex items-center justify-center transition-colors ${isDone ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}`}
                >
                {isDone && <CheckCircle size={14} className="text-white" />}
                </button>
                <div className="flex-grow">
                    <input 
                    className={`text-2xl font-bold bg-transparent w-full outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 ${isDone ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onBlur={handleBlurTitle}
                    placeholder={t('taskTitlePlaceholder', lang)}
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-3 ml-9 flex-wrap">
                 <div className="flex flex-wrap gap-2">
                    {editedTask.tags?.map(tag => (
                        <span key={tag.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {tag.name}
                            <button onClick={() => removeTag(tag.id)} className="hover:text-red-500"><X size={10} /></button>
                        </span>
                    ))}
                 </div>
                 {/* Project Label */}
                 <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                     <Folder size={12} />
                     {projects.find(p => p.id === editedTask.projectId)?.name}
                 </div>

                 {/* Created At */}
                 <div className="flex items-center gap-1 text-xs text-slate-400" title={formatDateTime(editedTask.createdAt, lang)}>
                    <Calendar size={12} className="opacity-50" />
                    <span>{formatDate(editedTask.createdAt, lang)}</span>
                 </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Description */}
          <div className="group">
            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                <AlignLeft size={16} /> {t('description', lang)}
            </div>
            <textarea
                className="w-full min-h-[100px] p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm leading-relaxed transition-all dark:text-slate-200"
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

          {/* Activity Stream */}
          <div className="flex-grow flex flex-col min-h-[200px]">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                <Activity size={16} /> {t('activity', lang)}
            </div>
            
            <div className="flex-grow space-y-4 mb-4 overflow-y-auto max-h-80 pr-2">
                {activityFeed.map((item, idx) => {
                    const isComment = item.type === 'comment';
                    const data = item.data as any;
                    const author = users.find(u => u.id === data.userId) || users[0];
                    
                    return (
                        <div key={data.id || idx} className="flex gap-3 text-sm">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isComment ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                {isComment ? author?.initials : <History size={14} />}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-bold text-textMain dark:text-slate-200">{author?.name}</span>
                                    <span className="text-xs text-slate-400">{formatDateTime(data.createdAt, lang)}</span>
                                </div>
                                {isComment ? (
                                    <div className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-bl-xl rounded-br-xl rounded-tr-xl">
                                        {data.text}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 dark:text-slate-400 italic">
                                        {data.details}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={commentsEndRef} />
            </div>

            <div className="flex gap-3 items-start mt-auto">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {activeUser?.initials}
                </div>
                <div className="flex-grow relative">
                    <textarea 
                        className="w-full p-3 pr-10 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none shadow-sm dark:text-slate-200"
                        rows={1}
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

        {/* Sidebar Controls (Right) */}
        <div className="w-full md:w-80 bg-slate-50/80 dark:bg-slate-800/50 p-6 flex flex-col gap-6 border-l border-slate-100 dark:border-slate-800 overflow-y-auto h-full">
           <div className="flex justify-between md:hidden items-center border-b border-slate-200 dark:border-slate-700 pb-4">
              <span className="font-bold text-slate-400">ACTIONS</span>
              <button onClick={onClose}><X size={24} className="text-slate-500" /></button>
           </div>
           
           <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
             <X size={20} />
           </button>

           <div className="space-y-6 mt-2 md:mt-8">
              
              {/* Project */}
              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Folder size={12}/> {t('project', lang)}</label>
                  <select 
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-slate-200"
                    value={editedTask.projectId}
                    onChange={(e) => handleSaveField('projectId', e.target.value)}
                  >
                      {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
              </div>

               {/* Tags Input */}
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><TagIcon size={12}/> {t('tags', lang)}</label>
                  <input
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-slate-200 placeholder:text-slate-400"
                    placeholder="Add tag + Enter"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Flag size={12}/> {t('priority', lang)}</label>
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
              </div>

              {/* Date & Time */}
              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Clock size={12}/> {t('deadline', lang)}</label>
                  <div className="flex gap-2">
                    <input 
                        type="date"
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-slate-200"
                        value={editedTask.dueAt ? editedTask.dueAt.split('T')[0] : ''}
                        onChange={(e) => {
                            const datePart = e.target.value;
                            if (!datePart) {
                                handleSaveField('dueAt', null);
                                return;
                            }
                            // Preserve time if exists
                            const current = editedTask.dueAt ? new Date(editedTask.dueAt) : new Date();
                            const newDate = new Date(datePart);
                            newDate.setHours(current.getHours(), current.getMinutes());
                            handleSaveField('dueAt', newDate.toISOString());
                        }}
                    />
                     <input 
                        type="time"
                        className="w-24 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-slate-200"
                        value={editedTask.dueAt ? new Date(editedTask.dueAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : ''}
                        onChange={(e) => {
                            if (!editedTask.dueAt) return;
                            const [h, m] = e.target.value.split(':');
                            const date = new Date(editedTask.dueAt);
                            date.setHours(parseInt(h), parseInt(m));
                            handleSaveField('dueAt', date.toISOString());
                        }}
                    />
                  </div>
              </div>

              {/* Reminders & Repeat */}
              <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Bell size={12}/> {t('remind', lang)}</label>
                        <select 
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-slate-200"
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val > 0) handleSaveField('remindOffsets', [...(editedTask.remindOffsets || []), val]);
                            }}
                        >
                            <option value="0">Add...</option>
                            <option value="15">15 min</option>
                            <option value="60">1 hour</option>
                            <option value="1440">1 day</option>
                        </select>
                         <div className="flex flex-wrap gap-1 mt-1">
                             {(editedTask.remindOffsets || []).map(r => (
                                 <span key={r} className="text-[10px] bg-yellow-50 text-yellow-700 px-1 rounded">{r}m</span>
                             ))}
                         </div>
                  </div>
                   <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Repeat size={12}/> {t('repeat', lang)}</label>
                        <select 
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-slate-200"
                            value={editedTask.rrule?.freq || 'none'}
                            onChange={(e) => {
                                const freq = e.target.value as any;
                                handleSaveField('rrule', freq === 'none' ? null : { ver: 1, freq });
                            }}
                        >
                            <option value="none">No</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                  </div>
              </div>
              
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
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-colors ${isDone ? 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700' : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400'}`}
                  >
                      <CheckCircle size={16} /> {isDone ? t('reopen', lang) : t('complete', lang)}
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