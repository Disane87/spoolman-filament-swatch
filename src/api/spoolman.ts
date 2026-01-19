export const DEFAULT_SPOOLMAN_URL = "";

const fetchJson = async <T>(baseUrl: string, path: string): Promise<T> => {
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) {
    throw new Error(`Spoolman error ${res.status}`);
  }
  return (await res.json()) as T;
};

export type SpoolmanHealth = {
  status: "healthy" | string;
};

export type SpoolmanInfo = {
  version: string;
  debug_mode: boolean;
  automatic_backups: boolean;
  data_dir: string;
  logs_dir: string;
  backups_dir: string;
  db_type: string;
  git_commit?: string;
  build_date?: string;
};

export const checkSpoolmanConnection = async (baseUrl: string): Promise<{ healthy: boolean; info?: SpoolmanInfo; error?: string }> => {
  if (!baseUrl || baseUrl.trim().length === 0) {
    return { healthy: false, error: "No URL provided" };
  }

  try {
    const health = await fetchJson<SpoolmanHealth>(baseUrl, "/api/v1/health");
    if (health.status !== "healthy") {
      return { healthy: false, error: `Unhealthy status: ${health.status}` };
    }

    const info = await fetchJson<SpoolmanInfo>(baseUrl, "/api/v1/info");
    return { healthy: true, info };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { healthy: false, error: message };
  }
};

export type SpoolmanFilament = {
  id: number;
  name: string;
  vendor?: {
    id: number;
    name: string;
    extra?: Record<string, unknown>;
  } | null;
  material?: string | null;
  color_hex?: string | null;
  multi_color_hexes?: string | null;
  multi_color_direction?: "coaxial" | "longitudinal" | null;
  price?: number | null;
  density?: number | null;
  diameter?: number | null;
  weight?: number | null;
  spool_weight?: number | null;
  settings_extruder_temp?: number | null;
  settings_bed_temp?: number | null;
  article_number?: string | null;
  comment?: string | null;
  extra?: Record<string, unknown>;
};

export type SpoolmanSpool = {
  id: number;
  filament?: {
    id: number;
    name?: string;
    vendor?: { id: number; name?: string } | null;
    material?: string | null;
  } | null;
  remaining_weight?: number | null;
  used_weight?: number | null;
  initial_weight?: number | null;
  spool_weight?: number | null;
  location?: string | null;
  archived?: boolean | null;
  first_used?: string | null;
  last_used?: string | null;
};

export type SpoolmanMaterial = {
  id: number;
  name?: string | null;
};

export type SpoolmanVendor = {
  id: number;
  name?: string | null;
};

export const fetchSpoolmanSpools = (baseUrl: string) =>
  fetchJson<SpoolmanSpool[]>(baseUrl, "/api/v1/spool");

export const fetchSpoolmanFilaments = (baseUrl: string) =>
  fetchJson<SpoolmanFilament[]>(baseUrl, "/api/v1/filament");

export const fetchSpoolmanMaterials = (baseUrl: string) =>
  fetchJson<SpoolmanMaterial[]>(baseUrl, "/api/v1/material");

export const fetchSpoolmanVendors = (baseUrl: string) =>
  fetchJson<SpoolmanVendor[]>(baseUrl, "/api/v1/vendor");

export const fetchSpoolmanLocations = (baseUrl: string) =>
  fetchJson<string[]>(baseUrl, "/api/v1/location");
