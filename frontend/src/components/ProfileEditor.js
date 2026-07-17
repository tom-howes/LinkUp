import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import SkillInput from "./SkillInput";
import "./ProfileEditor.css";

function ProfileEditor({ user, onSaved }) {
  const isSeeker = user.role === "seeker";
  const [desiredTitle, setDesiredTitle] = useState(user.desiredTitle || "");
  const [skills, setSkills] = useState(user.skills || []);
  const [companyName, setCompanyName] = useState(user.companyName || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDesiredTitle(user.desiredTitle || "");
    setSkills(user.skills || []);
    setCompanyName(user.companyName || "");
  }, [user]);

  function updateSkill(index, next) {
    setSkills((prev) => prev.map((s, i) => (i === index ? next : s)));
  }

  function removeSkill(index) {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  }

  function addSkill() {
    if (skills.length >= 3) return;
    setSkills((prev) => [...prev, { name: "", evidence: "" }]);
  }

  async function handleSave() {
    setError("");
    setStatus("");
    try {
      const body = isSeeker ? { desiredTitle, skills } : { companyName };
      const updated = await api.updateMe(body);
      setStatus("Saved");
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="profile-editor">
      <h2>Your Profile</h2>

      {isSeeker ? (
        <>
          <label htmlFor="desired-title">Desired job title</label>
          <input
            id="desired-title"
            type="text"
            value={desiredTitle}
            onChange={(e) => setDesiredTitle(e.target.value)}
          />

          <div className="skills-header">
            <span>Skills (max 3)</span>
            <button
              type="button"
              onClick={addSkill}
              disabled={skills.length >= 3}
            >
              Add skill
            </button>
          </div>

          {skills.map((skill, i) => (
            <SkillInput
              key={i}
              index={i}
              skill={skill}
              onChange={updateSkill}
              onRemove={removeSkill}
            />
          ))}
        </>
      ) : (
        <>
          <label htmlFor="company-name">Company name</label>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </>
      )}

      {error && <p className="profile-error">{error}</p>}
      {status && <p className="profile-status">{status}</p>}

      <button type="button" className="profile-save" onClick={handleSave}>
        Save profile
      </button>
    </div>
  );
}

ProfileEditor.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
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
};

export default ProfileEditor;
