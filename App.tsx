import React, { useState, useEffect } from 'react';
import { Layout, Plus, Home, Menu, X, Calendar, Settings, Hash, Layers } from 'lucide-react';
import { Project, Task, User, AppState, ViewMode, WorkspaceSettings, Priority } from './types';
import KanbanBoard from './components/KanbanBoard';
import TaskDetailModal from './components/TaskDetailModal';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import { generateId, t } from './services/utils';

// --- MOCK DATA ---
const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Вы', initials: 'ВЫ', role: 'admin', telegramId: 12345, username: 'dev_user' },
  { id: 'u2', name: 'Алиса Смит', initials: 'АС', role: 'member' },
  { id: 'u3', name: 'Боб Джонс', initials: 'БД', role: 'viewer' }
];

const INITIAL_PROJECTS: Project[] = [
  { 
    id: 'p1', 
    name: 'Development', 
    description: 'Main product dev',
    workspaceId: 'w1',
    columns: [
      { id: 'c1', title: 'Backlog', order: 0 },
      { id: 'c2', title: 'In Progress', order: 1 },
      { id: 'c3', title: 'Done', order: 2 }
    ]
  }
];

const INITIAL_WORKSPACE: WorkspaceSettings = {
    name: 'My Team',
    statuses: ['Backlog', 'In Progress', 'Done'],
    tags: []
};

