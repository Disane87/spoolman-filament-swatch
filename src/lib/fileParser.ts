/**
 * File parser utilities for extracting filament information from 3D print files
 * Supports .3mf (3D Manufacturing Format) and .gcode files
 */

import JSZip from 'jszip';

export interface FilamentInfo {
    name?: string;
    material?: string;
    color?: string;
    colorHex?: string;
    weight?: number; // in grams
    length?: number; // in mm
    cost?: number;
    temperature?: number;
    bedTemperature?: number;
    vendor?: string;
}

export interface PrintJobInfo {
    fileName: string;
    filaments: FilamentInfo[];
    printTime?: number; // in seconds
    layerHeight?: number;
    slicerName?: string;
    slicerVersion?: string;
    thumbnail?: string; // Base64 encoded preview image
    plateImages?: string[]; // Base64 encoded plate preview images
}

/**
 * Parse a .3mf file (ZIP archive containing XML metadata)
 * 3MF stores comprehensive information about materials, colors, and print settings
 */
export async function parse3MF(file: File): Promise<PrintJobInfo> {
    try {
        const zip = await JSZip.loadAsync(file);
        const result: PrintJobInfo = {
            fileName: file.name,
            filaments: []
        };

        console.log('Parsing 3MF file:', file.name);
        console.log('Available files in ZIP:', Object.keys(zip.files));

        // Parse 3dmodel.model (main model file with materials)
        const modelFile = zip.file('3D/3dmodel.model');
        if (modelFile) {
            const xmlContent = await modelFile.async('text');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

            // Extract materials (color and type info)
            const materials = xmlDoc.getElementsByTagName('basematerials');
            if (materials.length > 0) {
                const baseMaterials = materials[0].getElementsByTagName('base');
                for (let i = 0; i < baseMaterials.length; i++) {
                    const material = baseMaterials[i];
                    const colorAttr = material.getAttribute('displaycolor');
                    const nameAttr = material.getAttribute('name');

                    result.filaments.push({
                        name: nameAttr || undefined,
                        colorHex: colorAttr ? `#${colorAttr}` : undefined,
                        color: nameAttr || undefined
                    });
                }
            }
        }

        // Parse Metadata folder for slicer-specific data (Bambu Lab, PrusaSlicer, etc.)
        const metadataFolder = zip.folder('Metadata');
        if (metadataFolder) {
            console.log('Found Metadata folder');

            // Try Bambu Lab project_settings.config first (has multi-color info)
            const projectSettings = zip.file('Metadata/project_settings.config');
            if (projectSettings) {
                console.log('Found Metadata/project_settings.config');
                const settingsText = await projectSettings.async('text');
                try {
                    const settings = JSON.parse(settingsText);

                    // Extract filament arrays
                    const colors = settings.filament_colour || [];
                    const types = settings.filament_type || [];
                    const vendors = settings.filament_vendor || [];
                    const costs = settings.filament_cost || [];

                    console.log('Found filaments in project_settings:', colors.length);

                    // Create filament entries for each color
                    for (let i = 0; i < Math.max(colors.length, types.length); i++) {
                        if (!result.filaments[i]) result.filaments[i] = {};
                        if (colors[i]) result.filaments[i].colorHex = colors[i];
                        if (types[i]) result.filaments[i].material = types[i];
                        if (vendors[i]) result.filaments[i].vendor = vendors[i];
                        if (costs[i]) result.filaments[i].cost = parseFloat(costs[i]);
                    }
                } catch (e) {
                    console.error('Error parsing project_settings.config:', e);
                }
            }

            // Bambu Lab stores filament info in Metadata/plate_1.gcode or slice_info.config
            const plateGcode = zip.file('Metadata/plate_1.gcode');
            if (plateGcode) {
                console.log('Found Metadata/plate_1.gcode');
                const content = await plateGcode.async('text');
                console.log('First 500 chars:', content.substring(0, 500));
                extractBambuLabMetadata(content, result);
            }

            const sliceInfo = zip.file('Metadata/slice_info.config');
            if (sliceInfo) {
                console.log('Found Metadata/slice_info.config');
                const content = await sliceInfo.async('text');
                console.log('First 500 chars:', content.substring(0, 500));
                extractBambuLabConfig(content, result);
            }

            // Check for other metadata files
            const metadataFiles = Object.keys(zip.files).filter(name =>
                name.includes('Metadata') && (name.endsWith('.xml') || name.endsWith('.config') || name.endsWith('.gcode'))
            );

            console.log('Metadata files found:', metadataFiles);

            for (const metaFile of metadataFiles) {
                if (metaFile.includes('plate_1.gcode') || metaFile.includes('slice_info.config') || metaFile.includes('project_settings.config')) {
                    continue; // Already processed
                }

                const content = await zip.file(metaFile)?.async('text');
                if (!content) continue;

                // PrusaSlicer metadata format
                if (content.includes('slic3rpe:') || content.includes('PrusaSlicer')) {
                    extractPrusaSlicerMetadata(content, result);
                }

                // Cura metadata format
                if (content.includes('cura:')) {
                    extractCuraMetadata(content, result);
                }

                // Generic metadata
                extractGenericMetadata(content, result);
            }
        }

        console.log('Parsed filaments:', result.filaments);

        // Extract thumbnail preview images
        await extractThumbnail(zip, result);

        // If no filaments found, ensure at least one empty entry
        if (result.filaments.length === 0) {
            result.filaments.push({});
        }

        return result;
    } catch (error) {
        console.error('Error parsing 3MF file:', error);
        throw new Error(`Failed to parse 3MF file: ${error}`);
    }
}

