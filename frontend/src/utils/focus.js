/**
 * Focus helpers for destructive actions.
 *
 * When a button is removed from the page by the very action it performed
 * (deleting the posting, match or message it belonged to), the browser drops
 * focus onto <body>. A keyboard user then has to tab from the top of the
 * document again, and a screen-reader user is given no indication of where
 * they now are. These helpers put focus somewhere deliberate instead.
 */

/** Move focus to the main content region (it carries tabindex="-1"). */
export function focusMain() {
  const main = document.getElementById("main-content");
  if (main instanceof HTMLElement) main.focus();
}

/** Move focus to a specific element by id, if it is still on the page. */
export function focusById(id) {
  const el = document.getElementById(id);
  if (el instanceof HTMLElement) el.focus();
}
