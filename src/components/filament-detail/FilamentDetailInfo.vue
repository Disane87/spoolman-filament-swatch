<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { InfoBadge } from '@/components/ui/info-badge';
import type { FilamentCard } from '@/composables/useFilaments';

defineProps<{
  filament: FilamentCard;
  labels: {
    details: string;
  };
}>();
</script>

<template>
  <div class="detail-section">
    <h3 class="section-title">{{ labels.details }}</h3>

    <!-- External Source Notice -->
    <div v-if="filament.source === 'external'" class="external-source-notice notice-external">
      <Icon icon="lucide:link" class="w-4 h-4" />
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
      <InfoBadge v-if="filament.weight" icon="lucide:weight" :value="`${filament.weight}g`" />
      <InfoBadge
        v-if="filament.remainingWeight !== null && filament.remainingWeight !== undefined"
        icon="lucide:gauge"
        :value="`${filament.remainingWeight}g`"
      />
      <InfoBadge v-if="filament.price" icon="lucide:euro" :value="`${filament.price.toFixed(2)}€`" />
      <InfoBadge v-if="filament.density" icon="lucide:box" :value="`${filament.density} g/cm³`" />
      <InfoBadge v-if="filament.diameter" icon="lucide:ruler" :value="`${filament.diameter}mm`" />
      <InfoBadge v-if="filament.extruderTemp" icon="lucide:flame" :value="`${filament.extruderTemp}°C`" />
      <InfoBadge v-if="filament.bedTemp" icon="lucide:thermometer" :value="`${filament.bedTemp}°C`" />
      <InfoBadge v-if="filament.articleNumber" icon="lucide:hash" :value="filament.articleNumber" :wide="true" />
    </div>

    <div v-if="filament.comment" class="info-comment">
      <Icon icon="lucide:message-square" class="w-4 h-4" />
      <span>{{ filament.comment }}</span>
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

.info-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.external-source-notice.notice-external {
  background: rgba(150, 100, 255, 0.08);
  border-color: rgba(150, 100, 255, 0.2);
  color: rgb(150, 100, 255);
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
</style>
