import { apiRequest } from './apiClient';

export async function getDashboard() {
  return apiRequest('/dashboard');
}

export async function getAnalytics() {
  return apiRequest('/analytics');
}
