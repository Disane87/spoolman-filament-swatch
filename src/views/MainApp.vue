<template>
  <div class="mx-auto flex h-screen flex-col overflow-hidden">
    <!-- Main Content Wrapper (gets blurred when panels are open) -->
    <div class="main-content-wrapper" :class="{ blurred: paletteOpen || selectedFilament }">
      <!-- Top Navigation Bar -->
      <nav class="sticky top-0 z-40 bg-[rgb(var(--background))] flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-6 py-2 sm:py-4 pb-3 flex-shrink-0 border-b">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 class="text-base sm:text-xl font-semibold truncate">{{ t("app.title") }}</h1>
        </div>
        
        <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <!-- View Toggle -->
          <div class="flex gap-0.5 sm:gap-1 border rounded-lg bg-[rgb(var(--surface))] overflow-hidden">
            <Button
              :variant="$route.path.includes('/swatch') ? 'default' : 'ghost'"
              size="sm"
              @click="$router.push('/app/swatch')"
              class="h-8 sm:h-9 px-2 sm:px-3 rounded-none"
            >
              <Icon icon="lucide:palette" class="w-4 h-4 sm:mr-1" />
              <span class="hidden md:inline">Filamente</span>
            </Button>
            <Button
              :variant="$route.path.includes('/projects') ? 'default' : 'ghost'"
              size="sm"
              @click="$router.push('/app/projects')"
              class="h-8 sm:h-9 px-2 sm:px-3 relative rounded-none"
            >
              <Icon icon="lucide:folder" class="w-4 h-4 sm:mr-1" />
              <span class="hidden md:inline">Projekte</span>
              <span class="hidden sm:inline ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30">
                BETA
              </span>
              <span
                v-if="projectsCount > 0"
                class="ml-1 sm:ml-1.5 flex h-4 sm:h-5 w-4 sm:w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] sm:text-[10px] font-bold"
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
            class="h-8 sm:h-9 px-2 sm:px-3"
          >
            <Icon icon="lucide:plus" class="w-4 h-4 sm:mr-1" />
            <span class="hidden md:inline">Import</span>
          </Button>
          
          <!-- Desktop: Server button -->
          <Button
            size="sm"
            variant="outline"
            @click="openUrlDialog"
            class="relative h-8 sm:h-9 w-8 sm:w-9 p-0 hidden sm:flex"
            :aria-label="t('info.spoolmanUrl')"
          >
            <Icon icon="lucide:server" class="w-4 h-4" />
            <!-- Connection status indicator -->
            <span
              v-if="isConnected"
              class="absolute -right-1 -top-1 flex h-3 w-3"
            >
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span
              v-else-if="hasUrl"
              class="absolute -right-1 -top-1 flex h-3 w-3"
            >
              <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </Button>
          
          <!-- Desktop: Show all buttons -->
          <div class="hidden sm:flex items-center gap-2">
            <LocaleSwitch />
            <ThemeSwitch />
          </div>
          
          <Button
            size="sm"
            variant="outline"
            @click="paletteOpen = true"
            class="relative h-8 sm:h-9 w-8 sm:w-9 p-0"
            :aria-label="t('actions.openPalette')"
          >
            <Icon icon="lucide:palette" class="w-4 h-4" />
            <span
              v-if="pinnedItems.length > 0"
              class="absolute -right-1 sm:-right-1.5 -top-1 sm:-top-1.5 flex h-4 sm:h-5 w-4 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[9px] sm:text-[11px] font-bold text-white shadow-lg border-2 border-[rgb(var(--background))]"
            >
              {{ pinnedItems.length }}
            </span>
          </Button>

          <!-- Desktop: Show changelog & sponsor -->
          <div class="hidden sm:flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              @click="openChangelog"
              class="h-9 w-9 p-0"
              :aria-label="'What\'s New'"
            >
              <Icon icon="lucide:sparkles" class="w-4 h-4" />
            </Button>

            <a
              href="https://github.com/sponsors/Disane87"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                variant="outline"
                class="h-9 px-2 sm:px-3 text-pink-500 hover:text-pink-400 hover:border-pink-400/50"
                :aria-label="t('actions.sponsor')"
              >
                <Icon icon="lucide:heart" class="w-4 h-4 sm:mr-1" />
                <span class="hidden md:inline">{{ t('actions.sponsor') }}</span>
              </Button>
            </a>
          </div>
          
          <!-- Mobile: Menu button for additional options -->
          <div class="sm:hidden relative">
            <Button
              size="sm"
              variant="outline"
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="h-8 w-8 p-0"
              :aria-label="'Menu'"
            >
              <Icon icon="lucide:more-vertical" class="w-4 h-4" />
            </Button>
            
            <!-- Mobile Menu Dropdown -->
            <Transition name="fade">
              <div v-if="mobileMenuOpen">
                <!-- Backdrop -->
                <div class="fixed inset-0 z-40" @click="mobileMenuOpen = false"></div>
                <!-- Menu -->
                <div 
                  class="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-[rgb(var(--surface))] shadow-lg z-50"
                >
                  <div class="p-2 flex flex-col gap-1">
                    <button 
                      class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--surface-alt))] rounded-md transition-colors"
                      @click="openUrlDialog(); mobileMenuOpen = false"
                    >
                      <div class="relative">
                        <Icon icon="lucide:server" class="w-4 h-4" />
                        <span
                          v-if="isConnected"
                          class="absolute -right-1 -top-1 flex h-2 w-2"
                        >
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span
                          v-else-if="hasUrl"
                          class="absolute -right-1 -top-1 flex h-2 w-2"
                        >
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      </div>
                      Spoolman Server
                    </button>
                    <hr class="border-border/50 my-1" />
                    <div class="flex items-center justify-between px-3 py-2">
                      <span class="text-xs text-[rgb(var(--text-muted))]">Theme</span>
                      <ThemeSwitch />
                    </div>
                    <div class="flex items-center justify-between px-3 py-2">
                      <span class="text-xs text-[rgb(var(--text-muted))]">Sprache</span>
                      <LocaleSwitch />
                    </div>
                    <hr class="border-border/50 my-1" />
                    <button 
                      class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--surface-alt))] rounded-md transition-colors"
                      @click="openChangelog(); mobileMenuOpen = false"
                    >
                      <Icon icon="lucide:sparkles" class="w-4 h-4" />
                      What's New
                    </button>
                    <a
                      href="https://github.com/sponsors/Disane87"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-2 px-3 py-2 text-sm text-pink-500 hover:bg-[rgb(var(--surface-alt))] rounded-md transition-colors"
                      @click="mobileMenuOpen = false"
                    >
                      <Icon icon="lucide:heart" class="w-4 h-4" />
                      {{ t('actions.sponsor') }}
                    </a>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </nav>

      <!-- Router Outlet -->
      <div class="router-content px-3 sm:px-6 py-1 sm:py-2">
        <RouterView class="flex-1 min-h-0" />
      </div>

      <!-- App Footer -->
      <footer class="flex-shrink-0 border-t border-border/40 bg-[rgb(var(--background))]/80 backdrop-blur-sm">
        <div class="px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[rgb(var(--text-muted))]">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5">
              <Icon icon="lucide:palette" class="w-3.5 h-3.5 text-blue-400" />
              <span class="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Spool Swatch</span>
            </span>
            <span class="hidden sm:inline">•</span>
            <span class="hidden sm:inline">{{ t('app.footer.tagline') }}</span>
          </div>
          <div class="flex items-center gap-4">
            <a 
              href="https://github.com/Disane87/spoolman-filament-swatch" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
            >
              <Icon icon="lucide:github" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">GitHub</span>
            </a>
            <a 
              href="https://github.com/Disane87/spoolman-filament-swatch/discussions" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Icon icon="lucide:message-circle" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">{{ t('app.footer.feedback') }}</span>
            </a>
            <a 
              href="https://github.com/Disane87/spoolman-filament-swatch/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <Icon icon="lucide:bug" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">{{ t('app.footer.bugs') }}</span>
            </a>
            <a 
              href="https://github.com/sponsors/Disane87" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors"
            >
              <Icon icon="lucide:heart" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Sponsor</span>
            </a>
            <span class="hidden sm:inline text-[rgb(var(--text-muted))]/50">•</span>
            <span class="flex items-center gap-1.5">
              <span>{{ t('app.footer.handCrafted') }}</span>
              <Icon icon="lucide:heart" class="w-3.5 h-3.5 text-red-400" />
              <span>{{ t('app.footer.by') }}</span>
              <a 
                href="https://disane.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                class="font-semibold hover:text-blue-400 hover:underline transition-colors"
              >
                Disane
              </a>
            </span>
          </div>
        </div>
      </footer>
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
            <code class="font-mono text-xs text-yellow-700 break-all">{{ t("dialog.corsConfigLabel", { domain: currentDomain }) }}</code>
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
          
          <!-- Connection Status -->
          <div v-if="connectionChecking" class="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
            <Icon icon="lucide:loader-2" class="w-4 h-4 animate-spin" />
            {{ t("dialog.connectionChecking") }}
          </div>
          <div v-else-if="connectionStatus?.healthy" class="rounded-lg border border-green-500/40 bg-green-400/15 p-3">
            <div class="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
              <Icon icon="lucide:check-circle" class="w-4 h-4" />
              {{ t("dialog.connectionSuccess") }}
            </div>
            <div v-if="connectionStatus.info" class="mt-2 text-xs text-green-700 dark:text-green-400">
              <span class="font-mono">Spoolman v{{ connectionStatus.info.version }}</span>
              <span v-if="connectionStatus.info.db_type" class="ml-2 opacity-75">({{ connectionStatus.info.db_type }})</span>
            </div>
          </div>
          <div v-else-if="connectionStatus && !connectionStatus.healthy" class="rounded-lg border border-red-500/40 bg-red-400/15 p-3">
            <div class="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
              <Icon icon="lucide:x-circle" class="w-4 h-4" />
              {{ t("dialog.connectionFailed") }}
            </div>
            <p class="mt-1 text-xs text-red-700 dark:text-red-400">
              {{ connectionStatus.error }}
            </p>
            <p class="mt-2 text-xs text-red-700 dark:text-red-400 opacity-75">
              {{ t("dialog.connectionFailedHint") }}
            </p>
          </div>
          
          <div class="flex flex-wrap justify-between gap-3">
            <Button v-if="hasUrl" type="button" variant="ghost" size="sm" @click="resetUrlToDefault">
              {{ t("actions.reset") }}
            </Button>
            <div v-else></div>
            <div class="flex gap-3">
              <Button v-if="hasUrl" type="button" variant="secondary" size="sm" @click="urlDialogOpen = false">
                {{ t("actions.cancel") }}
              </Button>
              <Button type="submit" size="sm" :disabled="connectionChecking">
                <Icon v-if="connectionChecking" icon="lucide:loader-2" class="w-4 h-4 animate-spin mr-2" />
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
import { FilamentDetailPanel } from "@/components/filament-detail";
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
import { DEFAULT_SPOOLMAN_URL, checkSpoolmanConnection, type SpoolmanInfo } from "../api/spoolman";

