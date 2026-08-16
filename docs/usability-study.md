# LinkUp — Usability Study Report

> **Recordings:** links to the six session recordings go in §4 (one per
> participant). Make sure the folder and this document are both shared with
> **john.guerra@gmail.com** before submitting.

**Authors:** Tony Zhang, Thomas Howes
**Build under test:** https://linkup-bse3.onrender.com/
**Method:** Moderated think-aloud, ~30–45 minutes per session, 6 participants

_This is a two-person project (Tony Zhang, Thomas Howes), so the requirement is
6 participants — 3 per project member. Tony ran Participants 1–3; Thomas ran
Participants 4–6._

> Appendix A is a _heuristic evaluation_ — an expert inspection that drove the
> current build — and is deliberately kept separate from the participant
> findings in §4 and §5.

---

## 1. Application scope

### 1.1 Application description

LinkUp is a targeted job-matching app for jobseekers and employers. Instead of
matching a full CV against a wall of listings, both sides commit to a small
number of specific, **evidenced** qualifications up front:

- a **jobseeker** sets one desired job title and up to 3 skills, each backed by a
  short piece of evidence (a project, a certification, something they shipped);
- an **employer** posts a role with a job title and only 1–2 genuinely must-have
  skills.

LinkUp surfaces a **match** when the seeker's desired title equals the posting's
title **and** at least one skill overlaps. Either side can then unlock a
**private chat**, which is the only way the two can talk — conversation is gated
behind a real match rather than open messaging.

### 1.2 Users — target audience

Three personas, carried over from the design document:

**Priya — recent graduate.** 22, just finished a CS degree, little formal work
history. Wants to be noticed for the two things she is genuinely strong at
(React, TypeScript) rather than screened out for a thin résumé. On large job
boards her applications disappear and she never learns whether her skills were
even relevant.

**Marcus — hiring manager.** 38, engineering manager at a small company, hiring
while also shipping product. Wants to skip irrelevant applicants and only talk to
people who have the 1–2 must-have skills. Frustrated by reviewing dozens of CVs
for a role that comes down to "can they do X and Y".

**Dana — career switcher.** 30, moving from marketing into data analysis via
self-study. Wants to know whether her evidence for a new skill is strong enough
to compete, and which skills employers actually screen for.

**Recruit for contrast, not volume.** With six participants across two
facilitators the mix still matters more than the count. Aim to cover:

| Persona fit  | Looking for                          |
| ------------ | ------------------------------------ |
| Priya / Dana | Has job-hunted in the last 2 years   |
| Marcus       | Has screened or hired candidates     |
| Any          | Keyboard-first or screen-reader user |

Nobody who has seen the app before.

### 1.3 Data description

Four MongoDB collections. The deployed build is seeded with **over 4,000 synthetic
records** so search and matching behave realistically.

| Collection | Stored                                                                                                                       | Displayed                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `users`    | Email, bcrypt password hash, role; seekers add `desiredTitle` + `skills[{name, evidence}]` (≤3); employers add `companyName` | Own profile; a candidate's title, skills and evidence on employer match cards |
| `postings` | Title, 1–2 `requiredSkills`, description, location, poster, open/closed status                                               | Browse and search results, employer's own posting list                        |
| `matches`  | Seeker, posting, poster, `matchedSkills`, status (pending / unlocked / dismissed)                                            | Match cards with the skills that caused the match, worded status              |
| `messages` | Match, sender, text, timestamp, edit timestamp                                                                               | The private chat thread for an unlocked match                                 |

Passwords are never returned by the API; a candidate's email is never exposed to
an employer.

### 1.4 Main tasks — use cases

Five tasks, each with a concrete success criterion. Participants do **both
roles** in one session: T1–T3 as a jobseeker, then T4–T5 as an employer.

