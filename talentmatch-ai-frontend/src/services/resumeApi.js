import { apiUpload } from './apiClient';

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  return apiUpload('/resume/upload', formData);
}
