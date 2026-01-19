<template>
  <div class="flex flex-1 flex-col gap-3 sm:gap-6 min-h-0">
    <!-- Header Section -->
    <header class="hidden md:flex flex-col gap-2 flex-shrink-0 pt-4">
      <p class="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[rgb(var(--text-muted))]">
        {{ t("app.subtitle") }}
      </p>
      <p class="max-w-2xl text-sm text-[rgb(var(--text-muted))]">
        {{ t("app.tagline") }}
      </p>
    </header>

    <div class="control-grid hidden md:flex">
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

    <section class="flex flex-1 flex-col gap-3 sm:gap-6 min-h-0">
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
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { useFilaments } from "../composables/useFilaments";
import FiltersBar from "../components/FiltersBar.vue";
import FilamentCarousel from "../components/FilamentCarousel.vue";
import FilamentBoard from "../components/FilamentBoard.vue";
import type { FilamentCard } from "../composables/useFilaments";
import type { Ref } from "vue";

const { t } = useI18n();
const {
  filtered,
  filters,
  vendorOptions,
  materialOptions,
  colorOptions,
  locationOptions,
  loading,
  error,
  allFilaments,
} = useFilaments();

// Inject shared state from MainApp
const viewMode = inject<Ref<"carousel" | "board">>("viewMode");
const pinnedIds = inject<Ref<Set<string>>>("pinnedIds");
const selectedFilament = inject<Ref<FilamentCard | null>>("selectedFilament");

const togglePin = inject<(filament: { id: string }) => void>("togglePin");
const selectFilament = inject<(filament: FilamentCard) => void>("selectFilament");

// Debug logging
console.log('FilamentsView mounted', {
  viewMode: viewMode?.value,
  pinnedIds: pinnedIds?.value,
  selectedFilament: selectedFilament?.value,
  filtered: filtered.value.length,
  loading: loading.value,
  error: error.value
});

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
  sourceSpoolman: t("card.sourceSpoolman"),
  sourceExternal: t("card.sourceExternal"),
  pin: t("actions.pin"),
  unpin: t("actions.unpin"),
}));

const boardLabels = computed(() => ({
  pin: t("actions.pin"),
  unpin: t("actions.unpin"),
  sourceSpoolman: t("card.sourceSpoolman"),
  sourceExternal: t("card.sourceExternal"),
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
</script>
