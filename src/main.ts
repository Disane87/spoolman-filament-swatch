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

createApp(App).use(i18n).mount("#app");
