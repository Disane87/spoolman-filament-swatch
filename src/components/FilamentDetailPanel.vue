<template>
  <Transition name="slide-in">
    <div v-if="filament" class="detail-panel" :style="panelBackgroundStyle">
      <div class="detail-header">
        <div>
          <h2 class="detail-title">{{ filament.name }}</h2>
          <div class="detail-subtitle-row">
            <p class="detail-subtitle">
              {{ filament.vendor }} · {{ filament.material }}
            </p>
            <span 
              class="source-badge"
              :class="`source-${filament.source}`"
            >
              <Icon 
                :icon="getSourceIcon(filament.source)" 
                class="badge-icon" 
              />
              {{ getSourceLabel(filament.source) }}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" @click="$emit('close')">
          <Icon icon="lucide:x" class="w-5 h-5" />
        </Button>
      </div>

      <div class="detail-body">
        <!-- Color Swatch -->
        <div class="detail-section">
          <h3 class="section-title">{{ labels.color }}</h3>
          <div class="color-swatch-large" :style="swatchStyle">
            <div class="color-info">
              <span class="color-hex">{{ filament.colorHex.toUpperCase() }}</span>
            </div>
          </div>
        </div>

        <!-- Spoolman Details -->
        <div v-if="filament.source === 'spoolman'" class="detail-section">
          <h3 class="section-title">{{ labels.details }}</h3>
          <div class="info-badges">
            <div v-if="filament.weight" class="info-badge">
              <Icon icon="lucide:weight" class="badge-icon" />
              <span class="badge-value">{{ filament.weight }}g</span>
            </div>
            <div v-if="filament.remainingWeight !== null && filament.remainingWeight !== undefined" class="info-badge">
              <Icon icon="lucide:gauge" class="badge-icon" />
              <span class="badge-value">{{ filament.remainingWeight }}g</span>
            </div>
            <div v-if="filament.price" class="info-badge">
              <Icon icon="lucide:euro" class="badge-icon" />
              <span class="badge-value">{{ filament.price.toFixed(2) }}€</span>
            </div>
            <div v-if="filament.density" class="info-badge">
              <Icon icon="lucide:box" class="badge-icon" />
              <span class="badge-value">{{ filament.density }} g/cm³</span>
            </div>
            <div v-if="filament.diameter" class="info-badge">
              <Icon icon="lucide:ruler" class="badge-icon" />
              <span class="badge-value">{{ filament.diameter }}mm</span>
            </div>
            <div v-if="filament.extruderTemp" class="info-badge">
              <Icon icon="lucide:flame" class="badge-icon" />
              <span class="badge-value">{{ filament.extruderTemp }}°C</span>
            </div>
            <div v-if="filament.bedTemp" class="info-badge">
              <Icon icon="lucide:thermometer" class="badge-icon" />
              <span class="badge-value">{{ filament.bedTemp }}°C</span>
            </div>
            <div v-if="filament.articleNumber" class="info-badge info-badge-wide">
              <Icon icon="lucide:hash" class="badge-icon" />
              <span class="badge-value">{{ filament.articleNumber }}</span>
            </div>
          </div>
          <div v-if="filament.comment" class="info-comment">
            <Icon icon="lucide:message-square" class="w-4 h-4" />
            <span>{{ filament.comment }}</span>
          </div>
        </div>

        <!-- SpoolmanDB/External Details -->
        <div v-else-if="filament.source === 'external'" class="detail-section">
          <h3 class="section-title">{{ labels.details }}</h3>
          <div class="external-source-notice" :class="`notice-external`">
            <Icon 
              icon="lucide:link" 
              class="w-4 h-4" 
            />
            <div class="notice-content">
              <p class="notice-title">
                <strong>Externe Datenbank</strong>
              </p>
              <p class="notice-text">
                Diese Daten stammen aus einer externen Datenbank (SpoolmanDB Community oder andere Quellen). Keine Spulen-Informationen verfügbar.
              </p>
            </div>
          </div>
          <div class="info-badges">
            <div v-if="filament.density" class="info-badge">
              <Icon icon="lucide:box" class="badge-icon" />
              <span class="badge-value">{{ filament.density }} g/cm³</span>
            </div>
            <div v-if="filament.diameter" class="info-badge">
              <Icon icon="lucide:ruler" class="badge-icon" />
              <span class="badge-value">{{ filament.diameter }}mm</span>
            </div>
            <div v-if="filament.extruderTemp" class="info-badge">
              <Icon icon="lucide:flame" class="badge-icon" />
              <span class="badge-value">{{ filament.extruderTemp }}°C</span>
            </div>
            <div v-if="filament.bedTemp" class="info-badge">
              <Icon icon="lucide:thermometer" class="badge-icon" />
              <span class="badge-value">{{ filament.bedTemp }}°C</span>
            </div>
          </div>
        </div>

        <!-- Spools -->
        <div v-if="filament.source === 'spoolman' && filament.spools && filament.spools.length > 0" class="detail-section">
          <h3 class="section-title">{{ labels.spools }} ({{ filament.spools?.length || 0 }})</h3>
          <div class="spools-list">
            <div v-for="spool in filament.spools" :key="spool.id" class="spool-item">
              <div class="spool-header">
                <span class="spool-id">#{{ spool.id }}</span>
                <span v-if="spool.archived" class="spool-badge spool-archived">
                  <Icon icon="lucide:archive" class="w-3 h-3" />
                  {{ labels.archived }}
                </span>
              </div>
              <div class="spool-details">
                <div v-if="spool.location" class="spool-detail">
                  <Icon icon="lucide:map-pin" class="w-3.5 h-3.5" />
                  <span>{{ spool.location }}</span>
                </div>
                <div v-if="spool.remainingWeight !== null" class="spool-detail">
                  <Icon icon="lucide:package" class="w-3.5 h-3.5" />
                  <span>{{ spool.remainingWeight.toFixed(2) }}g {{ labels.remaining }}</span>
                </div>
                <div v-if="spool.usedWeight !== null && spool.usedWeight > 0" class="spool-detail">
                  <Icon icon="lucide:trending-down" class="w-3.5 h-3.5" />
                  <span>{{ spool.usedWeight.toFixed(2) }}g {{ labels.used }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Color Wheel -->
        <div v-if="filament" class="detail-section">
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
                  @click="$emit('selectFilament', item)"
                >
                  <title>{{ item.manufacturer ? `${item.manufacturer} - ${item.name}` : item.name }}</title>
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

        <!-- Similar Colors -->
        <div v-if="similarColors.length > 0" class="detail-section">
          <h3 class="section-title">{{ labels.similarColors }}</h3>
          <div class="color-chips">
            <button
              v-for="similar in similarColors"
              :key="similar.id"
              class="color-chip"
              :title="similar.name"
              @click="$emit('selectFilament', similar)"
            >
              <div class="chip-swatch" :style="{ background: similar.colorHex }" />
              <div class="chip-info">
                <span class="chip-name">{{ similar.name }}</span>
                <span class="chip-vendor">{{ similar.vendor }}</span>
              </div>
              <span 
                class="chip-source-badge"
                :class="`source-${similar.source}`"
                :title="getSourceLabel(similar.source)"
              >
                <Icon :icon="getSourceIcon(similar.source)" class="w-4 h-4" />
                <span class="badge-text">{{ getSourceLabel(similar.source) }}</span>
              </span>
            </button>
          </div>
        </div>

        <!-- Complementary Colors -->
        <div v-if="complementaryColors.length > 0" class="detail-section">
          <h3 class="section-title">{{ labels.complementaryColors }}</h3>
          <div class="color-chips">
            <button
              v-for="comp in complementaryColors"
              :key="comp.id"
              class="color-chip"
              :title="comp.name"
              @click="$emit('selectFilament', comp)"
            >
              <div class="chip-swatch" :style="{ background: comp.colorHex }" />
              <div class="chip-info">
                <span class="chip-name">{{ comp.name }}</span>
                <span class="chip-vendor">{{ comp.vendor }}</span>
              </div>
              <span 
                class="chip-source-badge"
                :class="`source-${comp.source}`"
                :title="getSourceLabel(comp.source)"
              >
                <Icon :icon="getSourceIcon(comp.source)" class="w-4 h-4" />
                <span class="badge-text">{{ getSourceLabel(comp.source) }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button } from '@/components/ui/button';
import type { FilamentCard } from '../composables/useFilaments';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  filament: FilamentCard | null;
  allFilaments: FilamentCard[];
  labels: {
    color: string;
    details: string;
    spoolId: string;
    remainingWeight: string;
    multiColorType: string;
    coaxial: string;
    longitudinal: string;
    similarColors: string;
    complementaryColors: string;
    spools: string;
    archived: string;
    remaining: string;
    used: string;
    colorHarmonies: string;
    currentColor: string;
    complementary: string;
    similar: string;
  };
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'selectFilament', filament: FilamentCard): void;
}>();

