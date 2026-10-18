import { useEffect, useState } from "react";
import AuthView from "./components/AuthView.jsx";
import { getSignedInUser, isCognitoConfigured, signOut } from "./auth.js";
import ChatView from "./views/ChatView.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!isCognitoConfigured) {
      setLoading(false);
      return;
    }

    getSignedInUser()
      .then(setUser)
      .catch((error) => setAuthError(error.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    await signOut();
    setUser(null);
  }

  if (!isCognitoConfigured) {
    return <AuthView configured={false} />;
  }

  if (loading) {
    return <main className="auth-screen"><p className="auth-status">Sprawdzanie sesji…</p></main>;
  }

  if (!user) {
    return (
      <AuthView
        onAuthenticated={setUser}
        initialError={authError}
      />
    );
  }

  return <ChatView user={user} onSignOut={handleSignOut} />;
}
