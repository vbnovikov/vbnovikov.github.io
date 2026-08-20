import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { AppRecoveryBoundary } from "./App";
import { installRefreshRecovery } from "./refreshRecovery";
import "./styles.css";

installRefreshRecovery();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRecoveryBoundary>
      <App />
    </AppRecoveryBoundary>
  </StrictMode>,
);
