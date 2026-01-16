export const DEFAULT_SPOOLMAN_URL = "http://localhost:7912";

const fetchJson = async <T>(baseUrl: string, path: string): Promise<T> => {
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) {
    throw new Error(`Spoolman error ${res.status}`);
  }
  return (await res.json()) as T;
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
  filament_id?: number | null;
  remaining_weight?: number | null;
  location?: string | null;
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
