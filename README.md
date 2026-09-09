# KaushalSetu

> **Bridging the gap between academic skills and industry requirements.**

KaushalSetu is an **Academia–Industry Collaboration Portal** developed for **Smart India Hackathon 2026 — Problem Statement 26044**.

The platform connects **students, industries, academicians, and institutions** through skill assessment, skill-gap analysis, career roadmaps, explainable opportunity matching, application tracking, candidate ranking, and institutional insights.

---

## 📌 Problem Statement

### Smart India Hackathon 2026

**Problem Statement ID:** 26044

**Problem:** Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement

**Theme:** Smart Automation

**Category:** Software

There is a persistent gap between the skills students develop in academic institutions and the competencies industries expect.

### Students

- Difficulty identifying skills required for target roles.
- Limited visibility into current skill proficiency.
- Difficulty identifying personal skill gaps.
- Difficulty finding opportunities that match their actual skills.
- Lack of a clear path toward career readiness.

### Industry

- Difficulty finding candidates with the required skills.
- Time-consuming candidate screening and comparison.
- Limited visibility into candidate skill gaps.
- Need for skill-based candidate ranking.

### Academicians

- Need better access to industry collaboration opportunities.
- Need access to industrial training, FDPs, consultancy, and research opportunities.

### Institutions

- Need visibility into student skill readiness.
- Need aggregate insight into common skill gaps.
- Need visibility into industry skill demand.
- Need better data for skill-development and placement planning.

---

# 💡 Solution

KaushalSetu provides a single platform connecting the academic skill-development journey with the industry opportunity journey.

    Student Profile
          ↓
    Skill Assessment
          ↓
    Skill Intelligence
          ↓
    Skill Gap Analysis
          ↓
    Career Roadmap
          ↓
    Skill-Based Opportunity Matching
          ↓
    Application & Tracking
          ↓
    Industry Candidate Ranking
          ↓
    Institutional Insights

The platform focuses on answering two important questions:

> **What skills does the student currently have?**

and

> **What does the student need to become ready for the desired career or opportunity?**

---

# 🚀 Core USP

## Skill Intelligence + Explainable Opportunity Matching

KaushalSetu's core MVP differentiator is the combination of:

    Skill Assessment
           ↓
    Skill Profile
           ↓
    Skill Gap Analysis
           ↓
    Career Readiness
           ↓
    Explainable Opportunity Matching
           ↓
    Application
           ↓
    Candidate Ranking

The current matching engine is a **deterministic mathematical model**.

It does not depend on:

- LLMs
- Embedding search
- Vector databases
- Black-box AI scoring

This makes the match score transparent and easy to explain.

---

# 🧮 Explainable Matching Engine

For every opportunity skill:

- `S` = student's current proficiency
- `R` = required proficiency
- Required skill weight = `1.0`
- Optional skill weight = `0.5`
- Missing student skill = `S = 0`

### Skill Score

    if R = 0:
        scoreRatio = 1

    otherwise:
        scoreRatio = min(S / R, 1)

### Overall Match

    matchPercentage =
    round(
        sum(scoreRatio × weight)
        / sum(weights)
        × 100
    )

### Example

| Skill | Student Proficiency | Required | Result |
|---|---:|---:|---|
| React | 8 | 7 | Matched |
| Node.js | 7 | 6 | Matched |
| SQL | 6 | 6 | Matched |
| DSA | 3 | 5 | Gap |

### Result

**90% Match**

The system can explain:

    Strong Skills:
    ✓ React
    ✓ Node.js
    ✓ SQL

    Skill Gap:
    ⚠ DSA

    Required: 5
    Current: 3
    Gap: +2 proficiency

This allows both students and recruiters to understand **why** a candidate matches an opportunity.

---

# ✨ Key Features

## 👨‍🎓 Student

### Student Profile

Students can manage:

- Personal information
- Education
- College
- Degree
- Graduation year
- Location
- Professional links
- Technical skills
- Soft skills
- Skill proficiency from 0–10

### Skill Assessment

Students can:

- Browse active assessments.
- Start an assessment.
- Answer skill-based questions.
- Submit an assessment.
- View results.
- View assessment history.
- Receive per-skill proficiency updates.

