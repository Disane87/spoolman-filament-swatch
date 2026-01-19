<script setup lang="ts">
import { Icon } from '@iconify/vue';

withDefaults(defineProps<{
  icon: string;
  value: string | number;
  wide?: boolean;
}>(), {
  wide: false,
});
</script>

<template>
  <div class="info-badge" :class="{ 'info-badge-wide': wide }">
    <Icon :icon="icon" class="badge-icon" />
    <span class="badge-value">{{ value }}</span>
  </div>
</template>

<style scoped>
.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(var(--surface-alt), 0.4);
  border: 1px solid rgba(var(--border), 0.3);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--text));
  white-space: nowrap;
}

.info-badge-wide {
  flex: 1 1 100%;
}

.badge-icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.badge-value {
  line-height: 1;
}
</style>
