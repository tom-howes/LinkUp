import PropTypes from "prop-types";
import styles from "./Badge.module.css";

/**
 * Small status / label chip used for match states, posting states and matched
 * skills.
 *
 * Each tone pairs a tint with a text colour that clears 4.5:1 against it, and
 * the badge always spells the state out in words - the colour reinforces the
 * meaning, it never carries it on its own.
 */
function Badge({ children, tone = "neutral" }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(["neutral", "brand", "success", "warn", "accent", "danger"]),
};

export default Badge;
