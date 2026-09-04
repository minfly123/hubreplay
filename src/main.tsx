import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Restore deep link after GitHub Pages 404 fallback
if (typeof window !== "undefined") {
  const redirect = sessionStorage.getItem("spa-redirect");
  if (redirect) {
    sessionStorage.removeItem("spa-redirect");
    if (redirect !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(null, "", redirect);
    }
  }
}

// Anti-inspect protection
if (typeof window !== "undefined") {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
      (e.ctrlKey && e.key === "u") ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
