import { apiRequest } from './apiClient';

export async function listOpenJobs({ search, location, category, experience, page } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (location) params.set('location', location);
  if (category) params.set('category', category);
  if (experience) params.set('experience', experience);
  if (page) params.set('page', page);

  const query = params.toString();
  return apiRequest(`/jobs${query ? `?${query}` : ''}`);
}

export async function getJob(id) {
  return apiRequest(`/jobs/${id}`);
}

export async function listMyJobs() {
  return apiRequest('/jobs/mine');
}

export async function createJob(data) {
  return apiRequest('/jobs', { method: 'POST', body: data });
}

export async function updateJob(id, data) {
  return apiRequest(`/jobs/${id}`, { method: 'PUT', body: data });
}

export async function closeJob(id) {
  return apiRequest(`/jobs/${id}/close`, { method: 'PATCH' });
}

export async function reopenJob(id) {
  return apiRequest(`/jobs/${id}/reopen`, { method: 'PATCH' });
}

export async function deleteJob(id) {
  return apiRequest(`/jobs/${id}`, { method: 'DELETE' });
}

export async function applyToJob(jobId) {
  return apiRequest(`/jobs/${jobId}/apply`, { method: 'POST' });
}

export async function rankCandidates(jobId) {
  return apiRequest(`/jobs/${jobId}/rank`, { method: 'POST' });
}