const getSourceIcon = (source: string): string => {
  switch (source) {
    case 'spoolman': return 'lucide:server';
    case 'external': return 'lucide:link';
    default: return 'lucide:help-circle';
  }
};

const getSourceLabel = (source: string): string => {
  switch (source) {
    case 'spoolman': return 'Spoolman';
    case 'external': return 'Extern';
    default: return 'Unbekannt';
  }
};

type HarmonyType = 'all' | 'complementary' | 'analogous' | 'triadic' | 'split' | 'similar';
const activeFilter = ref<HarmonyType>('all');

const toggleFilter = (type: HarmonyType) => {
  activeFilter.value = activeFilter.value === type ? 'all' : type;
};

const shouldShowSegment = (item: typeof props.allFilaments[0]) => {
  if (activeFilter.value === 'all' || item.id === props.filament?.id) return true;
  
  switch (activeFilter.value) {
    case 'complementary': return isComplementary(item);
    case 'analogous': return isAnalogous(item);
    case 'triadic': return isTriadic(item);
    case 'split': return isSplitComplementary(item);
    case 'similar': return isSimilar(item);
    default: return true;
  }
};

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const panelBackgroundStyle = computed(() => {
  if (!props.filament) return {};
  
  const color = props.filament.colorHex;
  return {
    background: `linear-gradient(180deg, ${hexToRgba(color, 0.15)} 0%, ${hexToRgba(color, 0.30)} 100%)`
  };
});

