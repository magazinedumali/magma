import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { TempoDevtools } from "tempo-devtools";

// Initialize Tempo Devtools only in development to avoid impacting production performance
if (import.meta.env.DEV) {
  TempoDevtools.init();
}

createRoot(document.getElementById("root")!).render(<App />);
