import { ref, watch } from "vue";
import { getHostedTheme, isHostedMode } from "./useHostedMode";

const THEME_KEY = "theme";
type ThemeMode = "light" | "dark" | "system";

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const applyTheme = (mode: ThemeMode) => {
  const isDark = mode === "dark" || (mode === "system" && mediaQuery.matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

export const setupTheme = () => {
  const hostedTheme = getHostedTheme();
  if (isHostedMode() && (hostedTheme === "light" || hostedTheme === "dark")) {
    applyTheme(hostedTheme);
    return;
  }

  const stored = (localStorage.getItem(THEME_KEY) as ThemeMode) ?? "system";
  applyTheme(stored);
};

export const useTheme = () => {
  const hostedTheme = getHostedTheme();
  if (isHostedMode() && (hostedTheme === "light" || hostedTheme === "dark")) {
    const mode = ref<ThemeMode>(hostedTheme);
    return {
      mode,
      setMode: () => {
        // Hosted mode mirrors the parent Spoolman shell and does not expose
        // an independent theme preference inside the embedded app.
      },
    };
  }

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
