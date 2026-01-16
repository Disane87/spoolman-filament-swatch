<template>
  <input
    :class="classes"
    :value="modelValue ?? ''"
    @input="onInput"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: string | number | null }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const classes =
  "h-11 w-full rounded-xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.9)] px-4 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--text-muted))] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-2),0.7)]";
</script>
