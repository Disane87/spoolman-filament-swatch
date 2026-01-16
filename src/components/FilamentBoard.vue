<template>
  <div class="board-wrapper">
    <div class="board-header">
      <div class="board-title">{{ title }}</div>
      <div class="board-actions">
        <div class="legend">
          <span class="legend-dot"></span>
          <span class="legend-label">{{ labels.legend }}</span>
        </div>
      </div>
    </div>

    <div class="board-body">
      <div class="board-grid">
        <div
          v-for="filament in filaments"
          :key="filament.id"
          class="board-card"
          :id="cardId(filament.id)"
          :style="{
            '--swatch': filament.colorHex,
          }"
        >
          <div class="swatch" :style="{ background: gradient(filament.colorHex) }" />
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
                @click="$emit('togglePin', filament)"
              >
                {{ isPinned(filament.id) ? labels.unpin : labels.pin }}
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

      <div class="minimap" aria-label="Color minimap">
        <button
          v-for="filament in filaments"
          :key="filament.id"
          class="minimap-dot"
          :title="filament.name"
          :style="{ background: filament.colorHex }"
          @click="scrollToCard(filament.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FilamentCard as FilamentCardType } from "../composables/useFilaments";

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
  title?: string;
}>();

const isPinned = (id: string) => {
  if (Array.isArray(props.pinnedIds)) return props.pinnedIds.includes(id);
  return props.pinnedIds.has(id);
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
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.board-card {
  display: grid;
  grid-template-rows: 110px 1fr;
  border: 1px solid rgba(var(--border), 0.7);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(var(--surface-alt), 0.9);
  box-shadow: 0 12px 24px -16px rgba(0, 0, 0, 0.35);
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
}

.board-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--accent), 0.6);
  box-shadow: 0 14px 28px -18px rgba(0, 0, 0, 0.4);
}

.swatch {
  width: 100%;
  height: 100%;
}

.card-meta {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  flex-direction: column;
  gap: 6px;
  padding: 10px 8px;
  border: 1px solid rgba(var(--border), 0.6);
  border-radius: 14px;
  background: rgba(var(--surface-alt), 0.7);
  max-height: 420px;
  overflow: auto;
}

.minimap-dot {
  width: 20px;
  height: 20px;
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
    grid-template-columns: 1fr;
  }

  .minimap {
    flex-direction: row;
    flex-wrap: wrap;
    max-height: none;
  }
}
</style>
