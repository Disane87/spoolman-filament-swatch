<template>
  <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
    <header class="flex flex-col gap-6">
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
          <LocaleSwitch />
          <ThemeSwitch />
        </div>
      </div>

      <div class="control-grid">
        <div class="control-card glass">
          <div class="control-top">
            <div class="control-url">
              <span class="label">{{ t("info.spoolmanUrl") }}</span>
              <span class="mono">{{ spoolmanUrl }}</span>
              <Button size="sm" variant="ghost" @click="openUrlDialog">
                {{ t("actions.editSpoolmanUrl") }}
              </Button>
            </div>
            <Button variant="secondary" size="sm" @click="refresh">
              {{ t("actions.refresh") }}
            </Button>
          </div>
          <FiltersBar
            class="mt-4"
            :filters="filters"
            :vendor-options="vendorOptions"
            :material-options="materialOptions"
            :color-options="colorOptions"
            :search-placeholder="t('search.placeholder')"
            :labels="{
              vendor: t('filters.vendor'),
              material: t('filters.material'),
              all: t('filters.all'),
              onlySpoolman: t('filters.onlySpoolman'),
              onlyExternal: t('filters.onlyExternal'),
              color: t('filters.color'),
              source: t('filters.source'),
              sort: t('filters.sort'),
              sortAsc: t('filters.sortAsc'),
              sortDesc: t('filters.sortDesc'),
              sortNameAsc: t('filters.sortNameAsc'),
              sortLuminanceAsc: t('filters.sortLuminanceAsc'),
              sortLightnessAsc: t('filters.sortLightnessAsc')
            }"
          />
        </div>

        <div class="summary-card glass">
          <div class="summary-row">
            <div class="summary-left">
              <span class="label">{{ t("info.sourcing") }}</span>
              <span class="mono">{{ countLabel }}</span>
            </div>
            <div class="view-toggle">
              <Button
                :variant="viewMode === 'carousel' ? 'primary' : 'ghost'"
                size="sm"
                @click="viewMode = 'carousel'"
              >
                {{ t('actions.viewCarousel') }}
              </Button>
              <Button
                :variant="viewMode === 'board' ? 'primary' : 'ghost'"
                size="sm"
                @click="viewMode = 'board'"
              >
                {{ t('actions.viewBoard') }}
              </Button>
            </div>
          </div>

          <div class="summary-row">
            <div class="summary-left">
              <span class="label">{{ t('info.palette') }}</span>
              <span class="mono">{{ pinnedItems.length }}</span>
            </div>
            <Button
              v-if="pinnedIds.size"
              size="sm"
              variant="ghost"
              @click="clearPalette"
            >
              {{ t('actions.clearPalette') }}
            </Button>
          </div>

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
          <div v-else class="summary-empty">
            {{ t('info.paletteEmpty') }}
          </div>
        </div>
      </div>
    </header>

    <section class="flex flex-1 flex-col gap-6">
      <div v-if="loading" class="text-sm text-[rgb(var(--text-muted))]">
        {{ t("status.loading") }}
      </div>
      <div v-else-if="error" class="text-sm text-red-400">
        {{ t("status.error") }} ({{ error }})
      </div>
      <div v-else-if="filtered.length === 0" class="text-sm text-[rgb(var(--text-muted))]">
        {{ t("status.empty") }}
      </div>
      <div v-else class="flex flex-col gap-4">
        <FilamentCarousel
          v-if="viewMode === 'carousel'"
          :items="filtered"
          :count-label="countLabel"
          :labels="cardLabels"
          @togglePin="togglePin"
          :pinned-ids="pinnedIds"
        />

        <FilamentBoard
          v-else
          :filaments="filtered"
          :pinned-ids="pinnedIds"
          :labels="boardLabels"
          :title="countLabel"
          @togglePin="togglePin"
        />
      </div>
    </section>

    <Dialog v-model:open="urlDialogOpen">
      <div class="flex flex-col gap-3">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--text-muted))]">
          {{ t("info.spoolman") }}
        </p>
        <h3 class="text-2xl font-semibold">
          {{ t("dialog.spoolmanUrlTitle") }}
        </h3>
        <p class="text-sm text-[rgb(var(--text-muted))]">
          {{ t("dialog.spoolmanUrlDescription", { defaultUrl: DEFAULT_SPOOLMAN_URL }) }}
        </p>
        <form class="mt-2 flex flex-col gap-4" @submit.prevent>
          <label class="flex flex-col gap-2 text-sm font-semibold text-[rgb(var(--text))]">
            <span class="text-xs uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
              {{ t("info.spoolmanUrl") }}
            </span>
            <Input
              v-model="spoolmanUrlInput"
              type="text"
              name="spoolman-url"
              placeholder="http://localhost:7912"
            />
          </label>
          <div class="flex flex-wrap justify-between gap-3">
            <Button type="button" variant="ghost" size="sm" @click="resetUrlToDefault">
              {{ t("actions.reset") }}
            </Button>
            <div class="flex gap-3">
              <Button type="button" variant="secondary" size="sm" @click="urlDialogOpen = false">
                {{ t("actions.cancel") }}
              </Button>
              <Button type="button" size="sm" @click="applySpoolmanUrl">
                {{ t("actions.save") }}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
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
import LocaleSwitch from "./components/LocaleSwitch.vue";
import ThemeSwitch from "./components/ThemeSwitch.vue";
import Button from "./components/ui/Button.vue";
import Dialog from "./components/ui/Dialog.vue";
import Input from "./components/ui/Input.vue";
import { DEFAULT_SPOOLMAN_URL } from "./api/spoolman";

const { t, locale } = useI18n();
const {
  filtered,
  filters,
  vendorOptions,
  materialOptions,
  colorOptions,
  loading,
  error,
  refresh,
  allFilaments,
} = useFilaments();

const viewMode = ref<"carousel" | "board">("carousel");
const pinnedIds = ref(new Set<string>());

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

const { spoolmanUrl, setSpoolmanUrl, resetSpoolmanUrl } = useSpoolmanUrl();
const urlDialogOpen = ref(false);
const spoolmanUrlInput = ref(spoolmanUrl.value);

const openUrlDialog = () => {
  spoolmanUrlInput.value = spoolmanUrl.value;
  urlDialogOpen.value = true;
};

const applySpoolmanUrl = () => {
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
  refresh();
});
</script>

<style scoped>
.palette {
  border: 1px solid rgba(var(--border), 0.6);
  border-radius: 18px;
  padding: 12px;
  background: rgba(var(--surface), 0.75);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.palette-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

.palette-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid rgba(var(--border), 0.6);
  border-radius: 12px;
  padding: 10px;
  color: #0f172a;
  background-blend-mode: multiply;
  box-shadow: 0 12px 20px -18px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.palette-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 26px -18px rgba(0, 0, 0, 0.5);
}

.palette-chip .mono {
  color: #0f172a;
  font-size: 12px;
}
</style>
