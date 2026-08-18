import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function useJson(url) {
  const [state, setState] = React.useState({ loading: true, error: null, data: null });

  React.useEffect(() => {
    let active = true;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (active) {
          setState({ loading: false, error: null, data });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ loading: false, error: error.message, data: null });
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  return state;
}

function JsonPanel({ title, state }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {state.loading ? <p>Loading...</p> : null}
      {state.error ? <p className="error">{state.error}</p> : null}
      {state.data ? <pre>{JSON.stringify(state.data, null, 2)}</pre> : null}
    </section>
  );
}

function App() {
  const health = useJson("/api/health");
  const hello = useJson("/api/hello");

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Spring + React</p>
        <h1>Java backend. React frontend. Real wiring.</h1>
        <p className="lede">
          This template runs a Spring Boot API beside a Vite-powered React app and keeps browser requests same-origin through a local `/api` proxy.
        </p>
      </section>
      <section className="grid">
        <JsonPanel title="Backend health" state={health} />
        <JsonPanel title="Frontend data fetch" state={hello} />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
