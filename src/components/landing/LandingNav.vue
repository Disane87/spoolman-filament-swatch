<script setup lang="ts">
import { Icon } from '@iconify/vue';
import LocaleSwitch from '@/components/LocaleSwitch.vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  githubStats: {
    stars: number;
    contributors: number;
    latestRelease: string;
  };
}>();

const emit = defineEmits<{
  (e: 'scrollTo', id: string): void;
}>();

const { t } = useI18n();
</script>

<template>
  <nav class="landing-nav">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2 group cursor-pointer" @click="emit('scrollTo', 'hero')">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-150"></div>
              <Icon icon="lucide:palette" class="w-6 h-6 text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-150" />
            </div>
            <span class="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-150">Spool Swatch</span>
          </div>

          <div class="hidden lg:flex items-center gap-2">
            <a
              href="https://github.com/Disane87/spoolman-filament-swatch/stargazers"
              target="_blank"
              class="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-full border border-input/50 hover:border-yellow-400/50 hover:bg-yellow-500/10 transition-all duration-150 hover:scale-105"
            >
              <Icon icon="lucide:star" class="w-3.5 h-3.5 text-yellow-400 group-hover:rotate-180 transition-transform duration-200" />
              <span class="text-xs font-semibold">{{ githubStats.stars.toLocaleString() }}</span>
            </a>

            <a
              href="https://github.com/Disane87/spoolman-filament-swatch/graphs/contributors"
              target="_blank"
              class="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-full border border-input/50 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all duration-150 hover:scale-105"
            >
              <Icon icon="lucide:users" class="w-3.5 h-3.5 text-blue-400 group-hover:scale-125 transition-transform duration-150" />
              <span class="text-xs font-semibold">{{ githubStats.contributors }}</span>
            </a>

            <a
              v-if="githubStats.latestRelease"
              href="https://github.com/Disane87/spoolman-filament-swatch/releases/latest"
              target="_blank"
              class="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-full border border-input/50 hover:border-green-400/50 hover:bg-green-500/10 transition-all duration-150 hover:scale-105"
            >
              <Icon icon="lucide:tag" class="w-3.5 h-3.5 text-green-400 group-hover:rotate-12 transition-transform duration-150" />
              <span class="text-xs font-semibold">{{ githubStats.latestRelease }}</span>
            </a>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <a
            href="https://github.com/sponsors/Disane87"
            target="_blank"
            rel="noopener noreferrer"
            class="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 backdrop-blur-md rounded-full border border-pink-400/30 hover:border-pink-400/60 hover:bg-pink-500/20 transition-all duration-150 hover:scale-105 mr-2"
          >
            <Icon icon="lucide:heart" class="w-3.5 h-3.5 text-pink-400 group-hover:scale-125 transition-transform duration-150" />
            <span class="text-xs font-semibold text-pink-400">{{ t('landing.sponsor.nav') }}</span>
          </a>
          <LocaleSwitch variant="ghost" />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.landing-nav {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  backdrop-filter: blur(12px);
  background: rgb(var(--background) / 0.95);
  border-bottom: 1px solid rgb(var(--border) / 0.4);
  transition: all 150ms;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.landing-nav:hover {
  background: rgb(var(--background) / 0.98);
}
</style>
