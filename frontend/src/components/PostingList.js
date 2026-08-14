import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import PostingForm from "./PostingForm";
import PostingCard from "./PostingCard";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import StatusMessage from "./StatusMessage";
import ConfirmDialog from "./ConfirmDialog";
import Button from "./Button";
import Field from "./Field";
import { focusMain } from "../utils/focus";
import styles from "./PostingList.module.css";

/**
 * scope="browse" - every open posting, with a search box (jobseeker view).
 * scope="mine"   - the employer's own postings, with create / edit / close /
 *                  delete controls.
 *
 * The result count is in an aria-live region so a search announces its outcome
 * instead of silently swapping the list out, and deleting now goes through a
 * confirmation because it cascades to matches and messages.
 */
function PostingList({ scope, titleSuggestions = [], onGoToProfile }) {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const isMine = scope === "mine";

  const load = useCallback(
    async (search) => {
      setLoading(true);
      setError("");
      try {
        const data = isMine
          ? await api.getMyPostings()
          : await api.getPostings({ search });
        setPostings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [isMine]
  );

  useEffect(() => {
    load(activeSearch);
  }, [load, activeSearch]);

  function handleSearch(event) {
    event.preventDefault();
    setActiveSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setActiveSearch("");
  }

  function handleCreated(posting) {
    setCreating(false);
    setPostings((prev) => [posting, ...prev]);
    setNotice(`"${posting.title}" has been published.`);
  }

  function handleUpdated(posting) {
    setEditingId(null);
    setPostings((prev) => prev.map((p) => (p._id === posting._id ? posting : p)));
    setNotice(`"${posting.title}" has been updated.`);
  }

  async function toggleStatus(posting) {
    setError("");
    try {
      const next = posting.status === "closed" ? "open" : "closed";
      const updated = await api.updatePosting(posting._id, { status: next });
      setPostings((prev) => prev.map((p) => (p._id === posting._id ? updated : p)));
      setNotice(`"${updated.title}" is now ${next}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmDelete() {
    const posting = pendingDelete;
    setPendingDelete(null);
    setError("");
    try {
      await api.deletePosting(posting._id);
      setPostings((prev) => prev.filter((p) => p._id !== posting._id));
      setNotice(`"${posting.title}" has been deleted.`);
      // The Delete button that had focus has just been removed with the card.
      focusMain();
    } catch (err) {
      setError(err.message);
    }
  }

  const resultSummary = loading
    ? "Loading postings..."
    : `${postings.length} ${postings.length === 1 ? "posting" : "postings"}${
        activeSearch ? ` matching "${activeSearch}"` : ""
      }`;

  return (
    <div className={styles.page}>
      <PageHeader
        title={isMine ? "My postings" : "Browse postings"}
        description={
          isMine
            ? "Everything you have published. Keep the required skills short - one or two must-haves is what makes matches specific."
            : "Every open role on LinkUp. Search to see which skills employers are actually asking for."
        }
        action={
          isMine ? (
            <Button
              variant="primary"
              onClick={() => {
                setCreating(true);
                setNotice("");
              }}
              disabled={creating}
            >
              New posting
            </Button>
          ) : null
        }
      />

      {isMine && creating && (
        <PostingForm
          titleSuggestions={titleSuggestions}
          onSaved={handleCreated}
          onCancel={() => setCreating(false)}
        />
      )}

      {!isMine && (
        <form className={styles.search} onSubmit={handleSearch} role="search">
          <Field
            id="posting-search"
            label="Search postings"
            type="search"
            value={searchInput}
            placeholder="Job title, skill or location"
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <div className={styles.searchActions}>
            <Button type="submit" variant="primary">
              Search
            </Button>
            {activeSearch && (
              <Button variant="secondary" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>
        </form>
      )}

      <div className={styles.feedback}>
        <StatusMessage tone="error">{error}</StatusMessage>
        <StatusMessage tone="success">{notice}</StatusMessage>
      </div>

      <p className={styles.resultCount} role="status">
        {resultSummary}
      </p>

      {!loading && postings.length === 0 ? (
        isMine ? (
          <EmptyState
            title="You have not published anything yet"
            action={
              <Button variant="primary" onClick={() => setCreating(true)}>
                Create your first posting
              </Button>
            }
          >
            <p>
              A posting needs a job title and one or two must-have skills. Jobseekers
              whose desired title is the same and who have one of those skills will show
              up under Matches.
            </p>
          </EmptyState>
        ) : (
          <EmptyState
            title={activeSearch ? "No postings match that search" : "No open postings"}
            action={
              activeSearch ? (
                <Button variant="secondary" onClick={clearSearch}>
                  Clear the search
                </Button>
              ) : null
            }
          >
            <p>
              {activeSearch
                ? 'Try a broader term - a single skill like "React", or just a city name.'
                : "There are no open postings right now. Check back shortly."}
            </p>
          </EmptyState>
        )
      ) : (
        <ul className={styles.list}>
          {postings.map((posting) => (
            <li key={posting._id}>
              {editingId === posting._id ? (
                <PostingForm
                  posting={posting}
                  titleSuggestions={titleSuggestions}
                  onSaved={handleUpdated}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <PostingCard
                  posting={posting}
                  isOwner={isMine}
                  onEdit={(p) => {
                    setEditingId(p._id);
                    setNotice("");
                  }}
                  onToggleStatus={toggleStatus}
                  onDelete={setPendingDelete}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {!isMine && onGoToProfile && postings.length > 0 && (
        <aside className={styles.tip}>
          <h2 className={styles.tipTitle}>Seeing a role you want?</h2>
          <p className={styles.tipText}>
            Copy its exact job title into your profile and add one of its required skills
            - that is what turns it into a match.
          </p>
          <Button variant="secondary" onClick={onGoToProfile}>
            Go to my profile
          </Button>
        </aside>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this posting?"
          message={`"${pendingDelete.title}" will be removed permanently, along with every match and chat thread that came from it. This cannot be undone.`}
          confirmLabel="Delete posting"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

PostingList.propTypes = {
  scope: PropTypes.oneOf(["browse", "mine"]).isRequired,
  titleSuggestions: PropTypes.arrayOf(PropTypes.string),
  onGoToProfile: PropTypes.func,
};

export default PostingList;