/**
 * Parse a .gcode file by reading slicer comments and metadata
 * Most slicers add comprehensive metadata in the header comments
 */
export async function parseGCode(file: File): Promise<PrintJobInfo> {
    const result: PrintJobInfo = {
        fileName: file.name,
        filaments: []
    };

    try {
        // Read first 50KB (header with metadata)
        const text = await file.slice(0, 51200).text();
        const lines = text.split('\n');

        let currentFilament: Partial<FilamentInfo> = {};

        for (const line of lines) {
            const trimmed = line.trim();

            // Stop at actual gcode commands
            if (trimmed && !trimmed.startsWith(';') && !trimmed.startsWith('M486')) {
                break;
            }

            // PrusaSlicer / SuperSlicer format
            if (trimmed.includes('; filament_type =')) {
                const materials = extractValue(trimmed).split(';').map(s => s.trim());
                materials.forEach((mat, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].material = mat;
                });
            }

            if (trimmed.includes('; filament_colour =')) {
                const colors = extractValue(trimmed).split(';').map(s => s.trim());
                colors.forEach((color, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].colorHex = color.startsWith('#') ? color : `#${color}`;
                });
            }

            if (trimmed.includes('; filament used [g] =')) {
                const weights = extractValue(trimmed).split(',').map(s => parseFloat(s.trim()));
                weights.forEach((weight, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].weight = weight;
                });
            }

            if (trimmed.includes('; filament used [mm] =')) {
                const lengths = extractValue(trimmed).split(',').map(s => parseFloat(s.trim()));
                lengths.forEach((length, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].length = length;
                });
            }

            if (trimmed.includes('; filament_cost =')) {
                const costs = extractValue(trimmed).split(',').map(s => parseFloat(s.trim()));
                costs.forEach((cost, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].cost = cost;
                });
            }

            if (trimmed.includes('; temperature =')) {
                const temps = extractValue(trimmed).split(',').map(s => parseInt(s.trim()));
                temps.forEach((temp, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].temperature = temp;
                });
            }

            if (trimmed.includes('; bed_temperature =')) {
                const temps = extractValue(trimmed).split(',').map(s => parseInt(s.trim()));
                temps.forEach((temp, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].bedTemperature = temp;
                });
            }

            // Cura format
            if (trimmed.includes(';MATERIAL:')) {
                currentFilament.material = trimmed.split(':')[1]?.trim();
            }

            if (trimmed.includes(';MATERIALWEIGHT:')) {
                currentFilament.weight = parseFloat(trimmed.split(':')[1]?.trim() || '0');
            }

            if (trimmed.includes(';MATERIALCOST:')) {
                currentFilament.cost = parseFloat(trimmed.split(':')[1]?.trim() || '0');
            }

            // Simplify3D format
            if (trimmed.includes('; plasticWeight,')) {
                currentFilament.weight = parseFloat(trimmed.split(',')[1] || '0');
            }

            // Generic metadata
            if (trimmed.includes('; estimated printing time')) {
                const timeStr = extractValue(trimmed);
                result.printTime = parseTimeString(timeStr);
            }

            if (trimmed.includes('; layer_height =')) {
                result.layerHeight = parseFloat(extractValue(trimmed));
            }

            if (trimmed.includes('; generated by')) {
                const slicerInfo = extractValue(trimmed);
                const match = slicerInfo.match(/^([^\s]+)\s+(.+)$/);
                if (match) {
                    result.slicerName = match[1];
                    result.slicerVersion = match[2];
                } else {
                    result.slicerName = slicerInfo;
                }
            }
        }

        // Add Cura filament if found
        if (Object.keys(currentFilament).length > 0) {
            result.filaments.push(currentFilament as FilamentInfo);
        }

        // Ensure at least one filament entry
        if (result.filaments.length === 0) {
            result.filaments.push({});
        }

        return result;
    } catch (error) {
        console.error('Error parsing GCode file:', error);
        throw new Error(`Failed to parse GCode file: ${error}`);
    }
}

