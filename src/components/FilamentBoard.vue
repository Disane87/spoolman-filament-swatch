<template>
  <div class="board-wrapper">
    <div class="board-header">
      <div class="board-title">{{ title }}</div>
      <div class="board-actions">
        <!-- Sort Controls -->
        <Select v-model="filters.sortField" class="w-28 sm:w-36">
          <SelectTrigger variant="ghost" class="h-9 sm:h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{{ sortLabels.name }}</SelectItem>
            <SelectItem value="vendor">{{ sortLabels.vendor }}</SelectItem>
            <SelectItem value="material">{{ sortLabels.material }}</SelectItem>
            <SelectItem value="source">{{ sortLabels.source }}</SelectItem>
            <SelectItem value="hue">{{ sortLabels.hue }}</SelectItem>
            <SelectItem value="luminance">{{ sortLabels.luminance }}</SelectItem>
            <SelectItem value="lightness">{{ sortLabels.lightness }}</SelectItem>
          </SelectContent>
        </Select>
        <Toggle variant="ghost" size="sm" :pressed="filters.sortDir === 'asc'" @click="filters.sortDir = 'asc'" class="h-9 w-9 sm:h-10 sm:w-10">
          <Icon icon="lucide:arrow-up" class="w-4 h-4" />
        </Toggle>
        <Toggle variant="ghost" size="sm" :pressed="filters.sortDir === 'desc'" @click="filters.sortDir = 'desc'" class="h-9 w-9 sm:h-10 sm:w-10">
          <Icon icon="lucide:arrow-down" class="w-4 h-4" />
        </Toggle>
        
        <!-- View Toggle -->
        <div class="flex gap-1">
          <Button
            :variant="viewMode === 'carousel' ? 'default' : 'ghost'"
            size="sm"
            @click="$emit('changeView', 'carousel')"
            class="h-9 w-9 sm:h-10 sm:w-10 p-0"
          >
            <Icon icon="lucide:gallery-horizontal" class="w-4 h-4" />
          </Button>
          <Button
            :variant="viewMode === 'board' ? 'default' : 'ghost'"
            size="sm"
            @click="$emit('changeView', 'board')"
            class="h-9 w-9 sm:h-10 sm:w-10 p-0"
          >
            <Icon icon="lucide:layout-grid" class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <div class="board-body">
      <div class="minimap" aria-label="Color minimap" ref="minimapRef" @click.stop>
        <button
          v-for="filament in filaments"
          :key="filament.id"
          class="minimap-dot"
          :class="{ active: activeCardId === filament.id }"
          :title="filament.name"
          :style="minimapStyle(filament)"
          @click.stop.prevent="scrollToCard(filament.id)"
        />
      </div>

      <div class="board-grid" ref="gridRef">
        <div
          v-for="filament in visibleItems"
          :key="filament.id"
          class="board-card"
          :id="cardId(filament.id)"
          :style="{
            '--swatch': filament.colorHex
          }"
          @click="$emit('selectFilament', filament)"
        >
          <div class="swatch" :style="swatchStyle(filament)" />
          <div class="card-meta">
            <div class="card-top">
              <div>
                <div class="card-name">{{ filament.name }}</div>
                <div class="card-sub">{{ filament.vendor }} · {{ filament.material }}</div>
              </div>
              <button
                type="button"
                class="pin-btn"
                :aria-pressed="isPinned(filament.id)"
                @click.stop="$emit('togglePin', filament)"
                :title="isPinned(filament.id) ? labels.unpin : labels.pin"
              >
                <Icon :icon="isPinned(filament.id) ? 'lucide:pin-off' : 'lucide:pin'" class="w-4 h-4" />
              </button>
            </div>
            <div class="card-bottom">
              <span class="card-hex">{{ filament.colorHex.toUpperCase() }}</span>
              <span class="card-source" :data-kind="filament.source">
                {{ filament.source === 'spoolman' ? labels.sourceSpoolman : labels.sourceExternal }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import type { FilamentCard as FilamentCardType } from "../composables/useFilaments";
import { Icon } from '@iconify/vue';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

const props = defineProps<{
  filaments: FilamentCardType[];
  pinnedIds: Set<string> | string[];
  labels: {
    pin: string;
    unpin: string;
    sourceSpoolman: string;
    sourceExternal: string;
    legend: string;
  };
  sortLabels: {
    name: string;
    vendor: string;
    material: string;
    source: string;
    hue: string;
    luminance: string;
    lightness: string;
  };
  filters: {
    sortField: string;
    sortDir: string;
  };
  viewMode: string;
  title?: string;
}>();

defineEmits<{
  (e: "togglePin", filament: FilamentCardType): void;
  (e: "selectFilament", filament: FilamentCardType): void;
  (e: "changeView", view: "carousel" | "board"): void;
}>();

const gridRef = ref<HTMLElement | null>(null);
const minimapRef = ref<HTMLElement | null>(null);
const activeCardId = ref<string | null>(null);
const scrollTop = ref(0);
const cols = ref(2);
let scrollTimeout: number | null = null;

const CARD_HEIGHT = 240; // Approximate card height
const BUFFER = 3; // Number of rows to render above/below viewport

// Update column count based on window width
const updateCols = () => {
  if (typeof window === 'undefined') return;
  if (window.innerWidth >= 1400) cols.value = 4;
  else if (window.innerWidth >= 1000) cols.value = 3;
  else if (window.innerWidth >= 640) cols.value = 3;
  else cols.value = 2;
};

// Calculate which items should be rendered
const visibleItems = computed(() => {
  if (!gridRef.value) return props.filaments.slice(0, 20);
  
  const viewportHeight = gridRef.value.clientHeight;
  const rowsInView = Math.ceil(viewportHeight / CARD_HEIGHT);
  const startRow = Math.max(0, Math.floor(scrollTop.value / CARD_HEIGHT) - BUFFER);
  const endRow = Math.ceil((scrollTop.value + viewportHeight) / CARD_HEIGHT) + BUFFER;
  const startIdx = startRow * cols.value;
  const endIdx = Math.min(props.filaments.length, endRow * cols.value);
  
  return props.filaments.slice(startIdx, endIdx).map((filament, idx) => ({
    ...filament,
    virtualIndex: startIdx + idx
  }));
});

const updateActiveCard = () => {
  if (!gridRef.value) return;
  
  const gridRect = gridRef.value.getBoundingClientRect();
  const centerY = gridRect.top + gridRect.height / 2;
  
  let closestCard: { id: string; distance: number } | null = null;
  
  props.filaments.forEach((filament) => {
    const el = document.getElementById(cardId(filament.id));
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    const cardCenterY = rect.top + rect.height / 2;
    const distance = Math.abs(cardCenterY - centerY);
    
    if (!closestCard || distance < closestCard.distance) {
      closestCard = { id: filament.id, distance };
    }
  });
  
  if (closestCard) {
    activeCardId.value = closestCard.id;
  }
};

const onScroll = () => {
  if (gridRef.value) {
    scrollTop.value = gridRef.value.scrollTop;
  }
  if (scrollTimeout) {
    window.clearTimeout(scrollTimeout);
  }
  scrollTimeout = window.setTimeout(updateActiveCard, 50);
};

onMounted(() => {
  updateCols();
  if (gridRef.value) {
    gridRef.value.addEventListener('scroll', onScroll);
    updateActiveCard();
  }
  window.addEventListener('resize', updateCols);
});

onUnmounted(() => {
  if (gridRef.value) {
    gridRef.value.removeEventListener('scroll', onScroll);
  }
  if (scrollTimeout) {
    window.clearTimeout(scrollTimeout);
  }
  window.removeEventListener('resize', updateCols);
});

const isPinned = (id: string) => {
  if (Array.isArray(props.pinnedIds)) return props.pinnedIds.includes(id);
  return props.pinnedIds.has(id);
};

const swatchStyle = (filament: FilamentCardType) => {
  // Multi-color support
  if (filament.multiColorHexes && filament.multiColorHexes.length > 1) {
    const colors = filament.multiColorHexes.map(ensureHex);
    if (filament.multiColorDirection === 'coaxial') {
      // Radial gradient with soft transitions
      const stops = colors.map((c, i) => {
        const center = (i / (colors.length - 1)) * 100;
        const spread = 15;
        if (i === 0) return `${c} 0%, ${c} ${center + spread}%`;
        if (i === colors.length - 1) return `${c} ${center - spread}%, ${c} 100%`;
        return `${c} ${center - spread}%, ${c} ${center + spread}%`;
      }).join(', ');
      return { background: `radial-gradient(circle, ${stops})` };
    } else {
      // Linear gradient (longitudinal)
      return { background: `linear-gradient(90deg, ${colors.join(', ')})` };
    }
  }
  // Single color with gradient effect
  return { background: gradient(filament.colorHex) };
};

const gradient = (hex: string) => {
  const safe = ensureHex(hex);
  return `linear-gradient(145deg, ${safe} 0%, ${safe}80 50%, ${safe}00 100%)`;
};

const cardId = (id: string) => `board-card-${id}`;

const scrollToCard = (id: string) => {
  const el = document.getElementById(cardId(id));
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
};
const minimapStyle = (filament: FilamentCardType) => {
  // Multi-color support in minimap
  if (filament.multiColorHexes && filament.multiColorHexes.length > 1) {
    const colors = filament.multiColorHexes.map(ensureHex);
    if (filament.multiColorDirection === 'coaxial') {
      return { background: `radial-gradient(circle, ${colors.join(', ')})` };
    } else {
      return { background: `linear-gradient(90deg, ${colors.join(', ')})` };
    }
  }
  return { background: filament.colorHex };
};
const ensureHex = (value: string | null | undefined): string => {
  if (!value) return "#888888";
  const trimmed = value.trim().replace(/^#/, "");
  const short = /^[0-9a-fA-F]{3}$/;
  const full = /^[0-9a-fA-F]{6}$/;
  if (full.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  if (short.test(trimmed)) {
    const [a, b, c] = trimmed;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  return "#888888";
};
</script>

<style scoped>
.board-wrapper {
  border: 1px solid rgba(var(--border), 0.6);
  background: rgba(var(--surface), 0.8);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

@media (min-width: 640px) {
  .board-wrapper {
    gap: 12px;
  }
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  flex-wrap: wrap;
}

.board-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

@media (min-width: 640px) {
  .board-title {
    font-size: 15px;
  }
}

.board-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.legend {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgb(var(--text-muted));
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(var(--accent), 0.5), rgba(var(--accent-2), 0.7));
}

.board-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

@media (min-width: 640px) {
  .board-body {
    gap: 12px;
  }
}

.minimap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
  border: 1px solid rgba(var(--border), 0.6);
  background: rgba(var(--surface-alt), 0.7);
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .minimap {
    gap: 6px;
  }
}

.board-grid {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
  padding-top: 4px;
  flex: 1;
  justify-content: flex-start;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--accent), 0.5) rgba(var(--surface-alt), 0.4);
}

@media (min-width: 640px) {
  .board-grid {
    gap: 12px;
    padding-right: 4px;
  }
}

/* Custom Scrollbar - WebKit (Chrome, Edge, Safari) */
.board-grid::-webkit-scrollbar {
  width: 10px;
}

.board-grid::-webkit-scrollbar-track {
  background: rgba(var(--surface-alt), 0.4);
  border-radius: 10px;
  margin: 2px 0;
}

.board-grid::-webkit-scrollbar-thumb {
  background: rgba(var(--accent), 0.5);
  border-radius: 10px;
  border: 2px solid rgba(var(--surface), 0.8);
  transition: background 200ms ease;
}

.board-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--accent), 0.7);
}