### Skill Intelligence

Students can identify:

- Strengths
- Developing skills
- Skill gaps
- Current proficiency
- Assessment performance
- Recommended areas of focus

### Career Roadmap

Students can select career goals such as:

- Java Developer
- Python Developer
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Analyst
- DevOps Engineer
- Software Engineer

The roadmap provides:

- Career readiness
- Required skills
- Current proficiency
- Skill gaps
- Recommended assessments
- Next skills to focus on

### Opportunities

Students can:

- Browse internships.
- Browse jobs.
- Browse apprenticeships.
- Search opportunities.
- Filter by type.
- Filter by location.
- Filter by work mode.
- View skill requirements.
- View explainable match scores.

### Applications

Students can:

- Apply to opportunities.
- Add a cover letter.
- Track applications.
- View application details.
- Withdraw eligible applications.

---

# 🏢 Industry

Industry users can:

## Company Profile

- Create company profile.
- Add company information.
- Add industry.
- Add location.
- Add company size.
- Add website.

## Opportunity Management

Industry users can:

- Create opportunities.
- Edit opportunities.
- Define required skills.
- Define required proficiency.
- Define optional skills.
- Publish opportunities.
- Close opportunities.

Supported opportunity types include:

- Internships
- Jobs
- Apprenticeships

## Candidate Management

Industry users can:

- View applications.
- View candidate profiles.
- View skill match.
- View skill gaps.
- Rank candidates.
- Search candidates.
- Filter candidates.
- Filter by minimum match.
- Filter by application status.
- Shortlist candidates.
- Update application status.

---

# 🏛 Institution

The current MVP provides **platform-wide anonymized institutional analytics**.

Institutions can view:

- Student skill readiness
- Readiness distribution
- Common skill gaps
- Industry skill demand
- Gap-vs-demand insights
- Application pipeline insights

## Important Limitation

The current MVP does **not** contain:

    InstitutionProfile

or:

    StudentProfile.institutionId

Therefore the current institution dashboard is:

> **Platform-wide and anonymized**

It is **not institution-specific**.

Institution APIs do not expose:

- Student names
- Student emails
- Student profile IDs

---

# 👨‍🏫 Academician

The current MVP provides a lightweight academician workspace containing:

- Account information
- Collaboration coming-soon area
- Published industry activity snapshot

The complete academician collaboration workflow is planned for a future phase.

---

# 📊 Dashboards

## Student Dashboard

Provides:

- Career readiness
- Skill count
- Applications
- Career goal
- Skill Intelligence
- Recommended opportunities
- Recent applications
- Profile completion

## Industry Dashboard

Provides company-scoped:

- Open opportunities
- Application pipeline
- Recent applications
- Candidate ranking
- Shortlisted candidates
- Selected candidates

## Institution Dashboard

Provides:

- Total students
- Assessed students
- Readiness distribution
- Skill-gap trends
- Industry skill demand
- Gap-vs-demand insights
- Application pipeline

## Academician Workspace

Provides:

- Account information
- Collaboration coming-soon section
- Published industry activity snapshot

---

# 🔐 Authentication & Security

KaushalSetu uses:

- JWT authentication
- bcryptjs password hashing
- Role-Based Access Control
- Protected routes
- Ownership checks
- Environment-based secrets

### Roles

    STUDENT
    INDUSTRY
    ACADEMICIAN
    INSTITUTION
    ADMIN

### Security Principles

- Password hashes are never returned through APIs.
- Passwords are not stored in browser local storage.
- JWT secrets are stored in environment variables.
- Public registration cannot create ADMIN accounts.
- Users can only access authorized modules.
- Industry users can only access their own company resources.
- Students can only access their own applications.
- Institution analytics are anonymized.

---

# 🔄 Application Workflow

    APPLIED
       ↓
    UNDER_REVIEW
       ↓
    SHORTLISTED
       ↓
    INTERVIEW
       ↓
    SELECTED

The system also supports valid rejection and student withdrawal flows.

---

# 🏆 Candidate Ranking

Industry candidates are ranked using the same matching engine used for student opportunity matching.

### Default Ranking Priority

1. Match percentage
2. Required-skill coverage
3. Total skill gap
4. Earlier application time
5. Application ID as deterministic tie-breaker

