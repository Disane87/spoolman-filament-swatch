import { normalizeVendorName } from './logoUtils';

/**
 * Generate a pre-filled GitHub issue URL for logo contribution
 */
export function generateGitHubPrUrl(
  vendorName: string,
  logoDataUrl: string,
  fileName: string
): string {
  const normalized = normalizeVendorName(vendorName);
  const title = `feat: add ${vendorName} logo`;

  const body = `## Logo Contribution

**Vendor:** ${vendorName}
**File:** \`public/logos/vendors/${normalized}.${getFileExtension(fileName)}\`

### Description
Added logo for ${vendorName} vendor.

### Logo Preview
![${vendorName} logo](${logoDataUrl})

### Checklist
- [ ] Logo is transparent PNG or SVG
- [ ] File name matches vendor name (normalized)
- [ ] Image is optimized and reasonably sized
- [ ] I have permission to use this logo`;

  const githubUrl = new URL('https://github.com/Disane87/spoolman-filament-swatch/issues/new');
  githubUrl.searchParams.set('title', title);
  githubUrl.searchParams.set('body', body);
  githubUrl.searchParams.set('labels', 'logo-contribution');

  return githubUrl.toString();
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts[parts.length - 1].toLowerCase();
}
