<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import LocaleSwitch from '@/components/LocaleSwitch.vue';
import ThemeSwitch from '@/components/ThemeSwitch.vue';

const props = defineProps<{
  projectsCount: number;
  pinnedCount: number;
  isConnected: boolean;
  hasUrl: boolean;
  viewMode?: 'board' | 'carousel';
}>();

const emit = defineEmits<{
  (e: 'openUrlDialog'): void;
  (e: 'openPalette'): void;
  (e: 'openChangelog'): void;
  (e: 'openImportDialog'): void;
  (e: 'changeView', mode: 'board' | 'carousel'): void;
  (e: 'openFilterModal'): void;
  (e: 'search', query: string): void;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const mobileMenuOpen = ref(false);
const searchQuery = ref('');

const handleOpenUrlDialog = () => {
  emit('openUrlDialog');
  mobileMenuOpen.value = false;
};

const handleOpenChangelog = () => {
  emit('openChangelog');
  mobileMenuOpen.value = false;
};

const handleSearch = (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchQuery.value = target.value;
  emit('search', searchQuery.value);
};

const isFilamentsView = () => route.path.includes('/swatch');
</script>

<template>
  <nav class="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-sm">
    <div class="px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
      <!-- Left: Logo & Navigation -->
      <div class="flex items-center gap-2 sm:gap-4 min-w-fit flex-shrink-0">
        <div class="flex items-center gap-2">
          <Icon icon="lucide:palette" class="w-5 h-5 text-[rgb(var(--accent))]" />
          <span class="hidden sm:inline font-semibold text-[rgb(var(--text))] text-base">Spool Swatch</span>
        </div>

        <!-- View/Page Toggle -->
        <div class="flex gap-0.5 sm:gap-1 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--bg))] overflow-hidden">
          <Button
            :variant="route.path.includes('/swatch') ? 'default' : 'ghost'"
            size="sm"
            @click="router.push('/app/swatch')"
            class="h-8 sm:h-9 px-2 sm:px-3 rounded-none"
          >
            <Icon icon="lucide:palette" class="w-4 h-4 sm:mr-1" />
            <span class="hidden md:inline text-xs">{{ t('app.filaments') || 'Filamente' }}</span>
          </Button>
          <Button
            :variant="route.path.includes('/projects') ? 'default' : 'ghost'"
            size="sm"
            @click="router.push('/app/projects')"
            class="h-8 sm:h-9 px-2 sm:px-3 relative rounded-none"
          >
            <Icon icon="lucide:folder" class="w-4 h-4 sm:mr-1" />
            <span class="hidden md:inline text-xs">{{ t('app.projects') || 'Projekte' }}</span>
            <span v-if="projectsCount > 0" class="ml-1 sm:ml-1.5 flex h-4 sm:h-5 w-4 sm:w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] sm:text-[10px] font-bold">
              {{ projectsCount }}
            </span>
          </Button>
        </div>
      </div>

      <!-- Center: Search (Filaments view only) -->
      <div v-if="isFilamentsView()" class="flex-1 max-w-md">
        <div class="relative">
          <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
          <input
            type="text"
            :placeholder="t('search.placeholder')"
            class="w-full bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded-lg pl-9 pr-4 py-1.5 sm:py-2 text-sm text-[rgb(var(--text))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Right: Controls -->
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <!-- Filter Button (Filaments view only) -->
        <button
          v-if="isFilamentsView()"
          @click="$emit('openFilterModal')"
          class="p-2 rounded-lg hover:bg-[rgb(var(--border))] transition text-[rgb(var(--text))] flex items-center gap-1.5"
          :title="t('filters.filter')"
        >
          <Icon icon="lucide:sliders-horizontal" class="w-5 h-5" />
          <span class="hidden sm:inline text-sm">{{ t('filters.filter') || 'Filters' }}</span>
        </button>

        <!-- View Toggle (Filaments view only) -->
        <div v-if="isFilamentsView()" class="flex items-center gap-1 bg-[rgb(var(--bg))] rounded-lg p-1">
          <button
            :class="[
              'p-1.5 rounded transition',
              viewMode === 'board'
                ? 'bg-[rgb(var(--accent))] text-white'
                : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
            ]"
            @click="$emit('changeView', 'board')"
            title="Board View"
          >
            <Icon icon="lucide:layout-grid" class="w-4 h-4" />
          </button>
          <button
            :class="[
              'p-1.5 rounded transition',
              viewMode === 'carousel'
                ? 'bg-[rgb(var(--accent))] text-white'
                : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
            ]"
            @click="$emit('changeView', 'carousel')"
            title="Carousel View"
          >
            <Icon icon="lucide:gallery-horizontal" class="w-4 h-4" />
          </button>
        </div>

        <!-- Server Status Button -->
        <Button
          size="sm"
          variant="outline"
          @click="emit('openUrlDialog')"
          class="relative h-8 sm:h-9 w-8 sm:w-9 p-0 hidden sm:flex"
          :aria-label="t('info.spoolmanUrl')"
        >
          <Icon icon="lucide:server" class="w-4 h-4" />
          <!-- Connection status indicator -->
          <span v-if="isConnected" class="absolute -right-1 -top-1 flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span v-else-if="hasUrl" class="absolute -right-1 -top-1 flex h-3 w-3">
            <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </Button>

        <!-- Desktop: Palette button -->
        <Button
          size="sm"
          variant="outline"
          @click="emit('openPalette')"
          class="relative h-8 sm:h-9 w-8 sm:w-9 p-0 hidden md:flex"
          :aria-label="t('actions.openPalette')"
        >
          <Icon icon="lucide:bookmark" class="w-4 h-4" />
          <span
            v-if="pinnedCount > 0"
            class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-white text-[10px] font-bold shadow-lg border-2 border-[rgb(var(--surface))]"
          >
            {{ pinnedCount }}
          </span>
        </Button>

        <!-- Desktop: Theme & Locale -->
        <div class="hidden sm:flex items-center gap-1">
          <LocaleSwitch />
          <ThemeSwitch />
        </div>

        <!-- Desktop: Changelog -->
        <Button
          size="sm"
          variant="outline"
          @click="emit('openChangelog')"
          class="h-8 sm:h-9 w-8 sm:w-9 p-0 hidden sm:flex"
          aria-label="What's New"
        >
          <Icon icon="lucide:sparkles" class="w-4 h-4" />
        </Button>

        <!-- Mobile: Menu button -->
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
              <div class="fixed inset-0 z-40" @click="mobileMenuOpen = false"></div>
              <div class="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-[rgb(var(--surface))] shadow-lg z-50">
                <div class="p-2 flex flex-col gap-1">
                  <button
                    class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--border))] rounded-md transition-colors"
                    @click="handleOpenUrlDialog"
                  >
                    <div class="relative">
                      <Icon icon="lucide:server" class="w-4 h-4" />
                      <span v-if="isConnected" class="absolute -right-1 -top-1 flex h-2 w-2">
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span v-else-if="hasUrl" class="absolute -right-1 -top-1 flex h-2 w-2">
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    </div>
                    {{ t('info.spoolmanUrl') || 'Spoolman Server' }}
                  </button>
                  <hr class="border-[rgb(var(--border))]/50 my-1" />
                  <div class="flex items-center justify-between px-3 py-2">
                    <span class="text-xs text-[rgb(var(--text-muted))]">{{ t('theme.theme') || 'Theme' }}</span>
                    <ThemeSwitch />
                  </div>
                  <div class="flex items-center justify-between px-3 py-2">
                    <span class="text-xs text-[rgb(var(--text-muted))]">{{ t('settings.language') || 'Language' }}</span>
                    <LocaleSwitch />
                  </div>
                  <hr class="border-[rgb(var(--border))]/50 my-1" />
                  <button
                    class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--border))] rounded-md transition-colors"
                    @click="handleOpenChangelog"
                  >
                    <Icon icon="lucide:sparkles" class="w-4 h-4" />
                    {{ t('changelog.title') || 'What\'s New' }}
                  </button>
                  <a
                    href="https://github.com/sponsors/Disane87"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-3 py-2 text-sm text-pink-500 hover:bg-[rgb(var(--border))] rounded-md transition-colors"
                    @click="mobileMenuOpen = false"
                  >
                    <Icon icon="lucide:heart" class="w-4 h-4" />
                    {{ t('actions.sponsor') }}
                  </a>
                  <hr class="border-[rgb(var(--border))]/50 my-1" />
                  <button
                    v-if="isFilamentsView()"
                    class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--border))] rounded-md transition-colors w-full"
                    @click="$emit('openFilterModal'); mobileMenuOpen = false"
                  >
                    <Icon icon="lucide:sliders-horizontal" class="w-4 h-4" />
                    {{ t('filters.filter') || 'Filters' }}
                  </button>
                  <button
                    v-if="isFilamentsView()"
                    class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--border))] rounded-md transition-colors w-full relative"
                    @click="$emit('openPalette'); mobileMenuOpen = false"
                  >
                    <Icon icon="lucide:bookmark" class="w-4 h-4" />
                    {{ t('info.palette') || 'Palette' }}
                    <span
                      v-if="pinnedCount > 0"
                      class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-white text-[10px] font-bold"
                    >
                      {{ pinnedCount }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
