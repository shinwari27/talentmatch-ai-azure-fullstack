import { jobs, applications, candidates, notifications } from '../constants/mockData';

const delay = (data, ms = 400) => new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const api = {
  getJobs: () => delay(jobs),
  getJob: (id) => delay(jobs.find((j) => j.id === id)),
  getApplications: () => delay(applications),
  getCandidates: () => delay(candidates),
  getCandidate: (id) => delay(candidates.find((c) => c.id === id)),
  getNotifications: () => delay(notifications),
  uploadResume: () => delay({ status: 'processing' }, 1200),
};
