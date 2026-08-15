# Top Bar UI Redesign Specification

**Date:** 2026-08-15  
**Status:** Design Approved  
**Implementation:** Phased (3 phases)

---

## Overview

Redesign the Spoolman Filament Swatch UI from a cluttered layout to a modern, responsive top-bar navigation with:
- Prominent filter controls in a dedicated modal
- Improved visual hierarchy and spacing
- Better mobile responsiveness
- Enhanced drawer (palette) with better UX

**Goal:** Cleaner, more intuitive UI while preserving all functionality.

---

## Current State Problems

- Filter bar is cramped and sometimes hidden
- Too many UI elements competing for attention
- Mobile layout breaks with too many controls
- Drawer is hard to notice and interact with
- Overall visual design is dated and lacks polish

---

## New Architecture

### Phase 1: Top Bar Navigation
Create modern header with:
- Logo/Brand (left)
- Search bar (center, prominent)
- Filter button (icon, opens modal)
- View toggle (Grid/Carousel, right)

### Phase 2: Filter Modal & Improvements
- Dedicated modal for all filter controls
- Better organized filter sections
- Reset/Apply buttons
- Smooth animations

### Phase 3: Drawer Redesign
- Larger, more visible palette chips
- Better spacing and padding
- Mobile: sticky bar at bottom
- Desktop: side drawer with improved styling

---

## Component Changes

### 1. AppNavbar.vue (REDESIGN)

**New Structure:**
```vue
<template>
  <nav class="top-bar">
    <!-- Left: Logo -->
    <div class="top-bar-logo">
      <Icon icon="lucide:palette" />
      <span>Spool Swatch</span>
    </div>

    <!-- Center: Search -->
    <input type="text" class="top-bar-search" placeholder="🔍 Search filaments...">

    <!-- Right: Controls -->
    <div class="top-bar-controls">
      <button @click="openFilterModal" class="filter-button">
        <Icon icon="lucide:sliders-horizontal" />
        Filters
      </button>
      <div class="view-toggle">
        <button :class="{active: viewMode === 'grid'}" @click="viewMode = 'grid'">
          <Icon icon="lucide:layout-grid" />
        </button>
        <button :class="{active: viewMode === 'carousel'}" @click="viewMode = 'carousel'">
          <Icon icon="lucide:gallery-horizontal" />
        </button>
      </div>
    </div>
  </nav>
</template>
```

**Styling:**
- Height: 56px (mobile), 64px (desktop)
- Background: gradient (dark mode)
- Sticky position (fixed to top)
- Gap between elements: 16px
- Responsive: Hamburger menu on mobile if needed

---

### 2. FilterModal.vue (NEW COMPONENT)

**New Component** - Modal overlay for all filter controls.

**Structure:**
```vue
<template>
  <div v-if="isOpen" class="filter-modal-overlay" @click="close">
    <div class="filter-modal" @click.stop>
      <!-- Header -->
      <div class="filter-modal-header">
        <h2>Filters & Settings</h2>
        <button @click="close" class="close-button">✕</button>
      </div>

      <!-- Content -->
      <div class="filter-modal-content">
        <!-- Vendor Filter -->
        <section>
          <h3>Vendor</h3>
          <div class="checkbox-group">
            <label v-for="vendor in vendors" :key="vendor">
              <input type="checkbox" v-model="filters.vendor" :value="vendor">
              {{ vendor }}
            </label>
          </div>
        </section>

        <!-- Material Filter -->
        <section>
          <h3>Material</h3>
          <div class="checkbox-group">
            <label v-for="material in materials" :key="material">
              <input type="checkbox" v-model="filters.material" :value="material">
              {{ material }}
            </label>
          </div>
        </section>

        <!-- Color Filter (Palette) -->
        <section>
          <h3>Color</h3>
          <div class="color-palette">
            <!-- Color chips -->
          </div>
        </section>

        <!-- Location Filter -->
        <section>
          <h3>Location</h3>
          <div class="checkbox-group">
            <label v-for="location in locations" :key="location">
              <input type="checkbox" v-model="filters.location" :value="location">
              {{ location }}
            </label>
          </div>
        </section>

        <!-- Source Filter -->
        <section>
          <h3>Source</h3>
          <div class="radio-group">
            <label>
              <input type="radio" v-model="filters.source" value="all">
              All Sources
            </label>
            <label>
              <input type="radio" v-model="filters.source" value="spoolman">
              Spoolman Only
            </label>
            <label>
              <input type="radio" v-model="filters.source" value="external">
              External DB Only
            </label>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="filter-modal-footer">
        <button @click="resetFilters" class="btn-secondary">Reset</button>
        <button @click="applyFilters" class="btn-primary">Apply</button>
      </div>
    </div>
  </div>
</template>
```

**Styling:**
- Modal width: 90vw (mobile), 400px (desktop)
- Center on screen with overlay
- Max-height: 80vh with scrollable content
- Smooth fade-in animation
- Touch-friendly checkboxes

