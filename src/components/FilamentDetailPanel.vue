<template>
  <Transition name="slide-in">
    <div v-if="filament" class="detail-panel">
      <div class="detail-header">
        <div>
          <h2 class="detail-title">{{ filament.name }}</h2>
          <p class="detail-subtitle">{{ filament.vendor }} · {{ filament.material }}</p>
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
          <div class="info-grid">
            <div v-if="filament.spoolId" class="info-item">
              <span class="info-label">{{ labels.spoolId }}</span>
              <span class="info-value">{{ filament.spoolId }}</span>
            </div>
            <div v-if="filament.remainingWeight !== null && filament.remainingWeight !== undefined" class="info-item">
              <span class="info-label">{{ labels.remainingWeight }}</span>
              <span class="info-value">{{ filament.remainingWeight }}g</span>
            </div>
            <div v-if="filament.weight" class="info-item">
              <span class="info-label">{{ labels.weight }}</span>
              <span class="info-value">{{ filament.weight }}g</span>
            </div>
            <div v-if="filament.spoolWeight" class="info-item">
              <span class="info-label">{{ labels.spoolWeight }}</span>
              <span class="info-value">{{ filament.spoolWeight }}g</span>
            </div>
            <div v-if="filament.price" class="info-item">
              <span class="info-label">{{ labels.price }}</span>
              <span class="info-value">{{ filament.price.toFixed(2) }}€</span>
            </div>
            <div v-if="filament.density" class="info-item">
              <span class="info-label">{{ labels.density }}</span>
              <span class="info-value">{{ filament.density }} g/cm³</span>
            </div>
            <div v-if="filament.diameter" class="info-item">
              <span class="info-label">{{ labels.diameter }}</span>
              <span class="info-value">{{ filament.diameter }}mm</span>
            </div>
            <div v-if="filament.extruderTemp" class="info-item">
              <span class="info-label">{{ labels.extruderTemp }}</span>
              <span class="info-value">{{ filament.extruderTemp }}°C</span>
            </div>
            <div v-if="filament.bedTemp" class="info-item">
              <span class="info-label">{{ labels.bedTemp }}</span>
              <span class="info-value">{{ filament.bedTemp }}°C</span>
            </div>
            <div v-if="filament.articleNumber" class="info-item">
              <span class="info-label">{{ labels.articleNumber }}</span>
              <span class="info-value">{{ filament.articleNumber }}</span>
            </div>
            <div v-if="filament.multiColorDirection" class="info-item">
              <span class="info-label">{{ labels.multiColorType }}</span>
              <span class="info-value">{{ filament.multiColorDirection === 'coaxial' ? labels.coaxial : labels.longitudinal }}</span>
            </div>
            <div v-if="filament.comment" class="info-item info-item-full">
              <span class="info-label">{{ labels.comment }}</span>
              <span class="info-value">{{ filament.comment }}</span>
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
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
  };
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'selectFilament', filament: FilamentCard): void;
}>();

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
</script>

<style scoped>
.detail-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  background: rgba(var(--surface), 0.98);
  border-left: 1px solid rgba(var(--border), 0.7);
  box-shadow: -8px 0 32px -8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  overflow-y: auto;
  z-index: 1000;
  pointer-events: auto;
}

.detail-header {
  position: sticky;
  top: 0;
  background: rgba(var(--surface), 0.95);
  backdrop-filter: blur(8px);
  padding: 20px;
  border-bottom: 1px solid rgba(var(--border), 0.5);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  z-index: 10;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: rgb(var(--text));
}

.detail-subtitle {
  font-size: 14px;
  color: rgb(var(--text-muted));
  margin: 4px 0 0;
}

.detail-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(var(--surface-alt), 0.5);
  border: 1px solid rgba(var(--border), 0.5);
  border-radius: 10px;
}

.info-item-full {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  color: rgb(var(--text-muted));
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--text));
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
