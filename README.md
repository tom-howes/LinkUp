# LinkUp - Targeted Job Matching & Private Chat

## Author
- Tony Zhang
- Thomas Howes

## Class Link
[Course link here - add your course/section link]

## Project Objective
LinkUp is a targeted matching app for jobseekers and employers. Instead of open
browsing, both sides commit to a small number of specific, evidenced
qualifications up front. A jobseeker posts one desired job title (must match)
plus their top 3 skills, each backed by a short piece of evidence. An employer
posts a job with the same title and only 1-2 top required skills. When a
seeker's title and skills line up with a posting, LinkUp surfaces it as a
match and unlocks a private chat between the two.

## Screenshot
_Add a screenshot of the running app here before submission._

## Tech Stack
- Frontend: React (hooks, client-side rendering), Vite
- Backend: Node.js + Express
- Database: MongoDB (native Node.js driver, no Mongoose)
- Auth: Passport (local strategy) + express-session
- Data requests: Fetch API

## Folder Structure
```
linkup/
  backend/     Express API, Mongo connection, Passport auth, routes, seed script
  frontend/    React app (Vite, hooks, one component per file + matching CSS)
```

## Instructions to Build

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your own Mongo URI and session secret
npm run seed            # populates 1k+ synthetic records
npm run dev              # starts API on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev              # starts Vite dev server on http://localhost:5173
```

The frontend expects the backend running at `http://localhost:5000` (see
`frontend/src/api/api.js`).

## Environment Variables
See `backend/.env.example`. Never commit a real `.env` file - it is already
listed in `.gitignore`.

## Deployment
_Add your deployed URL(s) here (e.g. Render/Railway for backend, Netlify/Vercel
for frontend) once deployed._

## AI Usage Disclosure
AI tools were used for brainstorming, scaffolding boilerplate, debugging help,
and writing support. Both students implemented, understood, and are able to
explain the full-stack logic for their own user stories.

## License
MIT - see `LICENSE`.
