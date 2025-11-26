import { Task, RRule } from '../types';
import { generateId } from './utils';

export const calculateNextDue = (baseDate: Date, rrule: RRule): Date => {
  const next = new Date(baseDate);
  // Prevent infinite loops in calculation by capping attempts
  let safety = 0;
  
  while (safety < 366) { // Look ahead max 1 year
    safety++;
    
    switch (rrule.freq) {
      case 'daily':
        next.setDate(next.getDate() + (rrule.interval || 1));
        break;
      
      case 'weekdays':
        next.setDate(next.getDate() + 1);
        // 0 = Sun, 6 = Sat
        if (next.getDay() === 0) next.setDate(next.getDate() + 1); // Skip Sun -> Mon
        if (next.getDay() === 6) next.setDate(next.getDate() + 2); // Skip Sat -> Mon
        break;

      case 'weekly':
        next.setDate(next.getDate() + (7 * (rrule.interval || 1)));
        if (rrule.byweekday && rrule.byweekday.length > 0) {
            // Complex logic for specific days would go here
            // For MVP: Simplistic 'same day next week' if interval=1 and no byweekday specified in UI
            // Or if specific day is set, find next occurrence
        }
        break;

      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        if (rrule.bymonthday) {
          // Handle months with fewer days (e.g. Jan 31 -> Feb 28)
          const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
          next.setDate(Math.min(rrule.bymonthday, lastDay));
        }
        break;

      default:
        // Fallback: 1 day
        next.setDate(next.getDate() + 1);
    }

    // Ensure strictly future
    if (next > baseDate) {
      return next;
    }
  }
  return next;
};

export const createNextTask = (completedTask: Task): Task | null => {
  if (!completedTask.rrule || !completedTask.dueAt) return null;

  const currentDue = new Date(completedTask.dueAt);
  const nextDue = calculateNextDue(currentDue, completedTask.rrule);

  return {
    ...completedTask,
    id: generateId(),
    status: 'pending',
    dueAt: nextDue.toISOString(),
    completedAt: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Keep rrule to propagate chain
  };
};

export const checkNotifications = (tasks: Task[], notifyEnabled: boolean) => {
  if (!notifyEnabled || Notification.permission !== 'granted') return;

  const now = new Date();
  
  tasks.forEach(task => {
    if (task.status === 'done' || !task.dueAt) return;
    
    const due = new Date(task.dueAt);
    const offsets = [...task.remindOffsets, 0]; // Include "at time of"

    offsets.forEach(offset => {
      // Calculate trigger time: Due Time - Offset Minutes
      const triggerTime = new Date(due.getTime() - offset * 60000);
      
      // Check if NOW is within a 15s window of the trigger time
      const diff = Math.abs(now.getTime() - triggerTime.getTime());
      
      if (diff <= 15000) { // 15 seconds tolerance matching the tick rate
         new Notification(task.title, {
           body: `Due: ${due.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
           icon: '/icon.png', // Placeholder
           tag: `${task.id}-${offset}` // Prevent duplicate notifs for same event
         });
      }
    });
  });
};