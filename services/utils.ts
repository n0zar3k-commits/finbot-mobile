
import { Priority, Language } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const formatDate = (isoString: string, lang: Language = 'ru'): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' });
};

export const formatDateTime = (isoString: string, lang: Language = 'ru'): string => {
  const date = new Date(isoString);
  return date.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export const formatTime = (isoString: string, lang: Language = 'ru'): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });
};

export const isOverdue = (isoString: string): boolean => {
  return new Date(isoString) < new Date();
};

export const isToday = (isoString: string): boolean => {
  const date = new Date(isoString);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const getDayStart = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getDayEnd = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const getMonthGrid = (year: number, month: number): (Date | null)[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
  
  const grid: (Date | null)[] = [];
  
  // Pad empty days at start
  for (let i = 0; i < startDayOfWeek; i++) {
    grid.push(null);
  }
  
  // Fill days
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(new Date(year, month, i));
  }
  
  return grid;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// --- Translations ---

type TranslationKey = 
  | 'dashboard' | 'calendar' | 'settings' | 'projects' | 'myProfile' | 'analytics'
  | 'newTask' | 'createProject' | 'save' | 'cancel' | 'delete' | 'complete'
  | 'description' | 'checklist' | 'activity' | 'priority' | 'deadline' | 'assignee'
  | 'theme' | 'language' | 'light' | 'dark' | 'saveTask' | 'today' | 'overdue' | 'myTasks'
  | 'attention' | 'noTasksToday' | 'noOverdue' | 'hello' | 'whatsUp'
  | 'totalTasks' | 'completionRate' | 'productivityTrend' | 'tasksByPriority' | 'openTasks' | 'completed'
  | 'taskTitlePlaceholder' | 'project' | 'tags' | 'time' | 'remind' | 'repeat' | 'next7Days' | 'all'
  | 'filterByProject' | 'quickActions' | 'reopen' | 'sortBy' | 'sortDefault' | 'sortDate' | 'sortPriority'
  | 'dragTaskHere' | 'backlog' | 'inProgress' | 'done'
  | 'filterByAssignee' | 'filterByPriority' | 'me' | 'limitExceeded' | 'quickAddPlaceholder' | 'create'
  | 'searchPlaceholder' | 'selectProject' | 'period' | 'last7Days' | 'last30Days' | 'last90Days' | 'createdVsCompleted'
  | 'created' | 'trend' | 'vsPrevious' | 'notifications' | 'notificationSetting' | 'actions' | 'noUpcomingTasks' | 'noPendingTasks';

export const t = (key: TranslationKey, lang: Language): string => {
  const dict: Record<Language, Record<TranslationKey, string>> = {
    ru: {
      dashboard: 'Главная',
      calendar: 'Календарь',
      analytics: 'Аналитика',
      settings: 'Настройки',
      projects: 'Проекты',
      myProfile: 'Мой профиль',
      newTask: 'Новая задача',
      createProject: 'Создать проект',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      complete: 'Выполнить',
      reopen: 'Открыть',
      description: 'Описание',
      checklist: 'Чек-лист',
      activity: 'Активность',
      priority: 'Приоритет',
      deadline: 'Срок',
      assignee: 'Исполнитель',
      theme: 'Тема оформления',
      language: 'Язык',
      light: 'Светлая',
      dark: 'Темная',
      saveTask: 'Сохранить задачу',
      today: 'На сегодня',
      overdue: 'Просрочено',
      myTasks: 'Мои задачи',
      attention: 'Требует внимания',
      noTasksToday: 'На сегодня задач нет. Хорошего дня! ☀️',
      noOverdue: 'Все чисто! Просроченных задач нет. 🚀',
      hello: 'Привет',
      whatsUp: 'Вот что происходит сегодня.',
      totalTasks: 'Всего задач',
      completionRate: 'Завершено',
      productivityTrend: 'Динамика продуктивности',
      tasksByPriority: 'Задачи по приоритету',
      openTasks: 'Открытые задачи',
      completed: 'Выполнено',
      taskTitlePlaceholder: 'Название задачи (например, "Купить молоко")',
      project: 'Проект',
      tags: 'Метки',
      time: 'Время',
      remind: 'Напомнить',
      repeat: 'Повтор',
      next7Days: 'Ближайшие 7 дней',
      all: 'Все',
      filterByProject: 'По проектам',
      quickActions: 'Быстрые действия',
      sortBy: 'Сортировка',
      sortDefault: 'По умолчанию',
      sortDate: 'По сроку',
      sortPriority: 'По приоритету',
      dragTaskHere: 'Создай задачу или перетащи сюда',
      backlog: 'Бэклог',
      inProgress: 'В работе',
      done: 'Готово',
      filterByAssignee: 'Исполнитель',
      filterByPriority: 'Приоритет',
      me: 'Я',
      limitExceeded: 'Лимит превышен',
      quickAddPlaceholder: 'Название задачи...',
      create: 'Создать',
      searchPlaceholder: 'Поиск задач...',
      selectProject: 'Выберите проект',
      period: 'Период',
      last7Days: '7 дней',
      last30Days: '30 дней',
      last90Days: '90 дней',
      createdVsCompleted: 'Создано vs Выполнено',
      created: 'Создано',
      trend: 'Тренд',
      vsPrevious: 'vs прошлый период',
      notifications: 'Уведомления',
      notificationSetting: 'Настройка уведомлений',
      actions: 'Действия',
      noUpcomingTasks: 'На этой неделе пока тихо. Добавь задачи — и мы покажем твою загрузку 😉',
      noPendingTasks: 'Нет активных задач'
    },
    en: {
      dashboard: 'Dashboard',
      calendar: 'Calendar',
      analytics: 'Analytics',
      settings: 'Settings',
      projects: 'Projects',
      myProfile: 'My Profile',
      newTask: 'New Task',
      createProject: 'Create Project',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      complete: 'Complete',
      reopen: 'Reopen',
      description: 'Description',
      checklist: 'Checklist',
      activity: 'Activity',
      priority: 'Priority',
      deadline: 'Deadline',
      assignee: 'Assignee',
      theme: 'Theme',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      saveTask: 'Save Task',
      today: 'Today',
      overdue: 'Overdue',
      myTasks: 'My Tasks',
      attention: 'Needs Attention',
      noTasksToday: 'No tasks for today. Have a great day! ☀️',
      noOverdue: 'All clear! No overdue tasks. 🚀',
      hello: 'Hello',
      whatsUp: 'Here is what\'s happening today.',
      totalTasks: 'Total Tasks',
      completionRate: 'Completion Rate',
      productivityTrend: 'Productivity Trend',
      tasksByPriority: 'Tasks by Priority',
      openTasks: 'Open Tasks',
      completed: 'Completed',
      taskTitlePlaceholder: 'Task title (e.g. "Buy milk")',
      project: 'Project',
      tags: 'Tags',
      time: 'Time',
      remind: 'Remind',
      repeat: 'Repeat',
      next7Days: 'Next 7 Days',
      all: 'All',
      filterByProject: 'By Project',
      quickActions: 'Quick Actions',
      sortBy: 'Sort by',
      sortDefault: 'Default',
      sortDate: 'Date',
      sortPriority: 'Priority',
      dragTaskHere: 'Create task or drag here',
      backlog: 'Backlog',
      inProgress: 'In Progress',
      done: 'Done',
      filterByAssignee: 'Assignee',
      filterByPriority: 'Priority',
      me: 'Me',
      limitExceeded: 'Limit exceeded',
      quickAddPlaceholder: 'Task title...',
      create: 'Create',
      searchPlaceholder: 'Search tasks...',
      selectProject: 'Select Project',
      period: 'Period',
      last7Days: '7 Days',
      last30Days: '30 Days',
      last90Days: '90 Days',
      createdVsCompleted: 'Created vs Completed',
      created: 'Created',
      trend: 'Trend',
      vsPrevious: 'vs previous period',
      notifications: 'Notifications',
      notificationSetting: 'Notification Setting',
      actions: 'Actions',
      noUpcomingTasks: 'It\'s quiet this week. Add some tasks to see your schedule! 😉',
      noPendingTasks: 'No pending tasks'
    }
  };
  return dict[lang][key] || key;
};

// --- Priority System ---

interface PriorityConfig {
  color: string;
  dot: string;
  labelRu: string;
  labelEn: string;
  descRu: string;
  descEn: string;
}

export const priorityConfig: Record<Priority, PriorityConfig> = {
  low: { 
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', 
    dot: 'bg-slate-400', 
    labelRu: 'Низкий', labelEn: 'Low',
    descRu: 'Можно сделать когда угодно', descEn: 'Can be done anytime'
  },
  normal: { 
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', 
    dot: 'bg-emerald-500', 
    labelRu: 'Обычный', labelEn: 'Normal',
    descRu: 'Стандартная рабочая задача', descEn: 'Standard work task'
  },
  medium: { 
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', 
    dot: 'bg-blue-500', 
    labelRu: 'Средний', labelEn: 'Medium',
    descRu: 'Требует внимания на неделе', descEn: 'Needs attention this week'
  },
  high: { 
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', 
    dot: 'bg-orange-500', 
    labelRu: 'Высокий', labelEn: 'High',
    descRu: 'Нужно сделать как можно скорее', descEn: 'Do as soon as possible'
  },
  urgent: { 
    color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', 
    dot: 'bg-red-500', 
    labelRu: 'Срочный', labelEn: 'Urgent',
    descRu: 'Блокирует работу других', descEn: 'Blocking others work'
  },
  critical: { 
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', 
    dot: 'bg-purple-600', 
    labelRu: 'Критический', labelEn: 'Critical',
    descRu: 'Авария или полная остановка', descEn: 'Disaster or full stop'
  }
};

export const priorityStyles = {
  low: { badge: priorityConfig.low.color, dot: priorityConfig.low.dot },
  normal: { badge: priorityConfig.normal.color, dot: priorityConfig.normal.dot },
  medium: { badge: priorityConfig.medium.color, dot: priorityConfig.medium.dot },
  high: { badge: priorityConfig.high.color, dot: priorityConfig.high.dot },
  urgent: { badge: priorityConfig.urgent.color, dot: priorityConfig.urgent.dot },
  critical: { badge: priorityConfig.critical.color, dot: priorityConfig.critical.dot },
};

export const getPriorityLabel = (priority: Priority, lang: Language): string => {
  const config = priorityConfig[priority];
  return lang === 'ru' ? config.labelRu : config.labelEn;
};

export const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
  viewer: 'Viewer'
};