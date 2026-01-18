<div align="center">

# 🤝 Contributing to Spoolman Filament Swatch

Thanks for your interest in contributing! 🎉

We love your input! We want to make contributing to Spoolman Filament Swatch as easy and transparent as possible.

</div>

---

## 🌟 Ways to Contribute

There are many ways you can contribute to this project:

- 🐛 **Report bugs** - Found something not working? Let us know!
- 💡 **Suggest features** - Have an idea? We'd love to hear it!
- 🌍 **Add translations** - Help make this app available in more languages
- 📝 **Improve documentation** - Help others understand the project better
- 💻 **Submit code** - Fix bugs or implement new features
- 🎨 **Design improvements** - Make the UI/UX even better
- 🧪 **Add tests** - Help improve code quality and reliability

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (we use npm in this project)
- **Git**
- A **Spoolman instance** for testing (or use the external database feature)

### Development Setup

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/spoolman-filament-swatch.git
   cd spoolman-filament-swatch
   ```

3. **Add the upstream remote**

   ```bash
   git remote add upstream https://github.com/Disane87/spoolman-filament-swatch.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Project Structure

```
spoolman-filament-swatch/
├── src/
│   ├── components/      # Vue components
│   │   ├── ui/         # Reusable UI components (Button, Card, Dialog, etc.)
│   │   └── ...         # Feature components (FilamentBoard, FilamentCard, etc.)
│   ├── composables/    # Vue composables (useFilaments, useTheme, etc.)
│   ├── locales/        # Translation files (en.json, de.json)
│   ├── api/            # API integration (spoolman.ts, external-filaments.ts)
│   ├── lib/            # Utility functions
│   └── App.vue         # Main application component
├── public/             # Static assets
└── ...
```

## 📝 Commit Guidelines

