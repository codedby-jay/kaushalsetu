# KaushalSetu

Academia–Industry Collaboration Portal for Smart India Hackathon 2026.

## Problem

There is a persistent gap between the skills students acquire in academic institutions and the competencies industries expect. Students often do not know which skills are in demand, which they are missing, which internships or jobs fit them, or which learning programmes to take. Industries struggle to find candidates with the right skills. Academicians need better access to faculty internships, industrial training, FDPs, consultancy, and research collaboration. Institutions need visibility into skill gaps, internship participation, placement readiness, and outcomes.

## Solution

KaushalSetu is a central portal that connects **students**, **industries**, **academicians**, and **institutions**. Students build a skill profile through assessment, see gaps against industry requirements, receive learning recommendations, and apply to matched opportunities. Industries post internships and jobs with explicit skill requirements and review ranked candidates. Institutions see analytics on readiness and demand.

## Core USP

**Skill Intelligence + Opportunity Matching Engine**

The MVP matching engine is an **explainable mathematical model**, not an LLM or embedding search.

For each required skill:

- If student proficiency ≥ required proficiency → full points
- Otherwise → partial points = student proficiency / required proficiency

`matchPercentage = (earned points / total possible points) × 100`

The API will return match percentage, matched skills, and skill gaps (current, required, gap). That engine is **not implemented yet**.

## Current status (Phase 4)

Completed:

- Foundation, design system, health API (Phase 1)
- Authentication, JWT, RBAC (Phase 2)
- Student profile and skills (Phase 3)
- Skill assessments, scoring, Skill Intelligence, industry readiness

Not yet implemented: matching, opportunities, applications, analytics, academician portal, learning programmes, or portfolio.

## MVP modules (planned)

| Module | Phase |
| --- | --- |
| Foundation + UI design system | 1 |
| Authentication + RBAC | 2 |
| Student profile + skills | 3 |
| Skill assessment + skill intelligence | 4 (this release) |
| Industry opportunities | 5 |
| Matching engine | 6 |
| Applications + tracking | 7 |
| Industry candidate ranking | 8 |
| Institution analytics | 9 |
| Learning programmes | 10 (post-MVP) |
| Digital portfolio | 11 |
| Academician portal | 12 |
| Verification | 13 |
| Optional AI resume parsing | 14 |
| SIH polish + deployment | 15 |

## Technology stack

| Layer | Choice |
| --- | --- |
| Frontend | React, JavaScript, Vite, React Router, Tailwind CSS, Axios, Lucide React |
| Backend | Node.js, Express.js, JavaScript, REST |
| Database | PostgreSQL, Prisma ORM 6.19.3 |
| Auth | JWT (`jsonwebtoken`), bcryptjs |

Prisma is pinned to **6.19.3**. Prisma 7+ moved the database URL into a separate config file and requires a driver adapter. This project keeps `schema.prisma` + `DATABASE_URL`.

JavaScript only. No TypeScript, MongoDB, Mongoose, NestJS, or microservices for this MVP.

## Architecture

```text
React (Vite)
    ↓ REST (Axios)
Express
    ↓ Controllers
Services
    ↓ Prisma
PostgreSQL
```

```mermaid
flowchart TD
  Client["React client"] --> API["Express REST API"]
  API --> C["Controllers"]
  C --> S["Services"]
  S --> P["Prisma"]
  P --> DB["PostgreSQL"]
```

Business logic lives in services. Controllers stay thin. Routes do not contain domain rules.

## Project structure

```text
.
├── client/          React + Vite frontend
├── server/          Express API + Prisma
├── .env.example     Environment template
├── README.md
└── LICENSE
```

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/codedby-jay/kaushalsetu.git
cd kaushalsetu
```

### 2. Install dependencies

```bash
cd server && npm install
npx prisma generate
cd ../client && npm install
```

### 3. Configure environment

Copy `.env.example` to `server/.env` and replace placeholders:

```bash
cp .env.example server/.env
```

Do not commit `.env`. Set a long random `JWT_SECRET` before using login. Public registration cannot create `ADMIN` accounts.

Optional frontend override (`client/.env`):

```bash
VITE_API_URL=/api
```

In development, Vite proxies `/api` to `http://localhost:5000`.

