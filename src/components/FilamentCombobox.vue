<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { FilamentCard } from '@/composables/useFilaments';

const props = defineProps<{
  filaments: FilamentCard[];
  modelValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const searchQuery = ref('');
const isOpen = ref(false);

const filteredFilaments = computed(() => {
  if (!searchQuery.value.trim()) return props.filaments;
  
  const query = searchQuery.value.toLowerCase();
  return props.filaments.filter(f =>
    f.material?.toLowerCase().includes(query) ||
    f.vendor?.toLowerCase().includes(query) ||
    f.colorName?.toLowerCase().includes(query) ||
    f.name?.toLowerCase().includes(query)
  );
});

const selectedFilament = computed(() => {
  return props.filaments.find(f => f.id === props.modelValue);
});

const handleSelect = (filamentId: string) => {
  emit('update:modelValue', filamentId);
  searchQuery.value = '';
  isOpen.value = false;
};

const handleClear = () => {
  emit('update:modelValue', '');
  searchQuery.value = '';
};
</script>

<template>
  <div class="relative w-full">
    <!-- Input Field -->
    <div class="relative">
      <div
        v-if="selectedFilament"
        class="absolute left-2 top-2.5 w-4 h-4 rounded border"
        :style="{ backgroundColor: selectedFilament.colorHex }"
      />
      <Input
        :value="searchQuery"
        @input="(e: Event) => searchQuery = (e.target as HTMLInputElement).value"
        @focus="isOpen = true"
        :placeholder="selectedFilament ? `${selectedFilament.vendor} · ${selectedFilament.material}` : 'Suchen nach Filament...'"
        :class="selectedFilament ? 'pl-8' : ''"
      />
      <Button
        v-if="selectedFilament"
        variant="ghost"
        size="sm"
        class="absolute right-1 top-1 h-7 w-7 p-0"
        @click="handleClear"
      >
        <Icon icon="lucide:x" class="w-4 h-4" />
      </Button>
    </div>

    <!-- Dropdown List -->
    <div
      v-if="isOpen && filteredFilaments.length > 0"
      class="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-md max-h-72 overflow-y-auto"
    >
      <div
        v-for="filament in filteredFilaments"
        :key="filament.id"
        class="px-3 py-2 cursor-pointer hover:bg-accent border-b last:border-b-0 flex items-center gap-3"
        @click="handleSelect(filament.id)"
      >
        <div
          class="w-4 h-4 rounded border shrink-0"
          :style="{ backgroundColor: filament.colorHex }"
        />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium">{{ filament.vendor }} · {{ filament.material }}</div>
          <div class="text-xs text-muted-foreground">{{ filament.colorName }}</div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div
      v-if="isOpen && filteredFilaments.length === 0 && searchQuery"
      class="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-md p-3 text-center text-sm text-muted-foreground"
    >
      Keine Filamente gefunden
    </div>

    <!-- Close dropdown when clicking outside -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    />
  </div>
</template>