We use **[Conventional Commits](https://www.conventionalcommits.org/)** for clear and meaningful commit messages.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature (Minor release)
- **fix**: A bug fix (Patch release)
- **docs**: Documentation only changes (Patch release)
- **style**: Changes that don't affect the meaning of the code (Patch release)
- **refactor**: Code change that neither fixes a bug nor adds a feature (Patch release)
- **perf**: Performance improvements (Patch release)
- **test**: Adding or updating tests (Patch release)
- **build**: Changes to the build system or dependencies (Patch release)
- **ci**: Changes to CI configuration files (Patch release)
- **chore**: Other changes that don't modify src or test files (No release)

### Scopes with Emojis

We use scopes to categorize commits. The following scopes automatically get emojis in the changelog:

| Scope | Emoji | Description |
|-------|-------|-------------|
| `ui` | 🎨 | UI components (FilamentCard, FilamentBoard, etc.) |
| `api` | 🔌 | API integration (Spoolman, SpoolmanDB) |
| `filters` | 🔍 | Filter functionality |
| `i18n` | 🌐 | Internationalization/Translations |
| `logo` | 🖼️ | Logo and branding |
| `theme` | 🎨 | Theme system (Dark/Light Mode) |
| `seo` | 📈 | SEO optimizations |
| `pwa` | 📱 | Progressive Web App features |
| `a11y` | ♿ | Accessibility |
| `security` | 🔒 | Security |
| `deps` | 📦 | Dependencies |
| `config` | ⚙️ | Configuration |

### Examples

```bash
# Features (with scopes and emojis)
feat(ui): add color gradient picker
feat(api): integrate SpoolmanDB external filaments
feat(i18n): add Spanish translation
feat(filters): add multi-select for manufacturers

# Bug fixes
fix(filters): color picker not updating on mobile
fix(theme): dark mode logo not loading correctly
fix(ui): FilamentCard hover effect in Safari

# Documentation
docs: update README with new URL parameters

# Other
style: improve mobile responsiveness of filament cards
refactor: extract color conversion logic to utility function
perf: implement virtual scrolling for large filament lists
test(ui): add unit tests for FilamentCard component
chore(deps): update vue to 3.5.13
```

### Testing Your Commits

Before pushing, you can test what release would be created:

```bash
# Shows which version would be created + release notes preview
npm run release:test
```

This will analyze your commits and show:
- What version change would occur (major/minor/patch)
- All commits included in the release
- A preview of the formatted release notes with emojis
- **No changes are made to your repository** - it's 100% safe!

### Breaking Changes

If your commit introduces a breaking change, add `!` after the type and include `BREAKING CHANGE:` in the commit body:

```bash
feat(api)!: redesign filter API

BREAKING CHANGE: Filter component now uses new props structure.
See migration guide in docs/migration.md
```

This will trigger a **major version** release (e.g., 1.6.0 → 2.0.0).

## 🌿 Branch Strategy

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Keep your branch up to date**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

3. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

## 🔍 Code Style

We maintain code quality with:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety

Before committing, make sure your code passes linting:

```bash
npm run lint
```

### Style Guidelines

- Use **TypeScript** for type safety
- Use **Vue 3 Composition API** with `<script setup>`
- Follow **Vue style guide** best practices
- Use **Tailwind CSS** utility classes for styling
- Keep components **small and focused**
- Write **descriptive variable and function names**
- Add **JSDoc comments** for complex functions

## 🌍 Adding Translations

We use **Vue I18n** for internationalization. Translation files are in `src/locales/`.

### Adding a New Language

1. Create a new JSON file in `src/locales/` (e.g., `fr.json`)
2. Copy the structure from `en.json`
3. Translate all strings
4. Update the language selector in the app

### Translation File Structure

```json
{
  "app": {
    "title": "Translated Title",
    "subtitle": "Translated Subtitle"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

### Using Translations in Components

```vue
<template>
  <h1>{{ $t('app.title') }}</h1>
  <button>{{ $t('actions.save') }}</button>
</template>
```

## 🧪 Testing

Before submitting a PR, please:

1. **Test your changes manually**
   - Test with a real Spoolman instance
   - Test with the external database
   - Test on different screen sizes
   - Test in both light and dark mode

2. **Check for console errors**
   - Open browser DevTools
   - Look for errors or warnings

3. **Test edge cases**
   - Empty states
   - Loading states
   - Error states
   - Large datasets

## 📥 Submitting a Pull Request

1. **Make sure your code is ready**
   - All commits follow conventional commit format
   - Code is properly formatted and linted
   - Changes are tested

2. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create the Pull Request**
   - Go to the [original repository](https://github.com/Disane87/spoolman-filament-swatch)
   - Click "New Pull Request"
   - Select "compare across forks"
   - Choose your fork and branch

4. **Fill out the PR template**
   - Provide a clear description of your changes
   - Reference any related issues
   - Add screenshots for UI changes
   - List any breaking changes

5. **Wait for review**
   - Respond to feedback promptly
   - Make requested changes
   - Keep the PR updated

## 🐛 Reporting Bugs

Found a bug? Here's how to report it:

1. **Check if it's already reported**
   - Search [existing issues](https://github.com/Disane87/spoolman-filament-swatch/issues)

2. **Create a new issue**
   - Use a clear, descriptive title
   - Describe the expected behavior
   - Describe the actual behavior
   - Provide steps to reproduce
   - Include screenshots if applicable
   - Mention your environment (browser, OS, Spoolman version)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - Browser: [e.g. Chrome 120]
 - OS: [e.g. Windows 11]
 - Spoolman Version: [e.g. 0.18.0]
 - App Version: [e.g. 1.2.0]
```

## 💡 Feature Requests

Have an idea for a new feature?

1. **Check existing feature requests**
   - Search [existing issues](https://github.com/Disane87/spoolman-filament-swatch/issues?q=is%3Aissue+label%3Aenhancement)

2. **Open a new issue**
   - Use the "Feature Request" template
   - Describe the feature clearly
   - Explain why it would be useful
   - Suggest implementation approaches if you have ideas

## 📜 Code of Conduct

### Our Standards

- **Be respectful** and considerate
- **Be collaborative** and helpful
- **Be open** to constructive criticism
- **Focus on what's best** for the community
- **Show empathy** towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other unprofessional conduct

## 🎯 Development Tips

### Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code
npm run format
```

### Debugging

- Use Vue DevTools browser extension
- Check browser console for errors
- Use `console.log()` or debugger statements
- Test with Spoolman API directly using browser DevTools

### Working with the Spoolman API

The Spoolman API integration is in `src/api/spoolman.ts`. Key endpoints:

- `/api/v1/spool` - Get all spools
- `/api/v1/filament` - Get all filaments
- `/api/v1/vendor` - Get all vendors

## 🙏 Questions?

Don't hesitate to ask! You can:

- 💬 Open a [discussion](https://github.com/Disane87/spoolman-filament-swatch/discussions)
- 📧 Comment on an existing issue
- 🐛 Create a new issue with the "question" label

## 🎉 Thank You!

Every contribution, no matter how small, makes a difference! Thank you for helping make Spoolman Filament Swatch better! 🚀

---

Made with ❤️ by the community, for the community
