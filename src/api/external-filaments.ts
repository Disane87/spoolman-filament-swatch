const publicBase = (import.meta.env.BASE_URL as string | undefined) ?? "/";

const safeString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

export type ExternalFilament = {
  id: string;
  name: string;
  vendor: string;
  material: string;
  colorHex: string;
  colorName: string;
  source: "external";
};

const normalizeExternalFilament = (
  record: Record<string, unknown>,
  vendor: string,
  index: number,
): ExternalFilament => {
  const name =
    safeString(record.name) ||
    safeString(record.filament) ||
    safeString(record.title) ||
    `Filament ${index + 1}`;

  const material =
    safeString(record.material) ||
    safeString(record.type) ||
    safeString(record.material_type) ||
    "Unknown";

  const colorHex =
    safeString(record.color_hex) ||
    safeString(record.hex) ||
    safeString(record.color) ||
    "#999999";

  const colorName =
    safeString(record.color_name) ||
    safeString(record.color) ||
    safeString(record.shade) ||
    "Unknown";

  const id =
    safeString(record.id) ||
    `${vendor}-${name}-${material}-${colorHex}`.replace(/\s+/g, "-");

  return {
    id,
    name,
    vendor,
    material,
    colorHex,
    colorName,
    source: "external",
  };
};

export const fetchExternalFilaments = async (): Promise<ExternalFilament[]> => {
  const indexRes = await fetch(`${publicBase}external-filaments/index.json`);
  if (!indexRes.ok) {
    return [];
  }
  const files = (await indexRes.json()) as string[];

  const batches = await Promise.all(
    files.map(async (file) => {
      const res = await fetch(`${publicBase}external-filaments/${file}`);
      if (!res.ok) {
        return [] as ExternalFilament[];
      }
      const data = (await res.json()) as Record<string, unknown>[];
      const vendor = file.replace(".json", "");
      return data.map((item, index) =>
        normalizeExternalFilament(item, vendor, index),
      );
    }),
  );

  return batches.flat();
};
