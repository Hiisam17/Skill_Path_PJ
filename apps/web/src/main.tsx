import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import { ProgressSyncProvider } from "./context/ProgressSyncContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProgressSyncProvider>
          <App />
        </ProgressSyncProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
