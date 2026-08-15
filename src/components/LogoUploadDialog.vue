<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div class="rounded-lg bg-[rgba(var(--surface),0.98)] p-6 shadow-2xl max-w-md w-full backdrop-blur-sm">
      <h2 class="mb-4 text-lg font-bold text-[rgb(var(--text))]">{{ t('upload.title') }}</h2>

      <div class="mb-4 text-sm text-[rgb(var(--text-muted))]">
        <p>{{ t('upload.instruction') }}</p>
      </div>

      <!-- Drag & Drop Area -->
      <div
        :class="[
          'mb-4 rounded-lg border-2 border-dashed p-6 text-center transition',
          isDragging
            ? 'border-[rgba(var(--accent),0.8)] bg-[rgba(var(--accent),0.1)]'
            : 'border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.5)]'
        ]"
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
      >
        <Icon icon="lucide:upload" class="mx-auto mb-2 h-8 w-8 text-[rgba(var(--accent),0.6)]" />
        <p class="text-sm font-medium text-[rgb(var(--text))]">{{ t('upload.dragDrop') }}</p>
        <p class="text-xs text-[rgb(var(--text-muted))]">{{ t('upload.formats') }}</p>
      </div>

      <!-- File Input -->
      <input
        ref="fileInput"
        type="file"
        accept=".png,.svg"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Buttons -->
      <div class="flex gap-3 mb-4">
        <button
          type="button"
          class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition border border-[rgba(var(--border),0.5)] text-[rgb(var(--text))] hover:bg-[rgba(var(--surface-alt),0.5)]"
          @click="$emit('close')"
        >
          {{ t('actions.cancel') }}
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition bg-blue-600 text-white hover:bg-blue-700"
          @click="() => fileInput?.click()"
        >
          {{ t('upload.selectFile') }}
        </button>
      </div>

      <!-- GitHub PR Link (shown after file selected) -->
      <div v-if="prUrl" class="rounded-lg bg-[rgba(100,150,255,0.15)] p-4 border border-[rgba(100,150,255,0.3)]">
        <p class="mb-2 text-xs font-semibold text-blue-600 dark:text-blue-400">{{ t('upload.prReady') }}</p>
        <a
          :href="prUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {{ t('upload.createPr') }}
          <Icon icon="lucide:external-link" class="ml-1 h-3 w-3" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { generateGitHubPrUrl } from '@/lib/githubPrGenerator';

defineProps<{
  vendorName: string;
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'uploaded', file: File): void;
}>();

const { t } = useI18n();
const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const prUrl = ref<string | null>(null);

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files?.length) {
    processFile(files[0]);
  }
};

const handleFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files?.length) {
    processFile(files[0]);
  }
};

const processFile = (file: File) => {
  if (!['image/png', 'image/svg+xml'].includes(file.type)) {
    alert(t('upload.invalidFormat'));
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    prUrl.value = generateGitHubPrUrl(vendorName, dataUrl, file.name);
  };
  reader.readAsDataURL(file);
};
</script>

<style scoped>
</style>
