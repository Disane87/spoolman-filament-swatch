<template>
  <div class="mx-auto flex min-h-screen h-screen max-w-6xl flex-col gap-2 px-6 py-10 overflow-hidden">
    <header class="flex flex-col gap-6 flex-shrink-0">
      <div class="flex flex-wrap items-center justify-between gap-6">
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[rgb(var(--text-muted))]">
            {{ t("app.subtitle") }}
          </p>
          <h1 class="text-4xl font-semibold md:text-5xl">
            {{ t("app.title") }}
          </h1>
          <p class="max-w-2xl text-base text-[rgb(var(--text-muted))]">
            {{ t("app.tagline") }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-3">
          <div class="flex items-center gap-2">
            <LocaleSwitch />
            <ThemeSwitch />
            <Button
              size="sm"
              variant="ghost"
              @click="paletteOpen = true"
              class="relative"
              :aria-label="t('actions.openPalette')"
            >
              <Icon icon="lucide:menu" class="w-5 h-5" />
              <span
                v-if="pinnedItems.length"
                class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-[10px] font-bold text-white"
              >
                {{ pinnedItems.length }}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div class="control-grid">
        <div class="control-card glass">
          <FiltersBar
            :filters="filters"
            :vendor-options="vendorOptions"
            :material-options="materialOptions"
            :color-options="colorOptions"
            :location-options="locationOptions"
            :search-placeholder="t('search.placeholder')"
            :labels="{
              vendor: t('filters.vendor'),
              material: t('filters.material'),
              location: t('filters.location'),
              all: t('filters.all'),
              onlySpoolman: t('filters.onlySpoolman'),
              onlyExternal: t('filters.onlyExternal'),
              color: t('filters.color'),
              colorType: t('filters.colorType'),
              singleColor: t('filters.singleColor'),
              multiColor: t('filters.multiColor'),
              source: t('filters.source'),
              sort: t('filters.sort'),
              sortAsc: t('filters.sortAsc'),
              sortDesc: t('filters.sortDesc'),
              sortNameAsc: t('filters.sortNameAsc'),
              sortVendorAsc: t('filters.sortVendorAsc'),
              sortMaterialAsc: t('filters.sortMaterialAsc'),
              sortSourceAsc: t('filters.sortSourceAsc'),
              sortHueAsc: t('filters.sortHueAsc'),
              sortLuminanceAsc: t('filters.sortLuminanceAsc'),
              sortLightnessAsc: t('filters.sortLightnessAsc')
            }"
          />
        </div>
      </div>
    </header>

    <section class="flex flex-1 flex-col gap-6 min-h-0">
      <div v-if="loading" class="text-sm text-[rgb(var(--text-muted))]">
        {{ t("status.loading") }}
      </div>
      <div v-else-if="error" class="text-sm text-red-400">
        {{ t("status.error") }} ({{ error }})
      </div>
      <div v-else-if="filtered.length === 0" class="text-sm text-[rgb(var(--text-muted))]">
        {{ t("status.empty") }}
      </div>
      <div v-else class="flex flex-col flex-1 gap-4 min-h-0">
        <FilamentCarousel
          v-if="viewMode === 'carousel'"
          :items="filtered"
          :count-label="countLabel"
          :labels="cardLabels"
          :filters="filters"
          :sort-labels="sortLabels"
          :view-mode="viewMode"
          @togglePin="togglePin"
          @selectFilament="selectFilament"
          @changeView="viewMode = $event"
          :pinned-ids="pinnedIds"
        />

        <FilamentBoard
          v-else
          :filaments="filtered"
          :pinned-ids="pinnedIds"
          :labels="boardLabels"
          :filters="filters"
          :sort-labels="sortLabels"
          :view-mode="viewMode"
          @changeView="viewMode = $event"
          :title="countLabel"
          @togglePin="togglePin"
          @selectFilament="selectFilament"
        />
      </div>
    </section>

    <!-- Detail Panel -->
    <FilamentDetailPanel
      :filament="selectedFilament"
      :all-filaments="allFilaments"
      :labels="detailLabels"
      @close="selectedFilament = null"
      @selectFilament="selectFilament"
    />

    <Dialog v-model:open="urlDialogOpen">
      <DialogContent class="sm:max-w-md" :onInteractOutside="(e) => { if (!hasUrl.value) e.preventDefault(); }">
        <DialogHeader>
          <DialogTitle>{{ t("dialog.spoolmanUrlTitle") }}</DialogTitle>
          <DialogDescription>
            {{ hasUrl.value ? t("dialog.spoolmanUrlDescription", { defaultUrl: DEFAULT_SPOOLMAN_URL || 'http://localhost:7912' }) : t("dialog.spoolmanUrlRequired") }}
          </DialogDescription>
        </DialogHeader>
        <form class="mt-2 flex flex-col gap-4" @submit.prevent="applySpoolmanUrl">
          <label class="flex flex-col gap-2 text-sm font-semibold text-[rgb(var(--text))]">
            <span class="text-xs uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
              {{ t("info.spoolmanUrl") }}
            </span>
            <Input
              v-model="spoolmanUrlInput"
              type="text"
              name="spoolman-url"
              placeholder="http://localhost:7912"
              required
            />
          </label>
          <div class="flex flex-wrap justify-between gap-3">
            <Button v-if="hasUrl.value" type="button" variant="ghost" size="sm" @click="resetUrlToDefault">
              {{ t("actions.reset") }}
            </Button>
            <div v-else></div>
            <div class="flex gap-3">
              <Button v-if="hasUrl.value" type="button" variant="secondary" size="sm" @click="urlDialogOpen = false">
                {{ t("actions.cancel") }}
              </Button>
              <Button type="submit" size="sm">
                {{ t("actions.save") }}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <div class="palette-drawer" :class="{ open: paletteOpen }">
      <div class="palette-overlay" @click="paletteOpen = false" />
      <div class="palette-panel">
        <div class="palette-panel__header">
          <div>
            <p class="label">{{ t('info.palette') }}</p>
            <p class="mono text-[rgb(var(--text))]">{{ pinnedItems.length }} {{ pinnedItems.length === 1 ? t('info.item') : t('info.items') }}</p>
          </div>
          <div class="flex gap-2">
            <Button v-if="pinnedItems.length" size="sm" variant="ghost" @click="clearPalette">
              <Icon icon="lucide:trash-2" class="w-4 h-4 mr-1" />
              {{ t('actions.clearPalette') }}
            </Button>
            <Button size="sm" variant="secondary" @click="paletteOpen = false">
              <Icon icon="lucide:x" class="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div class="palette-panel__body">
          <div v-if="pinnedItems.length" class="summary-palette">
            <button
              v-for="item in pinnedItems"
              :key="item.id"
              class="summary-chip"
              :style="{ background: item.colorHex }"
              @click="scrollToPinned(item.id)"
            >
              <span>{{ item.name }}</span>
              <span class="mono">{{ item.colorHex.toUpperCase() }}</span>
            </button>
          </div>
          <div v-else class="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <p class="text-sm text-[rgb(var(--text-muted))]">
              {{ t('info.paletteEmpty') }}
            </p>
            <p class="text-xs text-[rgb(var(--text-muted))]">
              {{ t('info.paletteHint') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <footer class="mt-auto pt-8 pb-4 text-center text-sm text-[rgb(var(--text-muted))]">
      <div class="flex items-center justify-center gap-2">
        <span>{{ t("info.spoolmanUrl") }}:</span>
        <span class="mono font-semibold text-[rgb(var(--text))]">{{ spoolmanUrl }}</span>
        <Button size="sm" variant="ghost" @click="openUrlDialog" class="h-7 px-2">
          <Icon icon="lucide:edit" class="w-3 h-3" />
        </Button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useFilaments } from "./composables/useFilaments";
import { useSeo } from "./composables/useSeo";
import { useSpoolmanUrl } from "./composables/useSpoolmanUrl";
import FiltersBar from "./components/FiltersBar.vue";
import FilamentCarousel from "./components/FilamentCarousel.vue";
import FilamentBoard from "./components/FilamentBoard.vue";
import FilamentDetailPanel from "./components/FilamentDetailPanel.vue";
import LocaleSwitch from "./components/LocaleSwitch.vue";
import ThemeSwitch from "./components/ThemeSwitch.vue";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { DEFAULT_SPOOLMAN_URL } from "./api/spoolman";
import type { FilamentCard } from "./composables/useFilaments";
import { watch } from "vue";

const { t, locale } = useI18n();
const {
  filtered,
  filters,
  vendorOptions,
  materialOptions,
  colorOptions,
  locationOptions,
  loading,
  error,
  refresh,
  allFilaments,
} = useFilaments();

const viewMode = ref<"carousel" | "board">("board");
const pinnedIds = ref(new Set<string>());
const paletteOpen = ref(false)
const selectedFilament = ref<FilamentCard | null>(null);

const selectFilament = (filament: FilamentCard) => {
  selectedFilament.value = filament;
};

const countLabel = computed(() =>
  t("info.count", { count: filtered.value.length }),
);

const cardLabels = computed(() => ({
  vendor: t("card.vendor"),
  material: t("card.material"),
  spool: t("card.spool"),
  weight: t("card.weight"),
  copy: t("actions.copy"),
  copied: t("actions.copied"),
  sourceSpoolman: t("info.spoolman"),
  sourceExternal: t("info.external"),
  pin: t("actions.pin"),
  unpin: t("actions.unpin"),
}));

const boardLabels = computed(() => ({
  pin: t("actions.pin"),
  unpin: t("actions.unpin"),
  sourceSpoolman: t("info.spoolman"),
  sourceExternal: t("info.external"),
  legend: t("info.legend"),
}));

const sortLabels = computed(() => ({
  name: t('filters.sortNameAsc'),
  vendor: t('filters.sortVendorAsc'),
  material: t('filters.sortMaterialAsc'),
  source: t('filters.sortSourceAsc'),
  hue: t('filters.sortHueAsc'),
  luminance: t('filters.sortLuminanceAsc'),
  lightness: t('filters.sortLightnessAsc'),
}));

const detailLabels = computed(() => ({
  color: t("detail.color"),
  details: t("detail.details"),
  spoolId: t("detail.spoolId"),
  remainingWeight: t("detail.remainingWeight"),
  weight: t("detail.weight"),
  spoolWeight: t("detail.spoolWeight"),
  price: t("detail.price"),
  density: t("detail.density"),
  diameter: t("detail.diameter"),
  extruderTemp: t("detail.extruderTemp"),
  bedTemp: t("detail.bedTemp"),
  articleNumber: t("detail.articleNumber"),
  comment: t("detail.comment"),
  multiColorType: t("detail.multiColorType"),
  coaxial: t("detail.coaxial"),
  longitudinal: t("detail.longitudinal"),
  similarColors: t("detail.similarColors"),
  complementaryColors: t("detail.complementaryColors"),
}));

const { spoolmanUrl, setSpoolmanUrl, resetSpoolmanUrl, hasUrl } = useSpoolmanUrl();
const urlDialogOpen = ref(false);
const spoolmanUrlInput = ref(spoolmanUrl.value);

const openUrlDialog = () => {
  spoolmanUrlInput.value = spoolmanUrl.value;
  urlDialogOpen.value = true;
};

const applySpoolmanUrl = () => {
  if (!spoolmanUrlInput.value.trim()) {
    return; // Don't close if empty
  }
  setSpoolmanUrl(spoolmanUrlInput.value);
  urlDialogOpen.value = false;
  refresh();
};

const resetUrlToDefault = () => {
  resetSpoolmanUrl();
  spoolmanUrlInput.value = spoolmanUrl.value;
  urlDialogOpen.value = false;
  refresh();
};

const togglePin = (filament: { id: string }) => {
  const next = new Set(pinnedIds.value);
  if (next.has(filament.id)) {
    next.delete(filament.id);
  } else {
    next.add(filament.id);
  }
  pinnedIds.value = next;
};

const clearPalette = () => {
  pinnedIds.value = new Set();
};

const pinnedItems = computed(() => {
  const map = new Map(allFilaments.value.map((f) => [f.id, f]));
  return Array.from(pinnedIds.value)
    .map((id) => map.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
});

watch(
  pinnedItems,
  (items, prev) => {
    if (!items.length) {
      paletteOpen.value = false;
    } else if ((prev?.length ?? 0) === 0 && items.length > 0) {
      paletteOpen.value = true;
    }
  },
  { immediate: true },
);

const scrollToPinned = (id: string) => {
  const el = document.getElementById(`board-card-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }
};

useSeo(
  () => t("seo.title"),
  () => t("seo.description"),
  () => locale.value,
);

onMounted(() => {
  // Open URL dialog if no URL is set
  if (!hasUrl.value) {
    urlDialogOpen.value = true;
  } else {
    refresh();
  }
});
</script>