const swatchStyle = computed(() => {
  if (!props.filament) return {};
  
  if (props.filament.multiColorHexes && props.filament.multiColorHexes.length > 1) {
    const colors = props.filament.multiColorHexes;
    if (props.filament.multiColorDirection === 'coaxial') {
      const stops = colors.map((c, i) => {
        const center = (i / (colors.length - 1)) * 100;
        const spread = 15;
        if (i === 0) return `${c} 0%, ${c} ${center + spread}%`;
        if (i === colors.length - 1) return `${c} ${center - spread}%, ${c} 100%`;
        return `${c} ${center - spread}%, ${c} ${center + spread}%`;
      }).join(', ');
      return { background: `radial-gradient(circle, ${stops})` };
    } else {
      return { background: `linear-gradient(90deg, ${colors.join(', ')})` };
    }
  }
  
  return { background: props.filament.colorHex };
});

const hexToRgb = (hex: string) => {
  const cleaned = hex.replace(/^#/, '');
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return { r, g, b };
};

const colorDistance = (hex1: string, hex2: string) => {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
};

const getHue = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  
  if (max !== min) {
    if (max === r) hue = ((g - b) / (max - min)) * 60;
    else if (max === g) hue = ((b - r) / (max - min)) * 60 + 120;
    else hue = ((r - g) / (max - min)) * 60 + 240;
    if (hue < 0) hue += 360;
  }
  
  return hue;
};

