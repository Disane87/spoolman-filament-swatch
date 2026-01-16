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
  grid-template-columns: repeat(auto-fill, minmax(22px, 1fr));
  gap: 6px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(var(--border), 0.7);
  background: rgba(var(--surface), 0.85);
  max-height: 80px;
  overflow-y: auto;
}
.color-dot {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid rgba(var(--border), 0.6);
  box-shadow: 0 4px 10px -6px rgba(var(--shadow), 0.7);
  cursor: pointer;
  transition: transform 100ms ease, box-shadow 100ms ease, border-color 100ms ease;
}
.color-dot--all {
  background: linear-gradient(120deg, #ff8a00, #8a2be2, #00c6ff);
  color: white;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid rgba(var(--accent-2), 0.7);
}
.color-dot:hover {
  transform: translateY(-1px) scale(1.08);
  box-shadow: 0 8px 16px -10px rgba(var(--shadow), 0.8);
}
.color-dot.active {
  outline: 2px solid rgb(var(--text));
  outline-offset: 2px;
  border-color: transparent;
  transform: scale(1.05);
}
.color-dot--all.active {
  outline: 2px solid rgb(var(--accent));
  outline-offset: 2px;
}
</style>
