import PropTypes from "prop-types";
import Badge from "./Badge";
import Button from "./Button";
import styles from "./MatchCard.module.css";

const STATUS_LABEL = {
  pending: { text: "Waiting on you", tone: "warn" },
  unlocked: { text: "Chat unlocked", tone: "success" },
  dismissed: { text: "Dismissed", tone: "neutral" },
};

/**
 * One match, shown from whichever side is looking at it.
 *
 * The employer view now lists the candidate's skills *with their evidence*,
 * which is the thing the whole app is built around - previously an employer
 * only saw a job title and had no reason to unlock anything.
 *
 * The status is a worded badge rather than a colour, and the primary action
 * for the current state is the only brand-blue button on the card.
 */
/**
 * matchedSkills are stored lower-cased, because that is how the matching
 * comparison is done. Showing them raw puts "react" next to the candidate's own
 * "React" a few lines below, so map each one back to how a human wrote it.
 */
function displayNames(matchedSkills, posting, seeker) {
  const casing = new Map();
  for (const skill of posting.requiredSkills || []) {
    casing.set(skill.toLowerCase(), skill);
  }
  for (const skill of seeker.skills || []) {
    if (skill.name) casing.set(skill.name.toLowerCase(), skill.name);
  }
  return (matchedSkills || []).map((skill) => {
    const key = skill.toLowerCase();
    return { key, label: casing.get(key) || skill };
  });
}

function MatchCard({ match, viewerRole, onUpdate, onDelete, onOpenChat }) {
  const posting = match.posting || {};
  const seeker = match.seeker || {};
  const status = STATUS_LABEL[match.status] || STATUS_LABEL.pending;
  const matched = displayNames(match.matchedSkills, posting, seeker);
  const matchedKeys = matched.map((s) => s.key);

  const isSeekerView = viewerRole === "seeker";
  const heading = isSeekerView
    ? posting.title || "Untitled posting"
    : seeker.desiredTitle || "Candidate";
  const titleId = `match-${match._id}-title`;

  return (
    <article
      className={`${styles.card} ${match.status === "dismissed" ? styles.dismissed : ""}`}
      aria-labelledby={titleId}
    >
      <div className={styles.main}>
        <div className={styles.titleRow}>
          <h2 id={titleId} className={styles.title}>
            {heading}
          </h2>
          <Badge tone={status.tone}>{status.text}</Badge>
        </div>

        <p className={styles.meta}>
          {isSeekerView
            ? posting.location || "Location not given"
            : `Candidate for your posting "${posting.title || "a deleted posting"}"`}
        </p>

        <div className={styles.matched}>
          <h3 className={styles.matchedLabel} id={`match-${match._id}-skills`}>
            Matched on
          </h3>
          <ul className={styles.badgeList} aria-labelledby={`match-${match._id}-skills`}>
            {matched.length === 0 ? (
              <li className={styles.noneText}>No overlapping skills recorded</li>
            ) : (
              matched.map((skill) => (
                <li key={skill.key}>
                  <Badge tone="accent">{skill.label}</Badge>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* The evidence is the point of the match, so the employer sees it up
            front rather than having to ask for it in chat. */}
        {!isSeekerView && (seeker.skills || []).length > 0 && (
          <div className={styles.evidence}>
            <h3 className={styles.evidenceLabel}>Their evidence</h3>
            <dl className={styles.evidenceList}>
              {seeker.skills.map((skill) => (
                <div key={skill.name} className={styles.evidenceItem}>
                  <dt className={styles.evidenceSkill}>
                    {skill.name}
                    {matchedKeys.includes((skill.name || "").toLowerCase()) && (
                      <span className={styles.evidenceMatch}> (matched)</span>
                    )}
                  </dt>
                  <dd className={styles.evidenceText}>{skill.evidence}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {match.status === "pending" && (
          <Button variant="primary" onClick={() => onUpdate(match._id, "unlocked")}>
            Unlock chat<span className="sr-only"> with {heading}</span>
          </Button>
        )}

        {match.status === "unlocked" && onOpenChat && (
          <Button
            variant="primary"
            onClick={() => onOpenChat({ id: match._id, label: heading })}
          >
            Open chat<span className="sr-only"> with {heading}</span>
          </Button>
        )}

        {match.status === "dismissed" ? (
          <Button variant="secondary" onClick={() => onUpdate(match._id, "pending")}>
            Restore<span className="sr-only"> {heading}</span>
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => onUpdate(match._id, "dismissed")}>
            Dismiss<span className="sr-only"> {heading}</span>
          </Button>
        )}

        <Button variant="danger" onClick={() => onDelete(match)}>
          Delete<span className="sr-only"> match with {heading}</span>
        </Button>
      </div>
    </article>
  );
}

MatchCard.propTypes = {
  match: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["pending", "unlocked", "dismissed"]).isRequired,
    matchedSkills: PropTypes.arrayOf(PropTypes.string),
    posting: PropTypes.shape({
      title: PropTypes.string,
      location: PropTypes.string,
    }),
    seeker: PropTypes.shape({
      desiredTitle: PropTypes.string,
      skills: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          evidence: PropTypes.string,
        })
      ),
    }),
  }).isRequired,
  viewerRole: PropTypes.oneOf(["seeker", "employer"]).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onOpenChat: PropTypes.func,
};

export default MatchCard;
