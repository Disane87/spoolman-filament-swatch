<template>
  <div class="flex items-center gap-2">
    <Toggle :active="locale === 'de'" @click="setLocale('de')">DE</Toggle>
    <Toggle :active="locale === 'en'" @click="setLocale('en')">EN</Toggle>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Toggle from "./ui/Toggle.vue";

const { locale } = useI18n();

const setLocale = (value: string) => {
  locale.value = value;
  localStorage.setItem("locale", value);
};
</script>
