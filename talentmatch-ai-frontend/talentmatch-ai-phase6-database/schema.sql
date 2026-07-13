-- ==============================================================================
-- TalentMatch AI — Phase 6: Database Schema
-- Target: Azure SQL Database (T-SQL)
-- ==============================================================================
-- Run this against the `talentmatchdb` database created in Phase 5, e.g. via
-- Azure Data Studio, SSMS, or the Query Editor in the Azure Portal.
-- Tables are created in dependency order (parents before children).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- USERS — base identity table for all three roles (Candidate/Recruiter/Admin)
-- ------------------------------------------------------------------------------
CREATE TABLE Users (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    FullName        NVARCHAR(150)   NOT NULL,
    Email           NVARCHAR(255)   NOT NULL,
    PasswordHash    NVARCHAR(255)   NOT NULL,
    Role            NVARCHAR(20)    NOT NULL,
    Status          NVARCHAR(20)    NOT NULL DEFAULT 'Active',
    CreatedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    LastLoginAt     DATETIME2       NULL,

    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT CK_Users_Role CHECK (Role IN ('Candidate', 'Recruiter', 'Admin')),
    CONSTRAINT CK_Users_Status CHECK (Status IN ('Active', 'Suspended'))
);

CREATE INDEX IX_Users_Role ON Users (Role);

-- ------------------------------------------------------------------------------
-- CANDIDATES — 1:1 extension of Users where Role = 'Candidate'
-- ------------------------------------------------------------------------------
CREATE TABLE Candidates (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    UserId          INT             NOT NULL,
    Title           NVARCHAR(150)   NULL,
    Location        NVARCHAR(150)   NULL,
    ResumeScore     INT             NULL,
    ResumeBlobUrl   NVARCHAR(500)   NULL,
    Bio             NVARCHAR(MAX)   NULL,
    UpdatedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Candidates_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Candidates_UserId UNIQUE (UserId),
    CONSTRAINT CK_Candidates_ResumeScore CHECK (ResumeScore BETWEEN 0 AND 100)
);

-- ------------------------------------------------------------------------------
-- RECRUITERS — 1:1 extension of Users where Role = 'Recruiter'
-- ------------------------------------------------------------------------------
CREATE TABLE Recruiters (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    UserId          INT             NOT NULL,
    CompanyName     NVARCHAR(200)   NOT NULL,
    CompanyLogoUrl  NVARCHAR(500)   NULL,

    CONSTRAINT FK_Recruiters_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Recruiters_UserId UNIQUE (UserId)
);