| #   | Task                                                                                               | Success criterion                                                                  |
| --- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| T1  | Set up a jobseeker profile that employers could match against.                                     | Desired title set and ≥1 skill with evidence saved successfully.                   |
| T2  | Find which jobs you are a match for, and say why one matched.                                      | Reaches Matches, reads a card, and names **both** the title and the skill overlap. |
| T3  | Start a private conversation and correct something you sent.                                       | Unlocks a match, opens the chat, sends a message, then edits it.                   |
| T4  | Advertise a role for a Frontend Developer who knows React.                                         | Posting published with a title and ≥1 required skill.                              |
| T5  | Review who matched, read a candidate's evidence, then set one aside without losing it permanently. | Reads the evidence on a match card, then uses **Dismiss** rather than **Delete**.  |

> Note on scope of the sessions actually run: Tony's three sessions concentrated
> on the seeker-side flow (T1–T3 plus match management), since that is the half
> of the app he owns; the seeker tasks were exercised in depth including profile
> editing and dismiss-vs-delete. Employer-side tasks (T4–T5) are covered by
> Thomas's three sessions.

---

## 2. Experiment

### 2.1 Preparation

#### Introduction (read aloud before recording starts)

> Thanks for helping with this. First, the important bit: **I'm testing the
> website, not you.** There are no wrong answers, and if something is confusing
> or annoying, that is exactly what I need to hear — it's the most useful thing
> you can give me.
>
> Please **think out loud** as you go: say what you're looking at, what you
> expect to happen, and what you're trying to do. I won't be able to answer
> questions during the tasks, because I need to see what happens when you're on
> your own — but I'll answer anything afterwards.
>
> The app is for people looking for a job and for people hiring. **Try to
> approach it as someone in that position** — imagine you're actually job-hunting
> or actually hiring for a role.
>
> You can stop at any time, for any reason, and you don't have to say why.
>
> **Is it OK if I record the screen, the audio and your webcam?** Nothing
> identifying will be shared — the recording is only seen by me and my
> instructor.

**Capture the consent answer _on_ the recording**: start recording, then ask the
consent question again briefly so the "yes" is on tape.

#### Demographics questions

Ask before the tasks. Preface with: _"You can skip any of these — just say pass."_

| #   | Question                                                                                     |
| --- | -------------------------------------------------------------------------------------------- |
| D1  | What age range are you in? (18–24 / 25–34 / 35–44 / 45–54 / 55+ / prefer not to say)         |
| D2  | What's your current situation? (student / employed / looking for work / hiring / other)      |
| D3  | Have you looked for a job in the last 2 years? If so, which sites did you use?               |
| D4  | Have you ever screened CVs or interviewed candidates?                                        |
| D5  | How often do you use job boards like LinkedIn or Indeed? (never / rarely / monthly / weekly) |
| D6  | Do you normally use a keyboard only, a screen reader, or any other assistive technology?     |
| D7  | How comfortable are you with web apps generally? (1 not at all — 5 very)                     |

#### Recording setup

- [ ] **Screen** capture running, at the deployed URL — not localhost
- [ ] **Audio** capture running and levels checked
- [ ] **Video** (webcam) running, or noted in §4 if the participant declined
- [ ] Consent captured on the recording itself
- [ ] Browser at a normal window size, zoom at 100%, no dev tools open
- [ ] Demo accounts working before the participant arrives

**Keyboard-only condition.** Run at least one session with the mouse and
trackpad unavailable. If one participant is a keyboard or screen-reader user, run
their whole session that way — that is worth far more than asking a mouse user to
pretend.

#### Task scripts (read to the participant)

**Script for intuitiveness (initial approach) — no clicking yet**

> Take a look at this page, but don't click anything yet.
>
> 1. What do you think this site is for?
> 2. Who do you think it's for?
> 3. If you were going to use it, what would you do first?

**Script for T1**

> You're looking for a job as a **Frontend Developer**, and you're good at
> **React**. Set yourself up on this site so that an employer looking for
> someone like you could find you.

**Script for T2**

> Now find out which jobs you're a match for. Pick one of them and tell me, in
> your own words, why you think that job matched you.

**Script for T3**

> You'd like to talk to the employer behind one of those jobs. Get a
> conversation going and send them a short message. Then imagine you spotted a
> typo — change the message you just sent.

