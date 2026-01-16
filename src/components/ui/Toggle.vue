<template>
  <button :class="classes" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    active?: boolean;
  }>(),
  { active: false },
);

const classes = computed(() => {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition";
  const active =
    "border-transparent bg-[rgb(var(--accent-2))] text-white shadow-lg shadow-blue-500/20";
  const inactive =
    "border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface-alt),0.8)] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]";
  return `${base} ${props.active ? active : inactive}`;
});
</script>
