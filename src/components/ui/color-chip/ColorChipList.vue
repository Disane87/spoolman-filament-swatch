<script setup lang="ts">
import ColorChip from './ColorChip.vue';

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
</script>

<template>
  <div class="color-chips">
    <ColorChip
      v-for="color in colors"
      :key="color.id"
      :color-hex="color.colorHex"
      :name="color.name"
      :vendor="color.vendor"
      :source="color.source"
      @select="$emit('select', color)"
    />
  </div>
</template>

<style scoped>
.color-chips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
