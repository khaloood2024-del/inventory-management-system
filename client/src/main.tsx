import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import { AppToastProvider } from "./components/ui/Toast";
import { LanguageProvider } from "./i18n/LanguageContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppToastProvider>
            <App />
          </AppToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
    <Analytics />
  </StrictMode>
);