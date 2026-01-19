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
}>();

const emit = defineEmits<{
  (e: 'openUrlDialog'): void;
  (e: 'openPalette'): void;
  (e: 'openChangelog'): void;
  (e: 'openImportDialog'): void;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const mobileMenuOpen = ref(false);

const handleOpenUrlDialog = () => {
  emit('openUrlDialog');
  mobileMenuOpen.value = false;
};

const handleOpenChangelog = () => {
  emit('openChangelog');
  mobileMenuOpen.value = false;
};
</script>

<template>
  <nav class="sticky top-0 z-40 bg-[rgb(var(--background))] flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-6 py-2 sm:py-4 pb-3 shrink-0 border-b">
    <div class="flex items-center gap-2 sm:gap-3 min-w-0">
      <h1 class="text-base sm:text-xl font-semibold truncate">{{ t("app.title") }}</h1>
    </div>
    
    <div class="flex items-center gap-1 sm:gap-2 shrink-0">
      <!-- View Toggle -->
      <div class="flex gap-0.5 sm:gap-1 border rounded-lg bg-[rgb(var(--surface))] overflow-hidden">
        <Button
          :variant="route.path.includes('/swatch') ? 'default' : 'ghost'"
          size="sm"
          @click="router.push('/app/swatch')"
          class="h-8 sm:h-9 px-2 sm:px-3 rounded-none"
        >
          <Icon icon="lucide:palette" class="w-4 h-4 sm:mr-1" />
          <span class="hidden md:inline">Filamente</span>
        </Button>
        <Button
          :variant="route.path.includes('/projects') ? 'default' : 'ghost'"
          size="sm"
          @click="router.push('/app/projects')"
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
        v-if="route.path.includes('/projects') && route.name === 'projects'"
        size="sm"
        variant="outline"
        @click="emit('openImportDialog')"
        class="h-8 sm:h-9 px-2 sm:px-3"
      >
        <Icon icon="lucide:plus" class="w-4 h-4 sm:mr-1" />
        <span class="hidden md:inline">Import</span>
      </Button>
      
      <!-- Desktop: Server button -->
      <Button
        size="sm"
        variant="outline"
        @click="emit('openUrlDialog')"
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
        @click="emit('openPalette')"
        class="relative h-8 sm:h-9 w-8 sm:w-9 p-0"
        :aria-label="t('actions.openPalette')"
      >
        <Icon icon="lucide:palette" class="w-4 h-4" />
        <span
          v-if="pinnedCount > 0"
          class="absolute -right-1 sm:-right-1.5 -top-1 sm:-top-1.5 flex h-4 sm:h-5 w-4 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[9px] sm:text-[11px] font-bold text-white shadow-lg border-2 border-[rgb(var(--background))]"
        >
          {{ pinnedCount }}
        </span>
      </Button>

      <!-- Desktop: Show changelog & sponsor -->
      <div class="hidden sm:flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          @click="emit('openChangelog')"
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
                  @click="handleOpenUrlDialog"
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
                  @click="handleOpenChangelog"
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
