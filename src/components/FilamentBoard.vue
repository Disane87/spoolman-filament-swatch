<template>
  <div class="board-wrapper">
    <div class="board-header">
      <div class="board-title">{{ title }}</div>
      <div class="board-actions">
        <!-- Sort Controls -->
        <Select v-model="filters.sortField" class="w-36">
          <SelectTrigger class="h-9">
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
        <Toggle variant="outline" size="sm" :pressed="filters.sortDir === 'asc'" @click="filters.sortDir = 'asc'">
          <Icon icon="lucide:arrow-up" class="w-4 h-4" />
        </Toggle>
        <Toggle variant="outline" size="sm" :pressed="filters.sortDir === 'desc'" @click="filters.sortDir = 'desc'">
          <Icon icon="lucide:arrow-down" class="w-4 h-4" />
        </Toggle>
        
        <!-- View Toggle -->
        <div class="flex gap-1 ml-2">
          <Button
            :variant="viewMode === 'carousel' ? 'default' : 'ghost'"
            size="sm"
            @click="$emit('changeView', 'carousel')"
          >
            <Icon icon="lucide:gallery-horizontal" class="w-4 h-4" />
          </Button>
          <Button
            :variant="viewMode === 'board' ? 'default' : 'ghost'"
            size="sm"
            @click="$emit('changeView', 'board')"
          >
            <Icon icon="lucide:layout-grid" class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <div class="board-body">
      <div class="minimap" aria-label="Color minimap">
        <button
          v-for="filament in filaments"
          :key="filament.id"
          class="minimap-dot"
          :title="filament.name"
          :style="minimapStyle(filament)"
          @click.stop="scrollToCard(filament.id)"
        />
      </div>

      <div class="board-grid">
        <div
          v-for="filament in filaments"
          :key="filament.id"
          class="board-card"
          :id="cardId(filament.id)"
          :style="{
            '--swatch': filament.colorHex,
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
  border-radius: 18px;
  background: rgba(var(--surface), 0.8);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.board-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.board-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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
  gap: 12px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.minimap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px;
  border: 1px solid rgba(var(--border), 0.6);
  border-radius: 14px;
  background: rgba(var(--surface-alt), 0.7);
  flex-shrink: 0;
}

.board-grid {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  flex: 1;
  justify-content: flex-start;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--accent), 0.5) rgba(var(--surface-alt), 0.4);
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
  border: 1px solid rgba(var(--border), 0.7);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(var(--surface-alt), 0.9);
  box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.2);
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
  flex: 1 1 calc((100% - 36px) / 4);
  min-width: 200px;
  max-width: calc((100% - 36px) / 4);
}

@media (max-width: 1400px) {
  .board-card {
    flex: 1 1 calc((100% - 24px) / 3);
    max-width: calc((100% - 24px) / 3);
  }
}

@media (max-width: 1000px) {
  .board-card {
    flex: 1 1 calc((100% - 12px) / 2);
    max-width: calc((100% - 12px) / 2);
  }
}

@media (max-width: 600px) {
  .board-card {
    flex: 1 1 100%;
    max-width: 100%;
  }
}

.board-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--accent), 0.6);
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.25);
}

.swatch {
  width: 100%;
  height: 110px;
  flex-shrink: 0;
}

.card-meta {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-name {
  font-weight: 700;
  font-size: 15px;
}

.card-sub {
  font-size: 12px;
  color: rgb(var(--text-muted));
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
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--border), 0.7);
  background: rgba(var(--surface-alt), 0.8);
  color: rgb(var(--text));
  transition: all 120ms ease;
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

.minimap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px;
  border: 1px solid rgba(var(--border), 0.6);
  border-radius: 14px;
  background: rgba(var(--surface-alt), 0.7);
  flex-shrink: 0;
}

.minimap-dot {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1px solid rgba(var(--border), 0.6);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 120ms ease, border-color 120ms ease;
}

.minimap-dot:hover {
  transform: translateY(-2px) scale(1.03);
  border-color: rgba(var(--accent), 0.7);
}

@media (max-width: 900px) {
  .board-body {
    flex-direction: column;
  }
}
</style>
