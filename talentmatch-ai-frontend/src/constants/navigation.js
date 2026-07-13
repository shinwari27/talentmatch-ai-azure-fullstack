import {
  LayoutDashboard, Search, FileText, User, Bell, Settings, Briefcase,
  Users, BarChart3, ShieldCheck, ClipboardList, FileStack,
} from 'lucide-react';

export const candidateNav = [
  { label: 'Dashboard', to: '/candidate', icon: LayoutDashboard },
  { label: 'Browse Jobs', to: '/candidate/jobs', icon: Search },
  { label: 'My Applications', to: '/candidate/applications', icon: ClipboardList },
  { label: 'Resume', to: '/candidate/resume', icon: FileText },
  { label: 'Profile', to: '/candidate/profile', icon: User },
  { label: 'Notifications', to: '/candidate/notifications', icon: Bell },
  { label: 'Settings', to: '/candidate/settings', icon: Settings },
];

export const recruiterNav = [
  { label: 'Dashboard', to: '/recruiter', icon: LayoutDashboard },
  { label: 'Jobs', to: '/recruiter/jobs', icon: Briefcase },
  { label: 'Candidates', to: '/recruiter/candidates', icon: Users },
  { label: 'Analytics', to: '/recruiter/analytics', icon: BarChart3 },
  { label: 'Notifications', to: '/recruiter/notifications', icon: Bell },
  { label: 'Settings', to: '/recruiter/settings', icon: Settings },
];

export const adminNav = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Recruiters', to: '/admin/recruiters', icon: Briefcase },
  { label: 'Candidates', to: '/admin/candidates', icon: User },
  { label: 'Jobs', to: '/admin/jobs', icon: FileStack },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldCheck },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];