### 4. Start PostgreSQL

Create a database named `kaushalsetu` (or match `DATABASE_URL`).

Phase 1 **does not require** PostgreSQL for the API process to start. If the database is unreachable, `GET /api/health` still returns HTTP 200 with `"database": "down"`.

### 5. Prisma (requires a running PostgreSQL instance)

The repository includes a committed migration history:

1. `init_user_foundation` — Phase 1 schema
2. `add_authentication` — `User.name` and default role `STUDENT`

If you already created a local `kaushalsetu` database during Phase 1 (no git migration history), treat it as disposable and recreate it:

```bash
dropdb kaushalsetu
createdb kaushalsetu
cd server
npx prisma validate
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

On Linux/macOS with `psql` instead of `dropdb`/`createdb`:

```bash
psql -d postgres -c "DROP DATABASE IF EXISTS kaushalsetu;"
psql -d postgres -c "CREATE DATABASE kaushalsetu;"
```

Do **not** use `prisma db push`. Fresh clones should use `npx prisma migrate dev` (local) or `npx prisma migrate deploy` (apply existing migrations only).

`npx prisma generate` does **not** require a live database, but it does need `DATABASE_URL` to be set.

### 6. Start the backend

```bash
cd server
npm run dev
```

API: `http://localhost:5000`  
Health: `http://localhost:5000/api/health`

### 7. Start the frontend

```bash
cd client
npm run dev
```

App: `http://localhost:5173`

## Routes

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | Service + database status |
| POST | `/api/auth/register` | Public registration (no ADMIN) |
| POST | `/api/auth/login` | Returns JWT + user |
| GET | `/api/auth/me` | Current user (Bearer token) |
| GET | `/api/auth/student-only` | RBAC demo: STUDENT 200, others 403 |
| GET | `/api/student/profile` | Own student profile (STUDENT) |
| POST | `/api/student/profile` | Create profile |
| PUT | `/api/student/profile` | Update profile |
| DELETE | `/api/student/profile` | Delete profile (not the User) |
| GET | `/api/student/skills` | Own skills + summary |
| POST | `/api/student/skills` | Add skill |
| PUT | `/api/student/skills/:skillId` | Update proficiency |
| DELETE | `/api/student/skills/:skillId` | Remove skill |
| GET | `/api/skills` | Skill catalog (authenticated) |
| GET | `/api/assessments` | Active assessments (STUDENT) |
| GET | `/api/assessments/:id` | Questions without correct answers |
| POST | `/api/assessments/:id/start` | Start or resume attempt |
| POST | `/api/assessments/:id/submit` | Score and update skills |
| GET | `/api/student/assessments/history` | Own attempts |
| GET | `/api/student/assessment-results/:attemptId` | Result + intelligence |
| GET | `/api/student/skill-intelligence` | Latest per-skill intelligence |
| UI | `/` | Landing page |
| UI | `/register` | Registration |
| UI | `/login` | Sign in |
| UI | `/app` | Protected application shell |
| UI | `/app/profile` | Student profile (STUDENT) |
| UI | `/app/skills` | Student skills (STUDENT) |
| UI | `/app/assessments` | Assessment list |
| UI | `/app/assessments/:id` | Take assessment |
| UI | `/app/assessments/results/:attemptId` | Result |
| UI | `/app/skill-intelligence` | Skill Intelligence |

## Development phases

Work proceeds **one phase at a time**. Do not start the next phase until it is explicitly requested.

1. Foundation + UI design system  
2. Authentication + RBAC  
3. Student profile + skills  
4. Skill assessment + skill intelligence  
5. Industry opportunities  
6. Matching engine  
7. Applications + tracking  
8. Industry candidate ranking  
9. Institution analytics  

Post-MVP: learning programmes, digital portfolio, academician portal, verification, optional AI resume parsing, SIH polish.

## License

MIT. See [LICENSE](LICENSE).
