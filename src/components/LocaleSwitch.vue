<template>
  <div class="flex items-center gap-2">
    <Toggle variant="outline" size="sm" :pressed="locale === 'de'" @click="setLocale('de')" class="h-9 sm:h-10">
      <Icon icon="circle-flags:de" class="w-5 h-5" />
    </Toggle>
    <Toggle variant="outline" size="sm" :pressed="locale === 'en'" @click="setLocale('en')" class="h-9 sm:h-10">
      <Icon icon="circle-flags:us" class="w-5 h-5" />
    </Toggle>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Toggle } from "@/components/ui/toggle";
import { Icon } from '@iconify/vue';

const { locale } = useI18n();

const setLocale = (value: string) => {
  locale.value = value;
  localStorage.setItem("locale", value);
};
</script>
