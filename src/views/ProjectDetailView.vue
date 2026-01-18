<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { 
  getProject, 
  updateProject, 
  deleteProject,
  updateProjectFilament,
  removeFilamentFromProject,
  type Project 
} from '@/api/projects';
import { formatDuration } from '@/lib/fileParser';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ThreeDViewer from '@/components/ThreeDViewer.vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const project = ref<Project | null>(null);
const isEditing = ref(false);
const editedName = ref('');
const show3DViewer = ref(false);
const editedDescription = ref('');
const showDeleteDialog = ref(false);

const projectId = computed(() => route.params.id as string);

const totalWeight = computed(() => {
  if (!project.value) return 0;
  return project.value.filamentUsage.reduce((sum, f) => {
    return sum + (f.actualWeight || f.estimatedWeight || 0);
  }, 0);
});

const totalCost = computed(() => {
  if (!project.value) return 0;
  return project.value.filamentUsage.reduce((sum, f) => {
    const weight = f.actualWeight || f.estimatedWeight || 0;
    const costPerGram = f.cost && f.spoolWeight ? (f.cost / f.spoolWeight) : 0;
    return sum + (weight * costPerGram);
  }, 0);
});

const costByPlate = computed(() => {
  if (!project.value) return new Map<number, number>();
  const costMap = new Map<number, number>();
  project.value.filamentUsage.forEach(f => {
    const plateIdx = f.plateIndex ?? 0;
    const weight = f.actualWeight || f.estimatedWeight || 0;
    const costPerGram = f.cost && f.spoolWeight ? (f.cost / f.spoolWeight) : 0;
    const filamentCost = weight * costPerGram;
    costMap.set(plateIdx, (costMap.get(plateIdx) ?? 0) + filamentCost);
  });
  return costMap;
});

const costByFilament = computed(() => {
  if (!project.value) return new Map<string, number>();
  const costMap = new Map<string, number>();
  project.value.filamentUsage.forEach(f => {
    const weight = f.actualWeight || f.estimatedWeight || 0;
    const costPerGram = f.cost && f.spoolWeight ? (f.cost / f.spoolWeight) : 0;
    costMap.set(f.id, weight * costPerGram);
  });
  return costMap;
});

const plateCount = computed(() => {
  if (!project.value || project.value.plateImages?.length) {
    return project.value?.plateImages?.length ?? 1;
  }
  const maxPlateIdx = Math.max(
    ...project.value!.filamentUsage.map(f => f.plateIndex ?? 0),
    0
  );
  return maxPlateIdx + 1;
});

const filamentColors = computed(() => {
  if (!project.value) return [];
  return project.value.filamentUsage
    .map(f => f.colorHex)
    .filter((color): color is string => !!color);
});

function loadProject() {
  const p = getProject(projectId.value);
  if (!p) {
    router.push('/app/projects');
    return;
  }
  project.value = p;
  editedName.value = p.name;
  editedDescription.value = p.description || '';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'planning': return 'secondary';
    case 'in-progress': return 'default';
    case 'completed': return 'default';
    case 'archived': return 'secondary';
    default: return 'secondary';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'planning': return t('projects.status.planning');
    case 'in-progress': return t('projects.status.inProgress');
    case 'completed': return t('projects.status.completed');
    case 'archived': return t('projects.status.archived');
    default: return status;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'planning': return 'lucide:clipboard-list';
    case 'in-progress': return 'lucide:printer';
    case 'completed': return 'lucide:check-circle';
    case 'archived': return 'lucide:archive';
    default: return 'lucide:circle';
  }
}

function toggleStatus() {
  if (!project.value) return;
  
  const statusFlow = ['planning', 'in-progress', 'completed', 'archived'] as const;
  const currentIndex = statusFlow.indexOf(project.value.status);
  const nextIndex = (currentIndex + 1) % statusFlow.length;
  
  updateProject(projectId.value, { status: statusFlow[nextIndex] });
  loadProject();
}

