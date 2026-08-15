# 🎨 Contributing Logos

Thank you for helping improve Spoolman Filament Swatch with vendor logos! This guide explains how to contribute logos for filament vendors.

## Quick Start

### Option 1: Upload via the App (Recommended)

1. Navigate to any filament card for a vendor without a logo
2. Click the **"Add Logo"** button on the card
3. Drag & drop your logo file (PNG or SVG)
4. Click the generated **"Create Pull Request"** link
5. Follow the GitHub flow to submit your contribution

### Option 2: Direct GitHub PR

If you prefer to submit via GitHub directly:

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/spoolman-filament-swatch.git`
3. Create a new branch: `git checkout -b add-logo/vendor-name`
4. Add your logo file to `public/logos/vendors/`
5. Commit: `git commit -m "feat: add Vendor Logo"`
6. Push: `git push origin add-logo/vendor-name`
7. Open a Pull Request

## Logo Requirements

### File Format
- **PNG** (transparent background recommended)
- **SVG** (vector format - preferred for crisp quality)

### File Naming
- Use lowercase, hyphenated vendor names
- Examples:
  - `prusament.svg`
  - `esun.png`
  - `matter-hackers.svg`

### Size & Optimization
- **Recommended:** 256x256px or smaller
- **Maximum:** 1MB file size
- PNG files should be optimized (use tools like TinyPNG if needed)
- SVG files should be minified

### Design
- Transparent background (not white)
- Logo should be recognizable at small sizes (20x20px minimum)
- Should work well in both light and dark themes
- Use brand colors if available, but ensure contrast

## Logo Placement

Logos appear next to the vendor name on filament cards:

```
┌─────────────────────────────┐
│ [Logo] Vendor Name · Material │
│                             │
│     [Color Swatch]          │
│                             │
└─────────────────────────────┘
```

## How to Find Official Logos

### Option 1: Vendor Website
Most filament vendors have press kits or brand assets:
- Look for "Press" or "Media" section
- Check for "Brand Assets" or "Logo Downloads"
- Download transparent PNG or SVG versions

### Option 2: Brand Guidelines
- Many vendors provide brand guidelines with logo variations
- Choose the primary horizontal logo or wordmark

### Option 3: SVG Recreation
If no official logo exists, you can create an SVG using the vendor name in their brand font/style. Tools:
- [Figma](https://figma.com) - Free design tool
- [Inkscape](https://inkscape.org) - Free vector editor
- [Adobe Illustrator](https://adobe.com) - Commercial

## Submitting Your Logo

### Via App Upload
1. Open filament card with missing logo
2. Click "Add Logo"
3. Select your file (PNG or SVG)
4. Click "Create Pull Request"
5. GitHub will open with a pre-filled PR template

### Via Direct GitHub PR
1. Follow the "Direct GitHub PR" section above
2. Use the logo contribution template

## After Submission

- Maintainers will review your contribution
- We may request adjustments (sizing, transparency, etc.)
- Once approved, your logo will be available for everyone to use!

## Troubleshooting

### My logo doesn't appear on cards
- Ensure file name matches vendor name (normalized)
- Check browser cache (hard refresh: `Ctrl+F5`)
- Verify SVG/PNG format is correct

### My SVG has rendering issues
- Ensure SVG uses `viewBox` attribute
- Remove unnecessary transforms or styles
- Minify the SVG

### I can't find an official logo
- It's okay to create a styled version of the vendor name
- Ensure it matches their brand colors
- Add a note in the PR describing the design approach

## Questions?

- Open an issue: [GitHub Issues](https://github.com/Disane87/spoolman-filament-swatch/issues)
- Check existing logos for examples: `public/logos/vendors/`

Thank you for contributing! 🎨
