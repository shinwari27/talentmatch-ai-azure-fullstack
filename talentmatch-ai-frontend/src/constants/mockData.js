// Centralized mock data for the TalentMatch AI frontend (Phase 3 - mock API integration).
// In later phases, the `services/mockApi.js` calls below will be swapped for real REST calls.

export const currentUser = {
  candidate: {
    id: 'u-1001',
    name: 'Amina Yousafzai',
    email: 'amina.y@example.com',
    role: 'candidate',
    avatar: 'AY',
    title: 'Frontend Developer',
    location: 'Toronto, ON',
    resumeScore: 82,
  },
  recruiter: {
    id: 'u-2001',
    name: 'Michael Chen',
    email: 'michael.chen@northbridge.io',
    role: 'recruiter',
    avatar: 'MC',
    company: 'Northbridge Technologies',
  },
  admin: {
    id: 'u-3001',
    name: 'Sara Malik',
    email: 'sara.malik@talentmatch.ai',
    role: 'admin',
    avatar: 'SM',
  },
};

export const jobs = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    company: 'Northbridge Technologies',
    logo: 'NT',
    location: 'Toronto, ON',
    remote: true,
    type: 'Full-time',
    experience: '4-6 yrs',
    salary: '$95,000 - $120,000',
    category: 'Engineering',
    posted: '2 days ago',
    applicants: 34,
    status: 'Open',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Testing'],
    description:
      'Northbridge Technologies is looking for a Senior Frontend Developer to lead the development of our customer-facing dashboard. You will collaborate with design and backend teams to ship performant, accessible interfaces.',
    responsibilities: [
      'Build and maintain React component libraries',
      'Collaborate with UX on design system decisions',
      'Optimize application performance and accessibility',
      'Mentor junior engineers',
    ],
    benefits: ['Health & dental', 'Remote flexibility', 'Learning budget', 'Stock options'],
    education: "Bachelor's in Computer Science or related field",
  },
  {
    id: 'job-2',
    title: 'Cloud Solutions Architect',
    company: 'Azuria Systems',
    logo: 'AS',
    location: 'Mississauga, ON',
    remote: false,
    type: 'Full-time',
    experience: '5-8 yrs',
    salary: '$130,000 - $150,000',
    category: 'Cloud & DevOps',
    posted: '5 days ago',
    applicants: 21,
    status: 'Open',
    skills: ['Azure', 'Bicep', 'Terraform', 'Kubernetes', 'CI/CD'],
    description:
      'Design and implement enterprise-scale Azure architectures for our financial services clients, with a strong focus on security and disaster recovery.',
    responsibilities: [
      'Design high-availability Azure architectures',
      'Lead disaster recovery planning',
      'Review IaC templates (Bicep/Terraform)',
      'Present architecture decisions to stakeholders',
    ],
    benefits: ['Hybrid work', 'Certification reimbursement', 'RRSP matching'],
    education: "Bachelor's in Computer Science, Azure certifications preferred",
  },
  {
    id: 'job-3',
    title: 'IT Support Specialist',
    company: 'Maple Retail Group',
    logo: 'MR',
    location: 'Mississauga, ON',
    remote: false,
    type: 'Full-time',
    experience: '1-3 yrs',
    salary: '$52,000 - $62,000',
    category: 'IT Support',
    posted: '1 week ago',
    applicants: 58,
    status: 'Open',
    skills: ['Windows Server', 'Active Directory', 'Networking', 'Help Desk'],
    description:
      'Provide first and second-line IT support across our retail locations, manage user accounts, and maintain network infrastructure.',
    responsibilities: [
      'Resolve help desk tickets within SLA',
      'Administer Active Directory and M365',
      'Support onboarding/offboarding',
      'Maintain hardware inventory',
    ],
    benefits: ['Health benefits', 'Paid training', 'Growth path to Sys Admin'],
    education: 'Diploma in IT or equivalent certification (CompTIA A+, CCNA an asset)',
  },
  {
    id: 'job-4',
    title: 'Data Analyst',
    company: 'Lumen Analytics',
    logo: 'LA',
    location: 'Remote',
    remote: true,
    type: 'Contract',
    experience: '2-4 yrs',
    salary: '$70,000 - $85,000',
    category: 'Data & AI',
    posted: '3 days ago',
    applicants: 47,
    status: 'Open',
    skills: ['SQL', 'Power BI', 'Python', 'Excel'],
    description:
      'Analyze recruitment funnel data to help clients improve hiring outcomes, build dashboards, and identify trends.',
    responsibilities: ['Build Power BI dashboards', 'Write SQL queries against warehouse data', 'Present insights to clients'],
    benefits: ['Fully remote', 'Flexible hours'],
    education: "Bachelor's in Statistics, CS, or related field",
  },
  {
    id: 'job-5',
    title: 'DevOps Engineer',
    company: 'Northbridge Technologies',
    logo: 'NT',
    location: 'Toronto, ON',
    remote: true,
    type: 'Full-time',
    experience: '3-5 yrs',
    salary: '$100,000 - $115,000',
    category: 'Cloud & DevOps',
    posted: '4 days ago',
    applicants: 29,
    status: 'Open',
    skills: ['Azure DevOps', 'Docker', 'Kubernetes', 'GitHub Actions'],
    description: 'Own our CI/CD pipelines and cloud infrastructure automation across staging and production environments.',
    responsibilities: ['Maintain GitHub Actions pipelines', 'Manage container orchestration', 'Improve deployment reliability'],
    benefits: ['Remote flexibility', 'Health & dental', 'Annual bonus'],
    education: "Bachelor's in Computer Science or equivalent experience",
  },
  {
    id: 'job-6',
    title: 'Network Administrator',
    company: 'Azuria Systems',
    logo: 'AS',
    location: 'Brampton, ON',
    remote: false,
    type: 'Full-time',
    experience: '2-4 yrs',
    salary: '$65,000 - $78,000',
    category: 'IT Support',
    posted: '6 days ago',
    applicants: 18,
    status: 'Closed',
    skills: ['Cisco', 'CCNA', 'Firewalls', 'VPN'],
    description: 'Manage enterprise network infrastructure including switches, routers, and firewall configurations.',
    responsibilities: ['Configure and monitor network devices', 'Maintain VPN and firewall rules', 'Troubleshoot connectivity issues'],
    benefits: ['Health benefits', 'CCNP sponsorship'],
    education: 'CCNA required, CCNP an asset',
  },
];

