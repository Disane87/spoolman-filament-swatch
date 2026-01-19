<script setup lang="ts">
import { toRef } from 'vue';
import { useColorWheel, type HarmonyFilter } from '@/composables/useColorWheel';
import type { FilamentCard } from '@/composables/useFilaments';

const props = defineProps<{
  filament: FilamentCard;
  allFilaments: FilamentCard[];
  labels: {
    colorHarmonies: string;
    currentColor: string;
    complementary: string;
    similar: string;
  };
}>();

const emit = defineEmits<{
  (e: 'selectFilament', filament: FilamentCard): void;
}>();

const filamentRef = toRef(props, 'filament');
const allFilamentsRef = toRef(props, 'allFilaments');

const {
  activeFilter,
  toggleFilter,
  shouldShowSegment,
  colorWheelItems,
  complementaryColors,
  triadColors,
  isComplementary,
  isSimilar,
  isAnalogous,
  isSplitComplementary,
  isTriadic,
  getColorPosition,
  getArcPath,
  getOuterRingPath,
  getTrianglePoints,
} = useColorWheel(filamentRef, allFilamentsRef);
</script>

<template>
  <div class="detail-section">
    <h3 class="section-title">{{ labels.colorHarmonies }}</h3>
    <div class="color-wheel">
      <svg viewBox="-10 -10 220 220" class="wheel-svg">
        <!-- Outer wheel segments -->
        <g v-for="(item, index) in colorWheelItems" :key="item.id">
          <path
            :d="getArcPath(index, colorWheelItems.length)"
            :fill="item.colorHex"
            :class="['wheel-segment', {
              'active': item.id === filament.id,
              'complementary': isComplementary(item),
              'similar': isSimilar(item),
              'analogous': isAnalogous(item),
              'split-complementary': isSplitComplementary(item),
              'triadic': isTriadic(item),
              'faded': !shouldShowSegment(item)
            }]"
            @click="emit('selectFilament', item)"
          >
            <title>{{ item.vendor ? `${item.vendor} - ${item.name}` : item.name }}</title>
          </path>
          <!-- Highlight rings for harmony colors -->
          <path
            v-if="isComplementary(item)"
            :d="getOuterRingPath(index, colorWheelItems.length)"
            fill="none"
            stroke="#ff6464"
            stroke-width="4"
            class="harmony-ring complementary-ring"
          />
          <path
            v-if="isSimilar(item)"
            :d="getOuterRingPath(index, colorWheelItems.length)"
            fill="none"
            stroke="#64c8ff"
            stroke-width="4"
            class="harmony-ring similar-ring"
          />
          <path
            v-if="isAnalogous(item)"
            :d="getOuterRingPath(index, colorWheelItems.length)"
            fill="none"
            stroke="#ffd164"
            stroke-width="4"
            class="harmony-ring analogous-ring"
          />
          <path
            v-if="isSplitComplementary(item)"
            :d="getOuterRingPath(index, colorWheelItems.length)"
            fill="none"
            stroke="#ff64c8"
            stroke-width="4"
            class="harmony-ring split-ring"
          />
          <path
            v-if="isTriadic(item) && item.id !== filament.id"
            :d="getOuterRingPath(index, colorWheelItems.length)"
            fill="none"
            stroke="#64ffc8"
            stroke-width="4"
            class="harmony-ring triadic-ring"
          />
        </g>

        <!-- Harmony lines (Triad) -->
        <g v-if="triadColors.length === 3" class="harmony-lines">
          <polygon
            :points="getTrianglePoints()"
            fill="none"
            stroke="rgba(var(--accent), 0.4)"
            stroke-width="2"
            stroke-dasharray="4,4"
          />
        </g>

        <!-- Harmony lines (Complementary) -->
        <g v-if="complementaryColors.length > 0" class="harmony-lines">
          <line
            :x1="getColorPosition(filament).x"
            :y1="getColorPosition(filament).y"
            :x2="getColorPosition(complementaryColors[0]).x"
            :y2="getColorPosition(complementaryColors[0]).y"
            stroke="#ff6464"
            stroke-width="2.5"
            stroke-dasharray="4,4"
          />
        </g>

        <!-- Center circle with current color -->
        <circle cx="100" cy="100" r="35" :fill="filament.colorHex" class="wheel-center" />
        <circle cx="100" cy="100" r="35" fill="none" stroke="rgba(var(--border), 0.5)" stroke-width="2" />
      </svg>

      <div class="wheel-legend">
        <button
          class="legend-item"
          :class="{ active: activeFilter === 'all' }"
          @click="toggleFilter('all')"
        >
          <div class="legend-dot current"></div>
          <span>{{ labels.currentColor }}</span>
        </button>
        <button
          class="legend-item"
          :class="{ active: activeFilter === 'complementary' }"
          @click="toggleFilter('complementary')"
        >
          <div class="legend-dot complementary"></div>
          <span>{{ labels.complementary }}</span>
        </button>
        <button
          class="legend-item"
          :class="{ active: activeFilter === 'analogous' }"
          @click="toggleFilter('analogous')"
        >
          <div class="legend-dot analogous"></div>
          <span>Analog</span>
        </button>
        <button
          class="legend-item"
          :class="{ active: activeFilter === 'triadic' }"
          @click="toggleFilter('triadic')"
        >
          <div class="legend-dot triadic"></div>
          <span>Triade</span>
        </button>
        <button
          class="legend-item"
          :class="{ active: activeFilter === 'split' }"
          @click="toggleFilter('split')"
        >
          <div class="legend-dot split"></div>
          <span>Split-Komplementär</span>
        </button>
        <button
          class="legend-item"
          :class="{ active: activeFilter === 'similar' }"
          @click="toggleFilter('similar')"
        >
          <div class="legend-dot similar"></div>
          <span>{{ labels.similar }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(var(--text-muted));
  margin: 0;
}

.color-wheel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(var(--surface-alt), 0.2);
  border: 1px solid rgba(var(--border), 0.3);
  border-radius: 16px;
}

.wheel-svg {
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
}

.wheel-segment {
  cursor: pointer;
  transition: opacity 200ms, transform 200ms;
}

.wheel-segment:hover {
  opacity: 0.8;
}

.wheel-segment.faded {
  opacity: 0.2;
}

.wheel-segment.active {
  stroke: white;
  stroke-width: 3;
}

.harmony-ring {
  pointer-events: none;
}

.wheel-center {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.wheel-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(var(--surface-alt), 0.4);
  border: 1px solid rgba(var(--border), 0.3);
  border-radius: 20px;
  font-size: 11px;
  color: rgb(var(--text-muted));
  cursor: pointer;
  transition: all 150ms ease;
}

.legend-item:hover,
.legend-item.active {
  background: rgba(var(--surface-alt), 0.7);
  border-color: rgba(var(--accent), 0.5);
  color: rgb(var(--text));
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.current {
  background: linear-gradient(135deg, #4080ff, #8040ff);
}

.legend-dot.complementary {
  background: #ff6464;
}

.legend-dot.analogous {
  background: #ffd164;
}

.legend-dot.triadic {
  background: #64ffc8;
}

.legend-dot.split {
  background: #ff64c8;
}

.legend-dot.similar {
  background: #64c8ff;
}
</style>
