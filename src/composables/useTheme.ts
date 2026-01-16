import { ref, watch } from "vue";

const THEME_KEY = "theme";
type ThemeMode = "light" | "dark" | "system";

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const applyTheme = (mode: ThemeMode) => {
  const isDark = mode === "dark" || (mode === "system" && mediaQuery.matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

export const setupTheme = () => {
  const stored = (localStorage.getItem(THEME_KEY) as ThemeMode) ?? "system";
  applyTheme(stored);
};

export const useTheme = () => {
  const stored = (localStorage.getItem(THEME_KEY) as ThemeMode) ?? "system";
  const mode = ref<ThemeMode>(stored);

  const setMode = (value: ThemeMode) => {
    mode.value = value;
  };

  watch(
    mode,
    (value) => {
      localStorage.setItem(THEME_KEY, value);
      applyTheme(value);
    },
    { immediate: true },
  );

  mediaQuery.addEventListener("change", () => applyTheme(mode.value));

  return { mode, setMode };
};
