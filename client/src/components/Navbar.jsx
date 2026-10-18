import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { SeerMark } from "./SeerMark";

function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <SeerMark size={34} />
          <span className="navbar-wordmark">Iddo the Seer</span>
        </Link>
      </div>
      {!isAuthPage && (
        <div className="navbar-links">
          {user ? (
            <>
              <span className="navbar-user">{user.username}</span>
              <button onClick={handleLogout} className="btn btn-logout">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
