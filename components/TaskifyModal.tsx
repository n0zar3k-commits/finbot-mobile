import React, { useState } from 'react';
import { X, Wand2 } from 'lucide-react';

interface TaskifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (lines: string[]) => void;
}

const TaskifyModal: React.FC<TaskifyModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleImport = () => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    onImport(lines);
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] ring-1 ring-white/20 transform transition-all scale-100 animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-slate-50">
          <div>
            <h3 className="font-bold text-xl text-slate-800 tracking-tight flex items-center gap-2">
                <div className="bg-indigo-100 p-1.5 rounded-lg text-primary">
                    <Wand2 size={18} />
                </div>
                Быстрое добавление
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          <p className="text-sm text-slate-500 mb-3 font-medium">Вставьте ваш список (одна задача на строку):</p>
          <textarea
            className="w-full h-64 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none resize-none font-medium text-sm leading-relaxed transition-all"
            placeholder={`Купить молоко завтра 10:00\nПозвонить Ивану в 17:00\nПроверить код проекта`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
        </div>

        <div className="p-6 pt-2 flex justify-end gap-3 bg-white rounded-b-3xl">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors text-sm">Отмена</button>
          <button 
            onClick={handleImport} 
            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primaryDark flex items-center gap-2 font-semibold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 text-sm"
            disabled={!text.trim()}
          >
            Создать задачи
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskifyModal;