<script setup lang="ts">
import { toRef } from 'vue';
import { ColorChipList } from '@/components/ui/color-chip';
import { useColorHarmonies } from '@/composables/useColorHarmonies';
import type { FilamentCard } from '@/composables/useFilaments';

const props = defineProps<{
  filament: FilamentCard;
  allFilaments: FilamentCard[];
  labels: {
    similarColors: string;
    complementaryColors: string;
  };
}>();

const emit = defineEmits<{
  (e: 'selectFilament', filament: FilamentCard): void;
}>();

const filamentRef = toRef(props, 'filament');
const allFilamentsRef = toRef(props, 'allFilaments');

const { similarColors, complementaryColors } = useColorHarmonies(filamentRef, allFilamentsRef);
</script>

<template>
  <!-- Similar Colors -->
  <div v-if="similarColors.length > 0" class="detail-section">
    <h3 class="section-title">{{ labels.similarColors }}</h3>
    <ColorChipList
      :colors="similarColors"
      @select="emit('selectFilament', $event as FilamentCard)"
    />
  </div>

  <!-- Complementary Colors -->
  <div v-if="complementaryColors.length > 0" class="detail-section">
    <h3 class="section-title">{{ labels.complementaryColors }}</h3>
    <ColorChipList
      :colors="complementaryColors"
      @select="emit('selectFilament', $event as FilamentCard)"
    />
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
</style>
