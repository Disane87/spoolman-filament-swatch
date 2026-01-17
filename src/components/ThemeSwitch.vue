<template>
  <Select :model-value="mode" @update:model-value="setMode">
    <SelectTrigger class="h-9 w-[60px] px-2">
      <SelectValue>
        <Icon 
          :icon="mode === 'light' ? 'lucide:sun' : mode === 'dark' ? 'lucide:moon' : 'lucide:monitor'" 
          class="w-4 h-4" 
        />
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="light">
        <div class="flex items-center gap-2">
          <Icon icon="lucide:sun" class="w-4 h-4" />
          <span>{{ t('theme.light') }}</span>
        </div>
      </SelectItem>
      <SelectItem value="dark">
        <div class="flex items-center gap-2">
          <Icon icon="lucide:moon" class="w-4 h-4" />
          <span>{{ t('theme.dark') }}</span>
        </div>
      </SelectItem>
      <SelectItem value="system">
        <div class="flex items-center gap-2">
          <Icon icon="lucide:monitor" class="w-4 h-4" />
          <span>{{ t('theme.system') }}</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTheme } from "../composables/useTheme";
import { Icon } from '@iconify/vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const { t } = useI18n();
const { mode, setMode } = useTheme();
</script>
