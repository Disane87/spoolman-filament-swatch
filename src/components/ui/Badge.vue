<template>
  <span :class="classes">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ variant?: "neutral" | "accent" }>(),
  { variant: "neutral" },
);

const classes = computed(() => {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide";
  const variants = {
    neutral:
      "border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface-alt),0.9)] text-[rgb(var(--text-muted))]",
    accent:
      "border-transparent bg-[rgba(var(--accent-2),0.15)] text-[rgb(var(--accent-2))]",
  };
  return `${base} ${variants[props.variant]}`;
});
</script>
