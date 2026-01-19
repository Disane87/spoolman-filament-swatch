# Spool Swatch - MakerWorld Importer Browser Extension

Eine Browser-Extension, die auf makerworld.com einen "📥 In Spool Swatch importieren" Button hinzufügt und 3MF Druckprojekte direkt in Spool Swatch importiert.

## Installation

### Chrome/Edge (Entwickler-Modus)

1. Öffne `chrome://extensions` (oder `edge://extensions`)
2. Aktiviere "Entwicklermodus" (oben rechts)
3. Klick auf "Entpackte Erweiterung laden"
4. Wähle diesen `extension` Ordner

### Firefox

1. Öffne `about:debugging#/runtime/this-firefox`
2. Klick auf "Temporäres Add-on laden"
3. Wähle die `manifest.json` Datei aus diesem Ordner

## Features

- 📥 **Button auf MakerWorld Modell-Seiten** - "In Spool Swatch importieren" Button
- 🎨 **Automatischer 3MF Download** - Lädt die Projekt-Datei herunter
- 🧵 **Projekt Import** - Importiert alle Platten, Schichten und Filament-Farben
- 🔗 **Direkte Integration** - Öffnet Spool Swatch mit den Projektdaten

## Dateistruktur

- `manifest.json` - Extension-Konfiguration
- `content.js` - Content-Script für MakerWorld Website
- `popup.html` - Popup UI
- `popup.js` - Popup Logik
- `README.md` - Diese Datei

## Wie es funktioniert

1. Der Content-Script fügt einen Button "📥 In Spool Swatch importieren" auf MakerWorld Modell-Seiten hinzu
2. Beim Klick wird die 3MF-Datei heruntergeladen
3. Die Datei wird in den Chrome Storage gespeichert
4. Spool Swatch wird geöffnet und lädt das Projekt automatisch
5. Alle erkannten Filament-Farben und Kombinationen werden angezeigt

## Voraussetzungen

- Spool Swatch muss lokal laufen auf `http://localhost:5173` (Vite dev server)
- Oder die URL in `content.js` anpassen

## Konfiguration

Um die Spool Swatch URL zu ändern, bearbeite `content.js` (Zeile ~60):

```javascript
const spoolSwatchUrl = 'http://deine-custom-url:port';
```

## Zukunfts-Features

- [ ] Externe Spool Swatch URLs unterstützen
- [ ] Unterstützung für andere Websites (Printables, etc.)
- [ ] Auto-Sync mit Spoolman API
- [ ] Projekthistorie und Favoriten

## Support

Fehler? Öffne ein Issue im Hauptprojekt!
