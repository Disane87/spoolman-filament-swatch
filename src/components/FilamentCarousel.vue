<template>
  <div class="carousel-shell relative">
    <div class="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
      <div class="text-xs sm:text-sm text-[rgb(var(--text-muted))]">
        {{ countLabel }}
      </div>
      <div class="flex flex-wrap items-center gap-1">
        <!-- Sort Controls -->
        <Select v-model="filters.sortField" class="w-28 sm:w-36">
          <SelectTrigger variant="ghost" class="h-9 sm:h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{{ sortLabels.name }}</SelectItem>
            <SelectItem value="vendor">{{ sortLabels.vendor }}</SelectItem>
            <SelectItem value="material">{{ sortLabels.material }}</SelectItem>
            <SelectItem value="source">{{ sortLabels.source }}</SelectItem>
            <SelectItem value="hue">{{ sortLabels.hue }}</SelectItem>
            <SelectItem value="luminance">{{ sortLabels.luminance }}</SelectItem>
            <SelectItem value="lightness">{{ sortLabels.lightness }}</SelectItem>
          </SelectContent>
        </Select>
        <Toggle variant="ghost" size="sm" :pressed="filters.sortDir === 'asc'" @click="filters.sortDir = 'asc'" class="h-9 w-9 sm:h-10 sm:w-10">
          <Icon icon="lucide:arrow-up" class="w-4 h-4" />
        </Toggle>
        <Toggle variant="ghost" size="sm" :pressed="filters.sortDir === 'desc'" @click="filters.sortDir = 'desc'" class="h-9 w-9 sm:h-10 sm:w-10">
          <Icon icon="lucide:arrow-down" class="w-4 h-4" />
        </Toggle>
        
        <!-- View Toggle -->
        <div class="flex gap-1">
          <Button
            :variant="viewMode === 'carousel' ? 'default' : 'ghost'"
            size="sm"
            @click="$emit('changeView', 'carousel')"
            class="h-9 w-9 sm:h-10 sm:w-10 p-0"
          >
            <Icon icon="lucide:gallery-horizontal" class="w-4 h-4" />
          </Button>
          <Button
            :variant="viewMode === 'board' ? 'default' : 'ghost'"
            size="sm"
            @click="$emit('changeView', 'board')"
            class="h-9 w-9 sm:h-10 sm:w-10 p-0"
          >
            <Icon icon="lucide:layout-grid" class="w-4 h-4" />
          </Button>
        </div>

        <!-- Navigation -->
        <div class="flex gap-1">
          <Button size="sm" variant="ghost" @click="goPrev" class="h-9 w-9 sm:h-10 sm:w-10 p-0">
            <Icon icon="lucide:chevron-left" class="w-5 h-5" />
          </Button>
          <Button size="sm" variant="ghost" @click="goNext" class="h-9 w-9 sm:h-10 sm:w-10 p-0">
            <Icon icon="lucide:chevron-right" class="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>

    <div class="mb-3 sm:mb-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
      <button
        v-for="(swatch, idx) in swatches"
        :key="swatch.id"
        class="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-[rgba(var(--border),0.6)] shadow-sm transition hover:scale-[1.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-2),0.7)]"
        :style="{ background: swatch.hex }"
        :aria-label="swatch.name"
        @click="scrollTo(idx)"
      />
    </div>

    <div class="relative">
      <div
        ref="track"
        class="carousel-track flex snap-x snap-mandatory gap-4 sm:gap-6 overflow-x-auto overflow-y-visible pt-6 sm:pt-8 pb-8 sm:pb-12 pr-4 sm:pr-6"
      >
        <div
          v-for="(item, idx) in items"
          :key="item.id"
          class="carousel-card relative min-w-[240px] sm:min-w-[280px] max-w-[280px] sm:max-w-[320px] flex-1 snap-center transition-transform"
          :class="idx === currentIndex ? 'scale-[1.02]' : 'scale-100 opacity-90'"
          :data-index="idx"
          ref="cardRefs"
        >
          <FilamentCard
            v-if="visibleIndices.has(idx) || Math.abs(idx - currentIndex) < 5"
            :filament="item"
            :labels="labels"
            :pinned="isPinned(item.id)"
            @togglePin="$emit('togglePin', item)"
            @selectFilament="$emit('selectFilament', item)"
          />
        </div>
      </div>
      <div class="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[rgba(var(--bg),0.95)] to-transparent" />
      <div class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[rgba(var(--bg),0.95)] to-transparent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { FilamentCard as FilamentCardType } from "../composables/useFilaments";
import FilamentCard from "./FilamentCard.vue";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

const props = defineProps<{
  items: FilamentCardType[];
  countLabel: string;
  labels: {
    vendor: string;
    material: string;
    spool: string;
    weight: string;
    copy: string;
    copied: string;
    sourceSpoolman: string;
    sourceExternal: string;
  };
  sortLabels: {
    name: string;
    vendor: string;
    material: string;
    source: string;
    hue: string;
    luminance: string;
    lightness: string;
  };
  filters: {
    sortField: string;
    sortDir: string;
  };
  viewMode: string;
  pinnedIds?: Set<string>;
}>();