/**
 * Extract Bambu Lab metadata from plate gcode
 */
function extractBambuLabMetadata(content: string, result: PrintJobInfo) {
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Bambu Lab filament type
        if (trimmed.startsWith('; filament_type =')) {
            const value = trimmed.split('=')[1]?.trim();
            if (value) {
                const materials = value.split(';').map(s => s.trim()).filter(Boolean);
                materials.forEach((mat, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].material = mat;
                });
            }
        }

        // Bambu Lab filament color
        if (trimmed.startsWith('; filament_colour =')) {
            const value = trimmed.split('=')[1]?.trim();
            if (value) {
                const colors = value.split(';').map(s => s.trim()).filter(Boolean);
                colors.forEach((color, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    const hex = color.startsWith('#') ? color : `#${color}`;
                    result.filaments[idx].colorHex = hex;
                });
            }
        }

        // Bambu Lab filament used (weight)
        if (trimmed.startsWith('; total_filament_used =') || trimmed.startsWith('; filament used [g] =')) {
            const value = trimmed.split('=')[1]?.trim();
            if (value) {
                const weights = value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                weights.forEach((weight, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].weight = weight;
                });
            }
        }

        // Bambu Lab filament used (length)
        if (trimmed.startsWith('; filament used [mm] =')) {
            const value = trimmed.split('=')[1]?.trim();
            if (value) {
                const lengths = value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                lengths.forEach((length, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].length = length;
                });
            }
        }

        // Bambu Lab filament cost
        if (trimmed.startsWith('; filament_cost =')) {
            const value = trimmed.split('=')[1]?.trim();
            if (value) {
                const costs = value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                costs.forEach((cost, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].cost = cost;
                });
            }
        }

        // Bambu Lab nozzle temperature
        if (trimmed.startsWith('; nozzle_temperature =')) {
            const value = trimmed.split('=')[1]?.trim();
            if (value) {
                const temps = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                temps.forEach((temp, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    result.filaments[idx].temperature = temp;
                });
            }
        }

        // Bambu Lab bed temperature
        if (trimmed.startsWith('; bed_temperature_initial_layer =') || trimmed.startsWith('; bed_temperature =')) {
            const value = trimmed.split('=')[1]?.trim();
            if (value) {
                const temps = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                temps.forEach((temp, idx) => {
                    if (!result.filaments[idx]) result.filaments[idx] = {};
                    if (!result.filaments[idx].bedTemperature) {
                        result.filaments[idx].bedTemperature = temp;
                    }
                });
            }
        }

        // Bambu Lab estimated time
        if (trimmed.startsWith('; estimated printing time =') || trimmed.startsWith('; total estimated printing time =')) {
            const value = trimmed.split('=')[1]?.trim();
            if (value) {
                result.printTime = parseTimeString(value);
            }
        }

        // Bambu Lab layer height
        if (trimmed.startsWith('; layer_height =')) {
            const value = trimmed.split('=')[1]?.trim();
            if (value) {
                result.layerHeight = parseFloat(value);
            }
        }

        // Bambu Studio version
        if (trimmed.includes('generated by BambuStudio') || trimmed.includes('BambuStudio')) {
            const match = trimmed.match(/BambuStudio\s+([\d.]+)/);
            result.slicerName = 'BambuStudio';
            if (match) {
                result.slicerVersion = match[1];
            }
        }
    }
}

