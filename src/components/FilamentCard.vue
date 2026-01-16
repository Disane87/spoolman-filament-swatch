<template>
  <div
    class="group relative flex h-full flex-col gap-4 rounded-3xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.95)] p-5 shadow-2xl shadow-black/10 transition hover:-translate-y-1"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-lg font-semibold">{{ filament.name }}</p>
        <p class="text-sm text-[rgb(var(--text-muted))]">
          {{ filament.vendor }} · {{ filament.material }}
        </p>
      </div>
      <div class="flex flex-col items-end gap-2">
        <Badge :variant="filament.source === 'spoolman' ? 'accent' : 'neutral'">
          {{ filament.source === "spoolman" ? labels.sourceSpoolman : labels.sourceExternal }}
        </Badge>
        <button
          type="button"
          class="pin-btn"
          :aria-pressed="pinned"
          @click="$emit('togglePin', filament)"
        >
          {{ pinned ? labels.unpin : labels.pin }}
        </button>
      </div>
    </div>

    <div class="flex flex-1 items-center justify-center">
      <div
        class="h-40 w-40 rounded-full border border-white/40 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.6)]"
        :style="swatchStyle"
        role="img"
        :aria-label="filament.colorName"
      />
    </div>

    <div class="flex flex-col gap-2 text-sm text-[rgb(var(--text-muted))]">
      <div class="flex items-center justify-between">
        <span class="uppercase tracking-wide">{{ labels.vendor }}</span>
        <span class="text-[rgb(var(--text))]">{{ filament.vendor }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="uppercase tracking-wide">{{ labels.material }}</span>
        <span class="text-[rgb(var(--text))]">{{ filament.material }}</span>
      </div>
      <div v-if="filament.spoolId" class="flex items-center justify-between">
        <span class="uppercase tracking-wide">{{ labels.spool }}</span>
        <span class="text-[rgb(var(--text))]">#{{ filament.spoolId }}</span>
      </div>
      <div v-if="filament.remainingWeight" class="flex items-center justify-between">
        <span class="uppercase tracking-wide">{{ labels.weight }}</span>
        <span class="text-[rgb(var(--text))]">
          {{ filament.remainingWeight }} g
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="mono text-xs text-[rgb(var(--text-muted))]">
        {{ filament.colorHex.toUpperCase() }}
      </div>
      <Button size="sm" variant="secondary" @click="copyHex">
        {{ copied ? labels.copied : labels.copy }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { FilamentCard as FilamentCardType } from "../composables/useFilaments";
import Badge from "./ui/Badge.vue";
import Button from "./ui/Button.vue";

const props = defineProps<{
  filament: FilamentCardType;
  pinned?: boolean;
  labels: {
    vendor: string;
    material: string;
    spool: string;
    weight: string;
    copy: string;
    copied: string;
    sourceSpoolman: string;
    sourceExternal: string;
    pin: string;
    unpin: string;
  };
}>();

defineEmits<{ (e: "togglePin", filament: FilamentCardType): void }>();

const copied = ref(false);

const swatchStyle = computed(() => ({
  background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), transparent 55%), linear-gradient(140deg, ${props.filament.colorHex} 0%, rgba(0,0,0,0.2) 120%)`,
}));

const copyHex = async () => {
  await navigator.clipboard.writeText(props.filament.colorHex);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1200);
};
</script>

<style scoped>
.pin-btn {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--border), 0.7);
  background: rgba(var(--surface-alt), 0.8);
  color: rgb(var(--text));
  transition: all 120ms ease;
}
.pin-btn:hover {
  border-color: rgba(var(--accent-2), 0.7);
  background: rgba(var(--accent-2), 0.12);
}
.pin-btn[aria-pressed="true"] {
  border-color: rgba(var(--accent), 0.7);
  background: rgba(var(--accent), 0.18);
  color: rgb(var(--text));
}
</style>
