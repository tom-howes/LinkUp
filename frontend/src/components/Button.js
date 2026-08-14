import PropTypes from "prop-types";
import styles from "./Button.module.css";

/**
 * The single button primitive for the whole app. Routing every action through
 * it is what guarantees the approve / cancel / destroy colours stay consistent
 * on every screen:
 *
 *   primary   brand blue     the approving action (Save, Create, Send, Unlock)
 *   secondary neutral outline the cancelling action (Cancel, Dismiss, Back)
 *   danger    red            destructive only (Delete), behind a confirmation
 *   quiet     borderless     low-emphasis inline actions (Edit a message)
 *
 * Always renders a real <button> so keyboard activation, focus order and
 * screen-reader semantics come for free.
 */
function Button({
  children,
  variant = "secondary",
  size = "md",
  type = "button",
  fullWidth = false,
  className = "",
  ...rest
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "quiet"]),
  size: PropTypes.oneOf(["sm", "md"]),
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
