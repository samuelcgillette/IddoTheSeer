import { Link } from "react-router";
import { ScrollMark } from "./ScrollMark";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <ScrollMark size={28} />
          <span className="navbar-wordmark">Iddo the Seer</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
