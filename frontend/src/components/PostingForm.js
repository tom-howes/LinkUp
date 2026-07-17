import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import "./PostingForm.css";

/**
 * Owned by: Thomas Howes
 * Create or edit a posting - title (must match a seeker's desiredTitle
 * exactly to generate matches), 1-2 requiredSkills, location, description.
 * Pass a `posting` to edit it; otherwise the form creates a new one.
 * Calls onSaved(posting) on success.
 */
function PostingForm({ posting, onSaved, onCancel }) {
  const editing = Boolean(posting);
  const [title, setTitle] = useState(posting?.title || "");
  const [skills, setSkills] = useState(
    posting?.requiredSkills?.length ? [...posting.requiredSkills] : [""]
  );
  const [location, setLocation] = useState(posting?.location || "");
  const [description, setDescription] = useState(posting?.description || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function setSkill(index, value) {
    setSkills((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function addSkill() {
    if (skills.length >= 2) return;
    setSkills((prev) => [...prev, ""]);
  }

  function removeSkill(index) {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanSkills = skills.map((s) => s.trim()).filter(Boolean);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (cleanSkills.length < 1 || cleanSkills.length > 2) {
      setError("Add 1 or 2 required skills");
      return;
    }

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

  return (
    <form className="posting-form" onSubmit={handleSubmit}>
      <h3>{editing ? "Edit posting" : "New posting"}</h3>

      <label htmlFor="posting-title">Job title</label>
      <input
        id="posting-title"
        type="text"
        value={title}
        placeholder="e.g. Frontend Developer"
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="posting-skills-header">
        <span>Required skills (1-2)</span>
        <button type="button" onClick={addSkill} disabled={skills.length >= 2}>
          Add skill
        </button>
      </div>
      {skills.map((skill, i) => (
        <div className="posting-skill-row" key={i}>
          <input
            type="text"
            value={skill}
            placeholder={`Skill ${i + 1}`}
            onChange={(e) => setSkill(i, e.target.value)}
          />
          {skills.length > 1 && (
            <button
              type="button"
              className="posting-skill-remove"
              onClick={() => removeSkill(i)}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <label htmlFor="posting-location">Location</label>
      <input
        id="posting-location"
        type="text"
        value={location}
        placeholder="e.g. Remote / Boston, MA"
        onChange={(e) => setLocation(e.target.value)}
      />

      <label htmlFor="posting-description">Description</label>
      <textarea
        id="posting-description"
        rows={4}
        value={description}
        placeholder="What the role involves day-to-day"
        onChange={(e) => setDescription(e.target.value)}
      />

      {error && <p className="posting-form-error">{error}</p>}

      <div className="posting-form-actions">
        <button type="submit" className="posting-form-save" disabled={busy}>
          {busy ? "Saving..." : editing ? "Save changes" : "Create posting"}
        </button>
        {onCancel && (
          <button type="button" className="posting-form-cancel" onClick={onCancel}>
            Cancel
          </button>
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
};

export default PostingForm;
