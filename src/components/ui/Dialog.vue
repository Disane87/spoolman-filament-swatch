<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('update:open', false)" />
      <div
        class="relative z-10 w-full max-w-xl rounded-2xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.97)] p-6 shadow-2xl shadow-black/30 dark:bg-[rgba(var(--surface),0.95)]"
      >
        <slot />
        <button
          type="button"
          class="absolute right-4 top-4 h-9 w-9 rounded-lg border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface-alt),0.7)] text-sm font-semibold text-[rgb(var(--text))] transition hover:bg-[rgba(var(--surface-alt),0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-2),0.6)]"
          aria-label="Close dialog"
          @click="emit('update:open', false)"
        >
          ×
        </button>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>();
const emit = defineEmits<{
  (event: "update:open", value: boolean): void;
}>();
</script>