export const applications = [
  { id: 'app-1', jobId: 'job-1', job: 'Senior Frontend Developer', company: 'Northbridge Technologies', appliedDate: '2026-06-28', status: 'Interview', matchScore: 88, interview: 'Jul 10, 10:00 AM' },
  { id: 'app-2', jobId: 'job-2', job: 'Cloud Solutions Architect', company: 'Azuria Systems', appliedDate: '2026-06-20', status: 'Under Review', matchScore: 74, interview: null },
  { id: 'app-3', jobId: 'job-4', job: 'Data Analyst', company: 'Lumen Analytics', appliedDate: '2026-06-15', status: 'Rejected', matchScore: 55, interview: null },
  { id: 'app-4', jobId: 'job-5', job: 'DevOps Engineer', company: 'Northbridge Technologies', appliedDate: '2026-06-30', status: 'Applied', matchScore: 81, interview: null },
];

export const candidates = [
  {
    id: 'c-1', name: 'Amina Yousafzai', avatar: 'AY', title: 'Frontend Developer', location: 'Toronto, ON',
    experience: '4 yrs', education: "Bachelor's in Computer Science", matchScore: 88, appliedFor: 'Senior Frontend Developer',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Jest'], missingSkills: ['GraphQL'],
    certifications: ['AZ-104'], languages: ['English', 'Urdu'],
    summary: 'Strong React fundamentals with 4 years of production experience building accessible, component-driven UIs. Slight gap in GraphQL but demonstrates fast ramp-up in similar tools.',
  },
  {
    id: 'c-2', name: 'Daniyal Raza', avatar: 'DR', title: 'Full-Stack Engineer', location: 'Mississauga, ON',
    experience: '5 yrs', education: "Bachelor's in Software Engineering", matchScore: 79, appliedFor: 'Senior Frontend Developer',
    skills: ['React', 'Node.js', 'REST APIs', 'CSS'], missingSkills: ['TypeScript', 'Testing'],
    certifications: [], languages: ['English'],
    summary: 'Solid full-stack background with heavier backend exposure than frontend specialization; would need onboarding on the team\'s TypeScript conventions.',
  },
  {
    id: 'c-3', name: 'Hina Zaman', avatar: 'HZ', title: 'UI Engineer', location: 'Remote',
    experience: '3 yrs', education: "Diploma in Web Development", matchScore: 71, appliedFor: 'Senior Frontend Developer',
    skills: ['React', 'Tailwind CSS', 'Figma'], missingSkills: ['TypeScript', 'Testing', 'REST APIs'],
    certifications: ['MS-900'], languages: ['English'],
    summary: 'Design-leaning frontend profile with strong visual craft; technical depth in testing and API integration is below the role requirements.',
  },
  {
    id: 'c-4', name: 'Bilal Ahmed', avatar: 'BA', title: 'Cloud Engineer', location: 'Toronto, ON',
    experience: '6 yrs', education: "Bachelor's in Computer Engineering", matchScore: 91, appliedFor: 'Cloud Solutions Architect',
    skills: ['Azure', 'Bicep', 'Kubernetes', 'Terraform', 'CI/CD'], missingSkills: [],
    certifications: ['AZ-104', 'AZ-305'], languages: ['English', 'Punjabi'],
    summary: 'Excellent architecture background with hands-on disaster recovery and IaC experience directly matching the role requirements.',
  },
];