/**
 * Extract Bambu Lab config file metadata
 */
function extractBambuLabConfig(content: string, result: PrintJobInfo) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');

        console.log('Parsing Bambu Lab config XML');

        // Get all plate elements
        const plates = xmlDoc.getElementsByTagName('plate');
        console.log('Found plates:', plates.length);

        // Collect all filaments from all plates
        const filamentsMap = new Map<string, FilamentInfo>();

        for (let i = 0; i < plates.length; i++) {
            const plate = plates[i];
            const filaments = plate.getElementsByTagName('filament');

            console.log(`Plate ${i + 1} has ${filaments.length} filaments`);

            for (let j = 0; j < filaments.length; j++) {
                const filament = filaments[j];
                const id = filament.getAttribute('id') || `${i}-${j}`;
                const type = filament.getAttribute('type');
                const color = filament.getAttribute('color');
                const usedG = filament.getAttribute('used_g');
                const usedM = filament.getAttribute('used_m');
                const trayInfo = filament.getAttribute('tray_info_idx');

                console.log('Filament data:', { id, type, color, usedG, usedM, trayInfo });

                // Use filament type + color as unique key to avoid duplicates
                const key = `${type}-${color}`;

                if (!filamentsMap.has(key)) {
                    filamentsMap.set(key, {
                        material: type || undefined,
                        colorHex: color || undefined,
                        weight: usedG ? parseFloat(usedG) : undefined,
                        length: usedM ? parseFloat(usedM) * 1000 : undefined, // Convert m to mm
                        vendor: trayInfo || undefined,
                    });
                } else {
                    // Accumulate weight and length for same filament
                    const existing = filamentsMap.get(key)!;
                    if (usedG) {
                        existing.weight = (existing.weight || 0) + parseFloat(usedG);
                    }
                    if (usedM) {
                        existing.length = (existing.length || 0) + parseFloat(usedM) * 1000;
                    }
                }
            }
        }

        // Also check for metadata about print time and layer height
        const metadata = xmlDoc.getElementsByTagName('metadata');
        for (let i = 0; i < metadata.length; i++) {
            const item = metadata[i];
            const key = item.getAttribute('key');
            const value = item.getAttribute('value');

            if (key === 'prediction' && value && !result.printTime) {
                result.printTime = parseInt(value);
            }
        }

        // Convert map to array and add to result
        const filamentArray = Array.from(filamentsMap.values());
        console.log('Extracted filaments:', filamentArray);

        if (filamentArray.length > 0) {
            // Replace empty filaments array with parsed data
            result.filaments = filamentArray;
        }

    } catch (error) {
        console.error('Error parsing Bambu Lab config XML:', error);
    }
}

/**
 * Extract PrusaSlicer-specific metadata from 3MF
 */
function extractPrusaSlicerMetadata(content: string, result: PrintJobInfo) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');

    // Look for metadata entries
    const metadata = xmlDoc.getElementsByTagName('metadata');
    for (let i = 0; i < metadata.length; i++) {
        const item = metadata[i];
        const name = item.getAttribute('name');
        const value = item.textContent;

        if (name === 'slic3rpe:filament_type' && value) {
            const materials = value.split(';');
            materials.forEach((mat, idx) => {
                if (!result.filaments[idx]) result.filaments[idx] = {};
                result.filaments[idx].material = mat.trim();
            });
        }

        if (name === 'slic3rpe:filament_colour' && value) {
            const colors = value.split(';');
            colors.forEach((color, idx) => {
                if (!result.filaments[idx]) result.filaments[idx] = {};
                result.filaments[idx].colorHex = color.startsWith('#') ? color : `#${color}`;
            });
        }

        if (name === 'slic3rpe:total_weight' && value) {
            result.filaments[0] = result.filaments[0] || {};
            result.filaments[0].weight = parseFloat(value);
        }

        if (name === 'slic3rpe:estimated_printing_time' && value) {
            result.printTime = parseTimeString(value);
        }
    }
}

/**
 * Extract Cura-specific metadata from 3MF
 */
