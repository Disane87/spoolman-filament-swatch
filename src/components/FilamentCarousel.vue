<template>
  <div class="relative">
    <div class="mb-4 flex items-center justify-between">
      <div class="text-sm text-[rgb(var(--text-muted))]">
        {{ countLabel }}
      </div>
      <div class="flex items-center gap-2">
        <Button size="sm" variant="ghost" @click="goPrev">◀</Button>
        <Button size="sm" variant="ghost" @click="goNext">▶</Button>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <button
        v-for="(swatch, idx) in swatches"
        :key="swatch.id"
        class="h-9 w-9 rounded-full border border-[rgba(var(--border),0.6)] shadow-sm transition hover:scale-[1.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-2),0.7)]"
        :style="{ background: swatch.hex }"
        :aria-label="swatch.name"
        @click="scrollTo(idx)"
      />
    </div>

    <div class="relative">
      <div
        ref="track"
        class="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pr-6"
        style="scrollbar-width: thin;"
      >
        <div
          v-for="(item, idx) in items"
          :key="item.id"
          class="min-w-[280px] max-w-[320px] flex-1 snap-center transition-transform"
          :class="idx === currentIndex ? 'scale-[1.02]' : 'scale-100 opacity-90'"
          ref="cardRefs"
        >
          <FilamentCard
            :filament="item"
            :labels="labels"
            :pinned="isPinned(item.id)"
            @togglePin="$emit('togglePin', item)"
          />
        </div>
      </div>
      <div class="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[rgba(var(--bg),0.95)] to-transparent" />
      <div class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[rgba(var(--bg),0.95)] to-transparent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import type { FilamentCard as FilamentCardType } from "../composables/useFilaments";
import FilamentCard from "./FilamentCard.vue";
import Button from "./ui/Button.vue";

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
  pinnedIds?: Set<string>;
}>();

defineEmits<{ (e: "togglePin", filament: FilamentCardType): void }>();

const track = ref<HTMLDivElement | null>(null);
const cardRefs = ref<HTMLElement[]>([]);
const currentIndex = ref(0);

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

// keep track in sync when items change (e.g., filtering)
watch(
  () => props.items,
  () => {
    currentIndex.value = 0;
    // refresh refs after DOM update
    nextTick(() => {
      cardRefs.value = cardRefs.value.filter(Boolean);
    });
  },
);

onMounted(() => {
  cardRefs.value = cardRefs.value.filter(Boolean);
});
</script>
