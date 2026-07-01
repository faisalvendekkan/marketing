import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Paginated } from '@/types';

export function useResource<T>(resource: string, params: Record<string, string | number> = {}) {
  const qc = useQueryClient();
  const key = [resource, params];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await api.get<{ data: Paginated<T> }>(`/${resource}`, { params });
      return res.data.data;
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [resource] });

  const create = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post(`/${resource}`, payload)).data,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      (await api.patch(`/${resource}/${id}`, payload)).data,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/${resource}/${id}`)).data,
    onSuccess: invalidate,
  });

  return { query, create, update, remove, invalidate };
}
