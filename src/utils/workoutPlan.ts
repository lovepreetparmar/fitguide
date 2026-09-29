export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStartOfTodayIso(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export function isPlanForToday(planGeneratedOn: string | null | undefined, date = new Date()) {
  if (!planGeneratedOn) return false;
  return planGeneratedOn === getLocalDateKey(date);
}
