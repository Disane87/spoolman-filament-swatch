<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { parseSlicerFile, formatDuration, type PrintJobInfo } from '@/lib/fileParser';
import { createProject, matchFilamentToSpoolman } from '@/api/projects';
import { useFilaments } from '@/composables/useFilaments';
import type { ProjectFilament } from '@/types/project';
import { Icon } from '@iconify/vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FilamentCombobox from '@/components/FilamentCombobox.vue';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'projectCreated': [projectId: string];
}>();

const { t } = useI18n();
const { allFilaments } = useFilaments();

const isDragging = ref(false);
const isProcessing = ref(false);
const uploadedFile = ref<File | null>(null);
const parsedInfo = ref<PrintJobInfo | null>(null);
const projectName = ref('');
const projectDescription = ref('');
const error = ref<string | null>(null);

// Track selected Spoolman filament for each parsed filament
const selectedSpoolmanIds = ref<Map<number, string>>(new Map());

const fileInputRef = ref<HTMLInputElement | null>(null);

const isValid = computed(() => {
  return projectName.value.trim().length > 0 && parsedInfo.value !== null;
});

const totalWeight = computed(() => {
  if (!parsedInfo.value) return 0;
  return parsedInfo.value.filaments.reduce((sum, f) => sum + (f.weight || 0), 0);
});

const totalCost = computed(() => {
  if (!parsedInfo.value) return 0;
  return parsedInfo.value.filaments.reduce((sum, f) => sum + (f.cost || 0), 0);
});

// Convert hex color to RGB
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

// Calculate color similarity using Euclidean distance in RGB space
// Returns 0-100 where 100 is identical color
function calculateColorSimilarity(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const distance = Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) + 
    Math.pow(rgb1[1] - rgb2[1], 2) + 
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
  
  // Normalize to 0-100 (max distance is sqrt(255^2 + 255^2 + 255^2) ≈ 441)
  return Math.max(0, 100 - (distance / 441) * 100);
}

// Get matching Spoolman filaments for a parsed filament
function getMatchingFilaments(filament: PrintJobInfo['filaments'][0]) {
  if (!allFilaments.value.length) return [];
  
  const matches: Array<{ filament: any; score: number }> = [];
  
  for (const spoolman of allFilaments.value) {
    let score = 0;
    
    // Material + Color match (highest priority)
    if (filament.material && spoolman.material.toLowerCase() === filament.material.toLowerCase()) {
      // If color also matches or is similar, bonus
      if (filament.colorHex && spoolman.colorHex) {
        const colorSimilarity = calculateColorSimilarity(filament.colorHex, spoolman.colorHex);
        if (colorSimilarity > 95) {
          score += 20; // Perfect match
        } else if (colorSimilarity > 75) {
          score += 18; // Very similar color
        } else if (colorSimilarity > 50) {
          score += 14; // Similar color
        } else {
          score += 10; // Material match only
        }
      } else {
        score += 10; // Material match without color comparison
      }
    }
    
    // Color similarity match alone (medium priority - without material match)
    if (score === 0 && filament.colorHex && spoolman.colorHex) {
      const colorSimilarity = calculateColorSimilarity(filament.colorHex, spoolman.colorHex);
      if (colorSimilarity > 95) {
        score += 12;
      } else if (colorSimilarity > 75) {
        score += 11;
      } else if (colorSimilarity > 50) {
        score += 8;
      }
    }
    
    // Vendor match (lower priority)
    if (filament.vendor && spoolman.vendor.toLowerCase().includes(filament.vendor.toLowerCase())) {
      score += 5;
    }
    
    // Color name similarity (lowest priority)
    if (filament.color && spoolman.colorName.toLowerCase().includes(filament.color.toLowerCase())) {
      score += 2;
    }
    
    if (score > 0) {
      matches.push({ filament: spoolman, score });
    }
  }
  
  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score).map(m => m.filament);
}

