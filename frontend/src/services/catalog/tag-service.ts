import { apiClient } from '../api-client';
import { TagDto } from '@/src/types';

export const tagService = {
  getLookup: async (): Promise<TagDto[]> => {
    return apiClient.get<TagDto[]>('/Tag/lookup');
  },
};