---

### 3. PaletteDrawer.vue (REDESIGN)

**Current:** Sidebar on right  
**New:** Better styled, with improvements:

```vue
<template>
  <aside class="palette-drawer" :class="{open: isOpen}">
    <!-- Header -->
    <div class="drawer-header">
      <h3>📌 My Palette</h3>
      <button @click="$emit('close')" class="close-button">✕</button>
    </div>

    <!-- Content -->
    <div class="drawer-content">
      <div v-if="pinnedItems.length" class="palette-chips">
        <div v-for="item in pinnedItems" :key="item.id" class="palette-chip">
          <div class="color-dot" :style="{background: item.colorHex}"></div>
          <div class="chip-info">
            <div class="chip-name">{{ item.name }}</div>
            <div class="chip-hex">{{ item.colorHex }}</div>
          </div>
          <button @click="removePin(item.id)" class="remove-btn">✕</button>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>No pinned colors yet</p>
        <p class="hint">Pin your favorites to build a palette</p>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="pinnedItems.length" class="drawer-footer">
      <button @click="clearPalette" class="btn-clear">
        <Icon icon="lucide:trash-2" />
        Clear All
      </button>
    </div>
  </aside>
</template>
```

**Styling:**
- Desktop: Right sidebar, width 250px, always visible
- Mobile: Sticky bottom sheet (transform: translateY)
- Chip: better padding, shadow, hover effect
- Responsive: drawer slides from right (desktop) or bottom (mobile)

---

### 4. FilamentBoard.vue & FilamentCarousel.vue (LAYOUT ADJUSTMENTS)

**Changes:**
- Remove FiltersBar (moved to modal)
- Larger grid/carousel cards (more padding, better spacing)
- Better responsive grid (3 cols desktop, 2 tablet, 1 mobile)
- Add top margin for fixed navbar

---

## File Structure Changes

**New Files:**
- `src/components/FilterModal.vue`
- `src/components/PaletteDrawer.vue` (refactored from drawer)

**Modified Files:**
- `src/components/AppNavbar.vue`
- `src/components/FilamentBoard.vue`
- `src/components/FilamentCarousel.vue`
- `src/views/FilamentsView.vue`
- `src/views/MainApp.vue`

**Removed/Hidden:**
- `src/components/FiltersBar.vue` (moved to modal)

---

## Responsive Design

### Desktop (> 1024px)
- Top bar: full width, fixed
- Filter modal: centered overlay
- Drawer: right sidebar, always visible
- Main content: full width with padding

### Tablet (768px - 1024px)
- Top bar: full width, fixed
- Filter modal: full height, right-aligned
- Drawer: collapsible sidebar
- Main content: adjusted padding

### Mobile (< 768px)
- Top bar: full width, fixed
- Filter icon: hamburger/filter button
- Filter modal: full screen overlay
- Drawer: sticky bottom sheet
- Cards: full width, stacked

---

## Animations & Transitions

- Modal fade-in: 200ms ease-out
- Drawer slide: 300ms ease-in-out
- Button hover: 150ms ease-out (scale + color)
- Card hover: 200ms ease-out (translate + shadow)

---

## Accessibility

- All buttons have proper `aria-label`
- Modal has `role="dialog"` and `aria-modal="true"`
- Keyboard navigation: Tab through filters
- Esc key closes modal
- Focus management on open/close
- Color not only indicator (icons + text)

---

## Implementation Phases

### Phase 1: Top Bar Navigation
1. Redesign AppNavbar
2. Update grid/carousel toggle styling
3. Test responsive on all breakpoints
4. **Commit:** "feat: redesign top bar navigation"

### Phase 2: Filter Modal
1. Create FilterModal component
2. Move all filters from FiltersBar to modal
3. Wire up modal open/close
4. Update filter logic
5. **Commit:** "feat: add filter modal component"

### Phase 3: Drawer Redesign
1. Refactor PaletteDrawer styling
2. Improve mobile responsiveness
3. Add better animations
4. Test on all devices
5. **Commit:** "feat: redesign palette drawer with better UX"

---

## Testing Checklist

- [ ] Top bar renders correctly on all breakpoints
- [ ] Filter modal opens/closes smoothly
- [ ] Filters apply correctly and update view
- [ ] Drawer shows/hides pinned items correctly
- [ ] Mobile: all controls accessible without scrolling
- [ ] Desktop: drawer always visible and usable
- [ ] Keyboard navigation works (Tab, Esc)
- [ ] No visual regressions on cards
- [ ] Animations smooth (no jank)

---

## Success Criteria

✅ UI looks modern and clean  
✅ All filters discoverable and easy to use  
✅ Mobile layout responsive without overflow  
✅ Drawer more prominent and usable  
✅ All original functionality preserved  
✅ No visual bugs or regressions  

---

## Notes

- Keep RGB display visible (already implemented)
- Keep vendor logos visible (already implemented)
- Maintain dark/light theme support
- No changes to card data or logic, only styling
