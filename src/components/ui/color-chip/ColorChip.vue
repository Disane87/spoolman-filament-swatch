<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { SourceBadge } from '@/components/ui/source-badge';

defineProps<{
  colorHex: string;
  name: string;
  vendor: string;
  source: string;
}>();

defineEmits<{
  (e: 'select'): void;
}>();
</script>

<template>
  <button
    class="color-chip"
    :title="name"
    @click="$emit('select')"
  >
    <div class="chip-swatch" :style="{ background: colorHex }" />
    <div class="chip-info">
      <span class="chip-name">{{ name }}</span>
      <span class="chip-vendor">{{ vendor }}</span>
    </div>
    <SourceBadge :source="source" variant="chip" :show-label="false" />
  </button>
</template>

<style scoped>
.color-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(var(--surface-alt), 0.4);
  border: 1px solid rgba(var(--border), 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
  width: 100%;
}

.color-chip:hover {
  background: rgba(var(--surface-alt), 0.6);
  border-color: rgba(var(--accent), 0.5);
  transform: translateX(4px);
}

.chip-swatch {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.chip-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chip-name {
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--text));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-vendor {
  font-size: 11px;
  color: rgb(var(--text-muted));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
