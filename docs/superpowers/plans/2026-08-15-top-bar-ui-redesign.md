# Top Bar UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Spoolman UI from cluttered layout to modern top-bar navigation with improved filter controls, better drawer, and responsive mobile support.

**Architecture:** Phased implementation (3 phases): (1) Top bar with new navbar design, (2) Filter modal component with all filter controls, (3) Drawer redesign with better UX. Each phase is independently testable and deployable.

**Tech Stack:** Vue 3, TypeScript, Tailwind CSS, Iconify

**Spec:** `docs/superpowers/specs/2026-08-15-top-bar-ui-redesign.md`

## Global Constraints

- Preserve all existing filter functionality
- Maintain dark/light theme support
- Keep RGB display visible
- Keep vendor logos visible
- Mobile-first responsive design
- No breaking changes to data/logic, only UI/styling
- All components use Tailwind CSS (no custom CSS where possible)

---

## File Structure

**Modified Files:**
- `src/components/AppNavbar.vue` — Top bar redesign with search, filter button, view toggle
- `src/views/FilamentsView.vue` — Remove FiltersBar usage, add FilterModal integration
- `src/components/FilamentBoard.vue` — Layout adjustments for full-width cards
- `src/components/FilamentCarousel.vue` — Layout adjustments, remove FiltersBar

**New Files:**
- `src/components/FilterModal.vue` — Modal overlay with all filter controls
- `src/components/PaletteDrawer.vue` — Refactored drawer with improved styling

**Removed/Hidden (from view):**
- `src/components/FiltersBar.vue` — Keep in codebase but don't render

---

## Phase 1: Top Bar Navigation

### Task 1: Redesign AppNavbar Component

**Files:**
- Modify: `src/components/AppNavbar.vue`

**Interfaces:**
- Consumes: `useI18n()`, `useRoute()`, `useRouter()`
- Produces: Updated navbar with:
  - Logo/brand section (left)
  - Search input (center)
  - Filter button (icon, opens modal)
  - View toggle buttons (Grid/Carousel)

**Steps:**

- [ ] **Step 1: Read current AppNavbar structure**

Read: `src/components/AppNavbar.vue` — understand current layout

- [ ] **Step 2: Redesign template structure**

Replace the template with new structure:

```vue
<template>
  <header class="top-bar sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-sm">
    <div class="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <!-- Left: Logo -->
      <div class="flex items-center gap-2 min-w-fit">
        <Icon icon="lucide:palette" class="w-5 h-5 text-[rgb(var(--accent))]" />
        <span class="hidden sm:inline font-semibold text-[rgb(var(--text))]">Spool Swatch</span>
      </div>

      <!-- Center: Search -->
      <div class="flex-1 max-w-md">
        <div class="relative">
          <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
          <input
            type="text"
            placeholder="Search filaments..."
            class="w-full bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded-lg pl-9 pr-4 py-2 text-sm text-[rgb(var(--text))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
            @input="$emit('search', $event.target.value)"
          />
        </div>
      </div>

      <!-- Right: Controls -->
      <div class="flex items-center gap-2">
        <!-- Filter Button -->
        <button
          @click="$emit('openFilterModal')"
          class="p-2 rounded-lg hover:bg-[rgb(var(--border))] transition text-[rgb(var(--text))] flex items-center gap-1.5"
          :title="t('filters.filter')"
        >
          <Icon icon="lucide:sliders-horizontal" class="w-5 h-5" />
          <span class="hidden sm:inline text-sm">Filters</span>
        </button>

        <!-- View Toggle -->
        <div class="flex items-center gap-1 bg-[rgb(var(--bg))] rounded-lg p-1">
          <button
            :class="[
              'p-1.5 rounded transition',
              viewMode === 'board'
                ? 'bg-[rgb(var(--accent))] text-white'
                : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
            ]"
            @click="$emit('changeView', 'board')"
            title="Board View"
          >
            <Icon icon="lucide:layout-grid" class="w-4 h-4" />
          </button>
          <button
            :class="[
              'p-1.5 rounded transition',
              viewMode === 'carousel'
                ? 'bg-[rgb(var(--accent))] text-white'
                : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
            ]"
            @click="$emit('changeView', 'carousel')"
            title="Carousel View"
          >
            <Icon icon="lucide:gallery-horizontal" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
```

- [ ] **Step 3: Update script setup**

Remove old filter toggle logic, add new emits:

```typescript
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

defineProps<{
  viewMode: 'board' | 'carousel';
}>();

defineEmits<{
  (e: 'changeView', mode: 'board' | 'carousel'): void;
  (e: 'openFilterModal'): void;
  (e: 'search', query: string): void;
}>();
</script>
```