defineEmits<{
  (e: "togglePin", filament: FilamentCardType): void;
  (e: "selectFilament", filament: FilamentCardType): void;
  (e: "changeView", view: "carousel" | "board"): void;
}>();

const track = ref<HTMLDivElement | null>(null);
const cardRefs = ref<HTMLElement[]>([]);
const currentIndex = ref(0);
const rafId = ref<number | null>(null);
const wheelHandler = ref<((e: WheelEvent) => void) | null>(null);
const visibleIndices = ref(new Set<number>());
let observer: IntersectionObserver | null = null;

const swatches = computed(() =>
  props.items.map((item) => ({ id: item.id, hex: item.colorHex, name: item.colorName })),
);

const scrollTo = async (idx: number) => {
  currentIndex.value = Math.min(Math.max(idx, 0), props.items.length - 1);
  await nextTick();
  const el = cardRefs.value[currentIndex.value];
  if (el) {
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
};

const goPrev = () => scrollTo(currentIndex.value - 1);
const goNext = () => scrollTo(currentIndex.value + 1);

const isPinned = (id: string) => props.pinnedIds?.has(id) ?? false;

const applyTransforms = () => {
  const el = track.value;
  if (!el) return;
  const center = el.scrollLeft + el.clientWidth / 2;
  const maxOffset = el.clientWidth / 2;

  cardRefs.value.forEach((card) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const delta = cardCenter - center;
    const ratio = Math.max(-1, Math.min(1, delta / maxOffset));
    const tilt = -ratio * 18; // tilt cards away from center
    const lift = (1 - Math.abs(ratio)) * 10 + 4; // raise center cards a bit
    const depth = (1 - Math.abs(ratio)) * 46; // push center cards “closer”

    card.style.setProperty("--tilt", tilt.toFixed(2));
    card.style.setProperty("--lift", lift.toFixed(2));
    card.style.setProperty("--depth", depth.toFixed(2));
  });
};

const queueTransformUpdate = () => {
  if (rafId.value) cancelAnimationFrame(rafId.value);
  rafId.value = requestAnimationFrame(() => {
    applyTransforms();
    rafId.value = null;
  });
};

// keep track in sync when items change (e.g., filtering)
watch(
  () => props.items,
  () => {
    currentIndex.value = 0;
    // refresh refs after DOM update
    nextTick(() => {
      cardRefs.value = cardRefs.value.filter(Boolean);
      queueTransformUpdate();
    });
  },
);

onMounted(() => {
  const el = track.value;
  cardRefs.value = cardRefs.value.filter(Boolean);
  queueTransformUpdate();
  el?.addEventListener("scroll", queueTransformUpdate, { passive: true });
  window.addEventListener("resize", queueTransformUpdate, { passive: true });

  // Setup Intersection Observer
  if (el) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = parseInt(entry.target.getAttribute('data-index') || '-1');
          if (idx >= 0) {
            if (entry.isIntersecting) {
              visibleIndices.value.add(idx);
            } else {
              visibleIndices.value.delete(idx);
            }
          }
        });
      },
      {
        root: el,
        rootMargin: '400px',
        threshold: 0
      }
    );
    
    // Observe all cards
    cardRefs.value.forEach((card) => card && observer?.observe(card));
  }

  wheelHandler.value = (evt: WheelEvent) => {
    // Translate vertical wheel into horizontal scroll; ignore if horizontal drag already dominates
    if (!el) return;
    if (Math.abs(evt.deltaY) <= Math.abs(evt.deltaX)) return;
    evt.preventDefault();
    el.scrollBy({ left: evt.deltaY * 0.9, behavior: "auto" });
  };

  el?.addEventListener("wheel", wheelHandler.value, { passive: false });
});

onUnmounted(() => {
  if (rafId.value) cancelAnimationFrame(rafId.value);
  const el = track.value;
  el?.removeEventListener("scroll", queueTransformUpdate);
  if (wheelHandler.value) {
    el?.removeEventListener("wheel", wheelHandler.value);
  }
  window.removeEventListener("resize", queueTransformUpdate);
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.carousel-shell {
  padding: 0;
}

.carousel-track {
  perspective: 1100px;
  perspective-origin: 50% 42%;
  mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-card {
  transform: translateZ(calc(var(--depth, 0) * 1px)) rotateY(calc(var(--tilt, 0) * 1deg))
    translateY(calc(var(--lift, 0) * -1px));
  transform-style: preserve-3d;
  will-change: transform;
  transition: transform 220ms ease, opacity 180ms ease;
}

.carousel-card::before {
  content: "";
  position: absolute;
  inset: 12px;
  border-radius: 28px;
  pointer-events: none;
  background: radial-gradient(circle at 50% 8%, rgba(255, 255, 255, 0.14), transparent 46%);
  opacity: 0.8;
  transform: translateZ(-1px);
}
</style>
