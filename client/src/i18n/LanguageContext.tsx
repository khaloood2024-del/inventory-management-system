import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { translations } from "./translations";
import type { Language, TranslationKey } from "./translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  locale: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  const stored = localStorage.getItem("language");
  return stored === "en" ? "en" : "ar";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = translations[language]["nav.appName"];
    localStorage.setItem("language", language);
  }, [language]);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
  }

  function toggleLanguage() {
    setLanguageState((prev) => (prev === "ar" ? "en" : "ar"));
  }

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text: string = translations[language][key] ?? key;
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(`{${param}}`, String(value));
      }
    }
    return text;
  }

  const locale = language === "ar" ? "ar-SA" : "en-US";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, locale }}>
      <DirectionProvider direction={language === "ar" ? "rtl" : "ltr"}>{children}</DirectionProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