**Script for T4**

> Now switch sides. You're hiring, and you need a **Frontend Developer who knows
> React**. Advertise that role on this site.

**Script for T5**

> Find out who's a good fit for the role you just posted. Pick one of them and
> tell me what evidence they gave for their strongest skill. Then there's one
> you're not interested in right now — set that one aside, but don't get rid of
> it permanently, in case you change your mind.

#### Post-questionnaire — Likert scales

Ask the two scale questions **immediately after each task**, while it's fresh.
All scales are 1–5.

- _Effective_: 1 = did not let me do it at all, 5 = let me do it completely
- _Intuitive_: 1 = very difficult, 5 = very easy

| Question                                                         |
| ---------------------------------------------------------------- |
| How **effective** was the application for T1?                    |
| How **intuitive / easy to use** was the application for T1?      |
| How **effective** was the application for T2?                    |
| How **intuitive / easy to use** was the application for T2?      |
| How **effective** was the application for T3?                    |
| How **intuitive / easy to use** was the application for T3?      |
| How **effective** was the application for T4?                    |
| How **intuitive / easy to use** was the application for T4?      |
| How **effective** was the application for T5?                    |
| How **intuitive / easy to use** was the application for T5?      |
| How **effective** was the application **overall**?               |
| How **intuitive / easy to use** was the application **overall**? |
| Any final comments or suggestions for improvement?               |

---

## 3. Experiment notes — method

After each session, **before doing anything else**, write down everything you
remember while it is still fresh. Then **rewatch the recording** and look
specifically for:

- moments of hesitation — a pause of more than a few seconds before acting,
- backtracking — opening the wrong screen, undoing, starting over,
- visible or audible frustration, sighing, "hmm", "wait",
- anything the participant said that contradicts what they did,
- anywhere they needed an **assist** (record it as one if they were stuck for
  60 seconds and you stepped in).

Turn those moments into issues, bugs and improvements in §5.

---

## 4. Participants

### Participant 1 (facilitator: Tony)

**Recording:** _link_
**Date:** _____ **Condition:** mouse

#### Demographics answers

| #   | Question                | Answer                                                                                                                             |
| --- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Age range               | 25                                                                                                                                |
| D2  | Current situation       | Studying + working + job hunting — Northeastern CS master's (2nd yr), on a SWE co-op, seeking a new-grad role for next year        |
| D3  | Job-hunted / sites used | Yes; LinkedIn (most used)                                                                                                          |
| D4  | Screened or hired       | No                                                                                                                                 |
| D5  | Job board frequency     | Regular LinkedIn user                                                                                                              |
| D6  | Assistive tech          | None                                                                                                                               |
| D7  | Web app comfort (1–5)   | 5 — "super comfortable"                                                                                                            |

#### Detailed notes

- **Initial approach (intuitiveness):** Read the app correctly as a job-hunting tool with seeker/employer roles, unprompted. Understood the seeker-vs-employer split immediately. Said unprompted he'd expect to upload a resume and see company descriptions and open positions — an expectation the app does not meet.
- **T1 — profile:** Signed up smoothly, though login needed one page refresh before it went through (possible cold-start / session hiccup). Called sign-up "pretty good." When asked what "evidence" meant, his answer was really about *matching* ("for me to match the job to my skills"), i.e. he did not clearly grasp that evidence is proof of a skill. Confident it saved. Noted a school project might feel like weak evidence; he'd want to attach a GitHub link or work sample.
- **T2 — matches:** Understood matching (title + skill) immediately. Single "Generate matches" button clear. Read status + matched skills + company name correctly.
- **T3 — chat:** Unlock did what he expected; chat felt "like a normal chat app." Suggested the message edit/delete buttons be hidden behind an overflow/extend control rather than always shown.
- **T4 — posting:** (Employer flow not run in depth in this session — seeker-side focus.)
- **T5 — evidence and dismiss:** **Dismiss vs delete guessed wrong** — thought dismiss = ignore employer messages, delete = remove the posting so he'd never see it. Did not distinguish reversible vs permanent.
- **Assists given:** Minor verbal guidance to locate tabs; one login refresh.
- **Keyboard-only observations:** n/a (mouse session).