// Auto-select best match for a parsed filament
function autoSelectBestMatch(index: number, filament: PrintJobInfo['filaments'][0]) {
  const matches = getMatchingFilaments(filament);
  if (matches.length > 0 && !selectedSpoolmanIds.value.has(index)) {
    selectedSpoolmanIds.value.set(index, matches[0].id);
  }
}

// Get the selected or auto-matched filament for a parsed filament
function getSelectedFilament(index: number, parsedFilament: PrintJobInfo['filaments'][0]) {
  const selectedId = selectedSpoolmanIds.value.get(index);
  if (selectedId) {
    return allFilaments.value.find(f => f.id === selectedId);
  }
  
  // Don't auto-select - user must choose
  return null;
}

// Check if the selected filament has insufficient capacity
function hasCapacityWarning(index: number, parsedFilament: PrintJobInfo['filaments'][0]): boolean {
  const selectedFilament = getSelectedFilament(index, parsedFilament);
  if (!selectedFilament || !parsedFilament.weight) return false;
  
  // Check if remaining weight is less than required weight
  // Use totalRemainingWeight from all spools
  const remainingWeight = selectedFilament.totalRemainingWeight || selectedFilament.weight || 0;
  return remainingWeight < parsedFilament.weight;
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

async function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    await processFile(files[0]);
  }
}

function handleFileClick() {
  fileInputRef.value?.click();
}

async function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    await processFile(input.files[0]);
  }
}

async function processFile(file: File) {
  const ext = file.name.toLowerCase().split('.').pop();
  if (!['3mf', 'gcode', 'gco', 'g'].includes(ext || '')) {
    error.value = t('projects.importDialog.errorUnsupported');
    return;
  }

  isProcessing.value = true;
  error.value = null;
  uploadedFile.value = file;

  try {
    const info = await parseSlicerFile(file);
    parsedInfo.value = info;
    selectedSpoolmanIds.value.clear();
    
    // Auto-select best matches for all filaments
    info.filaments.forEach((f, idx) => {
      autoSelectBestMatch(idx, f);
    });
    
    // Auto-fill project name from filename
    if (!projectName.value) {
      projectName.value = file.name.replace(/\.(3mf|gcode|gco|g)$/i, '');
    }
  } catch (err) {
    console.error('Error parsing file:', err);
    error.value = t('projects.importDialog.errorParsing', { error: err });
    uploadedFile.value = null;
    parsedInfo.value = null;
  } finally {
    isProcessing.value = false;
  }
}

function handleClose() {
  emit('update:open', false);
  reset();
}

function reset() {
  uploadedFile.value = null;
  parsedInfo.value = null;
  projectName.value = '';
  projectDescription.value = '';
  error.value = null;
  isDragging.value = false;
  isProcessing.value = false;
  selectedSpoolmanIds.value.clear();
}

