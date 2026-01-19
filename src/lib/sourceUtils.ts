export type FilamentSource = 'spoolman' | 'external';

export interface SourceConfig {
  icon: string;
  label: string;
  badgeClass: string;
}

/**
 * Configuration for each filament source type
 */
export const SOURCE_CONFIG: Record<FilamentSource, SourceConfig> = {
  spoolman: {
    icon: 'lucide:server',
    label: 'Spoolman',
    badgeClass: 'badge-spoolman',
  },
  external: {
    icon: 'lucide:link',
    label: 'Extern',
    badgeClass: 'badge-external',
  },
};

const DEFAULT_CONFIG: SourceConfig = {
  icon: 'lucide:help-circle',
  label: 'Unbekannt',
  badgeClass: '',
};

/**
 * Gets the icon for a filament source
 */
export function getSourceIcon(source: string): string {
  return SOURCE_CONFIG[source as FilamentSource]?.icon ?? DEFAULT_CONFIG.icon;
}

/**
 * Gets the display label for a filament source
 */
export function getSourceLabel(source: string): string {
  return SOURCE_CONFIG[source as FilamentSource]?.label ?? DEFAULT_CONFIG.label;
}

/**
 * Gets the CSS class for a source badge
 */
export function getSourceBadgeClass(source: string): string {
  return SOURCE_CONFIG[source as FilamentSource]?.badgeClass ?? DEFAULT_CONFIG.badgeClass;
}

/**
 * Gets the complete configuration for a source
 */
export function getSourceConfig(source: string): SourceConfig {
  return SOURCE_CONFIG[source as FilamentSource] ?? DEFAULT_CONFIG;
}

/**
 * Checks if a source is valid
 */
export function isValidSource(source: string): source is FilamentSource {
  return source in SOURCE_CONFIG;
}