.board-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(var(--surface-alt), 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
  flex: 1 1 calc(50% - 4px);
  min-width: 140px;
  max-width: calc(50% - 4px);
}

@media (min-width: 640px) {
  .board-card {
    border-radius: 16px;
    flex: 1 1 calc((100% - 24px) / 3);
    min-width: 180px;
    max-width: calc((100% - 24px) / 3);
  }
}

@media (min-width: 1000px) {
  .board-card {
    flex: 1 1 calc((100% - 24px) / 3);
    min-width: 200px;
    max-width: calc((100% - 24px) / 3);
  }
}

@media (min-width: 1400px) {
  .board-card {
    flex: 1 1 calc((100% - 36px) / 4);
    max-width: calc((100% - 36px) / 4);
  }
}

.board-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--accent), 0.6);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
}

.swatch {
  width: 100%;
  height: 90px;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .swatch {
    height: 110px;
  }
}

.card-meta {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

@media (min-width: 640px) {
  .card-meta {
    padding: 12px;
    gap: 10px;
  }
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-name {
  font-weight: 700;
  font-size: 13px;
  line-height: 1.3;
}

@media (min-width: 640px) {
  .card-name {
    font-size: 15px;
  }
}

.card-sub {
  font-size: 11px;
  color: rgb(var(--text-muted));
  line-height: 1.3;
}

@media (min-width: 640px) {
  .card-sub {
    font-size: 12px;
  }
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.card-hex {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: rgb(var(--text));
}

.card-source {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--border), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
}

.card-source[data-kind="spoolman"] {
  background: rgba(var(--accent), 0.16);
  border-color: rgba(var(--accent), 0.6);
}

.card-source[data-kind="external"] {
  background: rgba(var(--accent-2), 0.16);
  border-color: rgba(var(--accent-2), 0.6);
}

.pin-btn {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 6px 8px;
  border-radius: 999px;
  border: 1px solid rgba(var(--border), 0.7);
  background: rgba(var(--surface-alt), 0.8);
  color: rgb(var(--text));
  transition: all 120ms ease;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .pin-btn {
    padding: 6px 10px;
    min-width: auto;
    min-height: auto;
  }
}

.pin-btn:hover {
  border-color: rgba(var(--accent-2), 0.7);
  background: rgba(var(--accent-2), 0.12);
}

.pin-btn[aria-pressed="true"] {
  border-color: rgba(var(--accent), 0.7);
  background: rgba(var(--accent), 0.18);
  color: rgb(var(--text));
}

.minimap-dot {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 5px;
  border: 1px solid rgba(var(--border), 0.6);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 120ms ease, border-color 120ms ease;
}

@media (min-width: 640px) {
  .minimap-dot {
    width: 20px;
    height: 20px;
    border-radius: 6px;
  }
}

.minimap-dot:hover {
  transform: translateY(-2px) scale(1.03);
  border-color: rgba(var(--accent), 0.7);
}

.minimap-dot.active {
  transform: scale(1.15);
  border-color: rgba(var(--accent-2), 0.9);
  box-shadow: 
    0 0 0 2px rgba(var(--accent-2), 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  z-index: 1;
}

@media (max-width: 900px) {
  .board-body {
    flex-direction: column;
  }
}
</style>