- [ ] **Step 4: Add responsive styles**

```vue
<style scoped>
.top-bar {
  background: linear-gradient(to right, rgb(var(--surface)), rgb(var(--surface)));
}

@media (max-width: 640px) {
  .top-bar {
    padding: 0.5rem 0;
  }
}
</style>
```

- [ ] **Step 5: Update MainApp.vue to use new navbar**

Modify `src/views/MainApp.vue` — remove old props, add new events:

```vue
<AppNavbar
  :view-mode="viewMode"
  @changeView="viewMode = $event"
  @openFilterModal="filterModalOpen = true"
  @search="handleSearch"
/>
```

- [ ] **Step 6: Test in browser**

Run: `npm run dev`
- Check navbar renders correctly
- Verify responsive on mobile
- Check all buttons work
- Verify styling matches design

- [ ] **Step 7: Commit**

```bash
git add src/components/AppNavbar.vue src/views/MainApp.vue
git commit -m "feat: redesign top bar navigation with search and filter button"
```

---

### Task 2: Update Main Content Layout for Full Width

**Files:**
- Modify: `src/components/FilamentBoard.vue`
- Modify: `src/components/FilamentCarousel.vue`
- Modify: `src/views/FilamentsView.vue`

**Steps:**

- [ ] **Step 1: Add top padding to FilamentsView**

In `src/views/FilamentsView.vue`, add padding for fixed navbar:

```vue
<div class="flex flex-1 flex-col gap-3 sm:gap-6 min-h-0 pt-0">
  <!-- Navbar is fixed, no extra padding needed in content -->
</div>
```

- [ ] **Step 2: Update FilamentBoard grid**

Increase card size and improve spacing:

```vue
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
  <!-- Cards now have more space -->
</div>
```

- [ ] **Step 3: Update FilamentCarousel layout**

Adjust carousel for full-width:

```vue
<div class="carousel-shell relative px-4 sm:px-6">
  <!-- Full width with padding -->
</div>
```

- [ ] **Step 4: Test layout**

Run: `npm run dev`
- Check cards are larger
- Verify responsive grid
- Check no horizontal scroll

- [ ] **Step 5: Commit**

```bash
git add src/components/FilamentBoard.vue src/components/FilamentCarousel.vue src/views/FilamentsView.vue
git commit -m "feat: update layout for full-width cards with improved spacing"
```

---

## Phase 2: Filter Modal

### Task 3: Create FilterModal Component

**Files:**
- Create: `src/components/FilterModal.vue`

**Interfaces:**
- Consumes: Filter state from parent (vendor, material, color, location, source)
- Produces: Modal component that emits filter changes

**Steps:**

- [ ] **Step 1: Create component template**

Create `src/components/FilterModal.vue`:

