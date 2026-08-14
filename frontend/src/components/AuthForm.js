import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import Button from "./Button";
import Field from "./Field";
import StatusMessage from "./StatusMessage";
import styles from "./AuthForm.module.css";

/**
 * The signed-out landing page: what LinkUp is on the left, the log in /
 * register card on the right.
 *
 * Three deliberate changes from the previous build:
 *  - the page explains what the app does before asking for credentials, so a
 *    first-time user knows what they are signing up for;
 *  - it is a real <form>, so pressing Enter submits (the previous build used a
 *    plain button in a div, so Enter did nothing at all);
 *  - demo accounts are one click away, so someone evaluating the app can reach
 *    the interesting part without inventing a profile first.
 */
const DEMO_ACCOUNTS = {
  seeker: { email: "demo.seeker@linkup.app", password: "password123" },
  employer: { email: "demo.employer@linkup.app", password: "password123" },
};

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seeker");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  function switchMode(next) {
    setMode(next);
    setError("");
    setFieldErrors({});
  }

  function loadDemoAccount(kind) {
    const account = DEMO_ACCOUNTS[kind];
    setMode("login");
    setEmail(account.email);
    setPassword(account.password);
    setError("");
    setFieldErrors({});
  }

  function validate() {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = "Enter a valid email address, for example you@example.com.";
    }
    if (!password) {
      errors.password = "Enter your password.";
    } else if (isRegister && password.length < 8) {
      errors.password = "Choose a password of at least 8 characters.";
    }
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBusy(true);
    try {
      const user = isRegister
        ? await api.register({ email: email.trim(), password, role })
        : await api.login({ email: email.trim(), password });
      onAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={`${styles.brandBar} on-dark`}>
        <p className={styles.brand}>
          Link<span className={styles.brandAccent}>Up</span>
        </p>
      </header>

      <main className={styles.main} id="main-content">
        <section className={styles.pitch} aria-labelledby="pitch-title">
          <h1 id="pitch-title" className={styles.pitchTitle}>
            Match on the few skills that actually matter
          </h1>
          <p className={styles.pitchLead}>
            LinkUp is targeted job matching. Instead of a full CV against a wall of
            listings, both sides commit to a handful of specific, evidenced skills up
            front - and a private chat only opens once there is a genuine match.
          </p>

          <h2 className={styles.pitchSubtitle}>How it works</h2>
          <ol className={styles.steps}>
            <li>
              <strong>Jobseekers</strong> pick one desired job title and up to 3 skills,
              each backed by a short piece of evidence.
            </li>
            <li>
              <strong>Employers</strong> post a role with the same title and only 1-2
              genuinely must-have skills.
            </li>
            <li>
              <strong>LinkUp</strong> surfaces a match when the titles are the same and at
              least one skill overlaps.
            </li>
            <li>
              <strong>Either side</strong> can unlock a private chat to talk about the
              role.
            </li>
          </ol>
        </section>

        <section className={styles.cardWrap} aria-labelledby="auth-title">
          <div className={styles.card}>
            <h2 id="auth-title" className={styles.cardTitle}>
              {isRegister ? "Create your account" : "Log in to LinkUp"}
            </h2>

            <div className={styles.modeToggle}>
              <button
                type="button"
                className={`${styles.modeButton} ${!isRegister ? styles.modeButtonActive : ""}`}
                aria-pressed={!isRegister}
                onClick={() => switchMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                className={`${styles.modeButton} ${isRegister ? styles.modeButtonActive : ""}`}
                aria-pressed={isRegister}
                onClick={() => switchMode("register")}
              >
                Register
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <Field
                id="auth-email"
                label="Email address"
                type="email"
                value={email}
                required
                autoComplete="username"
                placeholder="you@example.com"
                error={fieldErrors.email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Field
                id="auth-password"
                label="Password"
                type="password"
                value={password}
                required
                autoComplete={isRegister ? "new-password" : "current-password"}
                hint={isRegister ? "At least 8 characters." : undefined}
                error={fieldErrors.password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {isRegister && (
                <Field
                  id="auth-role"
                  label="I am a"
                  as="select"
                  value={role}
                  hint="This decides whether you build a profile or publish postings. It cannot be changed later."
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="seeker">Jobseeker - looking for a role</option>
                  <option value="employer">Employer - hiring for a role</option>
                </Field>
              )}

              <StatusMessage tone="error">{error}</StatusMessage>

              <Button type="submit" variant="primary" fullWidth disabled={busy}>
                {busy ? "Working..." : isRegister ? "Create account" : "Log in"}
              </Button>
            </form>

            <div className={styles.demo}>
              <h3 className={styles.demoTitle}>Just looking around?</h3>
              <p className={styles.demoText}>
                Load a ready-made account with a profile, postings and matches already set
                up.
              </p>
              <div className={styles.demoButtons}>
                <Button size="sm" onClick={() => loadDemoAccount("seeker")}>
                  Use jobseeker demo
                </Button>
                <Button size="sm" onClick={() => loadDemoAccount("employer")}>
                  Use employer demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

AuthForm.propTypes = {
  onAuth: PropTypes.func.isRequired,
};

export default AuthForm;
