import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import MatchCard from "./MatchCard";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import StatusMessage from "./StatusMessage";
import ConfirmDialog from "./ConfirmDialog";
import Button from "./Button";
import { focusMain } from "../utils/focus";
import styles from "./MatchList.module.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Waiting on you" },
  { key: "unlocked", label: "Chat unlocked" },
  { key: "dismissed", label: "Dismissed" },
];

/**
 * The matches screen for both roles.
 *
 * Matching used to happen only when the user pressed "Generate matches", and
 * until they did the screen was empty with nothing saying an action was
 * required - the core feature was gated behind a step nothing announced. For
 * jobseekers it now runs automatically when the screen opens; the button
 * remains as an explicit "Refresh matches" for both roles.
 */
function MatchList({ user, onOpenChat, onGoToProfile }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const isSeeker = user.role === "seeker";
  const hasProfile = Boolean(user.desiredTitle) && (user.skills || []).length > 0;

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Both roles get their matches recomputed on arrival, so the screen is never
  // stale after a profile edit or a new posting. A seeker needs a title and at
  // least one skill before there is anything to match on; an employer just
  // needs a posting, which the server checks.
  const canGenerate = isSeeker ? hasProfile : true;

  const refresh = useCallback(
    async ({ announce } = {}) => {
      setRefreshing(true);
      setNotice("");
      try {
        if (canGenerate) {
          const { created } = await api.generateMatches();
          if (announce) {
            setNotice(
              created > 0
                ? `Found ${created} new ${created === 1 ? "match" : "matches"}.`
                : "No new matches - you are up to date."
            );
          }
        }
        await load();
      } catch (err) {
        setError(err.message);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    [canGenerate, load]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleUpdate(id, status) {
    setError("");
    setNotice("");
    try {
      await api.updateMatch(id, { status });
      setMatches((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmDelete() {
    const match = pendingDelete;
    setPendingDelete(null);
    setError("");
    try {
      await api.deleteMatch(match._id);
      setMatches((prev) => prev.filter((m) => m._id !== match._id));
      setNotice("Match deleted.");
      // The Delete button that had focus has just been removed with the card.
      focusMain();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = filter === "all" ? matches : matches.filter((m) => m.status === filter);

  const counts = matches.reduce(
    (acc, m) => ({ ...acc, [m.status]: (acc[m.status] || 0) + 1 }),
    {}
  );

  const summary = loading
    ? "Loading your matches..."
    : `Showing ${visible.length} of ${matches.length} ${
        matches.length === 1 ? "match" : "matches"
      }`;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Your matches"
        description={
          isSeeker
            ? "Postings where your job title is the same and at least one of your skills is required. Unlock one to start a private chat."
            : "Jobseekers whose desired title matches one of your postings and who have at least one required skill, with the evidence they gave."
        }
        action={
          <Button
            variant="primary"
            onClick={() => refresh({ announce: true })}
            disabled={refreshing || !canGenerate}
          >
            {refreshing ? "Refreshing..." : "Refresh matches"}
          </Button>
        }
      />

      <div className={styles.feedback}>
        <StatusMessage tone="error">{error}</StatusMessage>
        <StatusMessage tone="success">{notice}</StatusMessage>
        {isSeeker && !hasProfile && (
          <StatusMessage tone="info">
            Add a desired job title and at least one skill to your profile and matches
            will appear here.
          </StatusMessage>
        )}
      </div>

      {matches.length > 0 && (
        <div
          className={styles.filters}
          role="group"
          aria-label="Filter matches by status"
        >
          {FILTERS.map((option) => {
            const count = option.key === "all" ? matches.length : counts[option.key] || 0;
            const isActive = filter === option.key;
            return (
              <button
                key={option.key}
                type="button"
                className={`${styles.filter} ${isActive ? styles.filterActive : ""}`}
                aria-pressed={isActive}
                onClick={() => setFilter(option.key)}
              >
                {option.label} <span className={styles.filterCount}>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      <p className={styles.resultCount} role="status">
        {summary}
      </p>

      {!loading && matches.length === 0 ? (
        <EmptyState
          title="No matches yet"
          action={
            isSeeker && onGoToProfile ? (
              <Button variant="primary" onClick={onGoToProfile}>
                Edit my profile
              </Button>
            ) : null
          }
        >
          {isSeeker ? (
            <>
              <p>A posting becomes a match when both of these are true:</p>
              <ol>
                <li>its job title is exactly the same as your desired title, and</li>
                <li>it requires at least one of the skills on your profile.</li>
              </ol>
              <p>
                Browse the open postings to see the wording and skills employers are
                using, then mirror them on your profile.
              </p>
            </>
          ) : (
            <>
              <p>
                Nobody has matched your postings yet. Matches arrive when a jobseeker
                whose desired title is the same as one of your posting titles has at least
                one of its required skills.
              </p>
              <p>
                If a posting is getting nothing, the title wording or the required skills
                are usually too narrow.
              </p>
            </>
          )}
        </EmptyState>
      ) : !loading && visible.length === 0 ? (
        <EmptyState
          title="Nothing in this filter"
          action={
            <Button variant="secondary" onClick={() => setFilter("all")}>
              Show all matches
            </Button>
          }
        >
          <p>You have matches, just none with that status right now.</p>
        </EmptyState>
      ) : (
        <ul className={styles.list}>
          {visible.map((match) => (
            <li key={match._id}>
              <MatchCard
                match={match}
                viewerRole={user.role}
                onUpdate={handleUpdate}
                onDelete={setPendingDelete}
                onOpenChat={onOpenChat}
              />
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this match?"
          message="The match and the whole chat thread that goes with it will be removed permanently. If you just want it out of the way, dismiss it instead - that can be undone."
          confirmLabel="Delete match"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

MatchList.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.oneOf(["seeker", "employer"]).isRequired,
    desiredTitle: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
  }).isRequired,
  onOpenChat: PropTypes.func,
  onGoToProfile: PropTypes.func,
};

export default MatchList;
