import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { api } from "../api/api";
import Modal from "./Modal";
import Button from "./Button";
import Field from "./Field";
import StatusMessage from "./StatusMessage";
import ConfirmDialog from "./ConfirmDialog";
import { focusById } from "../utils/focus";
import styles from "./Chat.module.css";

/**
 * The private thread for one unlocked match.
 *
 * Rendered inside the shared Modal, so it is a real modal dialog: focus is
 * trapped, Escape closes it, and focus returns to the button that opened it.
 * The thread is a <ul> of messages with real <time> elements, and new messages
 * are announced politely rather than appearing silently.
 */
function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { iso: undefined, label: "" };
  return {
    iso: date.toISOString(),
    label: date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

function Chat({ matchId, partnerLabel, currentUserId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const endOfThreadRef = useRef(null);

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

  // Keep the newest message in view, unless the user asked for reduced motion.
  useEffect(() => {
    if (!endOfThreadRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endOfThreadRef.current.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "end",
    });
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      setError("Type a message before sending.");
      return;
    }
    setError("");
    try {
      const message = await api.sendMessage(matchId, text);
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(message) {
    setEditingId(message._id);
    setEditText(message.text);
    setError("");
  }

  async function saveEdit(event, id) {
    event.preventDefault();
    const text = editText.trim();
    if (!text) {
      setError("A message cannot be empty. Delete it instead.");
      return;
    }
    setError("");
    try {
      const updated = await api.updateMessage(id, text);
      setMessages((prev) => prev.map((m) => (m._id === id ? updated : m)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmDelete() {
    const message = pendingDelete;
    setPendingDelete(null);
    setError("");
    try {
      await api.deleteMessage(message._id);
      setMessages((prev) => prev.filter((m) => m._id !== message._id));
      // The message's own Delete button has gone with it; land on the composer.
      focusById(`chat-${matchId}-draft`);
    } catch (err) {
      setError(err.message);
    }
  }

  const isMine = (message) => String(message.senderId) === String(currentUserId);

  return (
    <>
      <Modal
        title={partnerLabel ? `Private chat: ${partnerLabel}` : "Private chat"}
        onClose={onClose}
        footer={
          <form className={styles.composer} onSubmit={handleSend}>
            <Field
              id={`chat-${matchId}-draft`}
              label="Your message"
              labelHidden
              value={draft}
              autoComplete="off"
              placeholder="Type a message..."
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Send
            </Button>
          </form>
        }
      >
        <StatusMessage tone="error">{error}</StatusMessage>

        {loading ? (
          <p className={styles.systemText} role="status">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <p className={styles.systemText}>
            No messages yet. Say hello - you already know you match on the skills that
            matter.
          </p>
        ) : (
          <ul className={styles.thread} aria-live="polite" aria-relevant="additions">
            {messages.map((message) => {
              const mine = isMine(message);
              const time = formatTime(message.timestamp);
              const isEditing = editingId === message._id;

              return (
                <li
                  key={message._id}
                  className={`${styles.item} ${mine ? styles.itemMine : styles.itemTheirs}`}
                >
                  {isEditing ? (
                    <form
                      className={styles.editForm}
                      onSubmit={(e) => saveEdit(e, message._id)}
                    >
                      <Field
                        id={`edit-${message._id}`}
                        label="Edit your message"
                        value={editText}
                        autoComplete="off"
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className={styles.editActions}>
                        <Button type="submit" variant="primary" size="sm">
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div
                        className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}
                      >
                        <p className={styles.sender}>{mine ? "You" : "Them"}</p>
                        <p className={styles.text}>{message.text}</p>
                        <p className={styles.stamp}>
                          <time dateTime={time.iso}>{time.label}</time>
                          {message.editedAt && <span> · edited</span>}
                        </p>
                      </div>

                      {mine && (
                        <div className={styles.messageActions}>
                          <Button
                            variant="quiet"
                            size="sm"
                            onClick={() => startEdit(message)}
                          >
                            Edit
                            <span className="sr-only"> message: {message.text}</span>
                          </Button>
                          <Button
                            variant="quiet"
                            size="sm"
                            onClick={() => setPendingDelete(message)}
                          >
                            Delete
                            <span className="sr-only"> message: {message.text}</span>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div ref={endOfThreadRef} />
      </Modal>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this message?"
          message="The message will be removed from the thread for both of you. This cannot be undone."
          confirmLabel="Delete message"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}

Chat.propTypes = {
  matchId: PropTypes.string.isRequired,
  partnerLabel: PropTypes.string,
  currentUserId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Chat;
