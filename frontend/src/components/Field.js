import { useId } from "react";
import PropTypes from "prop-types";
import styles from "./Field.module.css";

/**
 * A labelled form control. Every text input, textarea and select in the app
 * goes through this component, which is what guarantees that each one has:
 *
 *   - a real <label for> (never a placeholder standing in for a label),
 *   - its hint and error text wired up via aria-describedby,
 *   - aria-invalid set when the field is in error,
 *   - a consistent 4px-grid rhythm between label, control and helper text.
 *
 * Placeholders are still allowed, but only as an example of the format - the
 * label always carries the meaning.
 */
function Field({
  label,
  as = "input",
  hint,
  error,
  required = false,
  labelHidden = false,
  className = "",
  children,
  ...control
}) {
  const generatedId = useId();
  const id = control.id || generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  const controlProps = {
    ...control,
    id,
    required,
    // Callers can add to the base control styling, not replace it.
    className: [styles.control, className].filter(Boolean).join(" "),
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={labelHidden ? "sr-only" : styles.label}>
        {label}
        {required && (
          <span className={styles.required}>
            {" "}
            <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </span>
        )}
      </label>

      {as === "textarea" && <textarea {...controlProps} />}
      {as === "select" && <select {...controlProps}>{children}</select>}
      {as === "input" && <input {...controlProps} />}

      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  as: PropTypes.oneOf(["input", "textarea", "select"]),
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  labelHidden: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Field;
