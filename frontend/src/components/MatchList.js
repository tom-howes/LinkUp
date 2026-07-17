import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import MatchCard from "./MatchCard";
import "./MatchList.css";

function MatchList({ user, onOpenChat }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate() {
    setError("");
    try {
      await api.generateMatches();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(id, status) {
    try {
      await api.updateMatch(id, { status });
      setMatches((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteMatch(id);
      setMatches((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="match-list">
      <div className="match-list-header">
        <h2>Your Matches</h2>
        {user.role === "seeker" && (
          <button type="button" onClick={handleGenerate}>
            Generate matches
          </button>
        )}
      </div>

      {error && <p className="match-list-error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : matches.length === 0 ? (
        <p className="match-list-empty">No matches yet.</p>
      ) : (
        matches.map((m) => (
          <MatchCard
            key={m._id}
            match={m}
            viewerRole={user.role}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onOpenChat={onOpenChat}
          />
        ))
      )}
    </div>
  );
}

MatchList.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
  }).isRequired,
  onOpenChat: PropTypes.func,
};

export default MatchList;
