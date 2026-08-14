import PropTypes from "prop-types";
import styles from "./StatusMessage.module.css";

/**
 * The one way the app reports an error or a success back to the user.
 *
 * Errors render as role="alert" (announced immediately, because the user is
 * blocked); confirmations render as role="status" with aria-live="polite" so
 * they're announced without interrupting. Each tone also carries a text prefix,
 * so the meaning never depends on colour alone.
 */
const TONE_PREFIX = {
  error: "Error:",
  success: "Success:",
  info: "Note:",
};

function StatusMessage({ tone = "info", children, id }) {
  if (!children) return null;

  const isError = tone === "error";

  return (
    <p
      id={id}
      className={`${styles.message} ${styles[tone]}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <span className={styles.prefix}>{TONE_PREFIX[tone]}</span> {children}
    </p>
  );
}

StatusMessage.propTypes = {
  tone: PropTypes.oneOf(["error", "success", "info"]),
  children: PropTypes.node,
  id: PropTypes.string,
};

export default StatusMessage;
