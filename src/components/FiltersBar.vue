<template>
  <div class="grid gap-4 md:grid-cols-[1.2fr,1fr,1fr]">
    <Input
      v-model="filters.search"
      type="search"
      :placeholder="searchPlaceholder"
    />

    <div class="pill-row pill-row--vendor">
      <Toggle :active="filters.vendor === 'all'" @click="filters.vendor = 'all'">
        {{ labels.all }} · {{ labels.vendor }}
      </Toggle>
      <Toggle
        v-for="vendor in vendorOptions"
        :key="vendor"
        :active="filters.vendor === vendor"
        @click="filters.vendor = vendor"
      >
        {{ vendor }}
      </Toggle>
    </div>

    <div class="pill-row pill-row--material">
      <Toggle :active="filters.material === 'all'" @click="filters.material = 'all'">
        {{ labels.all }} · {{ labels.material }}
      </Toggle>
      <Toggle
        v-for="material in materialOptions"
        :key="material"
        :active="filters.material === material"
        @click="filters.material = material"
      >
        {{ material }}
      </Toggle>
    </div>
  </div>

  <div class="mt-4 grid gap-4 md:grid-cols-[1.2fr,1fr]">
    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
        {{ labels.color }}
      </span>
      <ColorMap
        :options="colorOptions"
        :active="filters.color"
        @select="filters.color = $event"
      />
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
        {{ labels.source }}
      </span>
      <div class="flex flex-wrap gap-2">
        <Toggle :active="filters.source === 'all'" @click="filters.source = 'all'">
          {{ labels.all }}
        </Toggle>
        <Toggle
          :active="filters.source === 'spoolman'"
          @click="filters.source = 'spoolman'"
        >
          {{ labels.onlySpoolman }}
        </Toggle>
        <Toggle
          :active="filters.source === 'external'"
          @click="filters.source = 'external'"
        >
          {{ labels.onlyExternal }}
        </Toggle>
      </div>
    </div>
  </div>

  <div class="mt-4 flex flex-wrap items-center gap-2">
    <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
      {{ labels.sort }}
    </span>
    <Select v-model="filters.sortField" class="w-44">
      <option value="name">{{ labels.sortNameAsc }}</option>
      <option value="luminance">{{ labels.sortLuminanceAsc }}</option>
      <option value="lightness">{{ labels.sortLightnessAsc }}</option>
    </Select>
    <div class="flex gap-2">
      <Toggle :active="filters.sortDir === 'asc'" @click="filters.sortDir = 'asc'">
        {{ labels.sortAsc }}
      </Toggle>
      <Toggle :active="filters.sortDir === 'desc'" @click="filters.sortDir = 'desc'">
        {{ labels.sortDesc }}
      </Toggle>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from "./ui/Input.vue";
import Select from "./ui/Select.vue";
import Toggle from "./ui/Toggle.vue";
import ColorMap from "./ColorMap.vue";

defineProps<{
  filters: {
    search: string;
    vendor: string;
    material: string;
    source: string;
    sortField: string;
    sortDir: string;
    color: string;
  };
  vendorOptions: string[];
  materialOptions: string[];
  colorOptions: string[];
  searchPlaceholder: string;
  labels: {
    vendor: string;
    material: string;
    all: string;
    onlySpoolman: string;
    onlyExternal: string;
    color: string;
    source: string;
    sort: string;
    sortAsc: string;
    sortDesc: string;
    sortNameAsc: string;
    sortLuminanceAsc: string;
    sortLightnessAsc: string;
  };
}>();
</script>
