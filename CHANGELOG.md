## [1.4.1](https://github.com/Disane87/spoolman-filament-swatch/compare/v1.4.0...v1.4.1) (2026-01-17)

### fix

* **ci:** only run build job if release job succeeds or is skipped ([b65f2e6](https://github.com/Disane87/spoolman-filament-swatch/commit/b65f2e6ed92f28ccc3ba6d7e194514e345e7b62a)) by [@Marco Franke](https://github.com/Marco Franke)

## [1.4.0](https://github.com/Disane87/spoolman-filament-swatch/compare/v1.3.0...v1.4.0) (2026-01-17)

### fix

* use process.env instead of context.env for GITHUB_TOKEN access ([33590af](https://github.com/Disane87/spoolman-filament-swatch/commit/33590aff9706e2678cc56f9277fe1d392abbdf33)) by [@Marco Franke](https://github.com/Marco Franke)

### refactor

* clean up whitespace in getGitHubUsername function ([8cb8973](https://github.com/Disane87/spoolman-filament-swatch/commit/8cb8973619a089c5670c6f4047a67769a44fabc8)) by [@Marco Franke](https://github.com/Marco Franke)

### feat

* fetch GitHub username for commits and update author information in transform function ([757d27c](https://github.com/Disane87/spoolman-filament-swatch/commit/757d27cfb6b167e3a15baec7fdd89208e78c4f6c)) by [@Marco Franke](https://github.com/Marco Franke)

## [1.3.0](https://github.com/Disane87/spoolman-filament-swatch/compare/v1.2.0...v1.3.0) (2026-01-17)

### docs

* add contributing guidelines to the repository ([b016866](https://github.com/Disane87/spoolman-filament-swatch/commit/b0168662d9d1e3468716fc27dab9c1a1978f4861)) by @Marco Franke

### feat

* add GitHub username fetching for commits and update release configuration ([dec35d8](https://github.com/Disane87/spoolman-filament-swatch/commit/dec35d8c3f7da6297214a591c9d3a11dbb486be6)) by @Marco Franke
* update package version to 1.2.0 and add @octokit/rest as a dev dependency ([0fc9810](https://github.com/Disane87/spoolman-filament-swatch/commit/0fc981070ea96e6fb38aad21fbd0762f3c7abc80)) by @Marco Franke

## [1.2.0](https://github.com/Disane87/spoolman-filament-swatch/compare/v1.1.0...v1.2.0) (2026-01-17)

### feat

* add custom writer options for release notes generation ([0dd24df](https://github.com/Disane87/spoolman-filament-swatch/commit/0dd24df6ec943e6489b4ec81be0a653dc3954e57)) by @Marco Franke
* add semantic release configuration with commit analyzer and release notes generator ([0b7e1e1](https://github.com/Disane87/spoolman-filament-swatch/commit/0b7e1e128880747ab246136edf4a728bb292bdb1)) by @Marco Franke
* enhance release transform function with author name and refactor hash shortening ([2b9923e](https://github.com/Disane87/spoolman-filament-swatch/commit/2b9923ebb8ef86f05819f0aac003dfb61f55677b)) by @Marco Franke
* replace .releaserc.json with .releaserc.js for semantic release configuration ([8c683e9](https://github.com/Disane87/spoolman-filament-swatch/commit/8c683e938218133ddc4b54c1747ced7bf3ef884f)) by @Marco Franke

### fix

* streamline hash shortening in release transform function ([da9e9fb](https://github.com/Disane87/spoolman-filament-swatch/commit/da9e9fb3d5fd232a44cd29e984a2d563250b83f6)) by @Marco Franke

## [1.1.0](https://github.com/Disane87/spoolman-filament-swatch/compare/v1.0.0...v1.1.0) (2026-01-17)

### ✨ Features

* update changelog modal for localization, add accordion components, and enhance styles ([516f77059f2fcb68967d2d6addd253b1479154f7](https://github.com/Disane87/spoolman-filament-swatch/commit/516f77059f2fcb68967d2d6addd253b1479154f7))

### 🐛 Bug Fixes

* adjust spacing in release notes template and styles for accordion animations ([cb99276b4e967613ae2725490f55d4662bb9c8d1](https://github.com/Disane87/spoolman-filament-swatch/commit/cb99276b4e967613ae2725490f55d4662bb9c8d1))

## 1.0.0 (2026-01-17)

### ✨ Features

* add Badge, Button, Card, Dialog, Input, Select, and Toggle components with variants and utility functions ([3245541](https://github.com/Disane87/spoolman-filament-swatch/commit/32455412843e67194989662a1de40b4144083a02))
* add CNAME file for custom domain configuration ([c8b34a7](https://github.com/Disane87/spoolman-filament-swatch/commit/c8b34a7d6fe1e693b94878a3fba8cc8e65ca4e37))
* add CORS warning alert and update CORS configuration instructions in dialogs ([a9f21f9](https://github.com/Disane87/spoolman-filament-swatch/commit/a9f21f99ccb6d62693c36780622c017e27869702))
* add FiltersBar component for advanced filtering options ([4a0d98a](https://github.com/Disane87/spoolman-filament-swatch/commit/4a0d98a8d5e06623567249e91f0a270a2f1bd6e9))
* add FUNDING.yml to support various funding model platforms ([1ccb852](https://github.com/Disane87/spoolman-filament-swatch/commit/1ccb852b1985e3f7b26efa83f27be9251e48172e))
* add FUNDING.yml to support various funding model platforms ([f277b43](https://github.com/Disane87/spoolman-filament-swatch/commit/f277b434acecee0467c76c805fcd34666cd21505))
* add GitHub Actions workflow for deploying to GitHub Pages ([2762ce5](https://github.com/Disane87/spoolman-filament-swatch/commit/2762ce5717876f8e507fbb9b3d4330e3331b0553))
* add initial README.md with project overview, features, and setup instructions ([e21b584](https://github.com/Disane87/spoolman-filament-swatch/commit/e21b584c10fbfc9d2bdc513465880fae2056416a))
* add Open Graph logo meta tag for improved social sharing ([f0107d1](https://github.com/Disane87/spoolman-filament-swatch/commit/f0107d1059bb5b94dae1d67be88aace15b23959f))
* add support for 'surl' parameter to set Spoolman URL from query string ([9790f8f](https://github.com/Disane87/spoolman-filament-swatch/commit/9790f8f376a4d321f90cbc6ae81e1c5eb44c451d))
* conditionally load external data sources based on filter settings ([5ec96c1](https://github.com/Disane87/spoolman-filament-swatch/commit/5ec96c13250330d879d8f48e3531701f0d70090e))
* enhance FiltersBar and LocaleSwitch components with improved styling and functionality ([ee60fae](https://github.com/Disane87/spoolman-filament-swatch/commit/ee60fae6d346d6a92bb8af93ca8485881bed09da))
* enhance Spoolman URL dialog with validation and localization updates ([4d34bb4](https://github.com/Disane87/spoolman-filament-swatch/commit/4d34bb4b450455678159b964974c6f8c12e9b5e5))
* implement semantic release workflow, add changelog modal, and update permissions in deploy.yml ([1c6fbb8](https://github.com/Disane87/spoolman-filament-swatch/commit/1c6fbb82b8983682823420dcd52f1899c1c60ec3))
* improve HTML structure and enhance SVG assets for better branding and usability ([d11929c](https://github.com/Disane87/spoolman-filament-swatch/commit/d11929cca4d5306c137c4576f99576864b204be0))
* improve styling and structure of Select component, add keyboard navigation and accessibility features ([aaad562](https://github.com/Disane87/spoolman-filament-swatch/commit/aaad5629c09fcc0350af01c31596830cb09dbc7d))
* refactor header and navigation components, implement virtual scrolling in FilamentBoard, and update theme and locale switches ([4cc4322](https://github.com/Disane87/spoolman-filament-swatch/commit/4cc43227e8176f4d242dd3b5958ae2ea61ca76dc))
* update README and add favicon, manifest, and Open Graph images for improved branding and usability ([30f627b](https://github.com/Disane87/spoolman-filament-swatch/commit/30f627bec21af1cd3990934a58e73246e3357550))

### 🐛 Bug Fixes

* improve CORS handling for local development in resolvedBaseUrl computation ([0669bab](https://github.com/Disane87/spoolman-filament-swatch/commit/0669bab83f0fa9fac3716a9eb4ea59511c2c6a82))
* remove unnecessary blank lines in readStored function for cleaner code ([65344bd](https://github.com/Disane87/spoolman-filament-swatch/commit/65344bd8df79f59193be4d8568f6714c81bd1ba2))
* set base path to root for development environment ([8b07d88](https://github.com/Disane87/spoolman-filament-swatch/commit/8b07d88add6bfa441ab5e15e49dedb0f3f150f0b))
* simplify problemMatcher configuration in tasks.json and update viewport meta tag in index.html ([3013690](https://github.com/Disane87/spoolman-filament-swatch/commit/3013690d7d07000bf28a1f20a59c52e866c00f45))
* update @vitejs/plugin-vue to version 6.0.0 in package.json and package-lock.json ([55cabd7](https://github.com/Disane87/spoolman-filament-swatch/commit/55cabd754b5201c7f652e08c4e62543973361dc9))
* update default source in useFilaments to 'spoolman' ([ba1a3cf](https://github.com/Disane87/spoolman-filament-swatch/commit/ba1a3cf53b0dd9055eb4e6d08774e2ce2923c6f6))
* update live demo links and CORS configuration in documentation ([3afdac8](https://github.com/Disane87/spoolman-filament-swatch/commit/3afdac88dc5753022e7aed8831ac3188863a2f2e))
* update Spoolman URL description to include CORS configuration instructions for deployed instances ([98afa75](https://github.com/Disane87/spoolman-filament-swatch/commit/98afa75675e286bb32f33adaa160117e46e0a805))
* update start_url and icon paths in manifest.json ([4eca17f](https://github.com/Disane87/spoolman-filament-swatch/commit/4eca17fc8cb5e871ddb2d386d3b46935c90abd97))

### 📦 Build

* **deps:** bump esbuild and vite ([c2ebbc7](https://github.com/Disane87/spoolman-filament-swatch/commit/c2ebbc7f2cd0a1628ad84ff70c50c1364fcdd3bc))
