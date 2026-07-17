import PropTypes from "prop-types";
import "./SkillInput.css";

function SkillInput({ index, skill, onChange, onRemove }) {
  return (
    <div className="skill-input">
      <input
        type="text"
        placeholder="Skill name"
        value={skill.name}
        onChange={(e) => onChange(index, { ...skill, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Evidence (e.g. project, cert)"
        value={skill.evidence}
        onChange={(e) => onChange(index, { ...skill, evidence: e.target.value })}
      />
      <button
        type="button"
        className="skill-remove"
        onClick={() => onRemove(index)}
      >
        Remove
      </button>
    </div>
  );
}

SkillInput.propTypes = {
  index: PropTypes.number.isRequired,
  skill: PropTypes.shape({
    name: PropTypes.string,
    evidence: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SkillInput;
