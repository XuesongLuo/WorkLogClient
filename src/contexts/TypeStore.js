// src/contexts/TypeStore.jsx
import { fetcher } from '../utils/fetcher';

export const typeApi = {
  async getTypes() {
    // 返回 [{_id, name}] 项目类型
    return await fetcher('/api/types');
  },
  async addType(name) {
    return await fetcher('/api/types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
  },
  async updateType(id, name) {
    return await fetcher(`/api/types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
  },
  async deleteType(id) {
    return await fetcher(`/api/types/${id}`, { method: 'DELETE' });
  }
};