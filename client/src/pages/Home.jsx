import { useState } from "react";
import logo from "../assets/logo.png";
import { useSendPrompt } from "../hooks/useSendPrompt.js";

function Home() {
  const [prompt, setPrompt] = useState("");
  const [modelResponse, setModelResponse] = useState("");
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
      <div>
        <p>{modelResponse}</p>
      </div>
      <button onClick={() => useSendPrompt(prompt, setModelResponse)}>Submit</button>
      <div style={{ textAlign: "center" }}>
        <img src={logo} alt="My App" className="home-logo" />
      </div>
    </div>
  );
}

export default Home;
