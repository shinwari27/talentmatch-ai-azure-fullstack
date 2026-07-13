import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import { candidateNav, recruiterNav, adminNav } from './constants/navigation';

// Public pages
import Landing from './pages/public/Landing';
import About from './pages/public/About';
import Features from './pages/public/Features';
import Pricing from './pages/public/Pricing';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import NotFound from './pages/public/NotFound';

// Candidate pages
import CandidateDashboard from './pages/candidate/Dashboard';
import BrowseJobs from './pages/candidate/BrowseJobs';
import JobDetails from './pages/candidate/JobDetails';
import ResumeUpload from './pages/candidate/ResumeUpload';
import Applications from './pages/candidate/Applications';
import CandidateProfile from './pages/candidate/Profile';
import CandidateSettings from './pages/candidate/Settings';
import CandidateNotifications from './pages/candidate/Notifications';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import ManageJobs from './pages/recruiter/ManageJobs';
import CreateJob from './pages/recruiter/CreateJob';
import RecruiterCandidates from './pages/recruiter/Candidates';
import CandidateDetails from './pages/recruiter/CandidateDetails';
import Analytics from './pages/recruiter/Analytics';
import RecruiterSettings from './pages/recruiter/Settings';
import RecruiterNotifications from './pages/recruiter/Notifications';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRecruiters from './pages/admin/Recruiters';
import AdminCandidates from './pages/admin/Candidates';
import AdminJobs from './pages/admin/Jobs';
import AuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/Settings';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />
      <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Candidate module */}
      <Route path="/candidate" element={
        <ProtectedRoute role="candidate">
          <DashboardLayout navItems={candidateNav} title="Dashboard"><CandidateDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/candidate/jobs" element={
        <ProtectedRoute role="candidate">
          <DashboardLayout navItems={candidateNav} title="Browse Jobs"><BrowseJobs /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/candidate/jobs/:id" element={
        <ProtectedRoute role="candidate">
          <DashboardLayout navItems={candidateNav} title="Job Details"><JobDetails /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/candidate/applications" element={
        <ProtectedRoute role="candidate">
          <DashboardLayout navItems={candidateNav} title="My Applications"><Applications /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/candidate/resume" element={
        <ProtectedRoute role="candidate">
          <DashboardLayout navItems={candidateNav} title="Resume"><ResumeUpload /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/candidate/profile" element={
        <ProtectedRoute role="candidate">
          <DashboardLayout navItems={candidateNav} title="Profile"><CandidateProfile /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/candidate/notifications" element={
        <ProtectedRoute role="candidate">
          <DashboardLayout navItems={candidateNav} title="Notifications"><CandidateNotifications /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/candidate/settings" element={
        <ProtectedRoute role="candidate">
          <DashboardLayout navItems={candidateNav} title="Settings"><CandidateSettings /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Recruiter module */}
      <Route path="/recruiter" element={
        <ProtectedRoute role="recruiter">
          <DashboardLayout navItems={recruiterNav} title="Dashboard"><RecruiterDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recruiter/jobs" element={
        <ProtectedRoute role="recruiter">
          <DashboardLayout navItems={recruiterNav} title="Jobs"><ManageJobs /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recruiter/jobs/create" element={
        <ProtectedRoute role="recruiter">
          <DashboardLayout navItems={recruiterNav} title="Create Job"><CreateJob /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recruiter/candidates" element={
        <ProtectedRoute role="recruiter">
          <DashboardLayout navItems={recruiterNav} title="Candidates"><RecruiterCandidates /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recruiter/candidates/:id" element={
        <ProtectedRoute role="recruiter">
          <DashboardLayout navItems={recruiterNav} title="Candidate Details"><CandidateDetails /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recruiter/analytics" element={
        <ProtectedRoute role="recruiter">
          <DashboardLayout navItems={recruiterNav} title="Analytics"><Analytics /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recruiter/notifications" element={
        <ProtectedRoute role="recruiter">
          <DashboardLayout navItems={recruiterNav} title="Notifications"><RecruiterNotifications /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recruiter/settings" element={
        <ProtectedRoute role="recruiter">
          <DashboardLayout navItems={recruiterNav} title="Settings"><RecruiterSettings /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Admin module */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <DashboardLayout navItems={adminNav} title="Dashboard"><AdminDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute role="admin">
          <DashboardLayout navItems={adminNav} title="Users"><AdminUsers /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/recruiters" element={
        <ProtectedRoute role="admin">
          <DashboardLayout navItems={adminNav} title="Recruiters"><AdminRecruiters /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/candidates" element={
        <ProtectedRoute role="admin">
          <DashboardLayout navItems={adminNav} title="Candidates"><AdminCandidates /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/jobs" element={
        <ProtectedRoute role="admin">
          <DashboardLayout navItems={adminNav} title="Jobs"><AdminJobs /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/audit-logs" element={
        <ProtectedRoute role="admin">
          <DashboardLayout navItems={adminNav} title="Audit Logs"><AuditLogs /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute role="admin">
          <DashboardLayout navItems={adminNav} title="Settings"><AdminSettings /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
