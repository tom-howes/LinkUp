import { useState, useEffect } from "react";
import { api } from "./api/api";
import Navbar from "./components/Navbar";
import AuthForm from "./components/AuthForm";
import ProfileEditor from "./components/ProfileEditor";
import MatchList from "./components/MatchList";
import PostingList from "./components/PostingList";
import Chat from "./components/Chat";
import "./App.css";

function defaultView(user) {
  return user.role === "employer" ? "postings" : "browse";
}

function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("browse");
  const [chatMatchId, setChatMatchId] = useState(null);

  useEffect(() => {
    api
      .session()
      .then((u) => {
        setUser(u);
        setView(defaultView(u));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  function handleAuth(u) {
    setUser(u);
    setView(defaultView(u));
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // ignore - clear locally regardless
    }
    setUser(null);
    setChatMatchId(null);
  }

  if (!ready) {
    return <p className="app-loading">Loading...</p>;
  }

  if (!user) {
    return <AuthForm onAuth={handleAuth} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        currentView={view}
        onNavigate={setView}
        onLogout={handleLogout}
      />
      <main className="app-main">
        {view === "browse" && user.role === "seeker" && (
          <PostingList scope="browse" />
        )}
        {view === "postings" && user.role === "employer" && (
          <PostingList scope="mine" />
        )}
        {view === "matches" && (
          <MatchList user={user} onOpenChat={setChatMatchId} />
        )}
        {view === "profile" && (
          <ProfileEditor user={user} onSaved={setUser} />
        )}
      </main>

      {chatMatchId && (
        <Chat
          matchId={chatMatchId}
          currentUserId={user._id}
          onClose={() => setChatMatchId(null)}
        />
      )}
    </div>
  );
}

export default App;
