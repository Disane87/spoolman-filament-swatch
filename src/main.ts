import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import "./styles.css";
import de from "./locales/de.json";
import en from "./locales/en.json";
import { setupTheme } from "./composables/useTheme";

const savedLocale = localStorage.getItem("locale") ?? "de";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  messages: {
    de,
    en,
  },
});

setupTheme();

// Analytics - nur in Produktion laden
if (import.meta.env.MODE !== 'development') {
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://statistics.disane.dev/script.js';
  script.setAttribute('data-website-id', '95c90cb7-c1d3-488c-a68b-4210a7d2c76c');
  document.head.appendChild(script);
}

createApp(App).use(i18n).mount("#app");
