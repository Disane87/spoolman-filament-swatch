<template>
  <div class="mx-auto flex h-screen flex-col overflow-hidden">
    <!-- Main Content Wrapper (gets blurred when panels are open) -->
    <div class="main-content-wrapper" :class="{ blurred: paletteOpen || selectedFilament }">
      <!-- Top Navigation Bar -->
      <nav class="sticky top-0 z-40 bg-[rgb(var(--background))] flex items-center justify-between gap-4 px-3 sm:px-6 py-2 sm:py-4 pb-3 flex-shrink-0 border-b">
        <div class="flex items-center gap-3">
          <h1 class="text-lg sm:text-xl font-semibold">{{ t("app.title") }}</h1>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- View Toggle -->
          <div class="flex gap-1 border rounded-lg bg-[rgb(var(--surface))] overflow-hidden">
            <Button
              :variant="$route.path.includes('/swatch') ? 'default' : 'ghost'"
              size="sm"
              @click="$router.push('/app/swatch')"
              class="h-9 px-3 rounded-none"
            >
              <Icon icon="lucide:palette" class="w-4 h-4 sm:mr-1" />
              <span class="hidden sm:inline">Filamente</span>
            </Button>
            <Button
              :variant="$route.path.includes('/projects') ? 'default' : 'ghost'"
              size="sm"
              @click="$router.push('/app/projects')"
              class="h-9 px-3 relative rounded-none"
            >
              <Icon icon="lucide:folder" class="w-4 h-4 sm:mr-1" />
              <span class="hidden sm:inline">Projekte</span>
              <span class="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30">
                BETA
              </span>
              <span
                v-if="projectsCount > 0"
                class="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold"
              >
                {{ projectsCount }}
              </span>
            </Button>
          </div>
          
          <Button
            v-if="$route.path.includes('/projects') && $route.name === 'projects'"
            size="sm"
            variant="outline"
            @click="showImportDialog = true"
            class="h-9 px-2 sm:px-3"
          >
            <Icon icon="lucide:plus" class="w-4 h-4 sm:mr-1" />
            <span class="hidden sm:inline">Import</span>
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            @click="openUrlDialog"
            class="h-9 px-2 sm:px-3"
            :aria-label="t('info.spoolmanUrl')"
          >
            <Icon icon="lucide:server" class="w-4 h-4" />
            <span class="hidden sm:inline text-xs font-mono ml-2 truncate max-w-[120px] lg:max-w-[200px]">{{ spoolmanUrl }}</span>
          </Button>
          
          <LocaleSwitch />
          <ThemeSwitch />
          
          <Button
            size="sm"
            variant="outline"
            @click="paletteOpen = true"
            class="relative h-9 w-9 p-0"
            :aria-label="t('actions.openPalette')"
          >
            <Icon icon="lucide:palette" class="w-4 h-4" />
            <span
              v-if="pinnedItems.length > 0"
              class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-lg border-2 border-[rgb(var(--background))]"
            >
              {{ pinnedItems.length }}
            </span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            @click="openChangelog"
            class="h-9 w-9 p-0"
            :aria-label="'What\'s New'"
          >
            <Icon icon="lucide:sparkles" class="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <!-- Router Outlet -->
      <div class="router-content px-3 sm:px-6 py-1 sm:py-2">
        <RouterView class="flex-1 min-h-0" />
      </div>
    </div>

    <!-- Palette Drawer -->
    <div class="palette-drawer" :class="{ open: paletteOpen }">
      <div class="palette-overlay" @click="paletteOpen = false" />
      <div class="palette-panel">
        <div class="palette-panel__header">
          <div>
            <p class="label text-[10px] sm:text-xs">{{ t('info.palette') }}</p>
            <p class="mono text-sm sm:text-base text-[rgb(var(--text))]">{{ pinnedItems.length }} {{ pinnedItems.length === 1 ? t('info.item') : t('info.items') }}</p>
          </div>
          <div class="flex gap-1 sm:gap-2">
            <Button v-if="pinnedItems.length" size="sm" variant="ghost" @click="clearPalette" class="h-9 px-2 sm:px-3">
              <Icon icon="lucide:trash-2" class="w-4 h-4 sm:mr-1" />
              <span class="hidden sm:inline">{{ t('actions.clearPalette') }}</span>
            </Button>
            <Button size="sm" variant="secondary" @click="paletteOpen = false" class="h-9 w-9 p-0">
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

    <!-- URL Dialog -->
    <Dialog v-model:open="urlDialogOpen">
      <DialogContent class="sm:max-w-md" :onInteractOutside="(e) => { if (!hasUrl) e.preventDefault(); }">
        <DialogHeader>
          <DialogTitle>{{ t("dialog.spoolmanUrlTitle") }}</DialogTitle>
          <DialogDescription>
            {{ hasUrl ? t("dialog.spoolmanUrlDescription", { defaultUrl: DEFAULT_SPOOLMAN_URL || 'http://localhost:7912', domain: currentDomain }) : t("dialog.spoolmanUrlRequired") }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="mt-4 rounded-lg border border-yellow-500/40 bg-yellow-400/15 p-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-yellow-700">{{ t("dialog.corsInfoTitle") }}</p>
          <p class="mt-2 text-xs text-yellow-700">{{ t("dialog.corsInfoDescription") }}</p>
          <div class="mt-3 rounded bg-black/20 p-2">
            <code class="font-mono text-xs text-yellow-700">{{ t("dialog.corsConfigLabel", { domain: currentDomain }) }}</code>
          </div>
          <p class="mt-2 text-xs text-yellow-700">
            <span v-for="(part, idx) in parseMarkdownLink(t('dialog.corsRestartRequired'))" :key="idx">
              <a v-if="part.isLink" :href="part.url" target="_blank" class="underline hover:text-yellow-600">{{ part.text }}</a>
              <span v-else>{{ part.text }}</span>
            </span>
          </p>
        </div>
        
        <form class="mt-2 flex flex-col gap-4" @submit.prevent="applySpoolmanUrl">
          <label class="flex flex-col gap-2 text-sm font-semibold text-[rgb(var(--text))]">
            <span class="text-xs uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
              {{ t("info.spoolmanUrl") }}
            </span>
            <Input
              v-model="spoolmanUrlInput"
              type="text"
              name="spoolman-url"
              placeholder="https://spoolman.your.tld"
              required
            />
          </label>
          <div class="flex flex-wrap justify-between gap-3">
            <Button v-if="hasUrl" type="button" variant="ghost" size="sm" @click="resetUrlToDefault">
              {{ t("actions.reset") }}
            </Button>
            <div v-else></div>
            <div class="flex gap-3">
              <Button v-if="hasUrl" type="button" variant="secondary" size="sm" @click="urlDialogOpen = false">
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

    <!-- Changelog Modal -->
    <ChangelogModal ref="changelogModal" />

    <!-- Project Import Dialog -->
    <ProjectImportDialog
      v-model:open="showImportDialog"
      @project-created="handleProjectCreated"
    />

    <!-- Detail Panel Overlay -->
    <div v-if="selectedFilament" class="detail-overlay" @click="selectedFilament = null" />

    <!-- Detail Panel -->
    <FilamentDetailPanel
      :filament="selectedFilament"
      :all-filaments="allFilaments"
      :labels="detailLabels"
      @close="selectedFilament = null"
      @selectFilament="selectFilament"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, provide, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, RouterView } from "vue-router";
