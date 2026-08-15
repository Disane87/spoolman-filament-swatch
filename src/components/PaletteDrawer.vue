<template>
  <div class="palette-drawer-wrapper" :class="{ open: isOpen }">
    <!-- Overlay (Mobile & Desktop) -->
    <div
      class="palette-overlay"
      :class="{ active: isOpen }"
      @click="$emit('close')"
    />

    <!-- Drawer Panel -->
    <div class="palette-panel" :class="{ active: isOpen }">
      <!-- Header -->
      <div class="palette-header">
        <div class="palette-title">
          <Icon icon="lucide:palette" class="w-4 h-4 text-[rgb(var(--accent))]" />
          <span class="font-semibold">{{ t('info.palette') }}</span>
          <span class="ml-auto text-xs text-[rgb(var(--text-muted))]">
            {{ pinnedItems.length }}
          </span>
        </div>
        <button
          @click="$emit('close')"
          class="p-1.5 hover:bg-[rgb(var(--border))] rounded transition text-[rgb(var(--text-muted))]"
        >
          <Icon icon="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="palette-content">
        <!-- Pinned Items -->
        <div v-if="pinnedItems.length" class="palette-chips">
          <button
            v-for="item in pinnedItems"
            :key="item.id"
            class="palette-chip"
            :style="{ '--color': item.colorHex } as any"
            @click="$emit('scrollTo', item.id)"
          >
            <div class="chip-color" :style="{ backgroundColor: item.colorHex }" />
            <div class="chip-info">
              <div class="chip-name">{{ item.name }}</div>
              <div class="chip-hex">{{ item.colorHex.toUpperCase() }}</div>
            </div>
            <button
              class="chip-remove"
              @click.stop="$emit('removePin', item.id)"
            >
              <Icon icon="lucide:x" class="w-3.5 h-3.5" />
            </button>
          </button>
        </div>

        <!-- Empty State -->
        <div v-else class="palette-empty">
          <Icon icon="lucide:palette" class="w-12 h-12 opacity-50" />
          <p class="text-sm font-medium">{{ t('info.paletteEmpty') }}</p>
          <p class="text-xs text-[rgb(var(--text-muted))]">
            {{ t('info.paletteHint') }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="pinnedItems.length" class="palette-footer">
        <button
          @click="$emit('clearPalette')"
          class="w-full px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition text-sm font-medium flex items-center justify-center gap-2"
        >
          <Icon icon="lucide:trash-2" class="w-4 h-4" />
          {{ t('actions.clearPalette') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import type { FilamentCard } from '@/composables/useFilaments';

defineProps<{
  isOpen: boolean;
  pinnedItems: FilamentCard[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'removePin', id: string): void;
  (e: 'clearPalette'): void;
  (e: 'scrollTo', id: string): void;
}>();

const { t } = useI18n();
</script>

<style scoped>
.palette-drawer-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  overflow: hidden;
}

.palette-drawer-wrapper.open {
  pointer-events: auto;
}

.palette-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background-color 200ms ease;
  pointer-events: none;
}

.palette-drawer-wrapper.open .palette-overlay.active {
  background: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  @media (min-width: 768px) {
    background: transparent;
    pointer-events: none;
  }
}

.palette-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: min(360px, 100vw);
  height: 100vh;
  background: rgb(var(--surface));
  border-left: 1px solid rgb(var(--border));
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  transform: translateX(100%);
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  contain: layout style paint;
  overflow: hidden;
}

@media (prefers-color-scheme: dark) {
  .palette-panel {
    box-shadow: -2px 0 12px rgba(0, 0, 0, 0.3);
  }
}

@media (min-width: 640px) {
  .palette-panel {
    width: min(320px, 85vw);
    padding: 16px;
    gap: 16px;
  }
}

.palette-drawer-wrapper.open .palette-panel.active {
  transform: translateX(0);
}

.palette-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(var(--border), 0.5);
  flex-shrink: 0;
}

.palette-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--text));
}

.palette-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.palette-content::-webkit-scrollbar {
  width: 6px;
}

.palette-content::-webkit-scrollbar-track {
  background: transparent;
}

.palette-content::-webkit-scrollbar-thumb {
  background: rgba(var(--accent), 0.3);
  border-radius: 3px;
}

.palette-content::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--accent), 0.5);
}

.palette-chips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.palette-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(var(--bg), 0.8);
  border: 1px solid transparent;
  transition: all 150ms ease;
  cursor: pointer;
  text-align: left;
}

.palette-chip:hover {
  background: rgba(var(--bg), 1);
  border-color: rgba(var(--accent), 0.3);
  transform: translateX(-4px);
}

.chip-color {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chip-info {
  flex: 1;
  min-width: 0;
}

.chip-name {
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-hex {
  font-size: 11px;
  font-family: ui-monospace, 'SF Mono', Monaco, Menlo, Consolas, 'Liberation Mono', 'Courier New', monospace;
  color: rgb(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: transparent;
  color: rgb(var(--text-muted));
  transition: all 150ms ease;
  opacity: 0;
  flex-shrink: 0;
}

.palette-chip:hover .chip-remove {
  opacity: 1;
  background: rgba(var(--accent), 0.1);
  color: rgb(var(--accent));
}

.palette-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: rgb(var(--text-muted));
}

.palette-empty p:first-of-type {
  color: rgb(var(--text));
  font-size: 14px;
  font-weight: 500;
}

.palette-footer {
  padding-top: 12px;
  border-top: 1px solid rgba(var(--border), 0.5);
  flex-shrink: 0;
}
</style>
