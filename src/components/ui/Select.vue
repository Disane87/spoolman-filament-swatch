<template>
  <select :class="classes" v-bind="$attrs">
    <slot />
  </select>
</template>

<script setup lang="ts">
const classes =
  "h-11 w-full rounded-xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.9)] px-3 text-sm text-[rgb(var(--text))] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-2),0.7)]";
</script>
