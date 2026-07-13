import { apiRequest } from './apiClient';

export const skillsApi = {
  list: () => apiRequest('/users/me/skills'),
  add: (name) => apiRequest('/users/me/skills', { method: 'POST', body: { name } }),
  remove: (skillId) => apiRequest(`/users/me/skills/${skillId}`, { method: 'DELETE' }),
};

export const languagesApi = {
  list: () => apiRequest('/users/me/languages'),
  add: (name, proficiency) => apiRequest('/users/me/languages', { method: 'POST', body: { name, proficiency } }),
  remove: (languageId) => apiRequest(`/users/me/languages/${languageId}`, { method: 'DELETE' }),
};

export const certificationsApi = {
  list: () => apiRequest('/users/me/certifications'),
  add: (name, { issuedBy, issueDate, expiryDate } = {}) =>
    apiRequest('/users/me/certifications', { method: 'POST', body: { name, issuedBy, issueDate, expiryDate } }),
  remove: (certificationId) => apiRequest(`/users/me/certifications/${certificationId}`, { method: 'DELETE' }),
};
