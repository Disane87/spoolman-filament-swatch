<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { SourceBadge } from '@/components/ui/source-badge';

defineProps<{
  name: string;
  vendor: string;
  material: string;
  source: string;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div class="detail-header">
    <div>
      <h2 class="detail-title">{{ name }}</h2>
      <div class="detail-subtitle-row">
        <p class="detail-subtitle">
          {{ vendor }} · {{ material }}
        </p>
        <SourceBadge :source="source" />
      </div>
    </div>
    <Button variant="ghost" size="sm" @click="$emit('close')">
      <Icon icon="lucide:x" class="w-5 h-5" />
    </Button>
  </div>
</template>

<style scoped>
.detail-header {
  border-bottom: 1px solid color-mix(in oklch, var(--border), transparent 70%);
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
</style>
