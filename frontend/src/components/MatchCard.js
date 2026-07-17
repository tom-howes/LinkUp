import PropTypes from "prop-types";
import "./MatchCard.css";

function MatchCard({ match, viewerRole, onUpdate, onDelete, onOpenChat }) {
  const posting = match.posting || {};
  const seeker = match.seeker || {};

  return (
    <div className={`match-card status-${match.status}`}>
      <div className="match-body">
        {viewerRole === "seeker" ? (
          <>
            <h3>{posting.title || "Untitled posting"}</h3>
            {posting.location && <p className="match-meta">{posting.location}</p>}
          </>
        ) : (
          <>
            <h3>{seeker.desiredTitle || "Candidate"}</h3>
            <p className="match-meta">Seeker match</p>
          </>
        )}
        <p className="match-skills">
          Matched skills: {(match.matchedSkills || []).join(", ") || "none"}
        </p>
        <span className="match-status-badge">{match.status}</span>
      </div>

      <div className="match-actions">
        {match.status !== "unlocked" && (
          <button type="button" onClick={() => onUpdate(match._id, "unlocked")}>
            Unlock chat
          </button>
        )}
        {match.status === "unlocked" && onOpenChat && (
          <button type="button" onClick={() => onOpenChat(match._id)}>
            Open chat
          </button>
        )}
        {match.status !== "dismissed" && (
          <button type="button" onClick={() => onUpdate(match._id, "dismissed")}>
            Dismiss
          </button>
        )}
        <button type="button" className="danger" onClick={() => onDelete(match._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

MatchCard.propTypes = {
  match: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    matchedSkills: PropTypes.arrayOf(PropTypes.string),
    posting: PropTypes.shape({
      title: PropTypes.string,
      location: PropTypes.string,
    }),
    seeker: PropTypes.shape({
      desiredTitle: PropTypes.string,
    }),
  }).isRequired,
  viewerRole: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onOpenChat: PropTypes.func,
};

export default MatchCard;
