<template>
  <div class="flex items-center gap-2">
    <Toggle :active="mode === 'light'" @click="setMode('light')">
      {{ t("theme.light") }}
    </Toggle>
    <Toggle :active="mode === 'dark'" @click="setMode('dark')">
      {{ t("theme.dark") }}
    </Toggle>
    <Toggle :active="mode === 'system'" @click="setMode('system')">
      {{ t("theme.auto") }}
    </Toggle>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTheme } from "../composables/useTheme";
import Toggle from "./ui/Toggle.vue";

const { t } = useI18n();
const { mode, setMode } = useTheme();
</script>