async function handleCreate() {
  if (!isValid.value || !parsedInfo.value || !uploadedFile.value) return;

  try {
    const filamentUsage: Omit<ProjectFilament, 'id' | 'projectId'>[] = parsedInfo.value.filaments.map((f, idx) => {
      const selectedFilament = getSelectedFilament(idx, f);
      
      return {
        plateIndex: 0, // First plate by default
        estimatedWeight: f.weight,
        estimatedLength: f.length,
        material: selectedFilament?.material || f.material,
        color: selectedFilament?.colorName || f.color,
        colorHex: selectedFilament?.colorHex || f.colorHex,
        temperature: f.temperature,
        bedTemperature: f.bedTemperature,
        vendor: selectedFilament?.vendor || f.vendor,
        cost: selectedFilament?.price || f.cost, // Cost per kg
        spoolWeight: selectedFilament?.weight, // Total weight of spool in grams
        spoolmanFilamentId: selectedFilament?.id,
      };
    });

    // Convert file to base64 for storage
    const modelData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(uploadedFile.value!);
    });

    const project = createProject({
      name: projectName.value.trim(),
      description: projectDescription.value.trim() || undefined,
      printTime: parsedInfo.value.printTime,
      layerHeight: parsedInfo.value.layerHeight,
      slicerName: parsedInfo.value.slicerName,
      slicerVersion: parsedInfo.value.slicerVersion,
      status: 'planning',
      filamentUsage,
      imageUrl: parsedInfo.value.thumbnail,
      modelData,
      plateImages: parsedInfo.value.plateImages,
    });

    emit('projectCreated', project.id);
    handleClose();
  } catch (err) {
    console.error('Error creating project:', err);
    error.value = t('projects.importDialog.errorCreating', { error: err });
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ t('projects.importDialog.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('projects.importDialog.description') }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- File Upload Area -->
        <div
          v-if="!uploadedFile"
          class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
          :class="{
            'border-primary bg-primary/5': isDragging,
            'border-border hover:border-primary/50 hover:bg-accent/50': !isDragging
          }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="handleFileClick"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".3mf,.gcode,.gco,.g"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <div v-if="isProcessing" class="flex flex-col items-center gap-2">
            <Icon icon="lucide:loader-2" class="w-12 h-12 animate-spin text-primary" />
            <p class="text-sm text-muted-foreground">{{ t('projects.importDialog.processing') }}</p>
          </div>
          
          <div v-else class="flex flex-col items-center gap-2">
            <Icon icon="lucide:upload-cloud" class="w-12 h-12 text-muted-foreground" />
            <p class="font-medium">{{ t('projects.importDialog.dropzone') }}</p>
            <p class="text-sm text-muted-foreground">
              {{ t('projects.importDialog.supportedFormats') }}
            </p>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
          <Icon icon="lucide:alert-circle" class="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p class="text-sm text-destructive">{{ error }}</p>
        </div>

        <!-- Parsed Info Display -->
        <div v-if="parsedInfo" class="space-y-4">
          <!-- 3D Preview Thumbnail -->
          <div v-if="parsedInfo.thumbnail" class="flex justify-center">
            <div class="relative">
              <img 
                :src="parsedInfo.thumbnail" 
                alt="3D Preview" 
                class="rounded-lg shadow-lg max-h-64 object-contain border border-border"
              />
              <Badge class="absolute top-2 right-2 bg-background/80 backdrop-blur">
                <Icon icon="lucide:eye" class="w-3 h-3 mr-1" />
                {{ t('projects.importDialog.preview') }}
              </Badge>
            </div>
          </div>

          <!-- File Info -->
          <div class="p-4 bg-accent rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ uploadedFile?.name }}</span>
              <Button variant="ghost" size="sm" @click="reset">
                <Icon icon="lucide:x" class="w-4 h-4" />
              </Button>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div v-if="parsedInfo.slicerName">
                <span class="text-muted-foreground">{{ t('projects.fields.slicer') }}:</span>
                {{ parsedInfo.slicerName }} {{ parsedInfo.slicerVersion }}
              </div>
              <div v-if="parsedInfo.printTime">
                <span class="text-muted-foreground">{{ t('projects.fields.printTime') }}:</span>
                {{ formatDuration(parsedInfo.printTime) }}
              </div>
              <div v-if="parsedInfo.layerHeight">
                <span class="text-muted-foreground">{{ t('projects.fields.layerHeight') }}:</span>
                {{ parsedInfo.layerHeight }}mm
              </div>
              <div v-if="totalWeight > 0">
                <span class="text-muted-foreground">{{ t('projects.fields.total') }}:</span>
                {{ totalWeight.toFixed(1) }}g
              </div>
            </div>
          </div>

          <!-- Filaments with Spoolman Matching -->
          <div class="space-y-2">
            <h4 class="font-medium text-sm">{{ t('projects.importDialog.filaments', { count: parsedInfo.filaments.length }) }}</h4>
            <div class="space-y-3">
              <div
                v-for="(filament, idx) in parsedInfo.filaments"
                :key="idx"
                class="p-4 border rounded-lg space-y-3"
              >
                <!-- Parsed Filament Info -->
                <div class="flex items-center gap-3">
                  <div
                    v-if="filament.colorHex"
                    class="w-12 h-12 rounded border flex-shrink-0"
                    :style="{ backgroundColor: filament.colorHex }"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium">
                      {{ filament.material || t('projects.importDialog.unknownMaterial') }}
                      <span v-if="filament.vendor" class="text-muted-foreground">· {{ filament.vendor }}</span>
                    </div>
                    <div class="text-sm text-muted-foreground flex gap-3 flex-wrap">
                      <span v-if="filament.weight">{{ filament.weight.toFixed(1) }}g</span>
                      <span v-if="filament.length">{{ (filament.length / 1000).toFixed(1) }}m</span>
                      <span v-if="filament.temperature">{{ filament.temperature }}°C</span>
                      <span v-if="filament.cost">{{ filament.cost.toFixed(2) }}€</span>
                    </div>
                  </div>
                  <Badge v-if="filament.color" variant="secondary">
                    {{ filament.color }}
                  </Badge>
                </div>

                <!-- Spoolman Filament Selection -->
                <div v-if="allFilaments.length > 0" class="space-y-2">
                  <label class="text-xs font-medium text-muted-foreground">Spoolman Filament zuordnen:</label>
                  <FilamentCombobox
                    :filaments="allFilaments"
                    :model-value="selectedSpoolmanIds.get(idx) || ''"
                    @update:model-value="(value) => selectedSpoolmanIds.set(idx, value)"
                  />
                  
                  <!-- Show selected filament preview with capacity warning -->
                  <div 
                    v-if="getSelectedFilament(idx, filament)"
                    class="space-y-2"
                  >
                    <div class="p-2 bg-accent/50 rounded flex items-center gap-2 text-xs">
                      <Icon icon="lucide:check-circle" class="w-4 h-4 text-green-600" />
                      <div
                        class="w-6 h-6 rounded border"
                        :style="{ backgroundColor: getSelectedFilament(idx, filament)?.colorHex }"
                      />
                      <span class="font-medium">
                        {{ getSelectedFilament(idx, filament)?.vendor }} · 
                        {{ getSelectedFilament(idx, filament)?.material }} · 
                        {{ getSelectedFilament(idx, filament)?.colorName }}
                      </span>
                    </div>

                    <!-- Capacity Warning -->
                    <div 
                      v-if="hasCapacityWarning(idx, filament)"
                      class="p-2 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-2 text-xs text-destructive"
                    >
                      <Icon icon="lucide:alert-triangle" class="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <div class="font-medium">Warnung: Nicht genügend Filament</div>
                        <div class="text-muted-foreground">
                          Benötigt: {{ filament.weight?.toFixed(1) }}g · 
                          Verfügbar: {{ (getSelectedFilament(idx, filament)?.totalRemainingWeight || 0).toFixed(1) }}g
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Project Details -->
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium mb-1.5 block">{{ t('projects.importDialog.nameRequired') }}</label>
              <Input
                v-model="projectName"
                :placeholder="t('projects.importDialog.namePlaceholder')"
                class="w-full"
              />
            </div>
            <div>
              <label class="text-sm font-medium mb-1.5 block">{{ t('projects.importDialog.descriptionOptional') }}</label>
              <Input
                v-model="projectDescription"
                :placeholder="t('projects.importDialog.descriptionPlaceholder')"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">{{ t('actions.cancel') }}</Button>
        <Button @click="handleCreate" :disabled="!isValid || isProcessing">
          <Icon icon="lucide:plus" class="w-4 h-4 mr-2" />
          {{ t('projects.create') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
