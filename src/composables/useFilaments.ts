import { computed, reactive, ref } from "vue";
import {
  fetchSpoolmanFilaments,
  fetchSpoolmanSpools,
  fetchSpoolmanMaterials,
  type SpoolmanFilament,
  type SpoolmanSpool,
  type SpoolmanMaterial,
} from "../api/spoolman";
import {
  fetchExternalFilaments,
  type ExternalFilament,
} from "../api/external-filaments";
import { useSpoolmanUrl } from "./useSpoolmanUrl";

export type FilamentCard = {
  id: string;
  name: string;
  vendor: string;
  material: string;
  colorHex: string;
  colorName: string;
  source: "spoolman" | "external";
  spoolId?: number;
  remainingWeight?: number | null;
};

type SortField = "name" | "luminance" | "lightness";
type SortDir = "asc" | "desc";

const normalizeVendor = (value: SpoolmanFilament["vendor"]) => {
  if (!value) return "Unknown";
  if (typeof value === "string") return value;
  return value.name || "Unknown";
};

const normalizeMaterial = (value: SpoolmanFilament["material"]) => {
  if (!value) return "Unknown";
  if (typeof value === "string") return value;
  return value.name || "Unknown";
};

const ensureHex = (value: string | null | undefined): string => {
  if (!value) return "#888888";
  const trimmed = value.trim().replace(/^#/, "");
  const short = /^[0-9a-fA-F]{3}$/;
  const full = /^[0-9a-fA-F]{6}$/;
  if (full.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  if (short.test(trimmed)) {
    const [a, b, c] = trimmed;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  return "#888888";
};

const hexToRgb = (hex: string) => {
  const cleaned = hex.replace(/^#/, "");
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return { r, g, b };
};

const getColorMetrics = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  // relative luminance (WCAG)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  // lightness as (max+min)/2 normalized
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 510; // 0-1
  return { luminance, lightness };
};

const normalizeSpoolmanFilament = (
  filament: SpoolmanFilament,
  spool?: SpoolmanSpool,
): FilamentCard => ({
  id: spool ? `spool-${spool.id}` : `filament-${filament.id}`,
  name: filament.name || `Filament ${filament.id}`,
  vendor: normalizeVendor(filament.vendor),
  material: normalizeMaterial(filament.material),
  colorHex: ensureHex(filament.color_hex),
  colorName: filament.color_name || "Unknown",
  source: "spoolman",
  spoolId: spool?.id,
  remainingWeight: spool?.remaining_weight ?? null,
});

const normalizeExternal = (filament: ExternalFilament): FilamentCard => ({
  id: filament.id,
  name: filament.name,
  vendor: filament.vendor,
  material: filament.material,
  colorHex: ensureHex(filament.colorHex),
  colorName: filament.colorName,
  source: "external",
});

export const useFilaments = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const allFilaments = ref<FilamentCard[]>([]);
  const spoolmanMaterials = ref<SpoolmanMaterial[]>([]);
  const { resolvedBaseUrl } = useSpoolmanUrl();

  const filters = reactive({
    search: "",
    vendor: "all",
    material: "all",
    source: "spoolman",
    sortField: "name" as SortField,
    sortDir: "asc" as SortDir,
    color: "all" as string,
  });

  const load = async () => {
    loading.value = true;
    error.value = null;
    try {
      const baseUrl = resolvedBaseUrl.value;

      const includeExternal = filters.source !== "spoolman";

      const [spools, filaments, materials, external] = await Promise.all([
        fetchSpoolmanSpools(baseUrl).catch(() => [] as SpoolmanSpool[]),
        fetchSpoolmanFilaments(baseUrl).catch(() => [] as SpoolmanFilament[]),
        fetchSpoolmanMaterials(baseUrl).catch(() => [] as SpoolmanMaterial[]),
        includeExternal
          ? fetchExternalFilaments().catch(() => [] as ExternalFilament[])
          : Promise.resolve([] as ExternalFilament[]),
      ]);

      spoolmanMaterials.value = materials;

      const spoolFilaments = spools
        .map((spool) => {
          const filament = filaments.find(
            (item) => item.id === spool.filament_id,
          );
          return filament ? normalizeSpoolmanFilament(filament, spool) : null;
        })
        .filter((item): item is FilamentCard => item !== null);

      const spoolFilamentIds = new Set(
        spools.map((spool) => spool.filament_id).filter(Boolean),
      );

      const looseFilaments = filaments
        .filter((item) => !spoolFilamentIds.has(item.id))
        .map((item) => normalizeSpoolmanFilament(item));

      allFilaments.value = [
        ...spoolFilaments,
        ...looseFilaments,
        ...external.map(normalizeExternal),
      ];
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
    } finally {
      loading.value = false;
    }
  };

  const filtered = computed(() => {
    const search = filters.search.toLowerCase();
    const result = allFilaments.value.filter((item) => {
      if (filters.source !== "all" && item.source !== filters.source) {
        return false;
      }
      if (filters.vendor !== "all" && item.vendor !== filters.vendor) {
        return false;
      }
      if (filters.material !== "all" && item.material !== filters.material) {
        return false;
      }
      if (filters.color !== "all" && item.colorHex !== filters.color) {
        return false;
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
      switch (filters.sortField) {
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
    const values = new Set(allFilaments.value.map((item) => item.vendor));
    return Array.from(values).sort();
  });

  const materialOptions = computed(() => {
    const values = new Set<string>();
    spoolmanMaterials.value.forEach((m) => m.name && values.add(m.name));
    allFilaments.value.forEach((item) => values.add(item.material));
    return Array.from(values).sort();
  });

  const colorOptions = computed(() => {
    const map = new Map<string, { hex: string; luminance: number }>();
    allFilaments.value.forEach((item) => {
      const hex = item.colorHex;
      if (!map.has(hex)) {
        map.set(hex, { hex, luminance: getColorMetrics(hex).luminance });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => a.luminance - b.luminance)
      .map((v) => v.hex);
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
    refresh: load,
  };
};