#### Post-test questionnaire results

| Task        | Effective (1–5) | Intuitive (1–5) | Notes                                                                          |
| ----------- | --------------- | --------------- | ------------------------------------------------------------------------------ |
| T1          | 4               | 5               | Wanted resume upload; felt 3-skill cap can be too few for some roles           |
| T2          | 4               | 5               | Matches map cleanly to profile                                                 |
| T3          | 4               | ~3              | Effective but not intuitive — didn't expect to *unlock* a chat first           |
| T4          | —               | —               | Employer flow not exercised in depth                                           |
| T5          | 4               | —               | Understood management once shown; dismiss/delete meaning unclear up front      |
| **Overall** | 4               | 5               | Clear what to do and how; wants resume upload + posting detail view            |

**Final comments / suggestions:** Add resume upload; show full posting details (not just location/company/skills); allow more than 3 skills or parse skills from experience; add company logos to postings.

---

### Participant 2 (facilitator: Tony)

**Recording:** _link_
**Date:** _____ **Condition:** mouse

#### Demographics answers

| #   | Question                | Answer                                                              |
| --- | ----------------------- | ------------------------------------------------------------------- |
| D1  | Age range               | 20s                                                                 |
| D2  | Current situation       | Working — software engineer (networking), 3+ years out of university |
| D3  | Job-hunted / sites used | LinkedIn (definitely); Handshake in university; unsure about Indeed |
| D4  | Screened or hired       | No                                                                  |
| D5  | Job board frequency     | "Everybody uses LinkedIn"                                           |
| D6  | Assistive tech          | None                                                                |
| D7  | Web app comfort (1–5)   | 5 — "very very comfortable"                                         |

#### Detailed notes

