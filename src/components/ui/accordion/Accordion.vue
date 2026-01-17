<script setup lang="ts">
import { AccordionRoot, type AccordionRootEmits, type AccordionRootProps, useForwardPropsEmits } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<AccordionRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<AccordionRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <AccordionRoot
    v-bind="forwarded"
    :class="cn('w-full', props.class)"
  >
    <slot />
  </AccordionRoot>
</template>
