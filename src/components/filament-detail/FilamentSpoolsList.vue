<script setup lang="ts">
import { Icon } from '@iconify/vue';

export interface SpoolData {
  id: number;
  location?: string | null;
  remainingWeight?: number | null;
  usedWeight?: number | null;
  archived?: boolean | null;
}

defineProps<{
  spools: SpoolData[];
  labels: {
    spools: string;
    archived: string;
    remaining: string;
    used: string;
  };
}>();
</script>

<template>
  <div class="detail-section">
    <h3 class="section-title">{{ labels.spools }} ({{ spools.length }})</h3>
    <div class="spools-list">
      <div v-for="spool in spools" :key="spool.id" class="spool-item">
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
            <span>{{ spool.remainingWeight?.toFixed(2) }}g {{ labels.remaining }}</span>
          </div>
          <div v-if="spool.usedWeight !== null && spool.usedWeight > 0" class="spool-detail">
            <Icon icon="lucide:trending-down" class="w-3.5 h-3.5" />
            <span>{{ spool.usedWeight?.toFixed(2) }}g {{ labels.used }}</span>
          </div>
        </div>
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
}

.spool-archived {
  background: rgba(var(--text-muted), 0.15);
  color: rgb(var(--text-muted));
}

.spool-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spool-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgb(var(--text-muted));
}
</style>
