export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatWeight(kg: number, units: 'metric' | 'imperial' = 'metric'): string {
  if (units === 'imperial') {
    return `${Math.round(kg * 2.20462)} lbs`;
  }
  return `${kg} kg`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getRecoveryColor(status: string): string {
  const colors: Record<string, string> = {
    recovered: '#00D9A5',
    recovering: '#FFC107',
    needs_rest: '#FF5252',
  };
  return colors[status] ?? '#666666';
}

export function getRecoveryLabel(status: string): string {
  const labels: Record<string, string> = {
    recovered: 'Recovered',
    recovering: 'Recovering',
    needs_rest: 'Needs Rest',
  };
  return labels[status] ?? status;
}
