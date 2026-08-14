import PropTypes from "prop-types";
import Badge from "./Badge";
import Button from "./Button";
import styles from "./PostingCard.module.css";

/**
 * A single job posting.
 *
 * Rendered as an <article> with its <h2> first, so the heading outline of the
 * page stays meaningful and a screen reader can jump posting to posting. The
 * owner's controls sit after the content in the DOM, which is also the order
 * they should be reached in by keyboard.
 */
function PostingCard({ posting, isOwner, onEdit, onToggleStatus, onDelete }) {
  const isClosed = posting.status === "closed";
  const company = posting.poster?.companyName;

  return (
    <article
      className={`${styles.card} ${isClosed ? styles.closed : ""}`}
      aria-labelledby={`posting-${posting._id}-title`}
    >
      <div className={styles.main}>
        <div className={styles.titleRow}>
          <h2 id={`posting-${posting._id}-title`} className={styles.title}>
            {posting.title}
          </h2>
          {isOwner && (
            <Badge tone={isClosed ? "neutral" : "success"}>
              {isClosed ? "Closed" : "Open"}
            </Badge>
          )}
        </div>

        <p className={styles.meta}>
          {company && <span className={styles.company}>{company}</span>}
          <span>{posting.location || "Location not given"}</span>
        </p>

        <div className={styles.skills}>
          <h3 className={styles.skillsLabel} id={`posting-${posting._id}-skills`}>
            Required skills
          </h3>
          <ul
            className={styles.skillList}
            aria-labelledby={`posting-${posting._id}-skills`}
          >
            {(posting.requiredSkills || []).map((skill) => (
              <li key={skill}>
                <Badge tone="accent">{skill}</Badge>
              </li>
            ))}
          </ul>
        </div>

        {posting.description && (
          <p className={styles.description}>{posting.description}</p>
        )}
      </div>

      {isOwner && (
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => onEdit(posting)}>
            Edit<span className="sr-only"> {posting.title}</span>
          </Button>
          <Button variant="secondary" onClick={() => onToggleStatus(posting)}>
            {isClosed ? "Reopen" : "Close"}
            <span className="sr-only"> {posting.title}</span>
          </Button>
          <Button variant="danger" onClick={() => onDelete(posting)}>
            Delete<span className="sr-only"> {posting.title}</span>
          </Button>
        </div>
      )}
    </article>
  );
}

PostingCard.propTypes = {
  posting: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    requiredSkills: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    location: PropTypes.string,
    status: PropTypes.oneOf(["open", "closed"]),
    poster: PropTypes.shape({
      companyName: PropTypes.string,
    }),
  }).isRequired,
  isOwner: PropTypes.bool,
  onEdit: PropTypes.func,
  onToggleStatus: PropTypes.func,
  onDelete: PropTypes.func,
};

export default PostingCard;
