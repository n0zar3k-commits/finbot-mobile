export type Priority = "low" | "normal" | "medium" | "high" | "urgent" | "critical";
export type Status = "backlog" | "todo" | "in-progress" | "review" | "done";
export type Language = "ru" | "en";
export type Theme = "light" | "dark";

export type ViewMode = "dashboard" | "project" | "calendar" | "settings";

export interface User {
  id: string;
  telegramId?: number;
  username?: string;
  name: string;
  avatar?: string;
  initials: string;
  timezone?: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
}

export interface AppSettings {
  language: Language;
  theme: Theme;
}

export interface Settings { // Old settings type, can be merged or kept for specific modules
  piGoal: number;
}

export interface Comment {
  id: string;
  userId: string; // references User
  text: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // tailwind class or hex
}

export interface RRule {
  ver: number;
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays';
  interval?: number;
  byweekday?: number[];
  bymonthday?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  columnId: string;
  
  // State
  status: 'pending' | 'done';

  // Metadata
  priority: Priority;
  tags: Tag[];
  assigneeId?: string;
  authorId: string;
  
  // Dates
  dueAt: string | null; // ISO
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;

  // Recurring & Alerts
  rrule?: RRule;
  remindOffsets: number[];

  // content
  checklist: ChecklistItem[];
  comments: Comment[];
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  columns: Column[];
}

export interface WorkspaceSettings {
  name: string;
  statuses: string[];
  tags: Tag[];
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
  users: User[];
  currentProjectId: string;
  currentView: ViewMode;
  workspaceSettings: WorkspaceSettings;
  appSettings: AppSettings;
}