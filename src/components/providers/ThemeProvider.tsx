"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      localStorage.removeItem("avira_theme");
      document.documentElement.classList.remove("dark");
    } catch {}
    setThemeState("light");
  }, []);

  const setTheme = () => {
    setThemeState("light");
    document.documentElement.classList.remove("dark");
  };

  const toggleTheme = () => {
    // Dark mode temporarily disabled until later phase
    setThemeState("light");
    document.documentElement.classList.remove("dark");
  };

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Theme Toggle disabled for now as requested by user
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  return null;
}
