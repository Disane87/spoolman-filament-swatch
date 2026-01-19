<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <footer class="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
    <div class="max-w-7xl mx-auto">
      <div class="grid md:grid-cols-4 gap-8 mb-8">
        <div class="md:col-span-2">
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
            <Icon icon="lucide:palette" class="w-5 h-5" />
            Spool Swatch
          </h3>
          <p class="text-[rgb(var(--foreground))]/60 text-sm mb-4">
            {{ t('landing.footer.description') }}
          </p>
          <div class="flex gap-3">
            <a href="https://github.com/Disane87/spoolman-filament-swatch" target="_blank" class="hover:text-blue-400 transition-colors">
              <Icon icon="lucide:github" class="w-6 h-6" />
            </a>
          </div>
        </div>

        <div>
          <h3 class="font-bold text-lg mb-4">{{ t('landing.footer.links.title') }}</h3>
          <ul class="space-y-2 text-sm text-[rgb(var(--foreground))]/60">
            <li><a href="https://github.com/Disane87/spoolman-filament-swatch" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.links.items.github') }}</a></li>
            <li><a href="https://github.com/Donkie/Spoolman/" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.links.items.spoolman') }}</a></li>
            <li><a href="https://github.com/Disane87/spoolman-filament-swatch/issues" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.links.items.issues') }}</a></li>
            <li><a href="https://github.com/Disane87/spoolman-filament-swatch/blob/main/CONTRIBUTING.md" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.links.items.contributing') }}</a></li>
          </ul>
        </div>

        <div>
          <h3 class="font-bold text-lg mb-4">{{ t('landing.footer.resources.title') }}</h3>
          <ul class="space-y-2 text-sm text-[rgb(var(--foreground))]/60">
            <li><a href="#features" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.resources.items.features') }}</a></li>
            <li><a href="/app" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.resources.items.launchApp') }}</a></li>
            <li><a href="https://github.com/Disane87/spoolman-filament-swatch#readme" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.resources.items.documentation') }}</a></li>
            <li>
              <a href="https://github.com/Donkie/Spoolman/" target="_blank" class="hover:text-blue-400 transition-colors flex items-center gap-1">
                <Icon icon="lucide:star" class="w-3 h-3" />
                {{ t('landing.footer.resources.items.spoolmanProject') }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="text-center text-sm text-[rgb(var(--foreground))]/40 pt-8 border-t border-border">
        <p>&copy; 2026 {{ t('landing.footer.copyright') }}</p>
        <p class="mt-2">
          <i18n-t keypath="landing.footer.madeWith" tag="span">
            <template #heart>
              <Icon icon="lucide:heart" class="w-4 h-4 inline text-red-400" />
            </template>
            <template #author>
              <a href="https://github.com/Disane87" target="_blank" class="hover:text-blue-400 transition-colors">Disane87</a>
            </template>
          </i18n-t>
        </p>
      </div>
    </div>
  </footer>
</template>
