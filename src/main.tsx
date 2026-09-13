import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const ARCANOVE_ORIGIN = "https://arcanove48.my.id";

const recoveryParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const isRecoveryLink =
  recoveryParams.get("type") === "recovery" ||
  (recoveryParams.has("access_token") && recoveryParams.has("refresh_token"));

if (isRecoveryLink && window.location.hostname === "hubreplay.lovable.app") {
  window.location.replace(
    `${ARCANOVE_ORIGIN}/reset-password${window.location.search}${window.location.hash}`,
  );
}

if (isRecoveryLink && window.location.pathname !== "/reset-password") {
  window.history.replaceState(
    null,
    "",
    `/reset-password${window.location.search}${window.location.hash}`,
  );
}

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

const root = document.getElementById("root");

if (root && window.location.hostname !== "hubreplay.lovable.app") {
  createRoot(root).render(<App />);
} else if (root && !isRecoveryLink) {
  createRoot(root).render(<App />);
}
