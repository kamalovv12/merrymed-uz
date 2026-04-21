import React, { createContext, useContext, useEffect, useState } from "react";
import { TRANSLATIONS } from "./translations";

const LanguageContext = createContext();
export const useLang = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("lang") || "uz");
  useEffect(() => { localStorage.setItem("lang", lang); document.documentElement.lang = lang; }, [lang]);
  const setLang = (l) => setLangState(l);
  const t = TRANSLATIONS[lang];
  const tr = (obj) => (obj && typeof obj === "object" ? obj[lang] || obj.uz || "" : obj || "");
  return <LanguageContext.Provider value={{ lang, setLang, t, tr }}>{children}</LanguageContext.Provider>;
}
