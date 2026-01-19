import { computed, reactive, ref, watch } from "vue";
import {
  fetchSpoolmanFilaments,
  fetchSpoolmanMaterials,
  fetchSpoolmanVendors,
  fetchSpoolmanLocations,
  fetchSpoolmanSpools,
  type SpoolmanFilament,
  type SpoolmanMaterial,
  type SpoolmanVendor,
  type SpoolmanSpool,
} from "../api/spoolman";
import {
  fetchExternalFilaments,
  type ExternalFilament,
} from "../api/external-filaments";
import {
  fetchSpoolmanDBFilaments,
  fetchSpoolmanDBMaterials,
  type SpoolmanDBFilament,
  type SpoolmanDBMaterial,
} from "../api/spoolmandb";
import { useSpoolmanUrl } from "./useSpoolmanUrl";
import { ensureHex, getColorMetrics } from "@/lib/colorUtils";

export type FilamentCard = {
  id: string;
  name: string;
  vendor: string;
  material: string;
  colorHex: string;
  colorName: string;
  source: "spoolman" | "external";
  multiColorHexes?: string[];
  multiColorDirection?: "coaxial" | "longitudinal";
  price?: number | null;
  density?: number | null;
  diameter?: number | null;
  weight?: number | null;
  spoolWeight?: number | null;
  extruderTemp?: number | null;
  bedTemp?: number | null;
  articleNumber?: string | null;
  comment?: string | null;
  locations?: string[];
  totalRemainingWeight?: number | null;
  spoolCount?: number;
  spools?: Array<{
    id: number;
    location?: string | null;
    remainingWeight?: number | null;
    usedWeight?: number | null;
    archived?: boolean | null;
  }>;
};

type SortField = "name" | "vendor" | "material" | "source" | "hue" | "luminance" | "lightness";
type SortDir = "asc" | "desc";

const normalizeVendor = (value: SpoolmanFilament["vendor"]) => {
  if (!value) return "Unknown";
  return value.name || "Unknown";
};

const normalizeMaterial = (value: SpoolmanFilament["material"]) => {
  if (!value) return "Unknown";
  return value;
};


const normalizeSpoolmanFilament = (
  filament: SpoolmanFilament,
): FilamentCard => {
  const hasMultiColor = filament.multi_color_hexes && filament.multi_color_hexes.trim().length > 0;
  const multiColorHexes = hasMultiColor
    ? filament.multi_color_hexes!.split(',').map(h => ensureHex(h.trim()))
    : undefined;

  const colorHex = hasMultiColor ? multiColorHexes![0] : ensureHex(filament.color_hex);

  return {
    id: `filament-${filament.id}`,
    name: filament.name || `Filament ${filament.id}`,
    vendor: normalizeVendor(filament.vendor),
    material: normalizeMaterial(filament.material),
    colorHex,
    colorName: colorHex.toUpperCase(),
    source: "spoolman",
    multiColorHexes,
    multiColorDirection: filament.multi_color_direction ?? undefined,
    price: filament.price ?? null,
    density: filament.density ?? null,
    diameter: filament.diameter ?? null,
    weight: filament.weight ?? null,
    spoolWeight: filament.spool_weight ?? null,
    extruderTemp: filament.settings_extruder_temp ?? null,
    bedTemp: filament.settings_bed_temp ?? null,
    articleNumber: filament.article_number ?? null,
    comment: filament.comment ?? null,
  };
};



const normalizeExternal = (filament: ExternalFilament): FilamentCard => ({
  id: filament.id,
  name: filament.name,
  vendor: filament.vendor,
  material: filament.material,
  colorHex: ensureHex(filament.colorHex),
  colorName: filament.colorName,
  source: "external",
});

const normalizeSpoolmanDB = (filament: SpoolmanDBFilament, index: number): FilamentCard => {
  const name = filament.name || `Filament ${index + 1}`;
  const vendor = filament.manufacturer || "Unknown";
  const material = filament.material || "Unknown";
  const colorHex = ensureHex(filament.color_hex);

  return {
    id: `spoolmandb-${filament.id || index}`,
    name,
    vendor,
    material,
    colorHex,
    colorName: colorHex.toUpperCase(),
    source: "external",
    density: filament.density ?? null,
    diameter: filament.diameters?.[0] ?? null,
    extruderTemp: filament.extruder_temp ?? null,
    bedTemp: filament.bed_temp ?? null,
  };
};

// Singleton instance
let instance: ReturnType<typeof useFilaments> | null = null;

export const useFilaments = () => {
  if (!instance) {
    instance = createFilamentsComposable();
  }
  return instance;
};