const similarColors = computed(() => {
  if (!props.filament) return [];
  
  const currentHex = props.filament.colorHex;
  
  return props.allFilaments
    .filter(f => f.id !== props.filament!.id)
    .map(f => ({
      ...f,
      distance: colorDistance(currentHex, f.colorHex)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
});

const complementaryColors = computed(() => {
  if (!props.filament) return [];
  
  const currentHue = getHue(props.filament.colorHex);
  const complementaryHue = (currentHue + 180) % 360;
  
  return props.allFilaments
    .filter(f => f.id !== props.filament!.id)
    .map(f => {
      const fHue = getHue(f.colorHex);
      const hueDiff = Math.abs(fHue - complementaryHue);
      const distance = Math.min(hueDiff, 360 - hueDiff);
      return { ...f, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
});

// Analogous colors (±30 degrees)
const analogousColors = computed(() => {
  if (!props.filament) return [];
  
  const currentHue = getHue(props.filament.colorHex);
  const analogHue1 = (currentHue + 30) % 360;
  const analogHue2 = (currentHue - 30 + 360) % 360;
  
  const findClosest = (targetHue: number) => {
    return props.allFilaments
      .filter(f => f.id !== props.filament!.id)
      .map(f => {
        const fHue = getHue(f.colorHex);
        const hueDiff = Math.abs(fHue - targetHue);
        const distance = Math.min(hueDiff, 360 - hueDiff);
        return { ...f, distance };
      })
      .sort((a, b) => a.distance - b.distance)[0];
  };
  
  return [findClosest(analogHue1), findClosest(analogHue2)].filter(Boolean);
});

// Split complementary colors (150° and 210°)
const splitComplementaryColors = computed(() => {
  if (!props.filament) return [];
  
  const currentHue = getHue(props.filament.colorHex);
  const splitHue1 = (currentHue + 150) % 360;
  const splitHue2 = (currentHue + 210) % 360;
  
  const findClosest = (targetHue: number) => {
    return props.allFilaments
      .filter(f => f.id !== props.filament!.id)
      .map(f => {
        const fHue = getHue(f.colorHex);
        const hueDiff = Math.abs(fHue - targetHue);
        const distance = Math.min(hueDiff, 360 - hueDiff);
        return { ...f, distance };
      })
      .sort((a, b) => a.distance - b.distance)[0];
  };
  
  return [findClosest(splitHue1), findClosest(splitHue2)].filter(Boolean);
});

// Color wheel helpers
const colorWheelItems = computed(() => {
  if (!props.filament) return [];
  
  // Create a balanced color wheel with 24 segments covering the full hue spectrum
  const wheelColors: typeof props.allFilaments = [];
  const hueStep = 15; // 360 / 24 = 15 degrees per segment
  
  for (let targetHue = 0; targetHue < 360; targetHue += hueStep) {
    // Find the closest filament to this hue
    const closest = props.allFilaments
      .map(f => ({
        filament: f,
        hueDiff: Math.min(
          Math.abs(getHue(f.colorHex) - targetHue),
          360 - Math.abs(getHue(f.colorHex) - targetHue)
        )
      }))
      .sort((a, b) => a.hueDiff - b.hueDiff)[0];
    
    if (closest && closest.hueDiff < 30) {
      wheelColors.push(closest.filament);
    }
  }
  
  // Sort by hue
  return wheelColors.sort((a, b) => getHue(a.colorHex) - getHue(b.colorHex));
});

// Triad colors (120 degrees apart)
const triadColors = computed(() => {
  if (!props.filament) return [];
  
  const currentHue = getHue(props.filament.colorHex);
  const triadHue1 = (currentHue + 120) % 360;
  const triadHue2 = (currentHue + 240) % 360;
  
  const findClosest = (targetHue: number) => {
    return props.allFilaments
      .filter(f => f.id !== props.filament!.id)
      .map(f => {
        const fHue = getHue(f.colorHex);
        const hueDiff = Math.abs(fHue - targetHue);
        const distance = Math.min(hueDiff, 360 - hueDiff);
        return { ...f, distance };
      })
      .sort((a, b) => a.distance - b.distance)[0];
  };
  
  const colors = [
    props.filament,
    findClosest(triadHue1),
    findClosest(triadHue2)
  ].filter(Boolean);
  
  return colors.length === 3 ? colors : [];
});

const getColorPosition = (item: typeof props.filament) => {
  if (!item) return { x: 100, y: 100 };
  const hue = getHue(item.colorHex);
  const angle = (hue - 90) * Math.PI / 180; // -90 to start at top
  const radius = 67.5; // Mid-point of wheel
  return {
    x: 100 + radius * Math.cos(angle),
    y: 100 + radius * Math.sin(angle)
  };
};

const getTrianglePoints = () => {
  if (triadColors.value.length !== 3) return '';
  return triadColors.value
    .map(c => {
      const pos = getColorPosition(c);
      return `${pos.x},${pos.y}`;
    })
    .join(' ');
};

const getOuterRingPath = (index: number, total: number) => {
  const centerX = 100;
  const centerY = 100;
  const outerRadius = 90;
  const ringRadius = 94; // Slightly outside the wheel
  const angleStart = (index / total) * 360;
  const angleEnd = ((index + 1) / total) * 360;
  
  const startAngleRad = (angleStart - 90) * Math.PI / 180;
  const endAngleRad = (angleEnd - 90) * Math.PI / 180;
  
  const x1 = centerX + ringRadius * Math.cos(startAngleRad);
  const y1 = centerY + ringRadius * Math.sin(startAngleRad);
  const x2 = centerX + ringRadius * Math.cos(endAngleRad);
  const y2 = centerY + ringRadius * Math.sin(endAngleRad);
  
  const largeArc = angleEnd - angleStart > 180 ? 1 : 0;
  
  return `M ${x1} ${y1} A ${ringRadius} ${ringRadius} 0 ${largeArc} 1 ${x2} ${y2}`;
};

const getArcPath = (index: number, total: number) => {
  const centerX = 100;
  const centerY = 100;
  const innerRadius = 40;
  const outerRadius = 90;
  const angleStart = (index / total) * 360;
  const angleEnd = ((index + 1) / total) * 360;
  
  const startAngleRad = (angleStart - 90) * Math.PI / 180;
  const endAngleRad = (angleEnd - 90) * Math.PI / 180;
  
  const x1 = centerX + innerRadius * Math.cos(startAngleRad);
  const y1 = centerY + innerRadius * Math.sin(startAngleRad);
  const x2 = centerX + outerRadius * Math.cos(startAngleRad);
  const y2 = centerY + outerRadius * Math.sin(startAngleRad);
  const x3 = centerX + outerRadius * Math.cos(endAngleRad);
  const y3 = centerY + outerRadius * Math.sin(endAngleRad);
  const x4 = centerX + innerRadius * Math.cos(endAngleRad);
  const y4 = centerY + innerRadius * Math.sin(endAngleRad);
  
  const largeArc = angleEnd - angleStart > 180 ? 1 : 0;
  
  return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`;
};

const isComplementary = (item: typeof props.allFilaments[0]) => {
  if (!props.filament) return false;
  return complementaryColors.value.some(c => c.id === item.id);
};

const isSimilar = (item: typeof props.allFilaments[0]) => {
  if (!props.filament) return false;
  return similarColors.value.some(c => c.id === item.id);
};

const isAnalogous = (item: typeof props.allFilaments[0]) => {
  if (!props.filament) return false;
  return analogousColors.value.some(c => c?.id === item.id);
};

const isSplitComplementary = (item: typeof props.allFilaments[0]) => {
  if (!props.filament) return false;
  return splitComplementaryColors.value.some(c => c?.id === item.id);
};

const isTriadic = (item: typeof props.allFilaments[0]) => {
  if (!props.filament) return false;
  return triadColors.value.some(c => c?.id === item.id);
};
</script>

<style scoped>
.detail-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  border-left: 1px solid rgba(var(--border), 0.7);
  box-shadow: -8px 0 32px -8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(32px) saturate(150%);
  -webkit-backdrop-filter: blur(32px) saturate(150%);
  z-index: 1000;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
}

.detail-header {
  border-bottom: 1px solid rgba(var(--border), 0.3);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-shrink: 0;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: rgb(var(--text));
}

.detail-subtitle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.detail-subtitle {
  font-size: 14px;
  color: rgb(var(--text-muted));
  margin: 0;
}

.detail-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow-y: auto;
}

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

.color-swatch-large {
  height: 180px;
  border-radius: 16px;
  display: flex;
  align-items: flex-end;
  padding: 16px;
  border: 1px solid rgba(var(--border), 0.5);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.3);
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
}

.color-hex {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.color-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.info-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

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

.info-comment {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(var(--surface-alt), 0.3);
  border: 1px solid rgba(var(--border), 0.3);
  border-radius: 12px;
  font-size: 13px;
  color: rgb(var(--text-muted));
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.external-source-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(var(--accent), 0.08);
  border: 1px solid rgba(var(--accent), 0.2);
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}

.external-source-notice.notice-spoolmandb {
  background: rgba(100, 150, 255, 0.08);
  border-color: rgba(100, 150, 255, 0.2);
  color: rgb(100, 150, 255);
}

.external-source-notice.notice-external {
  background: rgba(150, 100, 255, 0.08);
  border-color: rgba(150, 100, 255, 0.2);
  color: rgb(150, 100, 255);
}

.external-source-notice > .badge-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notice-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notice-title {
  font-weight: 700;
  margin: 0;
  color: rgb(var(--text));
}

.notice-text {
  margin: 0;
  color: rgb(var(--text-muted));
}

.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(var(--accent), 0.15);
  border: 1px solid rgba(var(--accent), 0.3);
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--text));
  white-space: nowrap;
}

.source-badge.source-spoolman {
  background: rgba(100, 200, 100, 0.15);
  border-color: rgba(100, 200, 100, 0.3);
  color: rgb(80, 180, 80);
}

.source-badge.source-spoolmandb {
  background: rgba(100, 150, 255, 0.15);
  border-color: rgba(100, 150, 255, 0.3);
  color: rgb(100, 150, 255);
}

.source-badge.source-external {
  background: rgba(150, 100, 255, 0.15);
  border-color: rgba(150, 100, 255, 0.3);
  color: rgb(150, 100, 255);
}

.spools-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spool-item {
  background: rgba(var(--surface-alt), 0.3);
  border: 1px solid rgba(var(--border), 0.3);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.spool-id {
  font-size: 14px;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  color: rgb(var(--text));
}

.spool-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.spool-archived {
  background: rgba(var(--text-muted), 0.15);
  color: rgb(var(--text-muted));
}

.spool-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.spool-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgb(var(--text-muted));
}

.color-wheel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.wheel-svg {
  width: 100%;
  max-width: 280px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.harmony-lines {
  pointer-events: none;
}

.wheel-segment {
  cursor: pointer;
  transition: all 150ms ease;
  stroke: rgba(var(--border), 0.2);
  stroke-width: 0.5;
}

.wheel-segment:hover {
  filter: brightness(1.2);
  stroke: rgba(var(--text), 0.4);
  stroke-width: 1.5;
  transform-origin: center;
}

.wheel-segment.active {
  stroke: rgba(var(--accent), 0.9);
  stroke-width: 3;
  filter: brightness(1.15) drop-shadow(0 0 8px currentColor);
}

.wheel-segment.complementary {
  filter: brightness(1.1);
}

.wheel-segment.similar {
  filter: brightness(1.08);
}

.wheel-segment.faded {
  opacity: 0.15;
  filter: grayscale(0.7);
}

.wheel-segment.faded:hover {
  opacity: 0.3;
}

.harmony-ring {
  pointer-events: none;
  opacity: 0.9;
  stroke-linecap: round;
}

.complementary-ring {
  filter: drop-shadow(0 0 6px #ff6464);
}

.similar-ring {
  filter: drop-shadow(0 0 6px #64c8ff);
}

.analogous-ring {
  filter: drop-shadow(0 0 6px #ffd164);
}

.triadic-ring {
  filter: drop-shadow(0 0 6px #64ffc8);
}

.split-ring {
  filter: drop-shadow(0 0 6px #ff64c8);
}

.wheel-center {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.wheel-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgb(var(--text-muted));
  background: none;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
}

.legend-item:hover {
  background: rgba(var(--surface-alt), 0.5);
  color: rgb(var(--text));
}

.legend-item.active {
  background: rgba(var(--accent), 0.15);
  color: rgb(var(--text));
  font-weight: 600;
}

.legend-item.active .legend-dot {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px rgba(var(--accent), 0.3);
}

.legend-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid;
  transition: all 150ms ease;
}

.legend-dot.current {
  background: rgba(var(--accent), 0.3);
  border-color: rgba(var(--accent), 0.9);
}

.legend-dot.complementary {
  background: rgba(255, 100, 100, 0.2);
  border-color: rgba(255, 100, 100, 0.7);
}

.legend-dot.similar {
  background: rgba(100, 200, 255, 0.2);
  border-color: rgba(100, 200, 255, 0.7);
}

.legend-dot.analogous {
  background: rgba(255, 209, 100, 0.2);
  border-color: rgba(255, 209, 100, 0.8);
}

.legend-dot.triadic {
  background: rgba(100, 255, 200, 0.2);
  border-color: rgba(100, 255, 200, 0.8);
}

.legend-dot.split {
  background: rgba(255, 100, 200, 0.2);
  border-color: rgba(255, 100, 200, 0.8);
}

.color-chips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(var(--surface-alt), 0.5);
  border: 1px solid rgba(var(--border), 0.5);
  border-radius: 10px;
  cursor: pointer;
  transition: all 120ms ease;
}

.color-chip:hover {
  background: rgba(var(--surface-alt), 0.8);
  border-color: rgba(var(--accent), 0.6);
  transform: translateX(-2px);
}

.chip-swatch {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(var(--border), 0.5);
  flex-shrink: 0;
}

.chip-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
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
}

.chip-source-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(var(--surface-alt), 0.8);
  color: rgb(var(--text-muted));
  flex-shrink: 0;
  transition: all 120ms ease;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.chip-source-badge.source-spoolman {
  background: rgba(100, 200, 100, 0.15);
  color: rgb(80, 180, 80);
  border: 1px solid rgba(100, 200, 100, 0.3);
}

.chip-source-badge.source-external {
  background: rgba(150, 100, 255, 0.15);
  color: rgb(150, 100, 255);
  border: 1px solid rgba(150, 100, 255, 0.3);
}

.chip-source-badge .badge-text {
  display: none;
}

@media (min-width: 640px) {
  .chip-source-badge .badge-text {
    display: inline;
  }
}

.color-chip:hover .chip-source-badge {
  transform: scale(1.05);
}

/* Transitions */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms;
}

.slide-in-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-in-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .detail-panel {
    width: 100%;
    max-width: 100vw;
  }
}
</style>
