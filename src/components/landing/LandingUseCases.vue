<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  scrollY: number;
}>();

const { t, tm } = useI18n();

const useCasesIcons = [
  { icon: 'lucide:search' },
  { icon: 'lucide:shopping-cart' },
  { icon: 'lucide:warehouse' },
  { icon: 'lucide:layers-3' },
];
</script>

<template>
  <section
    class="relative py-20 px-4 sm:px-6 lg:px-8"
    :style="{ transform: `translateY(${scrollY * 0.05}px)` }"
  >
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {{ t('landing.useCases.title') }}
        </h2>
        <p class="text-lg text-[rgb(var(--foreground))]/60 max-w-2xl mx-auto">
          {{ t('landing.useCases.subtitle') }}
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <div
          v-for="(useCase, index) in tm('landing.useCases.items')"
          :key="index"
          class="group relative bg-[rgb(var(--card))] rounded-2xl p-8 border border-input transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 cursor-pointer"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0">
              <div class="w-16 h-16 rounded-xl border-2 border-blue-500 flex items-center justify-center group-hover:scale-110 transition-all duration-150 bg-blue-500/10">
                <Icon :icon="useCasesIcons[index]?.icon" class="w-8 h-8 text-blue-500 group-hover:scale-125 transition-transform duration-150" />
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-3 text-[rgb(var(--foreground))] group-hover:text-blue-400 transition-colors duration-150">
                {{ useCase.title }}
              </h3>
              <p class="text-[rgb(var(--foreground))]/60 leading-relaxed group-hover:text-[rgb(var(--foreground))]/80 transition-colors duration-150">
                {{ useCase.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
