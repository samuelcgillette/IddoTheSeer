import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "./useAuth";

export function useRequireUser() {
  const { user, loading, setRedirectUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setRedirectUrl(location.pathname);
      navigate("/login");
    }
  }, [user, loading, navigate, location.pathname, setRedirectUrl]);

  return user;
}
