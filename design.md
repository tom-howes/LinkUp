# LinkUp — Design Document

**Targeted Job Matching & Private Chat**

- **Authors:** Tony Zhang, Thomas Howes
- **Class:** [Web Development, Summer 2026](https://johnguerra.co/classes/webDevelopment_online_summer_2026/)
- **Repository:** github.com/tom-howes/LinkUp

---

## 1. Project Description

Traditional job boards ask jobseekers to compete on a full résumé and ask
employers to wade through hundreds of loosely-relevant applications. Both sides
spend most of their effort filtering noise.

**LinkUp flips the model: both sides commit to a few specific, evidenced
qualifications up front.** A jobseeker posts **one desired job title** plus their
**top 3 skills**, each backed by a short piece of evidence (a project, a
certification, a shipped feature). An employer posts a job with the **same kind
of title** and only **1–2 must-have skills**. When a seeker's title and at least
one skill line up with a posting, LinkUp surfaces it as a **match** and lets
either side **unlock a private chat** to talk about the role.

Because postings are built around a couple of concrete required skills rather
than a generic description, LinkUp also gives seekers a clearer picture of what
a role actually involves day-to-day — helping connect coursework and self-study
to the skills employers are really screening for.

**What makes it different**
- Matching is driven by an exact **title match + skill overlap**, not keyword
  search or a résumé upload.
- Every seeker skill carries **evidence**, so a match is a claim someone can back
  up — not just a box ticked.
- Conversations are **gated behind a real match** and unlocked deliberately, so
  chat only happens between genuinely relevant people.

---

## 2. User Personas

### Priya — Recent Graduate
- **Age / context:** 22, just finished a CS degree, limited formal work history.
- **Goal:** Get noticed for one or two things she is genuinely strong at (React,
  TypeScript) instead of being screened out for a thin résumé.
- **Frustration:** On big job boards her application disappears into a pile; she
  never learns whether her skills were even relevant.
- **How LinkUp helps:** She sets *Frontend Developer* + three evidenced skills.
  LinkUp surfaces only the postings she actually qualifies for, and an employer
  can start a focused conversation about her React work.

### Marcus — Hiring Manager
- **Age / context:** 38, engineering manager at a small company, hiring while
  also shipping product.
- **Goal:** Skip irrelevant applicants and only talk to people who have the 1–2
  must-have skills for the role.
- **Frustration:** Reviewing dozens of résumés for a role that really comes down
  to "can they do X and Y."
- **How LinkUp helps:** He posts *Backend Developer* requiring **Node.js** and
  **MongoDB**. Only seekers whose title and skills overlap become matches, and he
  can open a private chat with the strong ones.

### Dana — Career Switcher
- **Age / context:** 30, moving from marketing into data analysis via
  self-study.
- **Goal:** Find out whether her evidence for a new skill is strong enough to
  compete in an unfamiliar field.
- **Frustration:** She doesn't know which skills employers actually screen for,
  or whether her portfolio projects "count."
- **How LinkUp helps:** Postings expose the concrete required skills for a title,
  so Dana can see exactly what *Data Analyst* roles ask for (SQL, Python), phrase
  her evidence against them, and get real feedback in chat.

---

## 3. User Stories

Written as stories (who / want / so that), each with acceptance criteria.

1. **Seeker — build an evidenced profile**
   *As a jobseeker, I want to set my desired title and up to 3 skills with
   evidence, so that I only surface for postings I'm genuinely qualified for.*
   - Can set exactly one desired title.
   - Can add up to 3 skills; each requires a name **and** a short evidence note.
   - Saving persists to my profile and is reflected immediately.

2. **Employer — manage postings (full CRUD)**
   *As an employer, I want to create, edit, delete, and browse my own postings
   with a title and 1–2 required skills, so that I attract closely matching
   candidates.*
   - Can create a posting with a title, 1–2 required skills, location, and
     description.
   - Can edit, close/reopen, and delete only my own postings.
   - The create form rejects 0 skills or more than 2.

3. **Anyone — automatic matching**
   *As a user, I want the system to surface matches when my title and skills
   align with a posting, so that I don't have to search manually.*
   - A match is generated when a seeker's title equals a posting's title **and**
     at least one required skill overlaps.
   - Matches record which skills matched.
   - Re-running matching does not create duplicates.

4. **Matched user — private chat**
   *As a matched user, I want to open a private chat once a match is unlocked, so
   that we can discuss the broader role and skillset.*
   - Chat is only available on an **unlocked** match.
   - Only the two participants can read or post messages.
   - I can send, edit, and delete my own messages.

5. **Anyone — manage matches**
   *As a user, I want to view and manage my matches (pending / unlocked /
   dismissed), so that I can track who I'm talking to.*
   - I can see all my matches with their current status.
   - I can unlock, dismiss, or delete a match.
   - Deleting a match also removes its chat history.

---

## 4. Design Mockups

Low-fidelity wireframes of the primary screens. Colors reflect the shipped UI
(navy nav `#1f2a44`, primary action blue `#2d6cdf`).

### 4.1 Login / Register
Email + password with a role selector on register (Passport local strategy).

![Login and register screen](docs/mockups/01-login.svg)

### 4.2 Browse Postings (seeker)
A search box over the open postings, each card showing title, company, required
skills, and a short description.

![Browse postings screen](docs/mockups/02-browse.svg)

### 4.3 Matches & Private Chat (seeker)
Match cards with status badges and actions. Unlocking a match opens the private
chat overlay with message bubbles and a composer.

![Matches list with chat overlay](docs/mockups/03-matches-chat.svg)

### 4.4 Employer Postings (create + manage)
The create form (title, 1–2 skills, location, description) above the employer's
existing postings, each with edit / close / delete controls.

![Employer postings management screen](docs/mockups/04-employer-postings.svg)

### 4.5 Seeker Profile
Desired title plus up to three skills, each paired with an evidence note.

![Seeker profile editor screen](docs/mockups/05-profile.svg)

---

## 5. Data Model (reference)

Four MongoDB collections (native driver, no Mongoose):

| Collection | Key fields |
|---|---|
| `users` | `email`, `password` (bcrypt), `role` (`seeker`\|`employer`); seekers add `desiredTitle` + `skills[{name, evidence}]` (≤3); employers add `companyName` |
| `postings` | `title`, `requiredSkills[]` (1–2), `description`, `location`, `posterId`, `status` (`open`\|`closed`) |
| `matches` | `seekerId`, `postingId`, `posterId`, `matchedSkills[]`, `status` (`pending`\|`unlocked`\|`dismissed`) |
| `messages` | `matchId`, `senderId`, `text`, `timestamp` |

**Matching rule:** a match exists when `normalize(seeker.desiredTitle) ===
normalize(posting.title)` **and** the seeker's skills overlap the posting's
`requiredSkills` by at least one. Deleting a posting or match cascades to the
dependent matches / messages.

---

## 6. Tech Stack

- **Frontend:** React (hooks, client-side rendering) via Create React App
- **Backend:** Node.js + Express
- **Database:** MongoDB (native Node.js driver)
- **Auth:** Passport (local strategy) + express-session
- **Data requests:** Fetch API
- Deliberately avoids Mongoose, Axios, and the `cors` package.
