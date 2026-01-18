#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const APP_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = join(__dirname, '..', 'public', 'landing');
const VIEWPORT = { width: 1400, height: 900 };
const DEVICE_SCALE_FACTOR = 2; // Für Retina/HiDPI Displays

// Warte-Zeit für Animationen und Ladezeiten
const WAIT_TIME = 2000;
const NETWORK_IDLE_WAIT = 'networkidle2';

async function takeScreenshots() {
  console.log('🚀 Starte Screenshot-Erstellung...');
  
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      ...VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
    },
  });

  try {
    const page = await browser.newPage();
    
    // Navigiere zur Haupt-App mit URL-Parametern (surl für Spoolman URL, nover um Changelog zu unterdrücken)
    console.log(`📍 Navigiere zu ${APP_URL}/app?surl=https://spoolman.disane.dev&nover=true...`);
    await page.goto(`${APP_URL}/app?surl=https://spoolman.disane.dev&nover=true`, { 
      waitUntil: NETWORK_IDLE_WAIT,
      timeout: 30000 
    });
    
    // Warte auf initiales Rendering
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));

    // Screenshot 1: Board View (Standard-Ansicht)
    console.log('📸 Erstelle Screenshot: Board View...');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'screenshot-board-view.png'),
      fullPage: false,
    });
    console.log('✅ Board View gespeichert');

    // Screenshot 2: Carousel View
    console.log('📸 Erstelle Screenshot: Carousel View...');
    // Suche nach dem Toggle-Button für Carousel View
    const carouselToggleSelector = 'button[aria-label*="Carousel"], button[title*="Carousel"], button:has-text("Carousel")';
    
    try {
      // Versuche verschiedene Selektoren für den View-Toggle
      const toggleButtons = await page.$$('button');
      let foundToggle = false;
      
      for (const button of toggleButtons) {
        const text = await button.evaluate(el => el.textContent || '');
        const ariaLabel = await button.evaluate(el => el.getAttribute('aria-label') || '');
        const title = await button.evaluate(el => el.getAttribute('title') || '');
        
        if (text.toLowerCase().includes('carousel') || 
            ariaLabel.toLowerCase().includes('carousel') ||
            title.toLowerCase().includes('carousel') ||
            text.toLowerCase().includes('karussell')) {
          await button.click();
          foundToggle = true;
          console.log('🔄 Carousel View aktiviert');
          break;
        }
      }
      
      if (!foundToggle) {
        console.log('⚠️  Carousel Toggle nicht gefunden, verwende aktuelle Ansicht');
      }
      
      await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'screenshot-carousel-view.png'),
        fullPage: false,
      });
      console.log('✅ Carousel View gespeichert');
    } catch (error) {
      console.log('⚠️  Konnte Carousel View nicht erstellen:', error.message);
    }

    // Screenshot 3: Filter-Ansicht
    console.log('📸 Erstelle Screenshot: Filter View...');
    
    // Zurück zur Board-Ansicht falls wir im Carousel waren
    await page.goto(`${APP_URL}/app?surl=https://spoolman.disane.dev&nover=true`, { 
      waitUntil: NETWORK_IDLE_WAIT 
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Öffne verschiedene Filter um die Funktionalität zu zeigen
      const filterSelectors = [
        'select', 
        'button:has-text("Filter")',
        '[role="combobox"]',
        'input[type="search"]'
      ];
      
      let filtersOpened = false;
      for (const selector of filterSelectors) {
        try {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            // Klicke auf das erste verfügbare Filter-Element
            await elements[0].click();
            filtersOpened = true;
            console.log(`🔍 Filter geöffnet mit: ${selector}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            break;
          }
        } catch (e) {
          // Versuche nächsten Selektor
          continue;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'screenshot-filters.png'),
        fullPage: false,
      });
      console.log('✅ Filter View gespeichert');
    } catch (error) {
      console.log('⚠️  Konnte Filter View nicht erstellen:', error.message);
    }

    console.log('\n✨ Alle Screenshots erfolgreich erstellt!');
    console.log(`📁 Gespeichert in: ${SCREENSHOT_DIR}`);
    
    // Konvertiere PNGs zu WebP für bessere Performance
    console.log('\n🔄 Konvertiere Screenshots zu WebP...');
    await convertToWebP();
    
  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function convertToWebP() {
  try {
    // Prüfe ob sharp installiert ist
    const sharp = await import('sharp').catch(() => null);
    
    if (!sharp) {
      console.log('⚠️  sharp nicht installiert. Überspringe WebP Konvertierung.');
      console.log('   Installiere mit: npm install -D sharp');
      return;
    }

    const screenshots = [
      'screenshot-board-view.png',
      'screenshot-carousel-view.png',
      'screenshot-filters.png'
    ];

    for (const screenshot of screenshots) {
      const inputPath = join(SCREENSHOT_DIR, screenshot);
      const outputPath = join(SCREENSHOT_DIR, screenshot.replace('.png', '.webp'));
      
      try {
        await sharp.default(inputPath)
          .webp({ quality: 85 })
          .toFile(outputPath);
        console.log(`✅ ${screenshot} → WebP konvertiert`);
      } catch (err) {
        console.log(`⚠️  Konvertierung fehlgeschlagen für ${screenshot}:`, err.message);
      }
    }
    
    console.log('✨ WebP Konvertierung abgeschlossen!');
  } catch (error) {
    console.log('⚠️  WebP Konvertierung übersprungen:', error.message);
  }
}

// Haupt-Funktion
(async () => {
  console.log('\n════════════════════════════════════════════');
  console.log('  Spoolman Filament Swatch - Screenshot Tool');
  console.log('════════════════════════════════════════════\n');
  
  // Prüfe ob Dev-Server läuft
  try {
    const response = await fetch(APP_URL);
    if (!response.ok) {
      throw new Error('Dev-Server antwortet nicht korrekt');
    }
  } catch (error) {
    console.error('❌ Fehler: Dev-Server ist nicht erreichbar!');
    console.error(`   Bitte starte den Server mit: npm run dev`);
    console.error(`   Stelle sicher, dass der Server auf ${APP_URL} läuft.\n`);
    process.exit(1);
  }
  
  await takeScreenshots();
  
  console.log('\n✨ Fertig! Screenshots sind bereit für die Landing Page.\n');
})();