- **Initial approach (intuitiveness):** First reaction: the signed-out page gives **zero intel** — "no logo, no tagline, I don't know if I'm logging into the NSA." Could only infer the purpose from prior context, not the page itself. Praised the snappy load ("UI comes up instantly," vs LinkedIn's slow hydration).
- **T1 — profile:** Registered fine; only two journeys from the front page, found that clear. "Shorter is better" on forms. On "evidence," was **unsure what format was wanted** — "I don't know if you want a description or a link" — and said a longer/explained field would help. This is the clearest articulation of the evidence-field ambiguity.
- **Save confidence:** **Not 100% sure it saved** because the "Saved" message appears even after removing a skill, so the confirmation doesn't feel tied to the actual save. Called it "kind of confusing."
- **T2 — matches:** Understood matching. **Unsure what "pending" status meant** — didn't connect it to "not yet unlocked."
- **T3 — chat:** Had **no idea what "unlock" meant** beforehand — "I've never seen a platform have an unlock chat option." Found it odd to be chatting with a "role/position" rather than a person. Unlock worked as expected once clicked. Suggested showing who you're chatting with, a chat start time, and reactions. Found always-editable, pre-populated profile fields "a little odd" — expected flat text with a pencil/edit affordance.
- **T5 — evidence and dismiss:** **Dismiss vs delete guessed wrong** — thought delete "blocks the person," dismiss = "read your notification." Named dismiss/delete the single most confusing thing.
- **Assists given:** Minimal.
- **Keyboard-only observations:** n/a (mouse session).

#### Post-test questionnaire results

| Task        | Effective (1–5) | Intuitive (1–5) | Notes                                                                    |
| ----------- | --------------- | --------------- | ------------------------------------------------------------------------ |
| T1          | 5               | 5               | Easy; wanted more optional fields (location, education)                  |
| T2          | 4               | 5               | Wanted "0 matches for X skill" as a demand signal                        |
| T3          | 5               | 3               | "I don't think it should be unlocking things — just let me open it"      |
| T4          | —               | —               | Employer flow not exercised in depth                                     |
| T5          | 4               | —               | Wanted undo / "here's what you deleted" toast; a trash bin for deletes   |
| **Overall** | 5               | 5               | Faster than LinkedIn; suggested profile-first onboarding                 |

**Final comments / suggestions:** Signed-out page needs a logo/tagline; rework the "unlock" step; add undo/feedback on delete; show chat partner + timestamp; optional color-coding of match cards by role; consider profile-first onboarding.

---

### Participant 3 (facilitator: Tony)

**Recording:** _link_
**Date:** _____ **Condition:** mouse

#### Demographics answers

| #   | Question                | Answer                                                                              |
| --- | ----------------------- | ----------------------------------------------------------------------------------- |
| D1  | Age range               | 24                                                                                  |
| D2  | Current situation       | Working — software developer at a drug distributor (C++, SQL)                       |
| D3  | Job-hunted / sites used | LinkedIn, Indeed, Handshake; liked Handshake most (real responses); Indeed spammy   |
| D4  | Screened or hired       | No                                                                                  |
| D5  | Job board frequency     | Has used all three                                                                  |
| D6  | Assistive tech          | None                                                                                |
| D7  | Web app comfort (1–5)   | 5 — "pretty tech-savvy"                                                             |

#### Detailed notes

- **Initial approach (intuitiveness):** From the login screen, correctly reasoned the app tackles a pain point in the application process and is for seekers, switchers, and students.
- **T1 — profile:** Very clear. Liked that register vs login was distinguished by color. Suggested a confirm-password field. "Evidence" was clear to him ("something that shows you have this skill"). Knew the 3-skill cap from the "max 3" label. Felt it saved via "Saved" text but **wanted a clearer visual change** on save. Unprompted praise for the browse cards showing *required* skills so you can judge fit without reading the full description.
- **T2 — matches:** Understood matching (title + skill); generate button clear as the only action.
- **T3 — chat:** Unlocked, opened chat, sent a message, discovered message editing on his own. Unlock did what he expected, though he "wasn't sure what to expect." Wanted the employer's name shown in the chat.
- **T5 — evidence and dismiss:** **Only participant to get dismiss vs delete right** — correctly reasoned delete removes entirely, dismiss hides temporarily, then verified both by testing. Even so, later named "unlock chat" wording as the #1 thing he'd change.
- **Assists given:** None of note; fully self-directed.
- **Keyboard-only observations:** n/a (mouse session).

#### Post-test questionnaire results

| Task        | Effective (1–5) | Intuitive (1–5) | Notes                                                                       |
| ----------- | --------------- | --------------- | --------------------------------------------------------------------------- |
| T1          | 4               | 5               | Process is a 5; docked to 4 wanting more profile options (location, remote) |
| T2          | 5               | 5               | Single button, instant results                                              |
| T3          | 5               | 5               | Two clicks; unsure why unlock is needed but fine as a confirmation          |
| T4          | —               | —               | Employer flow not exercised in depth                                        |
| T5          | 5               | —               | Liked having both dismiss and delete; easy to regenerate after delete       |
| **Overall** | 4               | 5               | Functionality-limited (wants more match dimensions); very easy to use       |

**Final comments / suggestions:** Rework "unlock chat" wording (and capitalize the C); add more profile/match dimensions (location, remote/hybrid/onsite, multiple titles); make the "seeker" header label link to the profile; profile-first onboarding.

---

### Participant 4 (facilitator: Thomas)

**Recording:** _link_
**Date:** _____ **Condition:** mouse / keyboard-only

#### Demographics answers

| #   | Question                | Answer |
| --- | ----------------------- | ------ |
| D1  | Age range               |        |
| D2  | Current situation       |        |
| D3  | Job-hunted / sites used |        |
| D4  | Screened or hired       |        |
| D5  | Job board frequency     |        |
| D6  | Assistive tech          |        |
| D7  | Web app comfort (1–5)   |        |

#### Detailed notes

- **Initial approach (intuitiveness):**
- **T1 — profile:**
- **T2 — matches:**
- **T3 — chat:**
- **T4 — posting:**
- **T5 — evidence and dismiss:**
- **Assists given:**
- **Keyboard-only observations (if applicable):**

#### Post-test questionnaire results

| Task        | Effective (1–5) | Intuitive (1–5) | Notes |
| ----------- | --------------- | --------------- | ----- |
| T1          |                 |                 |       |
| T2          |                 |                 |       |
| T3          |                 |                 |       |
| T4          |                 |                 |       |
| T5          |                 |                 |       |
| **Overall** |                 |                 |       |

**Final comments / suggestions:**

---

### Participant 5 (facilitator: Thomas)

**Recording:** _link_
**Date:** _____ **Condition:** mouse / keyboard-only

#### Demographics answers

| #   | Question                | Answer |
| --- | ----------------------- | ------ |
| D1  | Age range               |        |
| D2  | Current situation       |        |
| D3  | Job-hunted / sites used |        |
| D4  | Screened or hired       |        |
| D5  | Job board frequency     |        |
| D6  | Assistive tech          |        |
| D7  | Web app comfort (1–5)   |        |

#### Detailed notes

- **Initial approach (intuitiveness):**
- **T1 — profile:**
- **T2 — matches:**
- **T3 — chat:**
- **T4 — posting:**
- **T5 — evidence and dismiss:**
- **Assists given:**
- **Keyboard-only observations (if applicable):**

#### Post-test questionnaire results

| Task        | Effective (1–5) | Intuitive (1–5) | Notes |
| ----------- | --------------- | --------------- | ----- |
| T1          |                 |                 |       |
| T2          |                 |                 |       |
| T3          |                 |                 |       |
| T4          |                 |                 |       |
| T5          |                 |                 |       |
| **Overall** |                 |                 |       |

**Final comments / suggestions:**

---

### Participant 6 (facilitator: Thomas)

**Recording:** _link_
**Date:** _____ **Condition:** mouse / keyboard-only

#### Demographics answers

| #   | Question                | Answer |
| --- | ----------------------- | ------ |
| D1  | Age range               |        |
| D2  | Current situation       |        |
| D3  | Job-hunted / sites used |        |
| D4  | Screened or hired       |        |
| D5  | Job board frequency     |        |
| D6  | Assistive tech          |        |
| D7  | Web app comfort (1–5)   |        |

#### Detailed notes

- **Initial approach (intuitiveness):**
- **T1 — profile:**
- **T2 — matches:**
- **T3 — chat:**
- **T4 — posting:**
- **T5 — evidence and dismiss:**
- **Assists given:**
- **Keyboard-only observations (if applicable):**

#### Post-test questionnaire results

| Task        | Effective (1–5) | Intuitive (1–5) | Notes |
| ----------- | --------------- | --------------- | ----- |
| T1          |                 |                 |       |
| T2          |                 |                 |       |
| T3          |                 |                 |       |
| T4          |                 |                 |       |
| T5          |                 |                 |       |
| **Overall** |                 |                 |       |

**Final comments / suggestions:**

---

### Summary across participants

Report completion as a count out of 6, not a percentage — with n=6 a percentage
implies a precision this sample does not have. (Tony's three sessions are filled
in below; Thomas's three are pending and the averages should be recomputed once
Participants 4–6 are added.)

| Task        | Completed (of 6) | Assists | Avg. effective | Avg. intuitive |
| ----------- | ---------------- | ------- | -------------- | -------------- |
| T1          | 3/3 so far       | 1 minor | 4.3 (P1–3)     | 5.0 (P1–3)     |
| T2          | 3/3 so far       | 0       | 4.3 (P1–3)     | 5.0 (P1–3)     |
| T3          | 3/3 so far       | 0       | 4.7 (P1–3)     | ~3.7 (P1–3)    |
| T4          | pending (Thomas) |         |                |                |
| T5          | 3/3 so far       | 0       | 4.3 (P1–3)     | —              |
| **Overall** | 3/3 so far       | 1 minor | 4.3 (P1–3)     | 5.0 (P1–3)     |

_Standout pattern: intuitiveness dips sharply on T3 (the unlock→chat flow) while
every other task sits at or near 5 — the numbers localise the main problem to the
"unlock" step._

---

## 5. Prioritized list of issues and corresponding changes

Most crucial issues, most severe first. Priority uses MoSCoW: **Must**
(ship-blocking), **Should** (important, not blocking), **Could** (worth doing if
time allows), **Would** (nice, out of scope for now). "Participants affected"
counts Tony's three sessions; update to /6 after Thomas's are added.

### Issue 1

- **Issue:** The "unlock chat" wording and the unlock→open two-step confused or
  bothered nearly every participant. Users don't recognise "unlock" as a chat
  affordance, and phrasing the chat as being with a *role/position* rather than a
  person reads oddly. Intuitiveness scores on T3 were the lowest of any task.
- **Change:** Relabel the primary action to something recognisable (e.g. "Start
  chat" / "Message"), keep a lightweight confirmation to prevent accidental
  outreach, and show the counterpart's name/company in the chat header so it's
  clear who you're talking to.
- **Priority:** Should
- **Participants affected:** 3 of 3
- **Was it implemented? How?**

### Issue 2

- **Issue:** Dismiss vs delete is not understood. Two of three participants
  guessed the meanings wrong; the third only worked it out by testing both.
  Reversible-vs-permanent is not communicated at the point of action.
- **Change:** Reword or annotate the two actions (e.g. "Dismiss (hide, can
  restore)" vs "Delete (permanent)"), and rely on the existing delete
  confirmation dialog to spell out the difference. Consider grouping delete
  behind an overflow so it isn't presented as a peer of dismiss.
- **Priority:** Should
- **Participants affected:** 2 of 3 (confused) + 1 needed testing to be sure
- **Was it implemented? How?**

### Issue 3

- **Issue:** The "evidence" field is ambiguous in both purpose and format. One
  participant conflated it with the matching mechanism; another was unsure
  whether to type a description or paste a link.
- **Change:** Add placeholder/hint text on the evidence input (e.g. "A link or a
  short note that backs up this skill — a project, repo, or certification").
- **Priority:** Should
- **Participants affected:** 2 of 3
- **Was it implemented? How?**

### Issue 4

- **Issue:** Save feedback is weak. One participant distrusted the "Saved"
  message because it persists after unrelated edits (like removing a skill);
  another wanted a clearer visual change to confirm the save happened.
- **Change:** Tie the confirmation to the actual save event, clear it when the
  form becomes dirty again, and use a brief, obvious visual cue (toast or
  inline check) on successful save.
- **Priority:** Could
- **Participants affected:** 2 of 3
- **Was it implemented? How?**

### Issue 5

- **Issue:** Secondary clarity gaps: the signed-out page lacks identity (one
  participant couldn't tell what the product was), the "pending" match status
  wording was unclear, and the always-editable pre-populated profile fields
  surprised a participant expecting a view/edit affordance.
- **Change:** Add a short product line/logo to the signed-out page; reword
  "pending" to something like "Waiting on you"; consider a clearer edit
  affordance on the profile. (The signed-out page identity and worded statuses
  overlap with changes already begun in Appendix A.)
- **Priority:** Could
- **Participants affected:** 1–2 of 3 each
- **Was it implemented? How?**

### Issue 6 (scope requests — not usability defects)

- **Issue:** Consistent feature requests beyond the current matching model:
  resume upload, full posting detail view, more than 3 skills, location /
  remote-hybrid-onsite as a match dimension, company logos, chat partner name +
  timestamp, and profile-first onboarding.
- **Change:** Log for a future iteration. Profile-first onboarding and showing
  the chat counterpart are the cheapest and most-requested; the rest expand the
  data model.
- **Priority:** Would
- **Participants affected:** 3 of 3 (various)
- **Was it implemented? How?** No — out of scope for this iteration; recorded for
  the backlog.

---

## Appendix A — heuristic evaluation of the round-1 build

**Method: expert inspection, not user testing. No participants were involved.**
This is kept separate from §4 and §5 on purpose — it is design evidence, not
study evidence, and none of it should be read as something a participant did.

The round-1 build was walked screen by screen — with a mouse, and again with the
keyboard only — and judged against Nielsen's usability heuristics and WCAG 2.1
AA. Every defect below is a property of that build, verifiable by reading its
source or operating it.

This is what drove the current iteration. It is **not** a substitute for the
sessions: predictive methods reliably miss problems that only appear when someone
unfamiliar sits down with the app. Indeed, the sessions surfaced issues the
heuristic pass did not weight heavily — notably the "unlock" wording and the
dismiss/delete confusion — confirming the value of running real users.

Severity: 1 cosmetic · 2 minor · 3 major · 4 catastrophic.

| Heuristic breached                                               | Severity | Defect in the round-1 build                                                                                                                                                                                      | Change made                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visibility of system status; match between system and real world | 3        | The signed-out page was a bare log-in box. Nothing on it said what the product was or who it was for.                                                                                                            | The signed-out page now explains what LinkUp is and how matching works before asking for credentials. `AuthForm`                                                                                                                            |
| User control and freedom; recognition over recall                | 4        | Matches were only ever computed by pressing **Generate matches**. Until it was pressed the screen was empty, with nothing indicating an action was required.                                                     | Matching runs automatically when a jobseeker opens Matches; the button remains as an explicit "Refresh matches". `MatchList`                                                                                                                |
| Error prevention; help users recognise and recover from errors   | 4        | Matching is an exact, case-normalised string comparison on the job title. "Front-end dev" silently produced zero matches, with no hint that the wording had to match and no way to discover the accepted values. | The title field is backed by a datalist of titles actually in use on the other side of the marketplace, and the hint states matching is exact. `ProfileEditor`, `PostingForm`, new `/api/postings/titles` and `/api/users/titles` endpoints |
| Consistency and standards                                        | 3        | The log-in "form" was a `div` containing a `type="button"`. <kbd>Enter</kbd> did nothing — a broken convention and a keyboard-accessibility failure.                                                             | Every form is a real `<form>` with a submit button. `AuthForm`, `ProfileEditor`                                                                                                                                                             |
| Help and documentation                                           | 3        | An empty Matches screen read "No matches yet." and offered no explanation or next step.                                                                                                                          | Empty states name the two matching conditions and offer the action that fixes it. New `EmptyState` component                                                                                                                                |
| Match between system and real world                              | 3        | Employer match cards showed a job title and nothing else — not the candidate's skills, not their evidence — so the feature the product is built around was invisible to the side that acts on it.                | Employer match cards show the candidate's skills **and their evidence**, with matched skills marked. `MatchCard`                                                                                                                            |
| Error prevention                                                 | 4        | **Delete** on a match, posting or message fired immediately on a single click. Deletion cascades to matches and messages and is unrecoverable.                                                                   | Every destructive action goes through a confirmation naming what will be lost, with focus defaulting to the safe option. New `ConfirmDialog` component                                                                                      |
| User control and freedom (and WCAG 2.1.2, 2.4.3)                 | 3        | The chat overlay was a `div` with a click handler: no <kbd>Esc</kbd>, no focus trap, no focus restoration, and the background stayed reachable by screen readers.                                                | Chat and all confirmations are native `<dialog>` modals with a real focus trap, Escape-to-close and focus return. New `Modal` component                                                                                                     |
| Recognition over recall                                          | 2        | Statuses were raw enum values ("pending", "unlocked", "dismissed"), and nothing distinguished the reversible action (dismiss) from the permanent one (delete).                                                   | Statuses are worded ("Waiting on you", "Chat unlocked", "Dismissed"), dismissed matches can be restored, and the delete dialog spells out the difference                                                                                    |
| Help and documentation                                           | 2        | There was no in-app explanation of the matching model anywhere after the first screen.                                                                                                                           | "How it works" sits in the header on every screen, with role-specific steps and keyboard shortcuts. New `HelpPanel` component                                                                                                               |