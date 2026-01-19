<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { SourceBadge } from '@/components/ui/source-badge';
import { hexToRgba } from '@/lib/colorUtils';

export interface ColorChipItem {
  id: string;
  colorHex: string;
  name: string;
  vendor: string;
  source: string;
}

defineProps<{
  colors: ColorChipItem[];
}>();

defineEmits<{
  (e: 'select', item: ColorChipItem): void;
}>();

const getCardBackgroundStyle = (colorHex: string) => {
  return {
    background: `linear-gradient(135deg, ${hexToRgba(colorHex, 0.15)} 0%, ${hexToRgba(colorHex, 0.08)} 100%), linear-gradient(135deg, rgba(var(--surface-alt), 0.8) 0%, rgba(var(--surface-alt), 0.6) 100%)`,
  };
};
</script>

<template>
  <div class="color-chips">
    <button
      v-for="color in colors"
      :key="color.id"
      class="color-card"
      :title="color.name"
      :style="getCardBackgroundStyle(color.colorHex)"
      @click="$emit('select', color)"
    >
      <div class="card-header">
        <div class="card-info">
          <span class="card-name">{{ color.name }}</span>
          <span class="card-vendor">{{ color.vendor }}</span>
        </div>
        <SourceBadge :source="color.source" variant="chip" :show-label="false" />
      </div>

      <div class="card-swatch" :style="{ background: color.colorHex }" />

      <div class="card-footer">
        <span class="card-hex">{{ color.colorHex.toUpperCase() }}</span>
        <Icon icon="lucide:arrow-right" class="w-4 h-4 text-[rgb(var(--text-muted))]" />
      </div>
    </button>
  </div>
</template>

<style scoped>
.color-chips {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  width: 100%;
}

.color-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 2px solid rgba(var(--border), 0.6);
  border-radius: 14px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  height: 100%;
  overflow: hidden;
  backdrop-filter: blur(8px);
  position: relative;
}

.color-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.color-card:hover {
  background: linear-gradient(135deg, rgba(var(--surface-alt), 1) 0%, rgba(var(--surface-alt), 0.8) 100%);
  border-color: rgba(var(--accent), 0.8);
  transform: translateY(-3px);
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.4);
}

.card-header {
  display: flex;
  items-align: center;
  justify-content: space-between;
  gap: 8px;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-name {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--text));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-vendor {
  font-size: 11px;
  color: rgb(var(--text-muted));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-swatch {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.card-hex {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: rgb(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
</style>
