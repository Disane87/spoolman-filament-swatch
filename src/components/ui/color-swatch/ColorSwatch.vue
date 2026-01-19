<script setup lang="ts">
import { computed } from 'vue';
import { getSwatchStyle, getFlatSwatchStyle, type MultiColorDirection } from '@/lib/swatchUtils';

const props = withDefaults(defineProps<{
  colorHex: string;
  material?: string;
  multiColors?: string[];
  direction?: MultiColorDirection;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  flat?: boolean;
  rounded?: 'full' | 'lg' | 'md';
  ariaLabel?: string;
}>(), {
  material: 'pla',
  size: 'md',
  flat: false,
  rounded: 'full',
});

const swatchStyle = computed(() => {
  if (props.flat) {
    return getFlatSwatchStyle(props.colorHex, props.multiColors, props.direction);
  }
  return getSwatchStyle(props.colorHex, props.material, props.multiColors, props.direction);
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-32 h-32 sm:w-40 sm:h-40',
    xl: 'h-[180px] w-full',
  };
  return sizes[props.size];
});

const roundedClasses = computed(() => {
  const rounded = {
    full: 'rounded-full',
    lg: 'rounded-2xl',
    md: 'rounded-xl',
  };
  return rounded[props.rounded];
});
</script>

<template>
  <div
    class="color-swatch"
    :class="[sizeClasses, roundedClasses, { 'swatch-shadow': !flat }]"
    :style="swatchStyle"
    role="img"
    :aria-label="ariaLabel || `Color: ${colorHex}`"
  >
    <slot />
  </div>
</template>

<style scoped>
.color-swatch {
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.swatch-shadow {
  box-shadow: 0 25px 60px -30px rgba(0, 0, 0, 0.6);
}

.color-swatch:hover {
  transform: scale(1.02);
}
</style>
