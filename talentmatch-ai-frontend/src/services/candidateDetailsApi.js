import { apiRequest } from './apiClient';

/**
 * Mirrors the backend's candidateSubResourceFactory.js — Education,
 * Experience, Certifications, and Projects are all the same shape of
 * CRUD calls against a different path, so one factory builds all four
 * API modules instead of writing the same four functions four times.
 */
function createSubResourceApi(resourcePath) {
  return {
    list: () => apiRequest(`/users/me/${resourcePath}`),
    create: (data) => apiRequest(`/users/me/${resourcePath}`, { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/users/me/${resourcePath}/${id}`, { method: 'PUT', body: data }),
    remove: (id) => apiRequest(`/users/me/${resourcePath}/${id}`, { method: 'DELETE' }),
    verify: (id) => apiRequest(`/users/me/${resourcePath}/${id}/verify`, { method: 'PATCH' }),
  };
}

export const educationApi = createSubResourceApi('education');
export const experienceApi = createSubResourceApi('experience');
export const projectApi = createSubResourceApi('projects');
