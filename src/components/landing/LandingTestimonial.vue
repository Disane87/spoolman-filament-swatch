<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  scrollY: number;
}>();

const { t } = useI18n();
</script>

<template>
  <section
    class="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[rgb(var(--foreground))]/5"
    :style="{ transform: `translateY(${scrollY * 0.08}px)` }"
  >
    <div class="max-w-5xl mx-auto">
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
        <div class="relative bg-[rgb(var(--foreground))]/5 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-input">
          <div class="flex items-start gap-4 mb-6">
            <div class="flex-shrink-0">
              <img
                src="/landing/disane87-avatar.jpg?t=1"
                :alt="t('landing.testimonial.name')"
                class="w-16 h-16 rounded-full ring-2 ring-[rgb(var(--foreground))]/10 object-cover"
                onerror="this.style.display='none'"
              />
            </div>
            <div>
              <h3 class="text-xl font-bold mb-1">{{ t('landing.testimonial.name') }}</h3>
              <p class="text-sm text-[rgb(var(--foreground))]/60">{{ t('landing.testimonial.role') }}</p>
            </div>
          </div>

          <div class="space-y-4 text-[rgb(var(--foreground))]/70">
            <p class="text-lg leading-relaxed">
              <span class="text-4xl text-blue-400 mr-1">"</span>
              {{ t('landing.testimonial.quote1') }}
              <strong class="text-[rgb(var(--foreground))]">{{ t('landing.testimonial.quote1Bold') }}</strong>
            </p>

            <p class="text-lg leading-relaxed">
              {{ t('landing.testimonial.quote2') }} <strong class="text-[rgb(var(--foreground))]">{{ t('landing.testimonial.quote2Bold') }}</strong>{{ t('landing.testimonial.quote2Continue') }}
            </p>

            <p class="text-lg leading-relaxed">
              {{ t('landing.testimonial.quote3') }}
            </p>

            <p class="text-lg leading-relaxed">
              {{ t('landing.testimonial.quote4') }}
              <span class="text-4xl text-blue-400 ml-1">"</span>
            </p>
          </div>

          <div class="mt-8 pt-6 border-t border-border">
            <div class="flex items-start gap-3 text-sm text-[rgb(var(--foreground))]/60">
              <Icon icon="lucide:heart" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p class="mb-2">{{ t('landing.testimonial.madeWithLove') }}</p>
                <i18n-t keypath="landing.testimonial.poweredBy" tag="p">
                  <template #spoolman>
                    <a href="https://github.com/Donkie/Spoolman/" target="_blank" class="text-blue-400 hover:text-blue-300 underline font-semibold">Spoolman</a>
                  </template>
                  <template #donkie>
                    <a href="https://github.com/Donkie" target="_blank" class="text-blue-400 hover:text-blue-300 underline">Donkie</a>
                  </template>
                </i18n-t>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