### Candidate Filters

- Search
- Application status
- Minimum match percentage
- Withdrawn applications

### Candidate Sorting

- Match — highest first
- Match — lowest first
- Application — newest first
- Application — oldest first

---

# 📈 Industry Readiness

Career readiness is calculated by comparing a student's skills with the skills required by their selected career role.

### Readiness Bands

| Match Score | Readiness |
|---:|---|
| ≥ 80% | Ready |
| ≥ 60% | Almost Ready |
| ≥ 40% | Developing |
| < 40% | Needs Attention |

Students without an active career goal are classified as:

**Insufficient Data**

and are excluded from the readiness average.

---

# 🏗 Architecture

KaushalSetu follows a **modular monolith architecture**.

    ┌─────────────────────────────┐
    │      React + Vite Client    │
    │ Tailwind + React Router     │
    └──────────────┬──────────────┘
                   │
                REST API
                   │
    ┌──────────────▼──────────────┐
    │        Express.js           │
    │            API              │
    └──────────────┬──────────────┘
                   │
              Controllers
                   │
                   ▼
                Services
                   │
                   ▼
                 Prisma
                   │
                   ▼
              PostgreSQL

### Architecture Principles

- Business logic lives in services.
- Controllers remain thin.
- Routes do not contain domain rules.
- Prisma handles database access.
- JWT provides authentication context.
- Ownership is derived from the authenticated user.
- Matching is calculated from current skill data.
- Microservices are intentionally not used for the MVP.

---

# 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Language | JavaScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP Client | Axios |
| Icons | Lucide React |
| Backend | Node.js |
| Framework | Express.js |
| API | REST |
| Database | PostgreSQL |
| ORM | Prisma 6.19.3 |
| Authentication | JWT |
| Password Hashing | bcryptjs |

### Technology Decision

The MVP intentionally uses:

- React
- JavaScript
- Node.js
- Express.js
- PostgreSQL
- Prisma
- JWT
- bcryptjs

The MVP does not use:

- TypeScript
- MongoDB
- Mongoose
- NestJS
- Microservices
- LLM-based core matching
- Vector database

---

# 📁 Project Structure

    kaushalsetu/
    │
    ├── client/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── context/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   │
    │   ├── index.html
    │   ├── package.json
    │   └── vite.config.js
    │
    ├── server/
    │   ├── prisma/
    │   │   ├── migrations/
    │   │   ├── schema.prisma
    │   │   └── seed.js
    │   │
    │   ├── src/
    │   │   ├── controllers/
    │   │   ├── middleware/
    │   │   ├── routes/
    │   │   ├── services/
    │   │   ├── utils/
    │   │   ├── validators/
    │   │   └── server.js
    │   │
    │   ├── tests/
    │   └── package.json
    │
    ├── .env.example
    ├── .gitignore
    ├── LICENSE
    └── README.md

---

# 🗄 Database Overview

The main domain relationships are:

    User
     ├── StudentProfile
     │     ├── StudentSkill ── Skill
     │     ├── AssessmentAttempt
     │     ├── StudentCareerGoal ── CareerRole
     │     └── Application ── Opportunity
     │
     └── CompanyProfile
           └── Opportunity
                 └── OpportunitySkill ── Skill

    Assessment
     └── AssessmentQuestion ── Skill
           └── AssessmentAttempt
                 ├── AssessmentAnswer
                 └── SkillAssessmentResult

### Important Database Decisions

- `StudentSkill.proficiency` is the current proficiency source of truth.
- Assessment results are retained as intelligence/audit records.
- Opportunity requirements use `OpportunitySkill`.
- Career requirements use `CareerRoleSkill`.
- Student + opportunity applications are unique.
- Ownership is enforced through authenticated users.

---

# 🔌 API Overview

## Authentication

    POST /api/auth/register
    POST /api/auth/login
    GET  /api/auth/me

## Student Profile

    GET    /api/student/profile
    POST   /api/student/profile
    PUT    /api/student/profile
    DELETE /api/student/profile

## Student Skills

    GET    /api/student/skills
    POST   /api/student/skills
    PUT    /api/student/skills/:skillId
    DELETE /api/student/skills/:skillId

    GET    /api/skills

