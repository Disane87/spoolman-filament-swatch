<template>
  <button :class="classes" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md";
  }>(),
  {
    variant: "primary",
    size: "md",
  },
);

const classes = computed(() => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-4 text-sm",
  };
  const variants = {
    primary:
      "border-transparent bg-[rgb(var(--accent))] text-white shadow-lg shadow-orange-500/30 hover:brightness-110 focus-visible:ring-orange-300",
    secondary:
      "border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface-alt),0.9)] text-[rgb(var(--text))] hover:bg-[rgba(var(--surface),0.9)] focus-visible:ring-slate-300",
    ghost:
      "border-transparent bg-transparent text-[rgb(var(--text))] hover:bg-[rgba(var(--surface-alt),0.7)] focus-visible:ring-slate-300",
  };
  return `${base} ${sizes[props.size]} ${variants[props.variant]}`;
});
</script>
