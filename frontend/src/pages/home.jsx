import { useState } from "react";
import Particles from "../components/particle";

export default function SearchHome() {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search query:", query);
  };

  return (
    <div style={styles.page}>
      {/* Particles Background */}
      <div style={styles.particlesWrapper}>
        <Particles
          particleColors={["#6366f1", "#22d3ee"]}
          particleCount={180}
          particleSpread={12}
          speed={0.15}
          particleBaseSize={120}
          moveParticlesOnHover
          alphaParticles
          disableRotation={false}
          pixelRatio={window.devicePixelRatio || 1}
        />
      </div>

      {/* Foreground Content */}
      <div style={styles.content}>
        <h1 style={styles.logo}>N-jin</h1>
        <p style={styles.tagline}>Search beyond the obvious</p>

        <form onSubmit={handleSearch} style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search anything…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            ⌕
          </button>
        </form>

        <div style={styles.quickActions}>
          <button style={styles.chip}>AI tools</button>
          <button style={styles.chip}>Open-source</button>
          <button style={styles.chip}>Design systems</button>
          <button style={styles.chip}>Tech news</button>
        </div>
      </div>

      <footer style={styles.footer}>
        <span>© {new Date().getFullYear()} N-jin</span>
        <span>•</span>
        <span>Privacy</span>
        <span>•</span>
        <span>About</span>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    overflow: "hidden",
    position: "relative",
    background: "radial-gradient(circle at top, #020617, #000)",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#e5e7eb",
  },

  /* Particle layer */
  particlesWrapper: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
  },

  /* Content layer */
  content: {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    textAlign: "center",
  },

  logo: {
    fontSize: "3.5rem",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    background: "linear-gradient(90deg, #a5b4fc, #22d3ee)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "0.4rem",
  },

  tagline: {
    fontSize: "1.05rem",
    fontWeight: "900",
    color: "#94a3b8",
    marginBottom: "2.8rem",
  },

  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%",
    maxWidth: "540px",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(148,163,184,0.15)",
    padding: "0.65rem",
    borderRadius: "999px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "1rem",
    padding: "0.7rem 0.5rem",
    backgroundColor: "transparent",
    color: "#e5e7eb",
  },

  button: {
    border: "none",
    borderRadius: "999px",
    padding: "0.65rem 1.4rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
    color: "#020617",
    fontWeight: 1000,
    fontSize: "20px"
  },

  quickActions: {
    display: "flex",
    gap: "0.6rem",
    marginTop: "1.8rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  chip: {
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(10px)",
    borderRadius: "999px",
    padding: "0.45rem 0.95rem",
    fontSize: "0.8rem",
    cursor: "pointer",
    color: "#cbd5f5",
  },

  footer: {
    position: "absolute",
    bottom: "1rem",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "0.75rem",
    fontSize: "0.75rem",
    color: "#64748b",
    zIndex: 2,
  },
};