## Assessments

    GET  /api/assessments
    GET  /api/assessments/:id
    POST /api/assessments/:id/start
    POST /api/assessments/:id/submit

    GET /api/student/assessments/history
    GET /api/student/assessment-results/:attemptId
    GET /api/student/skill-intelligence

## Career Roadmap

    GET /api/career-roles
    GET /api/career-roles/:id

    GET /api/student/career-goal
    PUT /api/student/career-goal

    GET /api/student/career-roadmap

## Opportunities

    GET /api/opportunities
    GET /api/opportunities/:id
    GET /api/opportunities/:id/match

Industry users also have company-profile and own-opportunity CRUD/lifecycle endpoints.

## Applications

    POST  /api/opportunities/:id/apply

    GET   /api/student/applications
    GET   /api/student/applications/:id
    PATCH /api/student/applications/:id/withdraw

    GET   /api/industry/opportunities/:id/applications
    GET   /api/industry/applications/:id
    PATCH /api/industry/applications/:id/status

## Dashboards

    GET /api/student/dashboard
    GET /api/industry/dashboard
    GET /api/institution/dashboard
    GET /api/academician/dashboard

---

# 🧪 Testing

The project is developed phase-by-phase with:

- API testing
- Unit testing
- Client build verification
- Browser verification
- Authorization testing
- Ownership testing

### Matching Tests Cover

- Full match
- Partial match
- Missing skills
- Required skills
- Optional skills
- Zero required proficiency
- Multiple skills
- Match-band boundaries
- Skill-gap explanations

### Application Tests Cover

- Authentication
- Authorization
- Resource ownership
- Application creation
- Application uniqueness
- Status transitions
- Published/closed opportunity rules

### Candidate Ranking Tests Cover

- Match ranking
- Required-skill coverage
- Skill gaps
- Search
- Status filters
- Minimum match filters
- Sorting
- Ownership

---

# 📋 Current Implementation Status

| Phase | Feature | Status |
|---:|---|:---:|
| 1 | Foundation + UI Design System | ✅ |
| 2 | Authentication + RBAC | ✅ |
| 3 | Student Profile + Skills | ✅ |
| 4 | Skill Assessment + Skill Intelligence | ✅ |
| 5 | Industry Opportunities | ✅ |
| 6 | Explainable Matching Engine | ✅ |
| 7 | Career Roadmap + Dynamic Assessments | ✅ |
| 8 | Applications + Tracking | ✅ |
| 9 | Industry Candidate Ranking | ✅ |
| 10 | Dashboards + Institution Analytics | ✅ |

---

# 🗺 Post-MVP Roadmap

The following features are **planned and are not presented as current MVP functionality**.

## Phase 11 — Digital Skill Portfolio

Planned:

- Projects
- Certifications
- Experience
- Structured digital portfolio

## Phase 12 — Academician Portal

Planned:

- Faculty internships
- Industrial training
- FDP opportunities
- Consultancy
- Research collaboration

## Phase 13 — Verification

Planned:

- Organization verification
- Document verification
- Trusted credentials

## Phase 14 — Optional AI Features

Potential future features:

- Resume parsing
- Skill extraction
- Semantic skill normalization
- AI-assisted recommendations

The core matching engine will remain explainable.

## Phase 15 — Production Deployment

Planned:

- Production deployment
- Monitoring
- Performance optimization
- Security hardening
- Institutional tenancy
- Domain-specific skill taxonomies
- Ayush-specific skill mapping

---

# ⚙️ Local Setup

## Prerequisites

Install:

- Node.js
- npm
- PostgreSQL
- Git

## 1. Clone Repository

    git clone https://github.com/codedby-jay/kaushalsetu.git
    cd kaushalsetu

## 2. Install Backend

    cd server
    npm install
    npx prisma generate

## 3. Install Frontend

    cd ../client
    npm install

## 4. Configure Environment Variables

Create:

    server/.env

Example:

    DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/kaushalsetu?schema=public"
    JWT_SECRET="YOUR_LONG_RANDOM_SECRET"
    PORT=5000

Never commit `.env`.

## 5. Create PostgreSQL Database

