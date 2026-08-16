/**
 * Auto-growing textarea helper.
 *
 * The chat composer used to be a single-line input, so anything longer than the
 * box scrolled sideways and you could not read your own message back while
 * writing or editing it. These helpers let a textarea grow with its content up
 * to a cap, after which it scrolls vertically like a normal text box.
 *
 * Height is driven off scrollHeight rather than counting characters, so it
 * stays correct at any font size, zoom level or window width.
 */

/** Roughly seven lines at the app's base size, then it scrolls. */
const MAX_HEIGHT = 168;

/** Resize a textarea to fit its content, capped at MAX_HEIGHT. */
export function autoGrow(element) {
  if (!(element instanceof HTMLTextAreaElement)) return;
  // Collapse first, or scrollHeight can only ever report "bigger than now".
  element.style.height = "auto";
  const next = Math.min(element.scrollHeight, MAX_HEIGHT);
  element.style.height = `${next}px`;
  element.style.overflowY = element.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
}

/** Resize a textarea by id - used after clearing it, when there is no event. */
export function autoGrowById(id) {
  autoGrow(document.getElementById(id));
}

/**
 * True when a keypress should send rather than insert a newline: Enter on its
 * own sends, Shift+Enter (and any modifier combination) inserts a line break.
 */
export function isSendKey(event) {
  return event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey;
}