const loadState = (): AppState => {
  const stored = localStorage.getItem('ss_kanban_state_v3');
  if (stored) return JSON.parse(stored);
  return {
    projects: INITIAL_PROJECTS,
    tasks: [],
    users: INITIAL_USERS,
    currentProjectId: 'p1',
    currentView: 'dashboard',
    workspaceSettings: INITIAL_WORKSPACE,
    appSettings: { language: 'ru', theme: 'light' }
  };
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Apply Theme
  useEffect(() => {
    if (state.appSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.appSettings.theme]);

  // Auth / Telegram Check
  useEffect(() => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser) {
            setState(prev => ({
                ...prev,
                users: prev.users.map(u => u.id === 'u1' ? {
                    ...u, 
                    name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
                    username: tgUser.username,
                    telegramId: tgUser.id
                } : u)
            }));
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ss_kanban_state_v3', JSON.stringify(state));
  }, [state]);

  const currentProject = state.projects.find(p => p.id === state.currentProjectId) || state.projects[0];
  const currentUser = state.users[0];
  const lang = state.appSettings.language;

  // --- Handlers ---

  const handleTaskMove = (taskId: string, newColumnId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, columnId: newColumnId } : t)
    }));
  };

  const handleTaskDateDrop = (taskId: string, newDate: Date) => {
     setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, dueAt: newDate.toISOString() } : t)
    }));
  };

  const handleAddTask = (columnId?: string) => {
    if (!currentProject) return;
    
    let targetColumnId = columnId;
    if (!targetColumnId) {
        if (currentProject.columns && currentProject.columns.length > 0) {
            targetColumnId = currentProject.columns[0].id;
        } else {
            alert(lang === 'ru' ? "Невозможно создать задачу: нет колонок." : "Cannot create task: no columns.");
            return;
        }
    }

    const newTask: Task = {
      id: generateId(),
      projectId: currentProject.id,
      columnId: targetColumnId,
      title: t('newTask', lang),
      priority: 'normal',
      status: 'pending',
      remindOffsets: [],
      tags: [],
      comments: [],
      checklist: [],
      authorId: currentUser.id,
      assigneeId: currentUser.id, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setSelectedTask(newTask);
    setIsModalOpen(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
    setSelectedTask(updatedTask);
  };

  const handleDeleteTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
    setIsModalOpen(false);
  };

  const handleCreateProject = () => {
    const name = prompt(lang === 'ru' ? "Введите название нового проекта:" : "Enter new project name:");
    if (name && name.trim()) {
      const newProject: Project = {
        id: generateId(),
        name: name.trim(),
        workspaceId: state.workspaceSettings.name,
        columns: [
          { id: generateId(), title: 'To Do', order: 0 },
          { id: generateId(), title: 'In Progress', order: 1 },
          { id: generateId(), title: 'Done', order: 2 }
        ]
      };
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
        currentProjectId: newProject.id,
        currentView: 'project'
      }));
      setIsMobileMenuOpen(false);
    }
  };

  const navigateTo = (view: ViewMode, projectId?: string) => {
    setState(prev => ({ 
        ...prev, 
        currentView: view, 
        currentProjectId: projectId || prev.currentProjectId 
    }));
    setIsMobileMenuOpen(false);
  };

  // --- Renderers ---

  const renderContent = () => {
    switch (state.currentView) {
        case 'dashboard':
            return (
                <DashboardView 
                    tasks={state.tasks}
                    projects={state.projects}
                    currentUser={currentUser}
                    onTaskClick={(t) => { setSelectedTask(t); setIsModalOpen(true); }}
                    onAddTask={() => handleAddTask()}
                    lang={lang}
                />
            );
        case 'calendar':
            return (
                <CalendarView 
                    tasks={state.tasks}
                    onTaskClick={(t) => { setSelectedTask(t); setIsModalOpen(true); }}
                    onTaskDrop={handleTaskDateDrop}
                    lang={lang}
                />
            );
        case 'settings':
            return (
                <SettingsView 
                    user={currentUser}
                    workspace={state.workspaceSettings}
                    settings={state.appSettings}
                    onUpdateSettings={(s) => setState(prev => ({ ...prev, appSettings: s }))}
                />
            );
        case 'project':
        default:
             const projectTasks = state.tasks.filter(t => t.projectId === currentProject.id);
             return (
                 <div className="h-full flex flex-col">
                    <header className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex-shrink-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <button className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(true)}>
                                <Menu size={24} />
                            </button>
                            <h2 className="text-xl font-bold text-textMain dark:text-white truncate">{currentProject.name}</h2>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                             <button 
                                onClick={() => handleAddTask()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                <Plus size={16} /> <span className="hidden sm:inline">{t('newTask', lang)}</span>
                            </button>
                        </div>
                    </header>
                    <div className="flex-grow overflow-hidden pt-6 relative">
                        <KanbanBoard 
                            project={currentProject}
                            tasks={projectTasks}
                            users={state.users}
                            onTaskMove={handleTaskMove}
                            onTaskClick={(task) => { setSelectedTask(task); setIsModalOpen(true); }}
                            onAddTask={handleAddTask}
                            lang={lang}
                        />
                    </div>
                 </div>
             );
    }
  };

  return (
    <div className="flex h-screen bg-bg dark:bg-darkBg text-textMain dark:text-darkTextMain overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-surface dark:bg-darkSurface border-r border-slate-100 dark:border-slate-800 flex-col z-20 shadow-soft">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-glow">
            <Layout size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight dark:text-white">FlowDay</span>
        </div>

        <div className="px-4 space-y-1 mb-6">
            <button onClick={() => navigateTo('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${state.currentView === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <Home size={18} /> {t('dashboard', lang)}
            </button>
            <button onClick={() => navigateTo('calendar')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${state.currentView === 'calendar' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <Calendar size={18} /> {t('calendar', lang)}
            </button>
        </div>

        <div className="px-4 mb-4 flex-grow overflow-y-auto">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('projects', lang)}</div>
            <button onClick={handleCreateProject} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"><Plus size={14} /></button>
          </div>
          <nav className="space-y-1">
            {state.projects.map(p => (
              <button
                key={p.id}
                onClick={() => navigateTo('project', p.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${state.currentView === 'project' && state.currentProjectId === p.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <Hash size={16} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-50 dark:border-slate-800">
          <button onClick={() => navigateTo('settings')} className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium transition-colors ${state.currentView === 'settings' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'}`}>
             <Settings size={18} /> {t('settings', lang)}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 bg-bg dark:bg-darkBg md:overflow-hidden relative transition-colors duration-200">
        {state.currentView !== 'project' && (
             <div className="md:hidden p-4 flex items-center justify-between">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-500 dark:text-slate-400">
                    <Menu size={24} />
                </button>
                <div className="font-bold text-slate-800 dark:text-white">FlowDay</div>
                <div className="w-10" />
             </div>
        )}
        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-around p-3 z-30 pb-safe">
          <button onClick={() => navigateTo('dashboard')} className={`p-2 rounded-xl ${state.currentView === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}><Home size={24} /></button>
          <button onClick={() => navigateTo('project')} className={`p-2 rounded-xl ${state.currentView === 'project' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}><Layers size={24} /></button>
          <button onClick={() => navigateTo('calendar')} className={`p-2 rounded-xl ${state.currentView === 'calendar' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}><Calendar size={24} /></button>
          <button onClick={() => navigateTo('settings')} className={`p-2 rounded-xl ${state.currentView === 'settings' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}><Settings size={24} /></button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col animate-slide-right">
                <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={24} /></button>
                <div className="font-bold text-xl mb-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><Layout /> FlowDay</div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('projects', lang)}</div>
                  <button onClick={handleCreateProject} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg"><Plus size={16} /></button>
                </div>
                
                <div className="space-y-1 overflow-y-auto">
                    {state.projects.map(p => (
                    <button
                        key={p.id}
                        onClick={() => navigateTo('project', p.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${state.currentView === 'project' && state.currentProjectId === p.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        <Hash size={16} />
                        {p.name}
                    </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Modals */}
      <TaskDetailModal 
        isOpen={isModalOpen}
        task={selectedTask}
        users={state.users}
        currentUser={currentUser}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        lang={lang}
      />
    </div>
  );
};

export default App;