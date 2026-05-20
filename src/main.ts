import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createAppRouter } from "./router";
import App from "./App.vue";
import "./styles.css";
import de from "./locales/de.json";
import en from "./locales/en.json";
import { type HostedConfig, type HostedWindow } from "./composables/useHostedMode";
import { rehydrateFromHostedConfig } from "./composables/useSpoolmanUrl";
import { setupTheme } from "./composables/useTheme";

const getQueryParam = (name: string) => new URLSearchParams(window.location.search).get(name);

const loadFilamanConfig = async () => {
  const configUrl = getQueryParam("filaman_hosted_config");
  const hosted = getQueryParam("filaman_hosted");

  if (!hosted || !configUrl) {
    return null;
  }

  // The Filaman host serves this JSON from the same origin so the standalone app
  // can switch into embedded mode without baking any Filaman instance details.
  const response = await fetch(configUrl);
  if (!response.ok) {
    throw new Error(`Could not load Filaman hosted config: ${response.status}`);
  }

  const config = (await response.json()) as HostedConfig;
  (window as HostedWindow).__FILAMAN_HOSTED__ = config;
  return config;
};

const loadHostedConfig = async () => {
  const configUrl = getQueryParam("spoolman_hosted_config");
  const hosted = getQueryParam("spoolman_hosted");

  if (!hosted || !configUrl) {
    return null;
  }

  // The host runtime serves this JSON from the same origin so the standalone app
  // can switch into embedded mode without baking any Spoolman instance details.
  const response = await fetch(configUrl);
  if (!response.ok) {
    throw new Error(`Could not load hosted config: ${response.status}`);
  }

  const config = (await response.json()) as HostedConfig;
  (window as HostedWindow).__SPOOLMAN_HOSTED__ = config;
  return config;
};

const bootstrap = async () => {
  // Try Filaman hosted config first, then fall back to Spoolman hosted config.
  const hostedConfig =
    (await loadFilamanConfig().catch((error) => {
      console.warn("Could not load Filaman hosted config", error);
      return null;
    })) ??
    (await loadHostedConfig().catch((error) => {
      console.warn("Could not load Spoolman hosted config", error);
      return null;
    }));
  rehydrateFromHostedConfig(hostedConfig);

  const hostedTheme =
    getQueryParam("filaman_theme") ?? getQueryParam("spoolman_theme");
  if (hostedTheme === "light" || hostedTheme === "dark") {
    const win = window as HostedWindow;
    if (win.__FILAMAN_HOSTED__) {
      win.__FILAMAN_HOSTED_THEME__ = hostedTheme;
    } else {
      win.__SPOOLMAN_HOSTED_THEME__ = hostedTheme;
    }
  }

  const localeFromHost = getQueryParam("spoolman_locale");
  const savedLocale = localeFromHost || localStorage.getItem("locale") || "de";

  const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    messages: {
      de,
      en,
    },
  });

  setupTheme();
  const router = createAppRouter();

  // Hosted mode relies on the Spoolman shell for analytics and server discovery.
  if (import.meta.env.MODE !== "development" && !hostedConfig) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://statistics.disane.dev/script.js";
    script.setAttribute("data-website-id", "95c90cb7-c1d3-488c-a68b-4210a7d2c76c");
    document.head.appendChild(script);
  }

  createApp(App).use(i18n).use(router).mount("#app");
};

void bootstrap();