const createFilamentsComposable = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const allFilaments = ref<FilamentCard[]>([]);
  const spoolmanMaterials = ref<SpoolmanMaterial[]>([]);
  const spoolmanVendors = ref<SpoolmanVendor[]>([]);
  const spoolmanLocations = ref<string[]>([]);
  const { resolvedBaseUrl } = useSpoolmanUrl();

  // Read query parameters from URL (case-insensitive)
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('q') || '';
  const initialVendor = urlParams.get('v')?.toLowerCase() || 'all';
  const initialMaterial = urlParams.get('m')?.toLowerCase() || 'all';
  const initialColor = urlParams.get('c')?.toLowerCase() || 'all';
  const initialLocation = urlParams.get('l')?.toLowerCase() || 'all';
  const initialSource = urlParams.get('s')?.toLowerCase() || 'spoolman';

  const filters = reactive({
    search: initialSearch,
    vendor: initialVendor,
    material: initialMaterial,
    source: initialSource,
    sortField: "name" as SortField,
    sortDir: "asc" as SortDir,
    color: initialColor as string,
    colorType: "all" as "all" | "single" | "multi",
    location: initialLocation,
  });

  const load = async () => {
    loading.value = true;
    error.value = null;
    try {
      const baseUrl = resolvedBaseUrl.value;

      // Only load external data sources if not filtering for spoolman only
      const shouldLoadExternal = filters.source !== "spoolman";

      const [filaments, materials, vendors, locations, spools, external, spoolmanDBFilaments, spoolmanDBMaterials] = await Promise.all([
        fetchSpoolmanFilaments(baseUrl).catch(() => [] as SpoolmanFilament[]),
        fetchSpoolmanMaterials(baseUrl).catch(() => [] as SpoolmanMaterial[]),
        fetchSpoolmanVendors(baseUrl).catch(() => [] as SpoolmanVendor[]),
        fetchSpoolmanLocations(baseUrl).catch(() => [] as string[]),
        fetchSpoolmanSpools(baseUrl).catch(() => [] as SpoolmanSpool[]),
        shouldLoadExternal ? fetchExternalFilaments().catch(() => [] as ExternalFilament[]) : Promise.resolve([] as ExternalFilament[]),
        shouldLoadExternal ? fetchSpoolmanDBFilaments().catch(() => [] as SpoolmanDBFilament[]) : Promise.resolve([] as SpoolmanDBFilament[]),
        shouldLoadExternal ? fetchSpoolmanDBMaterials().catch(() => [] as SpoolmanDBMaterial[]) : Promise.resolve([] as SpoolmanDBMaterial[]),
      ]);

      spoolmanMaterials.value = materials;
      spoolmanVendors.value = vendors;
      spoolmanLocations.value = locations;

      // Create a map of filament_id -> spool data
      const filamentSpoolsMap = new Map<number, {
        locations: string[],
        totalWeight: number,
        count: number,
        spools: Array<{
          id: number;
          location?: string | null;
          remainingWeight?: number | null;
          usedWeight?: number | null;
          archived?: boolean | null;
        }>
      }>();

      spools.forEach((spool) => {
        if (spool.filament?.id) {
          const filamentId = spool.filament.id;
          const existing = filamentSpoolsMap.get(filamentId) || {
            locations: [],
            totalWeight: 0,
            count: 0,
            spools: []
          };

          if (spool.location && !existing.locations.includes(spool.location)) {
            existing.locations.push(spool.location);
          }
          if (spool.remaining_weight) {
            existing.totalWeight += spool.remaining_weight;
          }
          existing.count += 1;

          // Add full spool data
          existing.spools.push({
            id: spool.id,
            location: spool.location,
            remainingWeight: spool.remaining_weight ?? null,
            usedWeight: spool.used_weight ?? null,
            archived: spool.archived ?? false
          });

          filamentSpoolsMap.set(filamentId, existing);
        }
      });

      allFilaments.value = [
        ...filaments.map((item) => {
          const card = normalizeSpoolmanFilament(item);
          const spoolData = filamentSpoolsMap.get(item.id);
          if (spoolData) {
            card.locations = spoolData.locations;
            card.totalRemainingWeight = spoolData.totalWeight > 0 ? spoolData.totalWeight : null;
            card.spoolCount = spoolData.count;
            card.spools = spoolData.spools;
          }
          return card;
        }),
        ...external.map(normalizeExternal),
        ...spoolmanDBFilaments.map((item, index) => normalizeSpoolmanDB(item, index)),
      ];
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
    } finally {
      loading.value = false;
    }
  };

  // Sync filters to URL query string
  watch(() => ({ ...filters }), (newFilters) => {
    const params = new URLSearchParams();

    if (newFilters.search) {
      params.set('q', newFilters.search);
    }
    if (newFilters.vendor && newFilters.vendor !== 'all') {
      params.set('v', newFilters.vendor);
    }
    if (newFilters.material && newFilters.material !== 'all') {
      params.set('m', newFilters.material);
    }
    if (newFilters.color && newFilters.color !== 'all') {
      params.set('c', newFilters.color);
    }
    if (newFilters.location && newFilters.location !== 'all') {
      params.set('l', newFilters.location);
    }
    if (newFilters.source && newFilters.source !== 'all') {
      params.set('s', newFilters.source);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  });

  const filtered = computed(() => {
    const search = filters.search.toLowerCase();
    const result = allFilaments.value.filter((item) => {
      if (filters.source !== "all" && item.source !== filters.source) {
        return false;
      }
      if (filters.vendor !== "all" && item.vendor.toLowerCase() !== filters.vendor.toLowerCase()) {
        return false;
      }
      if (filters.material !== "all" && item.material.toLowerCase() !== filters.material.toLowerCase()) {
        return false;
      }
      if (filters.color !== "all" && item.colorHex.toLowerCase() !== filters.color.toLowerCase()) {
        return false;
      }
      if (filters.location !== "all") {
        if (!item.locations || !item.locations.some(loc => loc.toLowerCase() === filters.location.toLowerCase())) {
          return false;
        }
      }
      if (filters.colorType !== "all") {
        const isMultiColor = item.multiColorHexes && item.multiColorHexes.length > 1;
        if (filters.colorType === "multi" && !isMultiColor) return false;
        if (filters.colorType === "single" && isMultiColor) return false;
      }
      if (!search) return true;
      return (
        item.name.toLowerCase().includes(search) ||
        item.vendor.toLowerCase().includes(search) ||
        item.material.toLowerCase().includes(search) ||
        item.colorName.toLowerCase().includes(search) ||
        item.colorHex.toLowerCase().includes(search)
      );
    });

    const compare = (a: FilamentCard, b: FilamentCard) => {
      // Prioritize spoolman source (always comes first)
      if (a.source !== b.source) {
        return a.source === "spoolman" ? -1 : 1;
      }

      switch (filters.sortField) {
        case "vendor": {
          const cmp = a.vendor.localeCompare(b.vendor, undefined, { sensitivity: "base" });
          return filters.sortDir === "asc" ? cmp : -cmp;
        }
        case "material": {
          const cmp = a.material.localeCompare(b.material, undefined, { sensitivity: "base" });
          return filters.sortDir === "asc" ? cmp : -cmp;
        }
        case "source": {
          const cmp = a.source.localeCompare(b.source, undefined, { sensitivity: "base" });
          return filters.sortDir === "asc" ? cmp : -cmp;
        }
        case "hue": {
          const hA = getColorMetrics(a.colorHex).hue;
          const hB = getColorMetrics(b.colorHex).hue;
          return filters.sortDir === "asc" ? hA - hB : hB - hA;
        }
        case "luminance": {
          const lA = getColorMetrics(a.colorHex).luminance;
          const lB = getColorMetrics(b.colorHex).luminance;
          return filters.sortDir === "asc" ? lA - lB : lB - lA;
        }
        case "lightness": {
          const lA = getColorMetrics(a.colorHex).lightness;
          const lB = getColorMetrics(b.colorHex).lightness;
          return filters.sortDir === "asc" ? lA - lB : lB - lA;
        }
        case "name":
        default: {
          const cmp = a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
          return filters.sortDir === "asc" ? cmp : -cmp;
        }
      }
    };

    return result.slice().sort(compare);
  });

  const vendorOptions = computed(() => {
    const values = new Set<string>();
    // Use filtered results to respect active filters
    filtered.value.forEach((item) => {
      if (item.vendor && item.vendor !== "Unknown") values.add(item.vendor);
    });
    return Array.from(values).sort();
  });

  const materialOptions = computed(() => {
    const values = new Set<string>();
    // Use filtered results to respect active filters
    filtered.value.forEach((item) => {
      if (item.material && item.material !== "Unknown") values.add(item.material);
    });
    return Array.from(values).sort();
  });

  const colorOptions = computed(() => {
    const map = new Map<string, { hex: string; luminance: number }>();
    // Use filtered results to respect active filters
    filtered.value.forEach((item) => {
      const hex = item.colorHex;
      if (!map.has(hex)) {
        map.set(hex, { hex, luminance: getColorMetrics(hex).luminance });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => a.luminance - b.luminance)
      .map((v) => v.hex);
  });

  const locationOptions = computed(() => {
    return Array.from(spoolmanLocations.value).sort();
  });

  return {
    loading,
    error,
    allFilaments,
    filtered,
    filters,
    vendorOptions,
    materialOptions,
    colorOptions,
    locationOptions,
    refresh: load,
  };
};
