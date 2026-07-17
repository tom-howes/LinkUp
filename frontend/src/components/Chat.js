import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import "./Chat.css";

/**
 * Owned by: Thomas Howes
 * Private message thread for a single unlocked match (api.getMessages /
 * api.sendMessage). Users can edit and delete their own messages.
 * onClose closes the panel.
 */
function Chat({ matchId, currentUserId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMessages(matchId);
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setError("");
    try {
      const msg = await api.sendMessage(matchId, text);
      setMessages((prev) => [...prev, msg]);
      setDraft("");
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(msg) {
    setEditingId(msg._id);
    setEditText(msg.text);
  }

  async function saveEdit(id) {
    const text = editText.trim();
    if (!text) return;
    setError("");
    try {
      const updated = await api.updateMessage(id, text);
      setMessages((prev) => prev.map((m) => (m._id === id ? updated : m)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      await api.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function isMine(msg) {
    return String(msg.senderId) === String(currentUserId);
  }

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>Private chat</h3>
          <button type="button" className="chat-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <p className="chat-error">{error}</p>}

        <div className="chat-messages">
          {loading ? (
            <p>Loading...</p>
          ) : messages.length === 0 ? (
            <p className="chat-empty">No messages yet. Say hello!</p>
          ) : (
            messages.map((m) => (
              <div
                key={m._id}
                className={`chat-message ${isMine(m) ? "mine" : "theirs"}`}
              >
                {editingId === m._id ? (
                  <div className="chat-edit">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button type="button" onClick={() => saveEdit(m._id)}>
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="chat-text">{m.text}</span>
                    {m.editedAt && <span className="chat-edited"> (edited)</span>}
                    {isMine(m) && (
                      <span className="chat-message-actions">
                        <button type="button" onClick={() => startEdit(m)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(m._id)}>
                          Delete
                        </button>
                      </span>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <form className="chat-compose" onSubmit={handleSend}>
          <input
            type="text"
            value={draft}
            placeholder="Type a message..."
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

Chat.propTypes = {
  matchId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Chat;
