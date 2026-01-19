<script setup lang="ts">
import { computed } from 'vue';
import type { FilamentCard } from '@/composables/useFilaments';
import { hexToRgba } from '@/lib/colorUtils';
import { getFlatSwatchStyle } from '@/lib/swatchUtils';
import { ColorSwatch } from '@/components/ui/color-swatch';
import FilamentDetailHeader from './FilamentDetailHeader.vue';
import FilamentDetailInfo from './FilamentDetailInfo.vue';
import FilamentSpoolsList from './FilamentSpoolsList.vue';
import FilamentColorWheel from './FilamentColorWheel.vue';
import FilamentColorHarmonies from './FilamentColorHarmonies.vue';

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

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'selectFilament', filament: FilamentCard): void;
}>();

const panelBackgroundStyle = computed(() => {
  if (!props.filament) return {};

  const color = props.filament.colorHex;
  return {
    background: `linear-gradient(180deg, ${hexToRgba(color, 0.15)} 0%, ${hexToRgba(color, 0.30)} 100%)`,
  };
});

const swatchStyle = computed(() => {
  if (!props.filament) return {};
  return getFlatSwatchStyle(
    props.filament.colorHex,
    props.filament.multiColorHexes,
    props.filament.multiColorDirection
  );
});

const showSpools = computed(() => {
  return props.filament?.source === 'spoolman' &&
    props.filament?.spools &&
    props.filament.spools.length > 0;
});
</script>

<template>
  <Transition name="slide-in">
    <div v-if="filament" class="detail-panel" :style="panelBackgroundStyle">
      <FilamentDetailHeader
        :name="filament.name"
        :vendor="filament.vendor"
        :material="filament.material"
        :source="filament.source"
        @close="emit('close')"
      />

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

        <!-- Filament Details -->
        <FilamentDetailInfo
          :filament="filament"
          :labels="{ details: labels.details }"
        />

        <!-- Spools List -->
        <FilamentSpoolsList
          v-if="showSpools"
          :spools="filament.spools!"
          :labels="{
            spools: labels.spools,
            archived: labels.archived,
            remaining: labels.remaining,
            used: labels.used,
          }"
        />

        <!-- Color Wheel -->
        <FilamentColorWheel
          :filament="filament"
          :all-filaments="allFilaments"
          :labels="{
            colorHarmonies: labels.colorHarmonies,
            currentColor: labels.currentColor,
            complementary: labels.complementary,
            similar: labels.similar,
          }"
          @select-filament="emit('selectFilament', $event)"
        />

        <!-- Color Harmonies -->
        <FilamentColorHarmonies
          :filament="filament"
          :all-filaments="allFilaments"
          :labels="{
            similarColors: labels.similarColors,
            complementaryColors: labels.complementaryColors,
          }"
          @select-filament="emit('selectFilament', $event)"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.detail-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  border-left: 1px solid var(--border);
  box-shadow: -8px 0 32px -8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(32px) saturate(150%);
  -webkit-backdrop-filter: blur(32px) saturate(150%);
  z-index: 1000;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
}

.detail-body {
  padding: 20px;
  padding-top: 24px;
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

/* Transition */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 300ms ease, opacity 300ms ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
