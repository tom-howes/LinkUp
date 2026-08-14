import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import Button from "./Button";
import Field from "./Field";
import StatusMessage from "./StatusMessage";
import styles from "./PostingForm.module.css";

const MAX_SKILLS = 2;

/**
 * Create or edit a posting. Pass a `posting` to edit it, otherwise it creates
 * a new one, and calls onSaved(posting) either way.
 *
 * The required-skills rows live in a <fieldset> with a legend so the group has
 * a name, and each row's input is individually labelled ("Required skill 1")
 * rather than relying on a placeholder.
 */
function PostingForm({ posting, onSaved, onCancel, titleSuggestions = [] }) {
  const editing = Boolean(posting);
  const [title, setTitle] = useState(posting?.title || "");
  const [skills, setSkills] = useState(
    posting?.requiredSkills?.length ? [...posting.requiredSkills] : [""]
  );
  const [location, setLocation] = useState(posting?.location || "");
  const [description, setDescription] = useState(posting?.description || "");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function setSkill(index, value) {
    setSkills((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function addSkill() {
    if (skills.length >= MAX_SKILLS) return;
    setSkills((prev) => [...prev, ""]);
  }

  function removeSkill(index) {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanSkills = skills.map((s) => s.trim()).filter(Boolean);
    const errors = {};
    if (!title.trim()) {
      errors.title = "Give the role a job title.";
    }
    if (cleanSkills.length < 1) {
      errors.skills = "Add at least one required skill.";
    } else if (cleanSkills.length > MAX_SKILLS) {
      errors.skills = `A posting can list at most ${MAX_SKILLS} required skills.`;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBusy(true);
    try {
      const body = {
        title: title.trim(),
        requiredSkills: cleanSkills,
        location: location.trim(),
        description: description.trim(),
      };
      const saved = editing
        ? await api.updatePosting(posting._id, body)
        : await api.createPosting(body);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const headingId = editing ? `edit-posting-${posting._id}` : "new-posting";

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-labelledby={headingId}
      noValidate
    >
      <h2 id={headingId} className={styles.title}>
        {editing ? "Edit posting" : "New posting"}
      </h2>

      <Field
        id={`${headingId}-title`}
        label="Job title"
        value={title}
        required
        list="title-suggestions"
        placeholder="e.g. Frontend Developer"
        hint="Jobseekers are matched on an exact title, so use the standard wording for the role."
        error={fieldErrors.title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <datalist id="title-suggestions">
        {titleSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>

      <fieldset className={styles.skillsFieldset}>
        <legend className={styles.legend}>Required skills</legend>
        <p className={styles.legendHint}>
          One or two only. The short list is the point - it is what keeps matches
          specific.
        </p>

        <ul className={styles.skillList}>
          {skills.map((skill, i) => (
            // Rows are identified by position; they are only appended or removed.
            <li className={styles.skillRow} key={`required-skill-${i}`}>
              <Field
                id={`${headingId}-skill-${i}`}
                label={`Required skill ${i + 1}`}
                labelHidden
                value={skill}
                placeholder={`Required skill ${i + 1}, e.g. React`}
                onChange={(e) => setSkill(i, e.target.value)}
              />
              {skills.length > 1 && (
                <Button variant="secondary" onClick={() => removeSkill(i)}>
                  Remove<span className="sr-only"> required skill {i + 1}</span>
                </Button>
              )}
            </li>
          ))}
        </ul>

        {fieldErrors.skills && (
          <p className={styles.fieldError} role="alert">
            {fieldErrors.skills}
          </p>
        )}

        <Button size="sm" onClick={addSkill} disabled={skills.length >= MAX_SKILLS}>
          Add a second skill
        </Button>
      </fieldset>

      <Field
        id={`${headingId}-location`}
        label="Location"
        value={location}
        placeholder="e.g. Remote, or Boston, MA"
        onChange={(e) => setLocation(e.target.value)}
      />

      <Field
        id={`${headingId}-description`}
        label="Description"
        as="textarea"
        rows={4}
        value={description}
        placeholder="What the role involves day to day"
        hint="Optional, but it helps candidates judge whether the role is right for them."
        onChange={(e) => setDescription(e.target.value)}
      />

      <StatusMessage tone="error">{error}</StatusMessage>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Saving..." : editing ? "Save changes" : "Publish posting"}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

PostingForm.propTypes = {
  posting: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    requiredSkills: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.string,
    description: PropTypes.string,
  }),
  onSaved: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  titleSuggestions: PropTypes.arrayOf(PropTypes.string),
};

export default PostingForm;
