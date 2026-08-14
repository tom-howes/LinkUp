import { useState, useEffect, useCallback } from "react";
import { api } from "./api/api";
import Navbar from "./components/Navbar";
import AuthForm from "./components/AuthForm";
import ProfileEditor from "./components/ProfileEditor";
import MatchList from "./components/MatchList";
import PostingList from "./components/PostingList";
import Chat from "./components/Chat";
import HelpPanel from "./components/HelpPanel";
import styles from "./App.module.css";

const VIEW_TITLES = {
  browse: "Browse postings",
  postings: "My postings",
  matches: "Your matches",
  profile: "Your profile",
};

function defaultView(user) {
  return user.role === "employer" ? "postings" : "browse";
}

/**
 * App shell: session bootstrap, which view is showing, and the two overlays
 * (chat and the help panel).
 *
 * The skip link is the first thing in the tab order, the single <main> is the
 * skip target, and the document title tracks the current view so the tab and
 * the screen-reader page announcement both say where you are.
 */
function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("browse");
  const [chatMatch, setChatMatch] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState([]);

  useEffect(() => {
    api
      .session()
      .then((u) => {
        setUser(u);
        setView(defaultView(u));
      })
      .catch(() => {
        // Not signed in - the landing page is the right place to be.
      })
      .finally(() => setReady(true));
  }, []);

  // Titles that already exist on the other side of the marketplace, offered as
  // datalist suggestions. Exact-title matching is the app's sharpest edge, and
  // this is what stops people cutting themselves on it.
  useEffect(() => {
    if (!user) return;
    const fetchTitles =
      user.role === "seeker" ? api.getPostingTitles : api.getSeekerTitles;
    fetchTitles()
      .then(setTitleSuggestions)
      .catch(() => setTitleSuggestions([]));
  }, [user]);

  useEffect(() => {
    document.title = user
      ? `${VIEW_TITLES[view]} · LinkUp`
      : "LinkUp · Targeted job matching";
  }, [view, user]);

  const handleAuth = useCallback((u) => {
    setUser(u);
    setView(defaultView(u));
  }, []);

  const goToProfile = useCallback(() => setView("profile"), []);

  // The account is already gone server-side and the session destroyed, so this
  // just drops back to the landing page.
  const handleAccountDeleted = useCallback(() => {
    setUser(null);
    setChatMatch(null);
    setHelpOpen(false);
  }, []);

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Clear locally regardless - the session is gone as far as the user cares.
    }
    setUser(null);
    setChatMatch(null);
    setHelpOpen(false);
  }

  if (!ready) {
    return (
      <p className={styles.loading} role="status">
        Loading LinkUp...
      </p>
    );
  }

  if (!user) {
    return <AuthForm onAuth={handleAuth} />;
  }

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Navbar
        user={user}
        currentView={view}
        onNavigate={setView}
        onLogout={handleLogout}
        onOpenHelp={() => setHelpOpen(true)}
      />

      <main className={styles.main} id="main-content" tabIndex={-1}>
        {view === "browse" && user.role === "seeker" && (
          <PostingList
            scope="browse"
            titleSuggestions={titleSuggestions}
            onGoToProfile={goToProfile}
          />
        )}

        {view === "postings" && user.role === "employer" && (
          <PostingList scope="mine" titleSuggestions={titleSuggestions} />
        )}

        {view === "matches" && (
          <MatchList user={user} onOpenChat={setChatMatch} onGoToProfile={goToProfile} />
        )}

        {view === "profile" && (
          <ProfileEditor
            user={user}
            onSaved={setUser}
            onAccountDeleted={handleAccountDeleted}
            titleSuggestions={titleSuggestions}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          LinkUp - targeted job matching. Built for CS5610 Web Development.{" "}
          <a className={styles.footerLink} href="https://github.com/tom-howes/LinkUp">
            Source on GitHub
          </a>
        </p>
      </footer>

      {chatMatch && (
        <Chat
          matchId={chatMatch.id}
          partnerLabel={chatMatch.label}
          currentUserId={user._id}
          onClose={() => setChatMatch(null)}
        />
      )}

      {helpOpen && <HelpPanel role={user.role} onClose={() => setHelpOpen(false)} />}
    </div>
  );
}

export default App;
