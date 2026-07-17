import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import "./AuthForm.css";

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seeker");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setError("");
    setBusy(true);
    try {
      const user =
        mode === "login"
          ? await api.login({ email, password })
          : await api.register({ email, password, role });
      onAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-tabs">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          Log in
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <label htmlFor="auth-email">Email</label>
      <input
        id="auth-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="auth-password">Password</label>
      <input
        id="auth-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {mode === "register" && (
        <>
          <label htmlFor="auth-role">I am a</label>
          <select id="auth-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="seeker">Jobseeker</option>
            <option value="employer">Employer</option>
          </select>
        </>
      )}

      {error && <p className="auth-error">{error}</p>}

      <button
        type="button"
        className="auth-submit"
        onClick={handleSubmit}
        disabled={busy}
      >
        {busy ? "..." : mode === "login" ? "Log in" : "Create account"}
      </button>
    </div>
  );
}

AuthForm.propTypes = {
  onAuth: PropTypes.func.isRequired,
};

export default AuthForm;