```vue
<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      @click="$emit('close')"
    >
      <div
        class="bg-[rgb(var(--surface))] rounded-lg max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between gap-4 px-6 py-4 border-b border-[rgb(var(--border))]">
          <h2 class="text-lg font-semibold text-[rgb(var(--text))]">{{ t('filters.filter') }}</h2>
          <button
            @click="$emit('close')"
            class="p-1 hover:bg-[rgb(var(--border))] rounded transition text-[rgb(var(--text-muted))]"
          >
            <Icon icon="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Content (Scrollable) -->
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <!-- Vendor Filter -->
          <section>
            <h3 class="text-sm font-semibold text-[rgb(var(--text))] mb-3 uppercase tracking-wider">
              {{ t('filters.vendor') }}
            </h3>
            <div class="space-y-2">
              <label
                v-for="vendor in vendorOptions"
                :key="vendor"
                class="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  :checked="filters.vendor.includes(vendor)"
                  @change="toggleFilter('vendor', vendor)"
                  class="rounded border-[rgb(var(--border))] text-[rgb(var(--accent))]"
                />
                <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent))]">
                  {{ vendor }}
                </span>
              </label>
            </div>
          </section>

          <!-- Material Filter -->
          <section>
            <h3 class="text-sm font-semibold text-[rgb(var(--text))] mb-3 uppercase tracking-wider">
              {{ t('filters.material') }}
            </h3>
            <div class="space-y-2">
              <label
                v-for="material in materialOptions"
                :key="material"
                class="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  :checked="filters.material.includes(material)"
                  @change="toggleFilter('material', material)"
                  class="rounded border-[rgb(var(--border))] text-[rgb(var(--accent))]"
                />
                <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent))]">
                  {{ material }}
                </span>
              </label>
            </div>
          </section>

          <!-- Location Filter -->
          <section>
            <h3 class="text-sm font-semibold text-[rgb(var(--text))] mb-3 uppercase tracking-wider">
              {{ t('filters.location') }}
            </h3>
            <div class="space-y-2">
              <label
                v-for="location in locationOptions"
                :key="location"
                class="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  :checked="filters.location.includes(location)"
                  @change="toggleFilter('location', location)"
                  class="rounded border-[rgb(var(--border))] text-[rgb(var(--accent))]"
                />
                <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent))]">
                  {{ location }}
                </span>
              </label>
            </div>
          </section>

          <!-- Source Filter -->
          <section>
            <h3 class="text-sm font-semibold text-[rgb(var(--text))] mb-3 uppercase tracking-wider">
              {{ t('filters.source') }}
            </h3>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="source"
                  value="all"
                  :checked="filters.source === 'all'"
                  @change="filters.source = 'all'"
                  class="rounded-full text-[rgb(var(--accent))]"
                />
                <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent))]">
                  {{ t('filters.all') }}
                </span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="source"
                  value="spoolman"
                  :checked="filters.source === 'spoolman'"
                  @change="filters.source = 'spoolman'"
                  class="rounded-full text-[rgb(var(--accent))]"
                />
                <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent))]">
                  {{ t('filters.onlySpoolman') }}
                </span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="source"
                  value="external"
                  :checked="filters.source === 'external'"
                  @change="filters.source = 'external'"
                  class="rounded-full text-[rgb(var(--accent))]"
                />
                <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent))]">
                  {{ t('filters.onlyExternal') }}
                </span>
              </label>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="flex gap-3 px-6 py-4 border-t border-[rgb(var(--border))]">
          <button
            @click="resetFilters"
            class="flex-1 px-4 py-2 rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--text))] hover:bg-[rgb(var(--border))] transition text-sm font-medium"
          >
            {{ t('actions.reset') }}
          </button>
          <button
            @click="applyFilters"
            class="flex-1 px-4 py-2 rounded-lg bg-[rgb(var(--accent))] text-white hover:opacity-90 transition text-sm font-medium"
          >
            {{ t('actions.save') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';

interface FilterState {
  vendor: string[];
  material: string[];
  location: string[];
  source: 'all' | 'spoolman' | 'external';
}

const props = defineProps<{
  isOpen: boolean;
  initialFilters: FilterState;
  vendorOptions: string[];
  materialOptions: string[];
  locationOptions: string[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', filters: FilterState): void;
}>();

const { t } = useI18n();

const filters = ref<FilterState>({ ...props.initialFilters });

const toggleFilter = (type: keyof Omit<FilterState, 'source'>, value: string) => {
  const arr = filters.value[type];
  const idx = arr.indexOf(value);
  if (idx > -1) {
    arr.splice(idx, 1);
  } else {
    arr.push(value);
  }
};

const resetFilters = () => {
  filters.value = {
    vendor: [],
    material: [],
    location: [],
    source: 'all',
  };
};

const applyFilters = () => {
  emit('apply', filters.value);
  emit('close');
};
</script>

<style scoped>
input[type='checkbox'],
input[type='radio'] {
  cursor: pointer;
}
</style>
```

- [ ] **Step 2: Add FilterModal to MainApp**

Update `src/views/MainApp.vue`:

```typescript
const filterModalOpen = ref(false);

// In provide section:
provide('filterModalOpen', filterModalOpen);
```

Add to template before FilamentDetailPanel:

```vue
<FilterModal
  :is-open="filterModalOpen"
  :initial-filters="currentFilters"
  :vendor-options="vendorOptions"
  :material-options="materialOptions"
  :location-options="locationOptions"
  @close="filterModalOpen = false"
  @apply="applyFilterModal"
/>
```

- [ ] **Step 3: Wire up filter application**

Add method in MainApp:

```typescript
const applyFilterModal = (newFilters: FilterState) => {
  filters.value = newFilters;
};
```

- [ ] **Step 4: Test modal**

Run: `npm run dev`
- Click filter button in navbar
- Modal should open
- Toggle some filters
- Click Apply
- Filters should be applied

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterModal.vue src/views/MainApp.vue
git commit -m "feat: add filter modal component"
```

---

### Task 4: Hide/Remove FiltersBar

**Files:**
- Modify: `src/views/FilamentsView.vue`

**Steps:**

- [ ] **Step 1: Remove FiltersBar from template**

In `src/views/FilamentsView.vue`, find and remove or hide:

```vue
<!-- REMOVE THIS SECTION -->
<div class="control-grid hidden md:flex">
  <div class="control-card glass">
    <FiltersBar ... />
  </div>
