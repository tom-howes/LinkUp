import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import PostingForm from "./PostingForm";
import "./PostingList.css";

/**
 * Owned by: Thomas Howes
 * scope="browse" shows all open postings with a search box (api.getPostings).
 * scope="mine" shows the employer's own postings (api.getMyPostings) with
 * create / edit / close / delete controls (author only).
 */

// For this component I would have liked to see the cards be clickable, it was my natural intuition to click the the card
// for the listing and was thrown off when I wasn't able to. Made something you could add if you every come back to this project
function PostingList({ scope }) {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const isMine = scope === "mine";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = isMine ? await api.getMyPostings() : await api.getPostings({ search });
      setPostings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isMine, search]);

  useEffect(() => {
    load();
  }, [scope]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e) {
    e.preventDefault();
    load();
  }

  function handleCreated(posting) {
    setCreating(false);
    setPostings((prev) => [posting, ...prev]);
  }

  function handleUpdated(posting) {
    setEditingId(null);
    setPostings((prev) => prev.map((p) => (p._id === posting._id ? posting : p)));
  }

  async function toggleStatus(posting) {
    setError("");
    try {
      const next = posting.status === "closed" ? "open" : "closed";
      const updated = await api.updatePosting(posting._id, { status: next });
      setPostings((prev) => prev.map((p) => (p._id === posting._id ? updated : p)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      await api.deletePosting(id);
      setPostings((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="posting-list">
      <div className="posting-list-header">
        <h2>{isMine ? "My Postings" : "Browse Postings"}</h2>
        {isMine && !creating && (
          <button type="button" onClick={() => setCreating(true)}>
            New posting
          </button>
        )}
      </div>

      {isMine && creating && (
        <PostingForm onSaved={handleCreated} onCancel={() => setCreating(false)} />
      )}

      {!isMine && (
        <form className="posting-search" onSubmit={handleSearch}>
          <input
            type="text"
            value={search}
            placeholder="Search title, skill, location..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      )}

      {error && <p className="posting-list-error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : postings.length === 0 ? (
        <p className="posting-list-empty">
          {isMine ? "You have no postings yet." : "No postings found."}
        </p>
      ) : (
        postings.map((p) =>
          editingId === p._id ? (
            <PostingForm
              key={p._id}
              posting={p}
              onSaved={handleUpdated}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={p._id} className={`posting-card status-${p.status}`}>
              <div className="posting-card-main">
                <h3>{p.title}</h3>
                <p className="posting-meta">
                  {p.poster?.companyName ? `${p.poster.companyName} · ` : ""}
                  {p.location || "Location N/A"}
                  {isMine && ` · ${p.status}`}
                </p>
                <p className="posting-skills">
                  Required: {(p.requiredSkills || []).join(", ")}
                </p>
                {p.description && <p className="posting-description">{p.description}</p>}
              </div>

              {isMine && (
                <div className="posting-card-actions">
                  <button type="button" onClick={() => setEditingId(p._id)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => toggleStatus(p)}>
                    {p.status === "closed" ? "Reopen" : "Close"}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(p._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )
        )
      )}
    </div>
  );
}

PostingList.propTypes = {
  scope: PropTypes.oneOf(["browse", "mine"]).isRequired,
};

export default PostingList;
