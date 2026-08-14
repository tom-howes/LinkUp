import PropTypes from "prop-types";
import styles from "./EmptyState.module.css";

/**
 * Shown wherever a list has nothing in it. An empty screen that just says
 * "No matches yet" leaves the user stuck, so every empty state here names the
 * reason, gives the next step in plain language, and where possible offers the
 * button that performs it.
 */
function EmptyState({ title, children, action }) {
  return (
    <div className={styles.empty}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  action: PropTypes.node,
};

export default EmptyState;
