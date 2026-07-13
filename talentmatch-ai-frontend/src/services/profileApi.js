import { apiRequest } from './apiClient';

export async function getMyProfile() {
  return apiRequest('/users/me/profile');
}

export async function updateMyProfile(data) {
  return apiRequest('/users/me/profile', { method: 'PUT', body: data });
}

export async function changePassword(currentPassword, newPassword) {
  return apiRequest('/users/me/password', { method: 'PUT', body: { currentPassword, newPassword } });
}
