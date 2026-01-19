<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  isVisible: boolean;
  scrollY: number;
  statsAnimated: boolean;
}>();

const emit = defineEmits<{
  (e: 'enterApp'): void;
  (e: 'scrollTo', id: string): void;
}>();

const { t, tm } = useI18n();

const statsIcons = [
  { icon: 'lucide:palette', color: 'text-pink-400' },
  { icon: 'lucide:package', color: 'text-blue-400' },
  { icon: 'lucide:heart', color: 'text-red-400' },
  { icon: 'lucide:zap', color: 'text-yellow-400' },
];

const colorBlobs = [
  { color: '#ec4899', size: 120, x: 15, y: 20, delay: 0 },
  { color: '#3b82f6', size: 90, x: 75, y: 30, delay: 1.5 },
  { color: '#22c55e', size: 110, x: 85, y: 60, delay: 3 },
  { color: '#f97316', size: 80, x: 10, y: 70, delay: 4.5 },
  { color: '#8b5cf6', size: 100, x: 50, y: 15, delay: 2 },
  { color: '#06b6d4', size: 95, x: 30, y: 85, delay: 3.5 },
  { color: '#eab308', size: 85, x: 65, y: 50, delay: 1 },
  { color: '#ec4899', size: 75, x: 40, y: 40, delay: 2.5 },
];
</script>

<template>
  <section id="hero" class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
    <!-- Floating Color Blobs -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <div
        v-for="(blob, index) in colorBlobs"
        :key="index"
        class="absolute rounded-full blur-3xl opacity-30 animate-float-blob"
        :style="{
          background: `radial-gradient(circle, ${blob.color}88 0%, ${blob.color}44 50%, transparent 70%)`,
          width: `${blob.size}px`,
          height: `${blob.size}px`,
          left: `${blob.x}%`,
          top: `${blob.y}%`,
          animationDelay: `${blob.delay}s`,
          transform: `translateY(${scrollY * 0.05}px)`
        }"
      ></div>
    </div>

    <div
      class="max-w-6xl mx-auto text-center transition-all duration-150 transform relative z-10"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
    >
      <!-- Logo -->
      <div class="mb-8 inline-block animate-float group cursor-pointer" @click="emit('enterApp')">
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-60 animate-pulse scale-125 group-hover:scale-150 transition-transform duration-200"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-40 animate-pulse" style="animation-delay: 1s;"></div>
          <div class="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 rounded-3xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-200 hover:shadow-blue-500/50">
            <div class="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm"></div>
            <Icon icon="lucide:palette" class="w-24 h-24 text-white relative z-10 group-hover:rotate-12 transition-transform duration-200" />
          </div>
          <div class="absolute inset-0 border-4 border-blue-500/30 rounded-3xl group-hover:border-blue-400/50 transition-colors duration-200 animate-ping" style="animation-duration: 3s;"></div>
        </div>
      </div>

      <!-- Heading -->
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 relative">
        <span class="relative inline-block">
          <span class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-2xl opacity-50 animate-pulse"></span>
          <span class="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            {{ t('landing.hero.title') }}
          </span>
        </span>
      </h1>

      <p class="text-xl sm:text-2xl text-[rgb(var(--foreground))]/80 mb-4 max-w-3xl mx-auto font-medium leading-relaxed">
        {{ t('landing.hero.subtitle') }}
      </p>

      <i18n-t keypath="landing.hero.description" tag="p" class="text-base sm:text-lg text-[rgb(var(--foreground))]/60 mb-12 max-w-2xl mx-auto leading-relaxed">
        <template #spoolman>
          <a href="https://github.com/Donkie/Spoolman/" target="_blank" class="text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-4 transition-all hover:scale-105 inline-block">Spoolman</a>
        </template>
      </i18n-t>

      <!-- Requirements Notice -->
      <div class="max-w-2xl mx-auto mb-12 relative group">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-150"></div>
        <div class="relative bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-md group-hover:border-blue-400/50 transition-all duration-150 hover:shadow-2xl hover:shadow-blue-500/20">
          <div class="flex items-start gap-3">
            <div class="relative flex-shrink-0 mt-0.5">
              <div class="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50 animate-pulse"></div>
              <Icon icon="lucide:info" class="w-6 h-6 text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-150" />
            </div>
            <div class="text-sm text-[rgb(var(--foreground))]/80 leading-relaxed">
              <strong class="text-[rgb(var(--foreground))] block mb-2 text-base font-semibold">{{ t('landing.hero.requiresTitle') }}</strong>
              <i18n-t keypath="landing.hero.requiresText" tag="span">
                <template #spoolman>
                  <a href="https://github.com/Donkie/Spoolman/" target="_blank" class="text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors font-medium">Spoolman</a>
                </template>
              </i18n-t>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 flex-wrap">
        <Button
          @click="emit('enterApp')"
          size="lg"
          class="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-10 py-7 text-lg font-bold transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1"
        >
          <span class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
          <span class="relative z-10 flex items-center gap-3">
            <Icon icon="lucide:rocket" class="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-150" />
            {{ t('landing.hero.launchApp') }}
          </span>
          <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-150 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </Button>

        <Button
          @click="emit('scrollTo', 'features')"
          size="lg"
          variant="outline"
          class="group relative px-10 py-7 text-lg font-semibold border-2 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-150 hover:scale-105 hover:border-blue-400/50 hover:shadow-xl backdrop-blur-sm"
        >
          <Icon icon="lucide:sparkles" class="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-200" />
          {{ t('landing.hero.exploreFeatures') }}
        </Button>

        <Button
          as="a"
          href="https://github.com/Disane87/spoolman-filament-swatch"
          target="_blank"
          size="lg"
          variant="ghost"
          class="group relative px-10 py-7 text-lg font-semibold hover:bg-[rgb(var(--foreground))]/10 transition-all duration-150 hover:scale-105 rounded-xl backdrop-blur-sm"
        >
          <Icon icon="lucide:github" class="w-5 h-5 mr-2 group-hover:scale-125 transition-transform duration-150" />
          {{ t('landing.hero.github') }}
        </Button>
      </div>

      <!-- Stats -->
      <div id="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div
          v-for="(stat, index) in tm('landing.stats')"
          :key="index"
          class="group relative bg-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-2xl p-6 border border-input/50 transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/50 cursor-pointer"
          :class="{ 'animate-fade-in-up': statsAnimated }"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

          <div class="relative z-10">
            <div class="mb-4 flex justify-center">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <Icon :icon="statsIcons[index]?.icon" class="w-10 h-10 relative z-10 mx-auto group-hover:scale-125 transition-transform duration-150" :class="statsIcons[index]?.color" />
              </div>
            </div>
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-150">
              {{ stat.value }}
            </div>
            <div class="text-sm text-[rgb(var(--foreground))]/60 mt-2 font-medium group-hover:text-[rgb(var(--foreground))]/80 transition-colors duration-150">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer group" @click="emit('scrollTo', 'features')">
      <div class="relative">
        <div class="absolute inset-0 bg-blue-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
        <Icon icon="lucide:chevron-down" class="w-8 h-8 text-[rgb(var(--foreground))]/40 group-hover:text-blue-400 relative z-10 transition-colors duration-150" />
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% auto;
  animation: gradient 2s ease infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 1.5s ease-in-out infinite;
}

@keyframes float-blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-20px, -30px) scale(1.1); }
  50% { transform: translate(20px, -50px) scale(0.9); }
  75% { transform: translate(-15px, -25px) scale(1.05); }
}

.animate-float-blob {
  animation: float-blob 4s ease-in-out infinite;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fade-in-up 0.3s ease-out forwards;
}
</style>
