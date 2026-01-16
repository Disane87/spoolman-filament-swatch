<template>
  <div class="color-map" role="list">
    <button
      class="color-dot color-dot--all"
      :class="{ active: selected === 'all' }"
      aria-label="All colors"
      @click="$emit('select', 'all')"
    >
      ✦
    </button>
    <button
      v-for="hex in colors"
      :key="hex"
      class="color-dot"
      :class="{ active: selected === hex }"
      :style="{ background: hex }"
      :aria-label="hex"
      @click="$emit('select', hex)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  colors: string[];
  selected: string;
}>();

defineEmits<{ (e: "select", value: string): void }>();
</script>

<style scoped>
.color-map {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));
  gap: 8px;
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid rgba(var(--border), 0.7);
  background: rgba(var(--surface), 0.85);
}
.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(var(--border), 0.6);
  box-shadow: 0 6px 14px -8px rgba(var(--shadow), 0.7);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}
.color-dot--all {
  background: linear-gradient(120deg, #ff8a00, #8a2be2, #00c6ff);
  color: white;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(var(--accent-2), 0.7);
}
.color-dot:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 12px 24px -14px rgba(var(--shadow), 0.8);
}
.color-dot.active {
  outline: 2px solid rgba(var(--accent-2), 0.9);
  outline-offset: 2px;
  border-color: transparent;
}
</style>