</div>
```

- [ ] **Step 2: Test layout**

Run: `npm run dev`
- Verify FiltersBar is gone
- Verify filter modal works

- [ ] **Step 3: Commit**

```bash
git add src/views/FilamentsView.vue
git commit -m "feat: remove filters bar, use modal instead"
```

---

## Phase 3: Drawer Redesign

### Task 5: Refactor PaletteDrawer Component

**Files:**
- Modify: `src/components/AppNavbar.vue` (add palette drawer toggle)
- Create: `src/components/PaletteDrawer.vue` (new refactored version)

**Steps:**

- [ ] **Step 1: Create refactored PaletteDrawer**

Create new `src/components/PaletteDrawer.vue`:

```vue
<template>
  <aside
    :class="[
      'palette-drawer',
      'fixed right-0 top-0 h-screen z-30',
      'w-72 bg-[rgb(var(--surface))] border-l border-[rgb(var(--border))]',
      'transition-transform duration-300 ease-in-out',
      'flex flex-col',
      isOpen ? 'translate-x-0' : 'translate-x-full',
      'md:relative md:translate-x-0 md:top-auto md:border-l md:border-[rgb(var(--border))]'
    ]"
  >
    <!-- Header -->
    <div class="flex-shrink-0 px-6 py-4 border-b border-[rgb(var(--border))] flex items-center justify-between">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text))]">
        📌 {{ t('info.palette') }}
      </h3>
      <button
        @click="$emit('close')"
        class="md:hidden p-1 hover:bg-[rgb(var(--border))] rounded transition text-[rgb(var(--text-muted))]"
      >
        <Icon icon="lucide:x" class="w-5 h-5" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-4 py-4">
      <div v-if="pinnedItems.length" class="space-y-2">
        <div
          v-for="item in pinnedItems"
          :key="item.id"
          class="group flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--bg))] hover:bg-[rgb(var(--border))] transition"
        >
          <!-- Color Dot -->
          <div
            class="h-8 w-8 rounded-full border-2 border-[rgb(var(--border))] shadow-sm flex-shrink-0"
            :style="{ backgroundColor: item.colorHex }"
            :title="item.colorHex"
          />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-[rgb(var(--text))] truncate">{{ item.name }}</p>
            <p class="text-[10px] text-[rgb(var(--text-muted))] font-mono">{{ item.colorHex }}</p>
          </div>

          <!-- Remove Button -->
          <button
            @click="$emit('removePin', item.id)"
            class="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition text-red-500"
          >
            <Icon icon="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center h-full text-center">
        <Icon icon="lucide:palette" class="w-12 h-12 text-[rgb(var(--text-muted))] opacity-50 mb-3" />
        <p class="text-sm font-medium text-[rgb(var(--text))]">{{ t('info.paletteEmpty') }}</p>
        <p class="text-xs text-[rgb(var(--text-muted))] mt-1">{{ t('info.paletteHint') }}</p>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="pinnedItems.length" class="flex-shrink-0 px-4 py-4 border-t border-[rgb(var(--border))]">
      <button
        @click="$emit('clearPalette')"
        class="w-full px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition text-sm font-medium flex items-center justify-center gap-2"
      >
        <Icon icon="lucide:trash-2" class="w-4 h-4" />
        {{ t('actions.clearPalette') }}
      </button>
    </div>
  </aside>

  <!-- Mobile Overlay -->
  <div
    v-if="isOpen"
    class="md:hidden fixed inset-0 z-20 bg-black/50"
    @click="$emit('close')"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import type { FilamentCard } from '@/composables/useFilaments';

defineProps<{
  isOpen: boolean;
  pinnedItems: FilamentCard[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'removePin', id: string): void;
  (e: 'clearPalette'): void;
}>();

const { t } = useI18n();
</script>

<style scoped>
.palette-drawer {
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  .palette-drawer {
    box-shadow: -2px 0 12px rgba(0, 0, 0, 0.3);
  }
}
</style>
```

- [ ] **Step 2: Update MainApp to use new drawer**

Update `src/views/MainApp.vue`:

```vue
<PaletteDrawer
  :is-open="paletteOpen"
  :pinned-items="pinnedItems"
  @close="paletteOpen = false"
  @removePin="removePinFromDrawer"
  @clearPalette="clearPalette"
