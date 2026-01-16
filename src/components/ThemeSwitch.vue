<template>
  <div class="flex items-center gap-2">
    <Toggle variant="outline" size="sm" :pressed="mode === 'light'" @click="setMode('light')" class="h-9 sm:h-10">
      <Icon icon="lucide:sun" class="w-4 h-4" />
    </Toggle>
    <Toggle variant="outline" size="sm" :pressed="mode === 'dark'" @click="setMode('dark')" class="h-9 sm:h-10">
      <Icon icon="lucide:moon" class="w-4 h-4" />
    </Toggle>
    <Toggle variant="outline" size="sm" :pressed="mode === 'system'" @click="setMode('system')" class="h-9 sm:h-10">
      <Icon icon="lucide:monitor" class="w-4 h-4" />
    </Toggle>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTheme } from "../composables/useTheme";
import { Toggle } from "@/components/ui/toggle";
import { Icon } from '@iconify/vue';

const { t } = useI18n();
const { mode, setMode } = useTheme();
</script>
