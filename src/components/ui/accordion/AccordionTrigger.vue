<script setup lang="ts">
import { AccordionHeader, AccordionTrigger, type AccordionTriggerProps } from 'radix-vue'
import { Icon } from '@iconify/vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      v-bind="props"
      :class="cn(
        'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        props.class,
      )"
    >
      <slot />
      <Icon icon="lucide:chevron-down" class="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))] transition-transform duration-200" />
    </AccordionTrigger>
  </AccordionHeader>
</template>
