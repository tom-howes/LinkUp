import PropTypes from "prop-types";
import Modal from "./Modal";
import Button from "./Button";
import styles from "./HelpPanel.module.css";

/**
 * In-app instructions, reachable from "How it works" in the header on every
 * screen. The first build explained the matching model nowhere at all, so
 * someone who had not read the landing page closely had no way to find out
 * what the app was doing. This spells out the flow for the role they are
 * actually signed in as, plus the keyboard shortcuts.
 */
const STEPS = {
  seeker: [
    {
      title: "1. Fill in your profile",
      body: "Set the one job title you want, then add up to 3 skills. Each skill needs a short piece of evidence - a project, a certification, something you shipped.",
    },
    {
      title: "2. Browse open postings",
      body: "Search by title, skill or location to see what employers are actually asking for, so you know which evidence is worth writing up.",
    },
    {
      title: "3. Check your matches",
      body: "LinkUp matches you to a posting when your job title is the same and at least one of your skills is on its required list. Matches refresh automatically whenever you open the page.",
    },
    {
      title: "4. Unlock the chat",
      body: "Unlocking a match opens a private thread with the employer. Only the two of you can read it, and you can edit or delete anything you sent.",
    },
  ],
  employer: [
    {
      title: "1. Add your company name",
      body: "Your company name shows on every posting you publish, so jobseekers know who they are talking to.",
    },
    {
      title: "2. Create a posting",
      body: "Give it a job title and just 1 or 2 genuinely must-have skills. Keeping the list short is the point - it is what makes the matches specific.",
    },
    {
      title: "3. Review your matches",
      body: "Any jobseeker whose desired title equals your posting title and who has at least one of the required skills appears as a match, with their evidence attached.",
    },
    {
      title: "4. Unlock the chat",
      body: "Unlocking opens a private thread with that candidate. Dismiss the ones that are not a fit - dismissing is reversible, deleting is not.",
    },
  ],
};

function HelpPanel({ role, onClose }) {
  const steps = STEPS[role] || STEPS.seeker;

  return (
    <Modal
      title="How LinkUp works"
      onClose={onClose}
      footer={
        <Button variant="primary" onClick={onClose}>
          Got it
        </Button>
      }
    >
      <p className={styles.lead}>
        LinkUp matches jobseekers and employers on a small number of specific, evidenced
        skills instead of a full CV. Both sides commit to a few concrete things up front,
        and a private chat only opens once there is a real match.
      </p>

      <ol className={styles.steps}>
        {steps.map((step) => (
          <li key={step.title} className={styles.step}>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepBody}>{step.body}</p>
          </li>
        ))}
      </ol>

      <h3 className={styles.sectionTitle}>Keyboard shortcuts</h3>
      <dl className={styles.shortcuts}>
        <div className={styles.shortcut}>
          <dt>
            <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>
          </dt>
          <dd>Move between controls</dd>
        </div>
        <div className={styles.shortcut}>
          <dt>
            <kbd>Enter</kbd> / <kbd>Space</kbd>
          </dt>
          <dd>Activate the focused button or link</dd>
        </div>
        <div className={styles.shortcut}>
          <dt>
            <kbd>Enter</kbd>
          </dt>
          <dd>Submit the form you are typing in</dd>
        </div>
        <div className={styles.shortcut}>
          <dt>
            <kbd>Esc</kbd>
          </dt>
          <dd>Close this panel, the chat, or a confirmation</dd>
        </div>
      </dl>
    </Modal>
  );
}

HelpPanel.propTypes = {
  role: PropTypes.oneOf(["seeker", "employer"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default HelpPanel;
