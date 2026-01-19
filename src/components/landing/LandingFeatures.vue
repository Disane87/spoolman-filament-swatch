<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  scrollY: number;
}>();

const { t, tm } = useI18n();

const featuresIcons = [
  { icon: 'lucide:palette', gradient: 'from-pink-500 to-purple-500', color: 'text-pink-500', borderColor: '#ec4899' },
  { icon: 'lucide:filter', gradient: 'from-blue-500 to-cyan-500', color: 'text-blue-500', borderColor: '#3b82f6' },
  { icon: 'lucide:map-pin', gradient: 'from-green-500 to-emerald-500', color: 'text-green-500', borderColor: '#22c55e' },
  { icon: 'lucide:layers', gradient: 'from-orange-500 to-red-500', color: 'text-orange-500', borderColor: '#f97316' },
  { icon: 'lucide:smartphone', gradient: 'from-violet-500 to-purple-500', color: 'text-violet-500', borderColor: '#8b5cf6' },
  { icon: 'lucide:globe', gradient: 'from-cyan-500 to-blue-500', color: 'text-cyan-500', borderColor: '#06b6d4' },
  { icon: 'lucide:zap', gradient: 'from-yellow-500 to-orange-500', color: 'text-yellow-500', borderColor: '#eab308' },
  { icon: 'lucide:moon', gradient: 'from-slate-500 to-zinc-500', color: 'text-slate-500', borderColor: '#64748b' },
  { icon: 'lucide:package-open', gradient: 'from-amber-500 to-orange-500', color: 'text-amber-500', borderColor: '#f59e0b' },
];
</script>

<template>
  <section
    id="features"
    class="relative py-20 px-4 sm:px-6 lg:px-8 bg-[rgb(var(--foreground))]/5"
    :style="{ transform: `translateY(${scrollY * 0.03}px)` }"
  >
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {{ t('landing.features.title') }}
        </h2>
        <p class="text-lg text-[rgb(var(--foreground))]/60 max-w-2xl mx-auto">
          {{ t('landing.features.subtitle') }}
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(feature, index) in tm('landing.features.items')"
          :key="index"
          class="group relative bg-[rgb(var(--card))] rounded-2xl p-8 border transition-all duration-150 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl cursor-pointer will-change-transform"
          :style="{
            animationDelay: `${index * 100}ms`,
            borderColor: featuresIcons[index]?.borderColor
          }"
        >
          <div class="mb-6 flex justify-center">
            <Icon :icon="featuresIcons[index]?.icon" class="w-10 h-10 group-hover:scale-110 transition-transform duration-150" :class="featuresIcons[index]?.color" />
          </div>

          <h3
            class="text-xl font-bold mb-3 text-[rgb(var(--foreground))] text-center transition-colors duration-150"
            @mouseenter="($event.currentTarget as HTMLElement).style.color = featuresIcons[index]?.borderColor || ''"
            @mouseleave="($event.currentTarget as HTMLElement).style.color = ''"
          >
            {{ feature.title }}
          </h3>
          <p class="text-[rgb(var(--foreground))]/60 mb-4 leading-relaxed text-center group-hover:text-[rgb(var(--foreground))]/80 transition-colors duration-150">
            {{ feature.description }}
          </p>

          <ul v-if="feature.details && feature.details.length > 0" class="space-y-2">
            <li v-for="detail in feature.details" :key="detail" class="flex items-center gap-2 text-sm text-[rgb(var(--foreground))]/50 group-hover:text-[rgb(var(--foreground))]/70 transition-colors duration-100">
              <Icon icon="lucide:check" class="w-4 h-4 text-green-400 shrink-0 group-hover:scale-110 transition-transform duration-100" />
              <span>{{ detail }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
