import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState("/");

  // On mount, check if the user is already logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const value = {
    user,
    setUser,
    loading,
    redirectUrl,
    setRedirectUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

