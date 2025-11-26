
interface ParsedResult {
  title: string;
  dueAt: string | null;
}

export const parseTaskInput = (input: string): ParsedResult => {
  let text = input.trim();
  const now = new Date();
  let targetDate: Date | null = null;
  let hasTime = false;

  // Regex patterns
  const timeRegex = /\b([01]?\d|2[0-3])[:.]?([0-5]\d)\b/i;
  const todayRegex = /(сегодня|today)/i;
  const tomorrowRegex = /(завтра|tomorrow)/i;

  // 1. Detect Time
  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    hasTime = true;
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    
    // Default to today initially
    targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);
    
    // Remove time string from text
    text = text.replace(timeMatch[0], '').replace(/(в|at)\s*$/, '').trim();
  }

  // 2. Detect Date keywords
  const tomorrowMatch = text.match(tomorrowRegex);
  const todayMatch = text.match(todayRegex);

  if (tomorrowMatch) {
    if (!targetDate) {
      targetDate = new Date();
      targetDate.setHours(9, 0, 0, 0); // Default to 9am if no time specified
    }
    // Add 1 day
    targetDate.setDate(targetDate.getDate() + 1);
    text = text.replace(tomorrowMatch[0], '').trim();
  } else if (todayMatch) {
    if (!targetDate) {
      targetDate = new Date();
      targetDate.setHours(23, 59, 0, 0); // End of day if no time
    }
    // Date is already today (set above)
    text = text.replace(todayMatch[0], '').trim();
  } else if (hasTime && targetDate) {
    // If only time was provided (e.g. "10:30 call"), check if it's in the past
    // If 10:30 passed, assume tomorrow
    if (targetDate < now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  }

  // Cleanup cleanup extra prepositions
  text = text.replace(/\s+(в|at)\s*$/i, '').trim();
  text = text.replace(/^\s*(в|at)\s+/i, '').trim();

  return {
    title: text || "Новая задача",
    dueAt: targetDate ? targetDate.toISOString() : null
  };
};