import { useSeo } from "../composables/useSeo";
import { useSpoolmanUrl } from "../composables/useSpoolmanUrl";
import { getProjects } from "../api/projects";
import { useFilaments } from "../composables/useFilaments";
import LocaleSwitch from "../components/LocaleSwitch.vue";
import ThemeSwitch from "../components/ThemeSwitch.vue";
import ChangelogModal from "../components/ChangelogModal.vue";
import ProjectImportDialog from "../components/ProjectImportDialog.vue";
import FilamentDetailPanel from "../components/FilamentDetailPanel.vue";
import type { FilamentCard } from "../composables/useFilaments";
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
import { DEFAULT_SPOOLMAN_URL } from "../api/spoolman";

const { t, locale } = useI18n();
const router = useRouter();
const { refresh, allFilaments } = useFilaments();

// Shared state for child views
const viewMode = ref<"carousel" | "board">("board");
const pinnedIds = ref(new Set<string>());
const paletteOpen = ref(false);
const selectedFilament = ref<FilamentCard | null>(null);
const changelogModal = ref<InstanceType<typeof ChangelogModal> | null>(null);
const showImportDialog = ref(false);

const projectsCount = computed(() => getProjects().length);

// Define functions before providing them
const selectFilament = (filament: FilamentCard) => {
  selectedFilament.value = filament;
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

// Provide state to child views
provide('viewMode', viewMode);
provide('pinnedIds', pinnedIds);
provide('selectedFilament', selectedFilament);
provide('togglePin', togglePin);
provide('selectFilament', selectFilament);

// Detail panel labels
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
  spools: t("detail.spools"),
  archived: t("detail.archived"),
  remaining: t("detail.remaining"),
  used: t("detail.used"),
  colorHarmonies: t("detail.colorHarmonies"),
  currentColor: t("detail.currentColor"),
  complementary: t("detail.complementary"),
  similar: t("detail.similar"),
}));

const openChangelog = () => {
  changelogModal.value?.open();
};

const handleProjectCreated = (projectId: string) => {
  showImportDialog.value = false;
  router.push(`/app/projects/${projectId}`);
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

const { spoolmanUrl, setSpoolmanUrl, resetSpoolmanUrl, hasUrl } = useSpoolmanUrl();
const urlDialogOpen = ref(false);
const spoolmanUrlInput = ref(spoolmanUrl.value);

const currentDomain = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  }
  return 'spoolswatch.disane.dev';
});

const openUrlDialog = () => {
  spoolmanUrlInput.value = spoolmanUrl.value;
  urlDialogOpen.value = true;
};

const applySpoolmanUrl = () => {
  if (!spoolmanUrlInput.value.trim()) {
    return;
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

const parseMarkdownLink = (text: string): Array<{ text: string; url?: string; isLink: boolean }> => {
  const parts: Array<{ text: string; url?: string; isLink: boolean }> = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isLink: false });
    }
    parts.push({ text: match[1], url: match[2], isLink: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isLink: false });
  }

  return parts.length ? parts : [{ text, isLink: false }];
};

useSeo(
  () => t("seo.title"),
  () => t("seo.description"),
  () => locale.value,
);

onMounted(() => {
  if (!hasUrl.value) {
    urlDialogOpen.value = true;
  } else {
    refresh();
  }
  
  // Redirect to swatch if on /app root
  if (router.currentRoute.value.path === '/app') {
    router.replace('/app/swatch');
  }
});
</script>

