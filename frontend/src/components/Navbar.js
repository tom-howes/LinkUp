import PropTypes from "prop-types";
import "./Navbar.css";

/**
 * Top nav bar. Shows different links depending on user.role (seeker vs
 * employer), highlights the active view, and has a logout button.
 */

// On the nav bar if the user is signed in as an employer than it would be cool to have your compnay name shown on the nav bar next to your name
// Right now when I save the company name I can't see it anywhere other than where I saved it
function Navbar({ user, currentView, onNavigate, onLogout }) {
  const links =
    user.role === "seeker"
      ? [
          { key: "browse", label: "Browse" },
          { key: "matches", label: "Matches" },
          { key: "profile", label: "Profile" },
        ]
      : [
          { key: "postings", label: "My Postings" },
          { key: "matches", label: "Matches" },
          { key: "profile", label: "Profile" },
        ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">LinkUp</div>
      <div className="navbar-links">
        {links.map((link) => (
          <button
            key={link.key}
            type="button"
            className={currentView === link.key ? "active" : ""}
            onClick={() => onNavigate(link.key)}
          >
            {link.label}
          </button>
        ))}
      </div>
      <div className="navbar-user">
        <span className="navbar-role">{user.role}</span>
        <button type="button" className="navbar-logout" onClick={onLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    role: PropTypes.string.isRequired,
  }).isRequired,
  currentView: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
