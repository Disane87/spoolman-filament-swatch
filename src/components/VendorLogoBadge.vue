<template>
  <div class="vendor-badge flex items-center gap-2">
    <img
      v-if="logoUrl && !logoFailed"
      :src="logoUrl"
      :alt="getLogoAlt(vendorName)"
      class="h-5 w-5 sm:h-6 sm:w-6 object-contain flex-shrink-0"
      @error="logoFailed = true"
    />
    <span class="text-xs sm:text-sm font-medium">{{ vendorName }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getLogoUrl, getLogoAlt } from '@/lib/logoUtils';

defineProps<{
  vendorName: string;
}>();

const logoFailed = ref(false);

const logoUrl = computed(() => {
  if (logoFailed.value) return null;
  return getLogoUrl(vendorName);
});
</script>

<style scoped>
.vendor-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

img {
  flex-shrink: 0;
}
</style>
