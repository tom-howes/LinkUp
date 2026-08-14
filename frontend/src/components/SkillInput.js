import PropTypes from "prop-types";
import Field from "./Field";
import Button from "./Button";
import styles from "./SkillInput.module.css";

/**
 * One evidenced skill on a jobseeker profile.
 *
 * Wrapped in a <fieldset> with a "Skill 1 / 2 / 3" legend so a screen reader
 * announces which of the three rows it is reading - previously both inputs
 * relied on placeholders alone and every row sounded identical.
 */
function SkillInput({ index, skill, onChange, onRemove }) {
  const position = index + 1;

  return (
    <li className={styles.item}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Skill {position}</legend>

        <div className={styles.inputs}>
          <Field
            id={`skill-${index}-name`}
            label="Skill name"
            value={skill.name}
            required
            placeholder="e.g. React"
            onChange={(e) => onChange(index, { ...skill, name: e.target.value })}
          />

          <Field
            id={`skill-${index}-evidence`}
            label="Evidence"
            value={skill.evidence}
            required
            placeholder="e.g. Built a 12-screen dashboard at my last internship"
            hint="A project, a certification, something you shipped."
            onChange={(e) => onChange(index, { ...skill, evidence: e.target.value })}
          />
        </div>

        <Button
          variant="secondary"
          size="sm"
          className={styles.remove}
          onClick={() => onRemove(index)}
        >
          Remove<span className="sr-only"> skill {position}</span>
        </Button>
      </fieldset>
    </li>
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
