import { apiRequest } from './apiClient';

export async function listMyApplications() {
  return apiRequest('/applications/mine');
}

export async function listApplicationsForJob(jobId) {
  return apiRequest(`/jobs/${jobId}/applications`);
}

export async function updateApplicationStatus(applicationId, status) {
  return apiRequest(`/applications/${applicationId}/status`, { method: 'PATCH', body: { status } });
}

export async function recalculateMyMatch(applicationId) {
  return apiRequest(`/applications/${applicationId}/recalculate`, { method: 'POST' });
}
