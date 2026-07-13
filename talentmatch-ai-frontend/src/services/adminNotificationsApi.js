import { apiRequest } from './apiClient';

export const notificationsApi = {
  list: () => apiRequest('/notifications'),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),
};

export const adminUsersApi = {
  list: ({ role, search, page } = {}) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (search) params.set('search', search);
    if (page) params.set('page', page);
    const query = params.toString();
    return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
  },
  setStatus: (userId, status) => apiRequest(`/admin/users/${userId}/status`, { method: 'PATCH', body: { status } }),
};
