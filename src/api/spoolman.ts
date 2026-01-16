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
  vendor?: { name?: string } | string | null;
  material?: { name?: string } | string | null;
  color_hex?: string | null;
  color_name?: string | null;
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

export const fetchSpoolmanSpools = (baseUrl: string) =>
  fetchJson<SpoolmanSpool[]>(baseUrl, "/api/v1/spool");

export const fetchSpoolmanFilaments = (baseUrl: string) =>
  fetchJson<SpoolmanFilament[]>(baseUrl, "/api/v1/filament");

export const fetchSpoolmanMaterials = (baseUrl: string) =>
  fetchJson<SpoolmanMaterial[]>(baseUrl, "/api/v1/material");
