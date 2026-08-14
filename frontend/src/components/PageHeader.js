import PropTypes from "prop-types";
import styles from "./PageHeader.module.css";

/**
 * The top of every view, and the component that carries the app's visual
 * hierarchy: the <h1> sits at the top left where the eye lands first, a short
 * description explains the screen underneath it, and the single most important
 * action for that screen sits opposite as the only large brand-blue button
 * above the fold.
 *
 * Every view uses this, so the entry point of each screen is in the same place
 * and at the same weight.
 */
function PageHeader({ title, description, action }) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};

export default PageHeader;
