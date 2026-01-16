<template>
  <div class="filters-container">
    <!-- Search bar - only visible on desktop (md+) -->
    <div class="hidden md:flex gap-2 items-center">
      <Input v-model="props.filters.search" type="search" :placeholder="searchPlaceholder" class="flex-1 h-10" />
      <Button variant="ghost" size="icon" @click="filtersVisible = !filtersVisible" aria-label="Toggle filters"
        class="h-10 w-10 shrink-0" :class="{ 'bg-[rgb(var(--accent))]': filtersVisible }">
        <Icon icon="lucide:filter" class="w-5 h-5" />
      </Button>
    </div>

    <!-- Collapsible filters section -->
    <div v-if="filtersVisible" class="filters-section">
      <!-- Row 1: Select filters -->
      <div class="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <!-- Vendors -->
        <div class="filter-group">
          <label class="filter-label">{{ labels.vendor }}</label>
          <Select v-model="props.filters.vendor">
            <SelectTrigger class="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{{ labels.all }}</SelectItem>
              <SelectItem v-for="vendor in props.vendorOptions" :key="vendor" :value="vendor">
                {{ vendor }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Materials -->
        <div class="filter-group">
          <label class="filter-label">{{ labels.material }}</label>
          <Select v-model="props.filters.material">
            <SelectTrigger class="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{{ labels.all }}</SelectItem>
              <SelectItem v-for="material in props.materialOptions" :key="material" :value="material">
                {{ material }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Color Type -->
        <div class="filter-group">
          <label class="filter-label">{{ labels.colorType }}</label>
          <Select v-model="props.filters.colorType">
            <SelectTrigger class="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{{ labels.all }}</SelectItem>
              <SelectItem value="single">{{ labels.singleColor }}</SelectItem>
              <SelectItem value="multi">{{ labels.multiColor }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Location -->
        <div class="filter-group">
          <label class="filter-label">{{ labels.location }}</label>
          <Select v-model="props.filters.location">
            <SelectTrigger class="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{{ labels.all }}</SelectItem>
              <SelectItem v-for="location in props.locationOptions" :key="location" :value="location">
                {{ location }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Source -->
        <div class="filter-group">
          <label class="filter-label">{{ labels.source }}</label>
          <Select v-model="props.filters.source">
            <SelectTrigger class="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{{ labels.all }}</SelectItem>
              <SelectItem value="spoolman">{{ labels.onlySpoolman }}</SelectItem>
              <SelectItem value="external">{{ labels.onlyExternal }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Row 2: Color Palette -->
      <div class="filter-group">
        <label class="filter-label">{{ labels.color }}</label>
        <ColorMap :colors="props.colorOptions" :selected="props.filters.color" @select="props.filters.color = $event" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ColorMap from "./ColorMap.vue";

const filtersVisible = ref(false);

const props = defineProps<{
  filters: {
    search: string;
    vendor: string;
    material: string;
    source: string;
    sortField: string;
    sortDir: string;
    color: string;
    colorType: string;
    location: string;
  };
  vendorOptions: string[];
  materialOptions: string[];
  colorOptions: string[];
  locationOptions: string[];
  searchPlaceholder: string;
  labels: {
    vendor: string;
    material: string;
    location: string;
    all: string;
    onlySpoolman: string;
    onlyExternal: string;
    color: string;
    colorType: string;
    singleColor: string;
    multiColor: string;
    source: string;
    sort: string;
    sortAsc: string;
    sortDesc: string;
    sortNameAsc: string;
    sortVendorAsc: string;
    sortMaterialAsc: string;
    sortSourceAsc: string;
    sortHueAsc: string;
    sortLuminanceAsc: string;
    sortLightnessAsc: string;
  };
}>();

const sortOptions = computed(() => [
  { value: "name", label: props.labels.sortNameAsc },
  { value: "vendor", label: props.labels.sortVendorAsc },
  { value: "material", label: props.labels.sortMaterialAsc },
  { value: "source", label: props.labels.sortSourceAsc },
  { value: "hue", label: props.labels.sortHueAsc },
  { value: "luminance", label: props.labels.sortLuminanceAsc },
  { value: "lightness", label: props.labels.sortLightnessAsc },
]);
</script>

<style scoped>
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: stretch;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--text-muted));
  min-height: 16px;
  line-height: 1.2;
}
</style>