-- ------------------------------------------------------------------------------
-- JOBS — postings created by recruiters
-- ------------------------------------------------------------------------------
CREATE TABLE Jobs (
    Id                      INT             IDENTITY(1,1) PRIMARY KEY,
    RecruiterId             INT             NOT NULL,
    Title                   NVARCHAR(200)   NOT NULL,
    CompanyName             NVARCHAR(200)   NOT NULL,
    Location                NVARCHAR(150)   NOT NULL,
    IsRemote                BIT             NOT NULL DEFAULT 0,
    EmploymentType          NVARCHAR(50)    NOT NULL DEFAULT 'Full-time',
    SalaryMin               DECIMAL(10,2)   NULL,
    SalaryMax               DECIMAL(10,2)   NULL,
    ExperienceRequired      NVARCHAR(50)    NULL,
    EducationRequirement    NVARCHAR(300)   NULL,
    Category                NVARCHAR(100)   NULL,
    Description             NVARCHAR(MAX)   NOT NULL,
    Responsibilities        NVARCHAR(MAX)   NULL,  -- JSON array, e.g. ["Build X", "Own Y"]
    Benefits                NVARCHAR(MAX)   NULL,  -- JSON array, e.g. ["Health", "Remote"]
    Status                  NVARCHAR(20)    NOT NULL DEFAULT 'Open',
    PostedAt                DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ClosedAt                DATETIME2       NULL,

    CONSTRAINT FK_Jobs_Recruiters FOREIGN KEY (RecruiterId) REFERENCES Recruiters(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Jobs_Status CHECK (Status IN ('Open', 'Closed', 'Draft')),
    CONSTRAINT CK_Jobs_SalaryRange CHECK (SalaryMin IS NULL OR SalaryMax IS NULL OR SalaryMin <= SalaryMax)
);

CREATE INDEX IX_Jobs_Status_Category ON Jobs (Status, Category);
CREATE INDEX IX_Jobs_RecruiterId ON Jobs (RecruiterId);
CREATE INDEX IX_Jobs_Location ON Jobs (Location);

-- ------------------------------------------------------------------------------
-- APPLICATIONS — a candidate applying to a job (many-to-many with extra data)
-- NOTE: JobId's FK does NOT cascade on delete. SQL Server disallows cascading
-- from both Jobs and Candidates into Applications simultaneously (it would
-- create two cascade paths from Users: Users->Candidates->Applications and
-- Users->Recruiters->Jobs->Applications). Practically this means a Job with
-- existing applications can't be hard-deleted — it should be Closed instead
-- (already supported in the frontend), which is the more correct behavior
-- anyway: historical applications shouldn't vanish when a posting is removed.
-- ------------------------------------------------------------------------------
CREATE TABLE Applications (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    JobId           INT             NOT NULL,
    CandidateId     INT             NOT NULL,
    Status          NVARCHAR(20)    NOT NULL DEFAULT 'Applied',
    MatchScore      DECIMAL(5,2)    NULL,
    AppliedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    InterviewAt     DATETIME2       NULL,
    UpdatedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Applications_Jobs FOREIGN KEY (JobId) REFERENCES Jobs(Id),
    CONSTRAINT FK_Applications_Candidates FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Applications_Job_Candidate UNIQUE (JobId, CandidateId),
    CONSTRAINT CK_Applications_Status CHECK (Status IN ('Applied', 'Under Review', 'Interview', 'Offer', 'Rejected')),
    CONSTRAINT CK_Applications_MatchScore CHECK (MatchScore BETWEEN 0 AND 100)
);

CREATE INDEX IX_Applications_CandidateId ON Applications (CandidateId);
CREATE INDEX IX_Applications_JobId ON Applications (JobId);
CREATE INDEX IX_Applications_Status ON Applications (Status);

-- ------------------------------------------------------------------------------
-- SKILLS — master list, shared between candidates and jobs
-- ------------------------------------------------------------------------------
CREATE TABLE Skills (
    Id      INT             IDENTITY(1,1) PRIMARY KEY,
    Name    NVARCHAR(100)   NOT NULL,

    CONSTRAINT UQ_Skills_Name UNIQUE (Name)
);

CREATE TABLE CandidateSkills (
    CandidateId         INT     NOT NULL,
    SkillId             INT     NOT NULL,
    IsMissingForTarget  BIT     NOT NULL DEFAULT 0,

    CONSTRAINT PK_CandidateSkills PRIMARY KEY (CandidateId, SkillId),
    CONSTRAINT FK_CandidateSkills_Candidates FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE,
    CONSTRAINT FK_CandidateSkills_Skills FOREIGN KEY (SkillId) REFERENCES Skills(Id) ON DELETE CASCADE
);

CREATE TABLE JobSkills (
    JobId       INT     NOT NULL,
    SkillId     INT     NOT NULL,
    IsRequired  BIT     NOT NULL DEFAULT 1,

    CONSTRAINT PK_JobSkills PRIMARY KEY (JobId, SkillId),
    CONSTRAINT FK_JobSkills_Jobs FOREIGN KEY (JobId) REFERENCES Jobs(Id) ON DELETE CASCADE,
    CONSTRAINT FK_JobSkills_Skills FOREIGN KEY (SkillId) REFERENCES Skills(Id) ON DELETE CASCADE
);

CREATE INDEX IX_CandidateSkills_SkillId ON CandidateSkills (SkillId);
CREATE INDEX IX_JobSkills_SkillId ON JobSkills (SkillId);

-- ------------------------------------------------------------------------------
-- EDUCATIONS, EXPERIENCES, CERTIFICATIONS, PROJECTS — candidate profile detail
-- (one candidate can have many of each, so each gets its own table)
-- ------------------------------------------------------------------------------
CREATE TABLE Educations (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    CandidateId     INT             NOT NULL,
    Institution     NVARCHAR(200)   NOT NULL,
    Degree          NVARCHAR(150)   NOT NULL,
    FieldOfStudy    NVARCHAR(150)   NULL,
    StartDate       DATE            NULL,
    EndDate         DATE            NULL,

    CONSTRAINT FK_Educations_Candidates FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE
);

CREATE TABLE Experiences (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    CandidateId     INT             NOT NULL,
    CompanyName     NVARCHAR(200)   NOT NULL,
    JobTitle        NVARCHAR(150)   NOT NULL,
    StartDate       DATE            NULL,
    EndDate         DATE            NULL,
    Description     NVARCHAR(MAX)   NULL,

    CONSTRAINT FK_Experiences_Candidates FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE
);

CREATE TABLE Certifications (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    CandidateId     INT             NOT NULL,
    Name            NVARCHAR(150)   NOT NULL,
    IssuedBy        NVARCHAR(150)   NULL,
    IssueDate       DATE            NULL,
    ExpiryDate      DATE            NULL,

    CONSTRAINT FK_Certifications_Candidates FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE
);

CREATE TABLE Projects (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    CandidateId     INT             NOT NULL,
    Title           NVARCHAR(200)   NOT NULL,
    Description     NVARCHAR(MAX)   NULL,
    Url             NVARCHAR(500)   NULL,

    CONSTRAINT FK_Projects_Candidates FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE
);

CREATE INDEX IX_Educations_CandidateId ON Educations (CandidateId);
CREATE INDEX IX_Experiences_CandidateId ON Experiences (CandidateId);
CREATE INDEX IX_Certifications_CandidateId ON Certifications (CandidateId);
CREATE INDEX IX_Projects_CandidateId ON Projects (CandidateId);

-- ------------------------------------------------------------------------------
-- LANGUAGES — master list + candidate junction
-- ------------------------------------------------------------------------------
CREATE TABLE Languages (
    Id      INT             IDENTITY(1,1) PRIMARY KEY,
    Name    NVARCHAR(100)   NOT NULL,

    CONSTRAINT UQ_Languages_Name UNIQUE (Name)
);

CREATE TABLE CandidateLanguages (
    CandidateId     INT             NOT NULL,
    LanguageId      INT             NOT NULL,
    Proficiency     NVARCHAR(30)    NULL,   -- e.g. 'Native', 'Fluent', 'Conversational'

    CONSTRAINT PK_CandidateLanguages PRIMARY KEY (CandidateId, LanguageId),
    CONSTRAINT FK_CandidateLanguages_Candidates FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE,
    CONSTRAINT FK_CandidateLanguages_Languages FOREIGN KEY (LanguageId) REFERENCES Languages(Id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE Notifications (
    Id          INT             IDENTITY(1,1) PRIMARY KEY,
    UserId      INT             NOT NULL,
    Title       NVARCHAR(200)   NOT NULL,
    Message     NVARCHAR(500)   NOT NULL,
    Type        NVARCHAR(20)    NOT NULL DEFAULT 'info',
    IsRead      BIT             NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Notifications_Type CHECK (Type IN ('info', 'success', 'warning', 'error'))
);

CREATE INDEX IX_Notifications_UserId_IsRead ON Notifications (UserId, IsRead);

-- ------------------------------------------------------------------------------
-- AUDIT LOGS — actor is nullable to allow system-generated entries
-- ------------------------------------------------------------------------------
CREATE TABLE AuditLogs (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    ActorUserId     INT             NULL,
    Action          NVARCHAR(300)   NOT NULL,
    Details         NVARCHAR(MAX)   NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (ActorUserId) REFERENCES Users(Id) ON DELETE SET NULL
);

CREATE INDEX IX_AuditLogs_CreatedAt ON AuditLogs (CreatedAt DESC);

-- ==============================================================================
-- End of schema
-- ==============================================================================
