export interface SwatchStyle {
  background: string;
}

export type MultiColorDirection = 'coaxial' | 'longitudinal';

/**
 * Material-specific overlay gradients for realistic filament appearance
 */
export const MATERIAL_OVERLAYS = {
  pla: 'linear-gradient(110deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 32%, rgba(0,0,0,0.08) 70%)',
  petg: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.10) 0 26%, rgba(255,255,255,0) 40%), radial-gradient(circle at 60% 58%, rgba(0,0,0,0.12) 0 24%, rgba(0,0,0,0) 42%)',
  abs: 'linear-gradient(125deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.0) 24%, rgba(0,0,0,0.08) 44%, rgba(0,0,0,0) 60%)',
} as const;

/**
 * Highlight gradient for 3D sphere effect
 */
export const HIGHLIGHT_GRADIENT = 'radial-gradient(circle at 36% 26%, rgba(255,255,255,0.35), transparent 48%)';

/**
 * Gets the appropriate material layer based on material type
 */
export function getMaterialLayer(material: string): string {
  const mat = material.toLowerCase();
  if (mat.includes('petg')) return MATERIAL_OVERLAYS.petg;
  if (mat.includes('abs')) return MATERIAL_OVERLAYS.abs;
  return MATERIAL_OVERLAYS.pla;
}

/**
 * Creates a gradient for multi-color filaments
 */
export function getMultiColorGradient(colors: string[], direction: MultiColorDirection = 'longitudinal'): string {
  if (direction === 'coaxial') {
    const stops = colors.map((c, i) => {
      const center = (i / (colors.length - 1)) * 100;
      const spread = 15;
      if (i === 0) return `${c} 0%, ${c} ${center + spread}%`;
      if (i === colors.length - 1) return `${c} ${center - spread}%, ${c} 100%`;
      return `${c} ${center - spread}%, ${c} ${center + spread}%`;
    }).join(', ');
    return `radial-gradient(circle, ${stops})`;
  }

  // Longitudinal (default): linear gradient
  const stops = colors.map((c, i) => {
    const percent = (i / (colors.length - 1)) * 100;
    return `${c} ${percent}%`;
  }).join(', ');
  return `linear-gradient(135deg, ${stops})`;
}

/**
 * Creates the base shade gradient for single-color swatches
 */
export function getBaseShade(colorHex: string): string {
  return `${HIGHLIGHT_GRADIENT}, linear-gradient(145deg, ${colorHex} 0%, rgba(0,0,0,0.22) 115%)`;
}

/**
 * Gets the complete swatch style for a filament
 */
export function getSwatchStyle(
  colorHex: string,
  material: string,
  multiColorHexes?: string[],
  multiColorDirection?: MultiColorDirection
): SwatchStyle {
  const materialLayer = getMaterialLayer(material);

  // Multi-color gradient logic
  if (multiColorHexes && multiColorHexes.length > 1) {
    const colorGradient = getMultiColorGradient(multiColorHexes, multiColorDirection);
    return {
      background: [HIGHLIGHT_GRADIENT, materialLayer, colorGradient].join(', '),
    };
  }

  // Single color logic
  const baseShade = getBaseShade(colorHex);
  return {
    background: [materialLayer, baseShade].join(', '),
  };
}

/**
 * Gets a simple background style for flat color display (without 3D effects)
 */
export function getFlatSwatchStyle(
  colorHex: string,
  multiColorHexes?: string[],
  multiColorDirection?: MultiColorDirection
): SwatchStyle {
  if (multiColorHexes && multiColorHexes.length > 1) {
    return {
      background: getMultiColorGradient(multiColorHexes, multiColorDirection),
    };
  }
  return { background: colorHex };
}