Create a PostgreSQL database named:

    kaushalsetu

For an existing database with committed migrations:

    cd server
    npx prisma migrate deploy
    npx prisma generate
    npx prisma db seed

For a fresh local development database:

    npx prisma migrate dev
    npx prisma generate
    npx prisma db seed

Do not use:

    npx prisma db push

for the project's normal migration workflow.

## 6. Start Backend

    cd server
    npm run dev

Backend:

    http://localhost:5000

Health endpoint:

    http://localhost:5000/api/health

## 7. Start Frontend

Open another terminal:

    cd client
    npm run dev

Frontend:

    http://localhost:5173

---

# 👤 Demo Accounts

The seed provides demo accounts for local testing.

| Role | Email | Password |
|---|---|---|
| Industry | `industry.abc@kaushalsetu.demo` | `KaushalSetu@2026` |
| Industry | `industry.nova@kaushalsetu.demo` | `KaushalSetu@2026` |
| Student | `student.a@kaushalsetu.demo` | `KaushalSetu@2026` |
| Student | `student.b@kaushalsetu.demo` | `KaushalSetu@2026` |
| Student | `student.c@kaushalsetu.demo` | `KaushalSetu@2026` |

These credentials are intended for **local/demo use only**.

---

# 🎬 Recommended Demo Flow

## Student Demo

    Login
      ↓
    Complete Profile
      ↓
    Add Skills
      ↓
    Select Career Goal
      ↓
    Take Assessment
      ↓
    View Skill Intelligence
      ↓
    View Career Roadmap
      ↓
    Browse Opportunities
      ↓
    View Explainable Match
      ↓
    Apply
      ↓
    Track Application

## Industry Demo

    Login
      ↓
    Company Profile
      ↓
    Publish Opportunity
      ↓
    View Applications
      ↓
    Candidate Ranking
      ↓
    Open Candidate
      ↓
    View Match + Skill Gaps
      ↓
    Update Application Status

## Institution Demo

    Login
      ↓
    Institution Dashboard
      ↓
    Readiness Distribution
      ↓
    Skill Gap Insights
      ↓
    Industry Demand
      ↓
    Application Insights

---

# 🎯 Why KaushalSetu?

Existing platforms can provide professional profiles, job discovery, internships, candidate search, or recruitment workflows.

KaushalSetu focuses on connecting **academic skill development with industry requirements**.

### Traditional Workflow

    Profile
       ↓
    Search
       ↓
    Apply

### KaushalSetu Workflow

    Skills
      ↓
    Assessment
      ↓
    Skill Gap
      ↓
    Career Roadmap
      ↓
    Explainable Match
      ↓
    Opportunity
      ↓
    Application
      ↓
    Candidate Ranking
      ↓
    Institutional Insights

### Core Differentiator

> **Not just finding an opportunity — identifying what the learner needs to become ready for it.**

---

# 📚 Research & References

### World Economic Forum

**Future of Jobs Report 2025**

https://www.weforum.org/publications/the-future-of-jobs-report-2025/

### Government of India

**National Education Policy 2020**

https://www.education.gov.in/nep/nep2020_final_eng.pdf

### AICTE

**National Internship Portal**

https://internship.aicte-india.org/

### LinkedIn

**Recruiter Skills Match**

https://www.linkedin.com/help/recruiter/answer/a596630

### IEEE

**Explainable Job-Posting Recommendations**

https://ieeexplore.ieee.org/document/9658757/

### Ministry of Ayush

**AYURGYAN — Research & Innovation**

https://ngo.ayush.gov.in/central-sector-scheme-ayurgyan

---

# 🇮🇳 Smart India Hackathon 2026

| Field | Details |
|---|---|
| Event | Smart India Hackathon 2026 |
| Problem Statement ID | 26044 |
| Problem | Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement |
| Theme | Smart Automation |
| Category | Software |
| Team | KaushalSetu |

---

# 🔗 Repository

GitHub:

https://github.com/codedby-jay/kaushalsetu

---

# 📄 License

This project is licensed under the **MIT License**.

See [`LICENSE`](LICENSE) for details.

---

# 👥 Team

**KaushalSetu**

> Bridging the gap between academic skills and industry requirements.