function extractCuraMetadata(content: string, result: PrintJobInfo) {
    // Cura stores metadata differently, often as key-value pairs
    const materialMatch = content.match(/material_weight="([^"]+)"/);
    if (materialMatch) {
        result.filaments[0] = result.filaments[0] || {};
        result.filaments[0].weight = parseFloat(materialMatch[1]);
    }

    const printTimeMatch = content.match(/print_time="([^"]+)"/);
    if (printTimeMatch) {
        result.printTime = parseInt(printTimeMatch[1]);
    }
}

/**
 * Extract generic metadata (fallback)
 */
function extractGenericMetadata(content: string, result: PrintJobInfo) {
    // Look for common patterns
    const weightMatch = content.match(/weight[:\s=]+([0-9.]+)/i);
    if (weightMatch) {
        result.filaments[0] = result.filaments[0] || {};
        result.filaments[0].weight = parseFloat(weightMatch[1]);
    }
}

/**
 * Extract value from a comment line (after = or :)
 */
function extractValue(line: string): string {
    const parts = line.split(/[=:]/);
    return parts.length > 1 ? parts.slice(1).join(':').trim() : '';
}

/**
 * Parse time strings like "1h 23m 45s" or "1:23:45" to seconds
 */
function parseTimeString(timeStr: string): number {
    let totalSeconds = 0;

    // Format: "1h 23m 45s"
    const hoursMatch = timeStr.match(/(\d+)h/);
    const minutesMatch = timeStr.match(/(\d+)m/);
    const secondsMatch = timeStr.match(/(\d+)s/);

    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
    if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);

    // Format: "1:23:45" or "83:45"
    if (totalSeconds === 0 && timeStr.includes(':')) {
        const parts = timeStr.split(':').map(p => parseInt(p.trim()));
        if (parts.length === 3) {
            totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            totalSeconds = parts[0] * 60 + parts[1];
        }
    }

    return totalSeconds;
}

/**
 * Extract thumbnail from 3MF archive
 */
async function extractThumbnail(zip: JSZip, result: PrintJobInfo): Promise<void> {
    try {
        // Bambu Lab thumbnails are in Auxiliaries/.thumbnails/
        // Try different thumbnail sizes (prefer middle or large)
        const thumbnailPaths = [
            'Auxiliaries/.thumbnails/thumbnail_3mf.png',
            'Auxiliaries/.thumbnails/thumbnail_middle.png',
            'Auxiliaries/.thumbnails/thumbnail_small.png'
        ];

        for (const path of thumbnailPaths) {
            const thumbnailFile = zip.file(path);
            if (thumbnailFile) {
                console.log(`Found thumbnail: ${path}`);
                const blob = await thumbnailFile.async('blob');
                const base64 = await blobToBase64(blob);
                result.thumbnail = base64;
                break;
            }
        }

        // Extract plate images (Bambu Lab stores them as plate_1.png, plate_2.png, etc.)
        const plateImages: string[] = [];
        for (let i = 1; i <= 10; i++) {
            const plateFile = zip.file(`Metadata/plate_${i}.png`);
            if (plateFile) {
                console.log(`Found plate image: Metadata/plate_${i}.png`);
                const blob = await plateFile.async('blob');
                const base64 = await blobToBase64(blob);
                plateImages.push(base64);
            } else {
                break; // Stop when no more plates found
            }
        }
        if (plateImages.length > 0) {
            result.plateImages = plateImages;
            console.log(`Extracted ${plateImages.length} plate images`);
        }

        if (!result.thumbnail) {
            console.log('No thumbnail found in 3MF archive');
        }
    } catch (error) {
        console.warn('Failed to extract thumbnail or plate images:', error);
    }
}

/**
 * Convert a Blob to Base64 data URL
 */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

/**
 * Format seconds to human readable time
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
}

/**
 * Main entry point - auto-detect file type and parse
 */
export async function parseSlicerFile(file: File): Promise<PrintJobInfo> {
    const extension = file.name.toLowerCase().split('.').pop();

    switch (extension) {
        case '3mf':
            return parse3MF(file);
        case 'gcode':
        case 'gco':
        case 'g':
            return parseGCode(file);
        default:
            throw new Error(`Unsupported file type: ${extension}`);
    }
}
