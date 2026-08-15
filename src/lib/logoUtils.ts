/**
 * Normalize vendor name for logo file lookup
 * E.g., "Prusament" → "prusament", "eSUN" → "esun"
 */
export function normalizeVendorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
}

/**
 * Get the logo URL for a vendor
 * Returns null if logo doesn't exist
 */
export function getLogoUrl(vendorName: string): string | null {
  const normalized = normalizeVendorName(vendorName);
  const svgPath = `/logos/vendors/${normalized}.svg`;

  // The img tag will handle 404s gracefully
  return svgPath;
}

/**
 * Get alt text for logo image
 */
export function getLogoAlt(vendorName: string): string {
  return `${vendorName} logo`;
}

/**
 * Get Spoolman logo URL
 */
export function getSpoolmanLogoUrl(): string {
  return '/logos/spoolman/spoolman-icon.svg';
}

/**
 * Get Spoolman logo alt text
 */
export function getSpoolmanLogoAlt(): string {
  return 'Spoolman logo';
}
