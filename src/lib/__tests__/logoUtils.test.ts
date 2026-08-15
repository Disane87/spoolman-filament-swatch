import { normalizeVendorName, getLogoUrl, getLogoAlt } from '../logoUtils';

describe('logoUtils', () => {
  describe('normalizeVendorName', () => {
    it('converts to lowercase', () => {
      expect(normalizeVendorName('Prusament')).toBe('prusament');
    });

    it('replaces spaces with hyphens', () => {
      expect(normalizeVendorName('Prusa Research')).toBe('prusa-research');
    });

    it('handles mixed case with spaces', () => {
      expect(normalizeVendorName('eSUN Plus')).toBe('esun-plus');
    });

    it('removes special characters', () => {
      expect(normalizeVendorName('Brand & Co.')).toBe('brand--co');
    });

    it('handles multiple spaces', () => {
      expect(normalizeVendorName('Multi   Space   Name')).toBe('multi-space-name');
    });
  });

  describe('getLogoUrl', () => {
    it('returns SVG path for vendor', () => {
      const url = getLogoUrl('Prusament');
      expect(url).toBe('/logos/vendors/prusament.svg');
    });

    it('normalizes vendor name in path', () => {
      const url = getLogoUrl('eSUN');
      expect(url).toBe('/logos/vendors/esun.svg');
    });

    it('returns valid URL for spaces in name', () => {
      const url = getLogoUrl('Matter Hackers');
      expect(url).toBe('/logos/vendors/matter-hackers.svg');
    });
  });

  describe('getLogoAlt', () => {
    it('returns alt text for vendor', () => {
      expect(getLogoAlt('Prusament')).toBe('Prusament logo');
    });

    it('preserves vendor name capitalization in alt text', () => {
      expect(getLogoAlt('eSUN')).toBe('eSUN logo');
    });
  });
});
