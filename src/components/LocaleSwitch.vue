<template>
  <Select :model-value="locale" @update:model-value="setLocale">
    <SelectTrigger :variant="variant" class="h-9 w-[60px] px-2">
      <SelectValue>
        <Icon :icon="locale === 'de' ? 'circle-flags:de' : 'circle-flags:us'" class="w-4 h-4" />
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="de">
        <div class="flex items-center gap-2">
          <Icon icon="circle-flags:de" class="w-4 h-4" />
          <span>Deutsch</span>
        </div>
      </SelectItem>
      <SelectItem value="en">
        <div class="flex items-center gap-2">
          <Icon icon="circle-flags:us" class="w-4 h-4" />
          <span>English</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Icon } from '@iconify/vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

defineProps<{
  variant?: "default" | "ghost";
}>();

const { locale } = useI18n();

const setLocale = (value: string) => {
  locale.value = value;
  localStorage.setItem("locale", value);
};
</script>