const { t, locale } = useI18n();
const router = useRouter();
const { refresh, allFilaments } = useFilaments();

// Shared state for child views
const viewMode = ref<"carousel" | "board">("board");
const pinnedIds = ref(new Set<string>());
const paletteOpen = ref(false);
const mobileMenuOpen = ref(false);
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
const connectionChecking = ref(false);
const connectionStatus = ref<{ healthy: boolean; info?: SpoolmanInfo; error?: string } | null>(null);

const isConnected = computed(() => connectionStatus.value?.healthy === true);

const currentDomain = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  }
  return 'spoolswatch.disane.dev';
});

const openUrlDialog = async () => {
  spoolmanUrlInput.value = spoolmanUrl.value;
  connectionStatus.value = null;
  urlDialogOpen.value = true;
  
  // Check current connection if URL exists
  if (spoolmanUrl.value.trim()) {
    await checkConnection(spoolmanUrl.value);
  }
};

const checkConnection = async (url: string) => {
  if (!url.trim()) {
    connectionStatus.value = null;
    return;
  }
  connectionChecking.value = true;
  connectionStatus.value = null;
  try {
    connectionStatus.value = await checkSpoolmanConnection(url);
  } catch (err) {
    connectionStatus.value = { healthy: false, error: err instanceof Error ? err.message : 'Unknown error' };
  } finally {
    connectionChecking.value = false;
  }
};

const applySpoolmanUrl = async () => {
  if (!spoolmanUrlInput.value.trim()) {
    return;
  }
  
  // Check connection before saving
  await checkConnection(spoolmanUrlInput.value);
  
  // Only save if connection is healthy
  if (connectionStatus.value?.healthy) {
    setSpoolmanUrl(spoolmanUrlInput.value);
    urlDialogOpen.value = false;
    refresh();
  }
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

onMounted(async () => {
  if (!hasUrl.value) {
    urlDialogOpen.value = true;
  } else {
    // Check connection status on mount
    await checkConnection(spoolmanUrl.value);
    refresh();
  }
  
  // Redirect to swatch if on /app root
  if (router.currentRoute.value.path === '/app') {
    router.replace('/app/swatch');
  }
});
</script>

