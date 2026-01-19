export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorMetrics {
  luminance: number;
  lightness: number;
  hue: number;
}

/**
 * Converts a hex color to RGB values
 */
export function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace(/^#/, '');
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return { r, g, b };
}

/**
 * Converts a hex color to rgba string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Ensures a valid hex color format, normalizes short hex codes
 */
export function ensureHex(value: string | null | undefined): string {
  if (!value) return '#888888';
  const trimmed = value.trim().replace(/^#/, '');
  const short = /^[0-9a-fA-F]{3}$/;
  const full = /^[0-9a-fA-F]{6}$/;
  if (full.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  if (short.test(trimmed)) {
    const [a, b, c] = trimmed;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  return '#888888';
}

/**
 * Gets the hue value (0-360) from a hex color
 */
export function getHue(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;

  if (max !== min) {
    if (max === r) hue = ((g - b) / (max - min)) * 60;
    else if (max === g) hue = ((b - r) / (max - min)) * 60 + 120;
    else hue = ((r - g) / (max - min)) * 60 + 240;
    if (hue < 0) hue += 360;
  }

  return hue;
}

/**
 * Gets comprehensive color metrics: luminance, lightness, and hue
 */
export function getColorMetrics(hex: string): ColorMetrics {
  const { r, g, b } = hexToRgb(hex);
  // relative luminance (WCAG)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  // lightness as (max+min)/2 normalized
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 510; // 0-1
  // hue
  const hue = getHue(hex);

  return { luminance, lightness, hue };
}

/**
 * Calculates the Euclidean distance between two colors in RGB space
 */
export function colorDistance(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

/**
 * Calculates hue difference accounting for circular nature of hue
 */
export function hueDifference(hue1: number, hue2: number): number {
  const diff = Math.abs(hue1 - hue2);
  return Math.min(diff, 360 - diff);
}

/**
 * Determines if text should be light or dark based on background color
 */
export function shouldUseLightText(hex: string): boolean {
  const { luminance } = getColorMetrics(hex);
  return luminance < 0.5;
}
