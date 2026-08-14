import PropTypes from "prop-types";
import styles from "./Navbar.module.css";

/**
 * The app chrome: brand, primary navigation, and the account controls.
 *
 * Rendered as a real <header> containing a <nav aria-label="Main">, with the
 * navigation as a list of <button>s (this is a single-page app switching views,
 * not navigating documents). The active view is marked with aria-current so it
 * is announced, not just coloured.
 *
 * "on-dark" swaps the focus ring to gold so it stays visible against the navy.
 */
function Navbar({ user, currentView, onNavigate, onLogout, onOpenHelp }) {
  const links =
    user.role === "seeker"
      ? [
          { key: "browse", label: "Browse postings" },
          { key: "matches", label: "Matches" },
          { key: "profile", label: "Profile" },
        ]
      : [
          { key: "postings", label: "My postings" },
          { key: "matches", label: "Matches" },
          { key: "profile", label: "Profile" },
        ];

  return (
    <header className={`${styles.header} on-dark`}>
      <div className={styles.inner}>
        <p className={styles.brand}>
          Link<span className={styles.brandAccent}>Up</span>
        </p>

        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {links.map((link) => {
              const isCurrent = currentView === link.key;
              return (
                <li key={link.key}>
                  <button
                    type="button"
                    className={`${styles.navLink} ${isCurrent ? styles.navLinkActive : ""}`}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => onNavigate(link.key)}
                  >
                    {link.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.account}>
          <p className={styles.identity}>
            <span className={styles.email}>{user.email}</span>
            <span className={styles.role}>
              {user.role === "seeker" ? "Jobseeker" : "Employer"}
            </span>
          </p>
          <button type="button" className={styles.ghostButton} onClick={onOpenHelp}>
            How it works
          </button>
          <button type="button" className={styles.ghostButton} onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    role: PropTypes.oneOf(["seeker", "employer"]).isRequired,
  }).isRequired,
  currentView: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onOpenHelp: PropTypes.func.isRequired,
};

export default Navbar;
