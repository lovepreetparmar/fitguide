import { addDays, format, parseISO, isValid } from 'date-fns';

export function todayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function addDaysToDateString(date: string, delta: number): string {
  const base = parseISO(date);
  if (!isValid(base)) return todayDateString();
  return format(addDays(base, delta), 'yyyy-MM-dd');
}

export function formatDiaryLabel(date: string): string {
  const parsed = parseISO(date);
  if (!isValid(parsed)) return date;
  if (date === todayDateString()) return 'Today';
  return format(parsed, 'EEE, MMM d');
}
