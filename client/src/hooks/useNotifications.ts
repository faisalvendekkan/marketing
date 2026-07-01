import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Notification, Paginated } from '@/types';

export function useNotifications() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get<{ data: Paginated<Notification> }>('/notifications')).data.data,
  });

  const unread = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => (await api.get<{ data: { count: number } }>('/notifications/unread-count')).data.data.count,
    refetchInterval: 60_000,
  });

  const markAll = useMutation({
    mutationFn: async () => api.post('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOne = useMutation({
    mutationFn: async (id: number) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return { list, unread, markAll, markOne };
}
