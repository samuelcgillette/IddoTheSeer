import { useRequireUser } from "../hooks/useRequireUser";
import { useState } from "react";
import logo from "../assets/logo.png";

function Home() {
  const [prompt, setPrompt] = useState("");
  return (
    <div>
      <div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <img src={logo} alt="My App" className="home-logo" />
      </div>
    </div>
  );
}

export default Home;
