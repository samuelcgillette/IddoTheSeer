import { useRequireUser } from "../hooks/useRequireUser";
import logo from "../assets/logo.png";

function Home() {
  const user = useRequireUser();

  if (!user) {
    return null;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Welcome, {user.username}!</h2>
      <img src={logo} alt="My App" className="home-logo" />
    </div>
  );
}

export default Home;
