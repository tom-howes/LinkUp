import PropTypes from "prop-types";
import Modal from "./Modal";
import Button from "./Button";
import styles from "./ConfirmDialog.module.css";

/**
 * Confirmation step in front of every destructive action (deleting a posting,
 * a match or a message). Deleting used to happen on a single click, which is
 * both a usability trap and unrecoverable - matches and messages cascade.
 *
 * The cancel button is focused first so that the safe choice is the default
 * for keyboard and screen-reader users, and Escape also cancels.
 */
function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onCancel}
      footer={
        <>
          {/* Focus lands on the non-destructive option deliberately, so the
              safe choice is the one a keyboard or screen-reader user gets by
              default. Modal honours data-autofocus after showModal(). */}
          <Button variant="secondary" onClick={onCancel} data-autofocus>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className={styles.message}>{message}</p>
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog;
