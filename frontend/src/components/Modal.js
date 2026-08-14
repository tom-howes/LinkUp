import { useEffect, useRef, useState, useId } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import styles from "./Modal.module.css";

/**
 * Modal dialog built on the native <dialog> element opened with showModal().
 *
 * Using the platform element rather than a hand-rolled div gives us the hard
 * parts of accessible modals for free and correctly: the focus trap, Escape to
 * close, focus returned to the trigger on close, the rest of the page marked
 * inert for assistive tech, and a real ::backdrop.
 *
 * Two details worth knowing about:
 *
 * 1. We listen for "cancel" (Escape) rather than "close". close() fires its
 *    event in a queued task, so a programmatic close - which is exactly what
 *    the cleanup below does, and what React runs twice on mount in StrictMode -
 *    would deliver a stray "close" to the next listener and tear the dialog
 *    straight back down. "cancel" only fires for a user dismissal.
 *
 * 2. The open/close effect runs on mount and unmount only, with the latest
 *    onClose read through a ref. Re-running it whenever the parent happens to
 *    pass a new onClose would close and reopen the dialog, which yanks focus
 *    out of whatever the user was typing in.
 */
function Modal({ title, onClose, children, footer, size = "md" }) {
  const dialogRef = useRef(null);
  const bodyRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const triggerRef = useRef(null);
  const titleId = useId();
  const [bodyScrolls, setBodyScrolls] = useState(false);

  // A region that scrolls but contains nothing focusable can't be scrolled by
  // keyboard at all. Watch the body and make it a tab stop only while it
  // actually overflows, rather than adding a permanent empty stop to the
  // tab order.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || typeof ResizeObserver === "undefined") return undefined;

    const check = () => setBodyScrolls(body.scrollHeight > body.clientHeight);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(body);
    for (const child of body.children) observer.observe(child);

    return () => observer.disconnect();
  }, [children]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    // Remember what had focus so we can hand it back on close. Only recorded
    // once, and never something inside the dialog - on the second pass of
    // StrictMode's mount/unmount/mount the active element is already the
    // dialog's own close button, and latching onto that would strand focus.
    if (!triggerRef.current) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && !dialog.contains(active)) {
        triggerRef.current = active;
      }
    }

    if (!dialog.open) dialog.showModal();

    // showModal() parks focus on the first focusable child, which is the close
    // button. A dialog can nominate a better landing spot with data-autofocus -
    // ConfirmDialog uses it to put focus on the non-destructive option.
    const preferred = dialog.querySelector("[data-autofocus]");
    if (preferred instanceof HTMLElement) preferred.focus();

    // Escape. preventDefault stops the native close so that React stays the
    // one deciding when this component goes away.
    const handleCancel = (event) => {
      event.preventDefault();
      onCloseRef.current();
    };

    // A click that lands on the <dialog> itself, rather than on the inner
    // panel, is a click on the backdrop. Attached here rather than as a JSX
    // onClick so we aren't putting a handler on a non-interactive element.
    const handleClick = (event) => {
      if (event.target === dialog) onCloseRef.current();
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
      if (dialog.open) dialog.close();

      // Hand focus back to whatever opened the dialog. If that control has
      // since been removed (deleting the thing the dialog was about), fall
      // back to <main> rather than dropping focus onto <body>.
      const trigger = triggerRef.current;
      if (trigger && trigger.isConnected) {
        trigger.focus();
      } else {
        document.getElementById("main-content")?.focus();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${styles[size]}`}
      aria-labelledby={titleId}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <Button
            variant="quiet"
            size="sm"
            className={styles.close}
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <span aria-hidden="true">&times;</span>
          </Button>
        </header>

        <div
          ref={bodyRef}
          className={styles.body}
          role={bodyScrolls ? "group" : undefined}
          aria-label={bodyScrolls ? `${title}, scrollable content` : undefined}
          tabIndex={bodyScrolls ? 0 : undefined}
        >
          {children}
        </div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md"]),
};

export default Modal;
