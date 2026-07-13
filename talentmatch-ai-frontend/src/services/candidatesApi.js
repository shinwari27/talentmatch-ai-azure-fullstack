import { apiRequest } from './apiClient';

export async function listCandidates({ search, location, skill } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (location) params.set('location', location);
  if (skill) params.set('skill', skill);
  const query = params.toString();
  return apiRequest(`/candidates${query ? `?${query}` : ''}`);
}

export async function getCandidate(id) {
  return apiRequest(`/candidates/${id}`);
}
