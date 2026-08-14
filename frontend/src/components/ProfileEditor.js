import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import SkillInput from "./SkillInput";
import PageHeader from "./PageHeader";
import Button from "./Button";
import Field from "./Field";
import StatusMessage from "./StatusMessage";
import ConfirmDialog from "./ConfirmDialog";
import styles from "./ProfileEditor.module.css";

const MAX_SKILLS = 3;

/**
 * Profile screen. Jobseekers set one desired title plus up to 3 evidenced
 * skills; employers set the company name shown on their postings.
 *
 * Matching is an exact title comparison - "Front-end Dev" never matches
 * "Frontend Developer" - and the previous build gave no hint of that, so a
 * near-miss silently produced zero matches. The title field is now backed by a
 * datalist of the titles employers are actually hiring for, and the hint says
 * the match is exact.
 */
function ProfileEditor({ user, onSaved, onAccountDeleted, titleSuggestions = [] }) {
  const isSeeker = user.role === "seeker";

  const [desiredTitle, setDesiredTitle] = useState(user.desiredTitle || "");
  const [skills, setSkills] = useState(user.skills || []);
  const [companyName, setCompanyName] = useState(user.companyName || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setDesiredTitle(user.desiredTitle || "");
    setSkills(user.skills || []);
    setCompanyName(user.companyName || "");
  }, [user]);

  function updateSkill(index, next) {
    setSkills((prev) => prev.map((s, i) => (i === index ? next : s)));
    setStatus("");
  }

  function removeSkill(index) {
    setSkills((prev) => prev.filter((_, i) => i !== index));
    setStatus("");
  }

  function addSkill() {
    if (skills.length >= MAX_SKILLS) return;
    setSkills((prev) => [...prev, { name: "", evidence: "" }]);
    setStatus("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (isSeeker) {
      if (!desiredTitle.trim()) {
        setError("Add the job title you are looking for before saving.");
        return;
      }
      const incomplete = skills.some((s) => !s.name.trim() || !s.evidence.trim());
      if (incomplete) {
        setError("Every skill needs both a name and a piece of evidence.");
        return;
      }
    }

    setBusy(true);
    try {
      const body = isSeeker
        ? { desiredTitle: desiredTitle.trim(), skills }
        : { companyName: companyName.trim() };
      const updated = await api.updateMe(body);
      onSaved(updated);
      setStatus("Your profile has been saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    setConfirmingDelete(false);
    setError("");
    try {
      await api.deleteMe();
      onAccountDeleted();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className={styles.profile} onSubmit={handleSubmit} noValidate>
      <PageHeader
        title="Your profile"
        description={
          isSeeker
            ? "The title and skills here are what LinkUp matches against. Keep them to the things you can back up."
            : "Your company name appears on every posting you publish."
        }
        action={
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "Saving..." : "Save profile"}
          </Button>
        }
      />

      {isSeeker ? (
        <>
          <div className={styles.section}>
            <Field
              id="desired-title"
              label="Desired job title"
              value={desiredTitle}
              required
              list="title-suggestions"
              placeholder="e.g. Frontend Developer"
              hint="Matching is exact, so pick the wording employers use. Start typing to see titles currently being hired for."
              onChange={(e) => {
                setDesiredTitle(e.target.value);
                setStatus("");
              }}
            />
            <datalist id="title-suggestions">
              {titleSuggestions.map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
          </div>

          <section className={styles.section} aria-labelledby="skills-heading">
            <div className={styles.sectionHead}>
              <div>
                <h2 id="skills-heading" className={styles.sectionTitle}>
                  Your skills
                </h2>
                <p className={styles.sectionHint}>
                  Up to {MAX_SKILLS}. Each one needs evidence - that is what makes a match
                  worth something. {skills.length} of {MAX_SKILLS} added.
                </p>
              </div>
              <Button onClick={addSkill} disabled={skills.length >= MAX_SKILLS}>
                Add skill
              </Button>
            </div>

            {skills.length === 0 ? (
              <p className={styles.noSkills}>
                No skills yet. You need at least one to be matched to a posting.
              </p>
            ) : (
              <ul className={styles.skillList}>
                {skills.map((skill, i) => (
                  <SkillInput
                    // Index is the identity here: rows have no id and are only
                    // ever appended or removed by position.
                    key={`skill-${i}`}
                    index={i}
                    skill={skill}
                    onChange={updateSkill}
                    onRemove={removeSkill}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <div className={styles.section}>
          <Field
            id="company-name"
            label="Company name"
            value={companyName}
            required
            placeholder="e.g. Northwind Robotics"
            hint="Shown to jobseekers on every posting and match."
            onChange={(e) => {
              setCompanyName(e.target.value);
              setStatus("");
            }}
          />
        </div>
      )}

      <div className={styles.feedback}>
        <StatusMessage tone="error">{error}</StatusMessage>
        <StatusMessage tone="success">{status}</StatusMessage>
      </div>

      <section className={styles.dangerZone} aria-labelledby="danger-heading">
        <h2 id="danger-heading" className={styles.dangerTitle}>
          Delete your account
        </h2>
        <p className={styles.dangerText}>
          Removes your profile{isSeeker ? "" : ", your postings"}, all of your matches and
          every chat thread you are part of. This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
          Delete my account
        </Button>
      </section>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete your account?"
          message={`Your profile${isSeeker ? "" : ", every posting you published"}, all of your matches and all of your chat threads will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete my account"
          cancelLabel="Keep my account"
          onConfirm={deleteAccount}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </form>
  );
}

ProfileEditor.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.oneOf(["seeker", "employer"]).isRequired,
    desiredTitle: PropTypes.string,
    companyName: PropTypes.string,
    skills: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        evidence: PropTypes.string,
      })
    ),
  }).isRequired,
  onSaved: PropTypes.func.isRequired,
  onAccountDeleted: PropTypes.func.isRequired,
  titleSuggestions: PropTypes.arrayOf(PropTypes.string),
};

export default ProfileEditor;