/>
```

Add method:

```typescript
const removePinFromDrawer = (id: string) => {
  togglePin({ id });
};
```

- [ ] **Step 3: Add drawer toggle to navbar**

Update AppNavbar to add palette button:

```vue
<!-- In template right section, after filter button -->
<button
  @click="$emit('openPalette')"
  class="p-2 rounded-lg hover:bg-[rgb(var(--border))] transition text-[rgb(var(--text))] relative"
  :title="t('info.palette')"
>
  <Icon icon="lucide:bookmark" class="w-5 h-5" />
  <span v-if="pinnedCount > 0" class="absolute top-1 right-1 bg-[rgb(var(--accent))] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-semibold">
    {{ pinnedCount }}
  </span>
</button>
```

And add emit:

```typescript
defineEmits<{
  (e: 'changeView', mode: 'board' | 'carousel'): void;
  (e: 'openFilterModal'): void;
  (e: 'openPalette'): void;
  (e: 'search', query: string): void;
}>();
```

- [ ] **Step 4: Test drawer**

Run: `npm run dev`
- Click palette icon in navbar
- Drawer should slide in on mobile, visible on desktop
- Pin some filaments
- Remove pins
- Clear all

- [ ] **Step 5: Commit**

```bash
git add src/components/PaletteDrawer.vue src/components/AppNavbar.vue src/views/MainApp.vue
git commit -m "feat: redesign palette drawer with improved mobile UX"
```

---

### Task 6: Responsive Testing & Polish

**Files:**
- Test: All modified components

**Steps:**

- [ ] **Step 1: Test on desktop (1440px+)**

Run: `npm run dev`
- Open browser DevTools
- Set viewport to 1440px
- Verify:
  - Top bar fully visible with all controls
  - Filter modal centered
  - Drawer visible on right side
  - Cards in grid layout (3-4 columns)
  - No overflow

- [ ] **Step 2: Test on tablet (768px)**

Resize viewport to 768px:
- Verify:
  - Top bar still usable
  - Filter modal still fits
  - Drawer collapsible
  - Cards in 2-column grid
  - No horizontal scroll

- [ ] **Step 3: Test on mobile (375px)**

Resize viewport to 375px:
- Verify:
  - Top bar responsive
  - Search bar readable
  - Filter button accessible
  - Drawer slides from right
  - Cards single column
  - All buttons touch-friendly (min 44px)

- [ ] **Step 4: Test modal interactions**

- Open filter modal
- Toggle several filters
- Click Reset
- Click Apply
- Filters should update view

- [ ] **Step 5: Test palette drawer**

- Pin some filaments
- Icon badge shows count
- Click palette button
- Drawer opens
- Remove item from drawer
- Clear all

- [ ] **Step 6: Test theme switching**

- Toggle dark/light theme
- All colors should adjust
- Contrast should be maintained

- [ ] **Step 7: Commit any polish changes**

```bash
git add .
git commit -m "test: verify responsive design and interactions"
```

---

### Task 7: Final Integration & Cleanup

**Files:**
- Verify: All components integrated
- Cleanup: Remove unused code

**Steps:**

- [ ] **Step 1: Remove old FiltersBar component from imports**

Search `src/` for FiltersBar imports and remove if they exist.

- [ ] **Step 2: Run full app test**

Run: `npm run dev`
- Navigate all pages
- Test all filter combinations
- Pin/unpin filaments
- Switch views
- Change theme
- Resize window

- [ ] **Step 3: Check for console errors**

- Open DevTools console
- Should be no errors
- Check for warnings

- [ ] **Step 4: Verify build succeeds**

Run: `npm run build`
- Should complete without errors
- Check bundle size hasn't increased significantly

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete top bar UI redesign with modal filters and improved drawer"
```

---

## Testing Checklist

After all tasks complete, verify:

- [ ] Top bar renders on all breakpoints
- [ ] Filter modal opens/closes smoothly
- [ ] Filters apply and update view correctly
- [ ] Palette drawer shows/hides properly
- [ ] Mobile: no layout overflow
- [ ] Desktop: drawer always visible
- [ ] Keyboard navigation works (Tab, Esc)
- [ ] Dark/light theme works
- [ ] No console errors/warnings
- [ ] Build succeeds
- [ ] Cards display with proper spacing
- [ ] All original functionality preserved

---

## Success Criteria Met

✅ UI looks modern and clean  
✅ All filters discoverable in modal  
✅ Mobile layout fully responsive  
✅ Drawer more prominent and useful  
✅ All functionality preserved  
✅ No visual bugs or regressions  
✅ Smooth animations and interactions  