export const notifications = [
  { id: 'n-1', title: 'Interview scheduled', message: 'Your interview for Senior Frontend Developer is confirmed for Jul 10.', time: '2h ago', read: false, type: 'success' },
  { id: 'n-2', title: 'Application viewed', message: 'Northbridge Technologies viewed your application.', time: '1d ago', read: false, type: 'info' },
  { id: 'n-3', title: 'Resume processed', message: 'Your resume was successfully parsed and scored.', time: '3d ago', read: true, type: 'success' },
  { id: 'n-4', title: 'New job match', message: 'A new job matches your profile: DevOps Engineer.', time: '4d ago', read: true, type: 'info' },
];

export const applicationTrends = [
  { month: 'Jan', applications: 120 }, { month: 'Feb', applications: 145 },
  { month: 'Mar', applications: 168 }, { month: 'Apr', applications: 190 },
  { month: 'May', applications: 210 }, { month: 'Jun', applications: 254 },
];

export const skillDistribution = [
  { name: 'React', value: 34 }, { name: 'Azure', value: 26 },
  { name: 'Python', value: 18 }, { name: 'SQL', value: 14 }, { name: 'Cisco', value: 8 },
];

export const experienceDistribution = [
  { name: '0-2 yrs', value: 22 }, { name: '3-5 yrs', value: 41 },
  { name: '6-8 yrs', value: 24 }, { name: '9+ yrs', value: 13 },
];

export const hiringFunnel = [
  { stage: 'Applied', value: 320 }, { stage: 'Screened', value: 180 },
  { stage: 'Interview', value: 74 }, { stage: 'Offer', value: 22 }, { stage: 'Hired', value: 14 },
];

export const adminUsers = [
  { id: 'u-1', name: 'Amina Yousafzai', email: 'amina.y@example.com', role: 'Candidate', status: 'Active', joined: '2026-02-14' },
  { id: 'u-2', name: 'Michael Chen', email: 'michael.chen@northbridge.io', role: 'Recruiter', status: 'Active', joined: '2026-01-20' },
  { id: 'u-3', name: 'Daniyal Raza', email: 'daniyal.r@example.com', role: 'Candidate', status: 'Active', joined: '2026-03-02' },
  { id: 'u-4', name: 'Fatima Noor', email: 'fatima.n@azuria.com', role: 'Recruiter', status: 'Suspended', joined: '2025-11-11' },
  { id: 'u-5', name: 'Hina Zaman', email: 'hina.z@example.com', role: 'Candidate', status: 'Active', joined: '2026-04-18' },
];

export const auditLogs = [
  { id: 'l-1', actor: 'Michael Chen', action: 'Created job posting "DevOps Engineer"', time: '2026-07-05 14:22' },
  { id: 'l-2', actor: 'Sara Malik', action: 'Suspended user Fatima Noor', time: '2026-07-04 09:10' },
  { id: 'l-3', actor: 'System', action: 'Resume parsing completed for 12 candidates', time: '2026-07-04 03:00' },
  { id: 'l-4', actor: 'Amina Yousafzai', action: 'Uploaded new resume version', time: '2026-07-03 19:41' },
  { id: 'l-5', actor: 'Sara Malik', action: 'Updated platform matching weights', time: '2026-07-02 11:05' },
];

export const platformStats = {
  totalUsers: 4218, recruiters: 312, candidates: 3874, jobs: 641, storageUsedGb: 128, systemHealth: 99.98,
};
