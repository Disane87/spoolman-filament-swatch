<template>
  <div
    class="card-container group relative flex h-full flex-col gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.95)] p-4 sm:p-5 shadow-2xl shadow-black/10 cursor-pointer transition-all hover:border-[rgba(var(--accent),0.6)]"
    @click="$emit('selectFilament', filament)"
  >
    <div class="flex items-start justify-between gap-2 sm:gap-3">
      <div>
        <p class="text-base sm:text-lg font-semibold">{{ filament.name }}</p>
        <p class="text-xs sm:text-sm text-[rgb(var(--text-muted))]">
          {{ filament.vendor }} · {{ filament.material }}
        </p>
      </div>
      <div class="flex flex-col items-end gap-1.5 sm:gap-2">
        <Badge 
          :variant="filament.source === 'spoolman' ? 'accent' : 'neutral'" 
          class="text-[10px] sm:text-xs whitespace-nowrap"
          :class="getBadgeClass(filament.source)"
        >
          <Icon :icon="getSourceIcon(filament.source)" class="w-3 h-3 mr-1" />
          {{ getSourceLabel(filament.source) }}
        </Badge>
        <button
          type="button"
          class="pin-btn h-8 w-8 sm:h-9 sm:w-9"
          :aria-pressed="pinned"
          @click.stop="$emit('togglePin', filament)"
          :title="pinned ? labels.unpin : labels.pin"
        >
          <Icon :icon="pinned ? 'lucide:pin-off' : 'lucide:pin'" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="flex flex-1 items-center justify-center">
      <div
        class="h-32 w-32 sm:h-40 sm:w-40 rounded-full border border-white/40 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.6)]"
        :style="swatchStyle"
        role="img"
        :aria-label="filament.colorName"
      />
    </div>

    <div class="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm text-[rgb(var(--text-muted))]">
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
      <div class="mono text-[10px] sm:text-xs text-[rgb(var(--text-muted))]">
        {{ filament.colorHex.toUpperCase() }}
      </div>
      <Button size="sm" variant="secondary" @click.stop="copyHex" class="h-8 w-8 sm:h-9 sm:w-9 p-0">
        <Icon :icon="copied ? 'lucide:check' : 'lucide:copy'" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { FilamentCard as FilamentCardType } from "../composables/useFilaments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/vue';

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

defineEmits<{
  (e: "togglePin", filament: FilamentCardType): void;
  (e: "selectFilament", filament: FilamentCardType): void;
}>();

const copied = ref(false);

const getSourceIcon = (source: string): string => {
  switch (source) {
    case 'spoolman': return 'lucide:server';
    case 'external': return 'lucide:link';
    default: return 'lucide:help-circle';
  }
};

const getSourceLabel = (source: string): string => {
  switch (source) {
    case 'spoolman': return 'Spoolman';
    case 'external': return 'Extern';
    default: return 'Unbekannt';
  }
};

const getBadgeClass = (source: string): string => {
  switch (source) {
    case 'spoolman': return 'badge-spoolman';
    case 'external': return 'badge-external';
    default: return '';
  }
};

const swatchStyle = computed(() => {
  const filament = props.filament;
  const mat = filament.material.toLowerCase();

  // Multi-color gradient logic
  if (filament.multiColorHexes && filament.multiColorHexes.length > 1) {
    const colors = filament.multiColorHexes;
    let colorGradient: string;
    
    if (filament.multiColorDirection === "coaxial") {
      // Coaxial: circular gradient from center
      const stops = colors.map((c, i) => {
        const center = (i / (colors.length - 1)) * 100;
        const spread = 15; // Sanfter Übergang
        if (i === 0) return `${c} 0%, ${c} ${center + spread}%`;
        if (i === colors.length - 1) return `${c} ${center - spread}%, ${c} 100%`;
        return `${c} ${center - spread}%, ${c} ${center + spread}%`;
      }).join(", ");
      colorGradient = `radial-gradient(circle, ${stops})`;
    } else {
      // Longitudinal (default): linear gradient
      const stops = colors.map((c, i) => {
        const percent = (i / (colors.length - 1)) * 100;
        return `${c} ${percent}%`;
      }).join(", ");
      colorGradient = `linear-gradient(135deg, ${stops})`;
    }

    // Material overlay
    const plaSheen =
      "linear-gradient(110deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 32%, rgba(0,0,0,0.08) 70%)";
    const petgRings =
      "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.10) 0 26%, rgba(255,255,255,0) 40%), radial-gradient(circle at 60% 58%, rgba(0,0,0,0.12) 0 24%, rgba(0,0,0,0) 42%)";
    const absTexture =
      "linear-gradient(125deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.0) 24%, rgba(0,0,0,0.08) 44%, rgba(0,0,0,0) 60%)";

    let materialLayer = plaSheen;
    if (mat.includes("petg")) materialLayer = petgRings;
    else if (mat.includes("abs")) materialLayer = absTexture;

    const highlight = "radial-gradient(circle at 36% 26%, rgba(255,255,255,0.35), transparent 48%)";

    return {
      background: [highlight, materialLayer, colorGradient].join(", "),
    };
  }

  // Single color logic (original)
  const color = filament.colorHex;
  const baseShade = `radial-gradient(circle at 36% 26%, rgba(255,255,255,0.35), transparent 48%), linear-gradient(145deg, ${color} 0%, rgba(0,0,0,0.22) 115%)`;

  // Subtle material-specific overlays for a tactile feel
  const plaSheen =
    "linear-gradient(110deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 32%, rgba(0,0,0,0.08) 70%)";
  const petgRings =
    "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.10) 0 26%, rgba(255,255,255,0) 40%), radial-gradient(circle at 60% 58%, rgba(0,0,0,0.12) 0 24%, rgba(0,0,0,0) 42%)";
  const absTexture =
    "linear-gradient(125deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.0) 24%, rgba(0,0,0,0.08) 44%, rgba(0,0,0,0) 60%)";

  let materialLayer = plaSheen;
  if (mat.includes("petg")) materialLayer = petgRings;
  else if (mat.includes("abs")) materialLayer = absTexture;

  return {
    background: [materialLayer, baseShade].join(", "),
  };
});

const copyHex = async () => {
  await navigator.clipboard.writeText(props.filament.colorHex);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1200);
};
</script>

<style scoped>
.card-container {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  transform: translateZ(0);
  contain: layout style paint;
}

.card-container:hover {
  transform: translate3d(0, -4px, 0);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
}

.pin-btn {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--border), 0.7);
  background: rgba(var(--surface-alt), 0.8);
  color: rgb(var(--text));
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
}
.pin-btn:hover {
  border-color: rgba(var(--accent-2), 0.7);
  background: rgba(var(--accent-2), 0.12);
  transform: scale(1.05) translateZ(0);
}
.pin-btn[aria-pressed="true"] {
  border-color: rgba(var(--accent), 0.7);
  background: rgba(var(--accent), 0.12);
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
