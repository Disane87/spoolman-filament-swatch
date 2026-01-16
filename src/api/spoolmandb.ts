const SPOOLMANDB_BASE_URL = "https://donkie.github.io/SpoolmanDB";

const fetchJson = async <T>(path: string): Promise<T> => {
    const res = await fetch(`${SPOOLMANDB_BASE_URL}/${path}`);
    if (!res.ok) {
        throw new Error(`SpoolmanDB error ${res.status}`);
    }
    return (await res.json()) as T;
};

export type SpoolmanDBFilament = {
    id?: string | number;
    name?: string;
    manufacturer?: string;
    material?: string;
    color_hex?: string;
    density?: number;
    diameters?: number[];
    extruder_temp?: number;
    bed_temp?: number;
    [key: string]: unknown;
};

export type SpoolmanDBMaterial = {
    id?: string | number;
    name?: string;
    density?: number;
    [key: string]: unknown;
};

export const fetchSpoolmanDBFilaments = () =>
    fetchJson<SpoolmanDBFilament[]>("filaments.json");

export const fetchSpoolmanDBMaterials = () =>
    fetchJson<SpoolmanDBMaterial[]>("materials.json");
