import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { flushSyncOutbox } from '@/services/sync/syncWorker';
import { isSupabaseConfigured } from '@/services/supabase';
import { notificationService } from '@/services/notifications';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.profile?.user_id);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated || !isSupabaseConfigured) return;
    void flushSyncOutbox();
    void notificationService.requestPermissions();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void flushSyncOutbox();
    });
    return () => sub.remove();
  }, [isAuthenticated, userId]);

  return <>{children}</>;
}
