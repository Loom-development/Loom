import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Loom Spring Boot + React template</h1>
      <p>Backend endpoint: http://localhost:8081/api/hello</p>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