function saveEdit() {
  if (!project.value || !editedName.value.trim()) return;
  
  updateProject(projectId.value, {
    name: editedName.value.trim(),
    description: editedDescription.value.trim() || undefined
  });
  
  loadProject();
  isEditing.value = false;
}

function cancelEdit() {
  if (!project.value) return;
  editedName.value = project.value.name;
  editedDescription.value = project.value.description || '';
  isEditing.value = false;
}

function confirmDelete() {
  showDeleteDialog.value = true;
}

function handleDelete() {
  deleteProject(projectId.value);
  router.push('/app/projects');
}

function updateActualWeight(filamentId: string, value: string) {
  const weight = parseFloat(value);
  if (isNaN(weight)) return;
  
  updateProjectFilament(projectId.value, filamentId, { actualWeight: weight });
  loadProject();
}

function removeFilament(filamentId: string) {
  removeFilamentFromProject(projectId.value, filamentId);
  loadProject();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  loadProject();
});
</script>

<template>
  <div v-if="project" class="w-full p-1 md:p-2 space-y-2 overflow-y-auto flex flex-col">
    <!-- Header -->
    <div class="flex items-start gap-2">
      <Button variant="ghost" size="sm" @click="router.push('/app/projects')">
        <Icon icon="lucide:arrow-left" class="w-4 h-4 mr-2" />
        {{ t('projects.detail.backToProjects') }}
      </Button>
      
      <div class="flex-1">
        <div v-if="!isEditing" class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-2xl font-bold">{{ project.name }}</h1>
            <Badge :variant="getStatusColor(project.status)">
              <Icon :icon="getStatusIcon(project.status)" class="w-3 h-3 mr-1" />
              {{ getStatusLabel(project.status) }}
            </Badge>
          </div>
          <p v-if="project.description" class="text-muted-foreground">
            {{ project.description }}
          </p>
        </div>
        
        <div v-else class="space-y-3">
          <Input v-model="editedName" :placeholder="t('projects.fields.name')" class="text-lg font-bold" />
          <Input v-model="editedDescription" :placeholder="t('projects.importDialog.descriptionOptional')" />
        </div>
      </div>
      
      <div class="flex gap-2">
        <Button v-if="!isEditing" variant="outline" size="sm" @click="isEditing = true">
          <Icon icon="lucide:edit-2" class="w-4 h-4" />
        </Button>
        <template v-else>
          <Button variant="outline" size="sm" @click="cancelEdit">
            <Icon icon="lucide:x" class="w-4 h-4" />
          </Button>
          <Button size="sm" @click="saveEdit">
            <Icon icon="lucide:check" class="w-4 h-4" />
          </Button>
        </template>
      </div>
    </div>

    <!-- 3D Preview and Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-1.5">
      <!-- Thumbnail / 3D Preview -->
      <Card class="lg:col-span-1">
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <Icon icon="lucide:box" class="w-4 h-4" />
              {{ t('projects.importDialog.preview') }}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              @click="show3DViewer = !show3DViewer"
            >
              <Icon :icon="show3DViewer ? 'lucide:image' : 'lucide:box'" class="w-4 h-4 mr-2" />
              {{ show3DViewer ? 'Thumbnail' : '3D' }}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <!-- 3D Viewer -->
          <div 
            v-if="show3DViewer" 
            class="w-full h-32 bg-accent rounded-lg overflow-hidden"
          >
            <ThreeDViewer :colors="filamentColors" :modelData="project.modelData" />
          </div>
          
          <!-- Thumbnail -->
          <div 
            v-else-if="project.imageUrl" 
            class="w-full h-32 bg-accent rounded-lg overflow-hidden flex items-center justify-center"
          >
            <img 
              :src="project.imageUrl" 
              :alt="project.name"
              class="w-full h-full object-contain"
            />
          </div>
          
          <!-- Placeholder -->
          <div 
            v-else 
            class="w-full h-32 bg-linear-to-br from-accent to-muted rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            @click="show3DViewer = true"
          >
            <div class="text-center">
              <Icon icon="lucide:box" class="w-24 h-24 text-muted-foreground/30 mx-auto mb-2" />
              <p class="text-sm text-muted-foreground">{{ show3DViewer ? '' : 'Klick für 3D Ansicht' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Stats Grid -->
      <div class="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        <Card>
          <div class="text-xs text-muted-foreground">{{ t('projects.stats.filament') }}</div>
          <div class="text-2xl font-bold">{{ project.filamentUsage.length }}</div>
          <div class="text-xs text-muted-foreground mt-0.5">{{ t('projects.fields.material') }}</div>
        </Card>

        <Card>
          <div class="text-xs text-muted-foreground">{{ t('projects.fields.weight') }}</div>
          <div class="text-2xl font-bold">{{ totalWeight.toFixed(0) }}g</div>
          <div class="text-xs text-muted-foreground mt-0.5">{{ t('projects.fields.estimated') }}/{{ t('projects.stats.used') }}</div>
        </Card>

        <Card v-if="project.printTime">
          <div class="text-xs text-muted-foreground">{{ t('projects.fields.printTime') }}</div>
          <div class="text-xl font-bold">{{ formatDuration(project.printTime) }}</div>
          <div class="text-xs text-muted-foreground mt-0.5">{{ t('projects.fields.estimated') }}</div>
        </Card>

        <Card v-if="totalCost > 0">
          <div class="text-xs text-muted-foreground">{{ t('projects.fields.costs') }} Gesamt</div>
          <div class="text-2xl font-bold text-green-600">{{ totalCost.toFixed(2) }}€</div>
          <div class="text-xs text-muted-foreground mt-0.5">
            <div>{{ project.filamentUsage.length }} {{ t('projects.fields.material') }}</div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Cost Breakdown & Filament Usage -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-1.5">
      <!-- Cost Breakdown -->
      <Card v-if="totalCost > 0" class="lg:col-span-3">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon icon="lucide:dfc" class="w-5 h-5" />
            Kostenübersicht
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
        <!-- Costs by Filament -->
        <div class="space-y-2">
          <div class="font-semibold text-xs text-muted-foreground">Pro Filament</div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            <div 
              v-for="filament in project.filamentUsage"
              :key="filament.id"
              class="bg-accent/30 rounded p-2 text-xs flex items-center justify-between"
            >
              <div class="flex items-center gap-2 min-w-0">
                <div
                  v-if="filament.colorHex"
                  class="w-3 h-3 rounded border shrink-0"
                  :style="{ backgroundColor: filament.colorHex }"
                />
                <span class="truncate">{{ filament.material || 'Unbekannt' }}</span>
              </div>
              <span v-if="filament.cost" class="font-semibold whitespace-nowrap ml-2">{{ filament.cost.toFixed(2) }}€</span>
            </div>
          </div>
        </div>

        <!-- Costs by Plate (if multiple plates) -->
        <div v-if="plateCount > 1" class="space-y-2">
          <div class="font-semibold text-xs text-muted-foreground">Pro Plate</div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            <div 
              v-for="plateIdx in Array.from({length: plateCount}, (_, i) => i)"
              :key="plateIdx"
              class="bg-accent/50 rounded p-3"
            >
              <div class="text-xs text-muted-foreground mb-1">Plate {{ plateIdx + 1 }}</div>
              <div class="text-lg font-semibold">{{ (costByPlate.get(plateIdx) ?? 0).toFixed(2) }}€</div>
              <div class="text-xs text-muted-foreground mt-1">
                {{ project.filamentUsage.filter(f => (f.plateIndex ?? 0) === plateIdx).length }} Filamente
              </div>
            </div>
          </div>
        </div>

        <!-- Total Summary -->
        <div class="border-t pt-2">
          <div class="flex justify-between items-center">
            <div class="font-semibold text-sm">Gesamt</div>
            <div class="text-xl font-bold text-green-600">{{ totalCost.toFixed(2) }}€</div>
          </div>
        </div>
      </CardContent>
    </Card>

      <!-- Sidebar: Project Info & Actions -->
      <div class="lg:col-span-1 space-y-1.5">
        <!-- Project Info Card -->
        <Card>
          <div class="font-semibold text-sm mb-2">{{ t('projects.detail.projectInfo') }}</div>
          <div class="space-y-1.5 text-xs">
            <div><span class="text-muted-foreground text-[11px]">Erstellt:</span> {{ formatDate(new Date(project.createdAt)) }}</div>
            <div><span class="text-muted-foreground text-[11px]">Aktualisiert:</span> {{ formatDate(new Date(project.updatedAt)) }}</div>
            <div v-if="project.printTime"><span class="text-muted-foreground text-[11px]">Druckzeit:</span> {{ formatDuration(project.printTime) }}</div>
            <div v-if="project.layerHeight"><span class="text-muted-foreground text-[11px]">Höhe:</span> {{ project.layerHeight }}mm</div>
            <div v-if="project.slicerName"><span class="text-muted-foreground text-[11px]">Slicer:</span> {{ project.slicerName }}</div>
          </div>
        </Card>

        <!-- Actions Card -->
        <Card>
          <div class="space-y-1.5">
            <Button variant="outline" size="sm" class="w-full text-xs h-8" @click="toggleStatus">
              <Icon icon="lucide:refresh-cw" class="w-3 h-3 mr-1" />
              Status
            </Button>
            <Button variant="destructive" size="sm" class="w-full text-xs h-8" @click="confirmDelete">
              <Icon icon="lucide:trash-2" class="w-3 h-3 mr-1" />
              Löschen
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- Plate Images with Costs -->
    <div v-if="project.plateImages && project.plateImages.length > 0">
      <h2 class="text-base font-bold mb-1.5">{{ project.plateImages.length }} Plate(n)</h2>
      <div class="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-1.5">
        <Card 
          v-for="(plateImage, idx) in project.plateImages"
          :key="idx"
          class="overflow-hidden"
        >
          <img 
            :src="plateImage" 
            :alt="`Plate ${idx + 1}`"
            class="w-full h-24 object-contain bg-accent"
          />
          <CardContent class="space-y-1 pt-2">
            <div class="font-medium text-xs">Plate {{ idx + 1 }}</div>
            <div v-if="costByPlate.get(idx)" class="text-xs bg-accent/50 rounded p-1.5">
              <div class="text-muted-foreground text-[10px]">Kosten</div>
              <div class="font-semibold text-xs">{{ (costByPlate.get(idx) ?? 0).toFixed(2) }}€</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Metadata -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('projects.detail.projectInfo') }}</CardTitle>
      </CardHeader>
      <CardContent class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div v-if="project.slicerName">
          <div class="text-muted-foreground">{{ t('projects.fields.slicer') }}</div>
          <div class="font-medium">{{ project.slicerName }} {{ project.slicerVersion }}</div>
        </div>
        <div v-if="project.layerHeight">
          <div class="text-muted-foreground">{{ t('projects.fields.layerHeight') }}</div>
          <div class="font-medium">{{ project.layerHeight }}mm</div>
        </div>
        <div>
          <div class="text-muted-foreground">Erstellt</div>
          <div class="font-medium">{{ formatDate(project.createdAt) }}</div>
        </div>
        <div>
          <div class="text-muted-foreground">{{ t('projects.fields.updated') }}</div>
          <div class="font-medium">{{ formatDate(project.updatedAt) }}</div>
        </div>
      </CardContent>
    </Card>

    <!-- Filaments -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('projects.detail.filamentUsage') }}</CardTitle>
        <CardDescription>
          {{ t('projects.fields.estimated') }} und {{ t('projects.fields.actual') }} Verbrauch pro {{ t('projects.fields.material') }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div
          v-for="filament in project.filamentUsage"
          :key="filament.id"
          class="p-4 border rounded-lg"
        >
          <div class="flex items-start gap-4">
            <div
              v-if="filament.colorHex"
              class="w-16 h-16 rounded border flex-shrink-0"
              :style="{ backgroundColor: filament.colorHex }"
            />
            
            <div class="flex-1 space-y-3">
              <div>
                <div class="font-medium text-lg">
                  {{ filament.material || t('projects.importDialog.unknownMaterial') }}
                  <span v-if="filament.vendor" class="text-muted-foreground">· {{ filament.vendor }}</span>
                </div>
                <div v-if="filament.color" class="text-sm text-muted-foreground">
                  {{ filament.color }}
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div v-if="filament.estimatedWeight">
                  <div class="text-muted-foreground text-xs">{{ t('projects.fields.estimated') }}</div>
                  <div class="font-medium">{{ filament.estimatedWeight.toFixed(1) }}g</div>
                </div>
                <div v-if="filament.estimatedLength">
                  <div class="text-muted-foreground text-xs">Länge</div>
                  <div class="font-medium">{{ (filament.estimatedLength / 1000).toFixed(1) }}m</div>
                </div>
                <div v-if="filament.temperature">
                  <div class="text-muted-foreground text-xs">Temperatur</div>
                  <div class="font-medium">{{ filament.temperature }}°C</div>
                </div>
                <div v-if="filament.bedTemperature">
                  <div class="text-muted-foreground text-xs">Bett</div>
                  <div class="font-medium">{{ filament.bedTemperature }}°C</div>
                </div>
                <div v-if="filament.cost && filament.spoolWeight">
                  <div class="text-muted-foreground text-xs">{{ t('projects.fields.cost') }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ (filament.cost / 1000).toFixed(2) }}€/kg · 
                    <span class="font-semibold text-green-600">{{ (costByFilament.get(filament.id) || 0).toFixed(2) }}€</span>
                  </div>
                </div>
                <div v-else-if="filament.cost">
                  <div class="text-muted-foreground text-xs">{{ t('projects.fields.cost') }}</div>
                  <div class="font-semibold text-green-600">{{ filament.cost.toFixed(2) }}€</div>
                </div>
                <div v-if="filament.plateIndex !== undefined">
                  <div class="text-muted-foreground text-xs">Plate</div>
                  <div class="font-medium">{{ filament.plateIndex + 1 }}</div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <label class="text-sm text-muted-foreground whitespace-nowrap">{{ t('projects.fields.actual') }} verwendet:</label>
                <Input
                  type="number"
                  step="0.1"
                  :value="filament.actualWeight || ''"
                  @blur="(e) => updateActualWeight(filament.id, (e.target as HTMLInputElement).value)"
                  placeholder="0.0"
                  class="w-24"
                />
                <span class="text-sm text-muted-foreground">g</span>
              </div>
            </div>

            <Button variant="ghost" size="sm" @click="removeFilament(filament.id)" class="text-destructive">
              <Icon icon="lucide:trash-2" class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div v-if="project.filamentUsage.length === 0" class="text-center py-8 text-muted-foreground">
          {{ t('projects.stats.filament') }} nicht gefunden
        </div>
      </CardContent>
    </Card>

    <!-- Notes -->
    <Card v-if="project.notes">
      <CardHeader>
        <CardTitle>Notizen</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="whitespace-pre-wrap">{{ project.notes }}</p>
      </CardContent>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('projects.confirmDelete') }}</DialogTitle>
          <DialogDescription>
            {{ t('projects.confirmDeleteMessage', { name: project.name }) }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">{{ t('actions.cancel') }}</Button>
          <Button variant="destructive" @click="handleDelete">
            <Icon icon="lucide:trash-2" class="w-4 h-4 mr-2" />
            {{ t('projects.delete') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
