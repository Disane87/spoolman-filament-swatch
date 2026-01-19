<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { getSourceIcon, getSourceLabel, getSourceBadgeClass } from '@/lib/sourceUtils';

const props = withDefaults(defineProps<{
  source: string;
  variant?: 'default' | 'chip' | 'minimal';
  showLabel?: boolean;
}>(), {
  variant: 'default',
  showLabel: true,
});

const icon = computed(() => getSourceIcon(props.source));
const label = computed(() => getSourceLabel(props.source));
const badgeClass = computed(() => getSourceBadgeClass(props.source));
</script>

<template>
  <span
    class="source-badge"
    :class="[badgeClass, `source-${source}`, `variant-${variant}`]"
    :title="!showLabel ? label : undefined"
  >
    <Icon :icon="icon" class="badge-icon" />
    <span v-if="showLabel" class="badge-label">{{ label }}</span>
  </span>
</template>

<style scoped>
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

.source-badge.variant-chip {
  padding: 4px 8px;
  font-size: 10px;
  border-radius: 12px;
}

.source-badge.variant-minimal {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 8px;
  background: transparent;
  border: none;
}

.badge-icon {
  width: 14px;
  height: 14px;
  opacity: 0.9;
}

.variant-chip .badge-icon,
.variant-minimal .badge-icon {
  width: 12px;
  height: 12px;
}

.source-badge.source-spoolman {
  background: rgba(100, 200, 100, 0.15);
  border-color: rgba(100, 200, 100, 0.3);
  color: rgb(80, 180, 80);
}

.source-badge.source-external {
  background: rgba(150, 100, 255, 0.15);
  border-color: rgba(150, 100, 255, 0.3);
  color: rgb(150, 100, 255);
}

.badge-spoolman {
  background: rgba(100, 200, 100, 0.15);
  color: rgb(80, 180, 80);
}

.badge-external {
  background: rgba(150, 100, 255, 0.15);
  color: rgb(150, 100, 255);
}
</style>
