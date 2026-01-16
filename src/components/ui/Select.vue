<template>
  <div class="select-shell" @keydown.stop.prevent="onKeydown" tabindex="0" role="combobox" :aria-expanded="open">
    <button type="button" :class="triggerClasses" @click="toggle" :aria-expanded="open">
      <span>{{ activeLabel }}</span>
      <span class="select-caret" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M6 8l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>
    <transition name="fade-fast">
      <ul
        v-if="open"
        class="select-menu glass"
        role="listbox"
        :aria-activedescendant="activeId"
      >
        <li
          v-for="(opt, idx) in options"
          :key="opt.value"
          :id="idFor(opt.value)"
          :class="['select-item', { active: opt.value === modelValue, highlight: idx === highlightIndex }]"
          role="option"
          @click="select(opt.value)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{ modelValue: string; options: { value: string; label: string }[] }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const open = ref(false);
const highlightIndex = ref(0);

const activeLabel = computed(() => {
  return props.options.find((o) => o.value === props.modelValue)?.label ?? props.options[0]?.label ?? "";
});

const triggerClasses =
  "h-11 w-full inline-flex items-center justify-between rounded-xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.94)] px-3 text-sm text-[rgb(var(--text))] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-2),0.7)] focus-visible:border-[rgba(var(--accent-2),0.8)]";

const idFor = (value: string) => `select-opt-${value}`;
const activeId = computed(() => idFor(props.options[highlightIndex.value]?.value ?? ""));

const close = () => {
  open.value = false;
};

const toggle = () => {
  open.value = !open.value;
  if (open.value) {
    const currentIdx = props.options.findIndex((o) => o.value === props.modelValue);
    highlightIndex.value = currentIdx >= 0 ? currentIdx : 0;
  }
};

const select = (value: string) => {
  emit("update:modelValue", value);
  close();
};

const onKeydown = (e: KeyboardEvent) => {
  if (!open.value && (e.key === "ArrowDown" || e.key === "Enter" || e.key === "Space")) {
    e.preventDefault();
    toggle();
    return;
  }
  if (!open.value) return;
  if (e.key === "ArrowDown") {
    highlightIndex.value = (highlightIndex.value + 1) % props.options.length;
  } else if (e.key === "ArrowUp") {
    highlightIndex.value = (highlightIndex.value - 1 + props.options.length) % props.options.length;
  } else if (e.key === "Enter" || e.key === "Space") {
    const opt = props.options[highlightIndex.value];
    if (opt) select(opt.value);
  } else if (e.key === "Escape") {
    close();
  }
};

const handleClickOutside = (evt: Event) => {
  const el = evt.target as HTMLElement | null;
  const root = (evt.currentTarget as Document).documentElement;
  if (!el) return;
  // Walk up; if we find our shell, ignore
  let cur: HTMLElement | null = el;
  while (cur) {
    if (cur.classList?.contains("select-shell")) return;
    cur = cur.parentElement;
  }
  close();
};

onMounted(() => {
  document.addEventListener("pointerdown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", handleClickOutside);
});
</script>

<style scoped>
.select-shell {
  position: relative;
  width: 100%;
}

.select-caret {
  display: inline-flex;
  align-items: center;
  color: rgba(var(--text-muted), 0.9);
  pointer-events: none;
}


.select-menu {
  position: absolute;
  z-index: 60;
  margin-top: 8px;
  width: 100%;
  max-height: 280px;
  overflow: auto;
  border-radius: 14px;
  border: 2px solid rgb(var(--border));
  background: rgb(var(--surface));
  box-shadow: 
    0 0 0 1px rgba(var(--border), 0.4),
    0 8px 16px rgba(0, 0, 0, 0.28),
    0 24px 56px -16px rgba(0, 0, 0, 0.5);
  padding: 6px 0;
}

.select-item {
  padding: 10px 14px;
  font-size: 14px;
  color: rgb(var(--text));
  cursor: pointer;
  border-radius: 8px;
  margin: 0 6px;
  transition: background 120ms ease, color 120ms ease;
}

.select-item:hover,
.select-item.highlight {
  background: rgba(var(--accent-2), 0.18);
  color: rgb(var(--text));
}

.select-item.active {
  background: rgba(var(--accent-2), 0.24);
  color: rgb(var(--text));
  font-weight: 600;
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 120ms ease, transform 140ms ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
