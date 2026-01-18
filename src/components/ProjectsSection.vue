<template>
  <div class="space-y-6 pb-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Gesamt</CardDescription>
          <CardTitle class="text-3xl">{{ stats.totalProjects }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xs text-muted-foreground flex items-center gap-1">
            <Icon icon="lucide:folder" class="w-3 h-3" />
            Projekte
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Aktiv</CardDescription>
          <CardTitle class="text-3xl">{{ stats.activeProjects }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xs text-muted-foreground flex items-center gap-1">
            <Icon icon="lucide:printer" class="w-3 h-3" />
            In Arbeit
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Druckzeit</CardDescription>
          <CardTitle class="text-2xl">{{ formatDuration(stats.totalPrintTime) }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xs text-muted-foreground flex items-center gap-1">
            <Icon icon="lucide:clock" class="w-3 h-3" />
            Geschätzt
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Filament</CardDescription>
          <CardTitle class="text-3xl">{{ (stats.totalFilamentUsed / 1000).toFixed(1) }}kg</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xs text-muted-foreground flex items-center gap-1">
            <Icon icon="lucide:weight" class="w-3 h-3" />
            Verbraucht
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 flex-wrap">
      <Button
        :variant="filterStatus === 'all' ? 'default' : 'outline'"
        size="sm"
        @click="filterStatus = 'all'"
      >
        Alle
      </Button>
      <Button
        :variant="filterStatus === 'planning' ? 'default' : 'outline'"
        size="sm"
        @click="filterStatus = 'planning'"
      >
        <Icon icon="lucide:clipboard-list" class="w-4 h-4 mr-1" />
        Planung
      </Button>
      <Button
        :variant="filterStatus === 'in-progress' ? 'default' : 'outline'"
        size="sm"
        @click="filterStatus = 'in-progress'"
      >
        <Icon icon="lucide:printer" class="w-4 h-4 mr-1" />
        In Arbeit
      </Button>
      <Button
        :variant="filterStatus === 'completed' ? 'default' : 'outline'"
        size="sm"
        @click="filterStatus = 'completed'"
      >
        <Icon icon="lucide:check-circle" class="w-4 h-4 mr-1" />
        Fertig
      </Button>
    </div>

    <!-- Projects Grid -->
    <div v-if="sortedProjects.length === 0" class="text-center py-12">
      <Icon icon="lucide:folder-open" class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-xl font-medium mb-2">Keine Projekte gefunden</h3>
      <p class="text-muted-foreground mb-4">
        Importiere deine erste .3mf oder .gcode Datei, um loszulegen
      </p>
      <Button @click="$emit('openImport')">
        <Icon icon="lucide:upload" class="w-4 h-4 mr-2" />
        Projekt importieren
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="project in sortedProjects"
        :key="project.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="router.push(`/app/projects/${project.id}`)"
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <CardTitle class="truncate">{{ project.name }}</CardTitle>
              <CardDescription class="line-clamp-2 mt-1">
                {{ project.description || 'Keine Beschreibung' }}
              </CardDescription>
            </div>
            <Badge :variant="getStatusColor(project.status)" class="flex-shrink-0">
              <Icon :icon="getStatusIcon(project.status)" class="w-3 h-3 mr-1" />
              {{ getStatusLabel(project.status) }}
            </Badge>
          </div>
        </CardHeader>

        <CardContent class="space-y-3">
          <div class="flex gap-1 flex-wrap">
            <div
              v-for="(filament, idx) in project.filamentUsage.slice(0, 8)"
              :key="idx"
              class="w-6 h-6 rounded-sm border"
              :style="{ backgroundColor: filament.colorHex || '#ccc' }"
              :title="filament.material"
            />
            <div
              v-if="project.filamentUsage.length > 8"
              class="w-6 h-6 rounded-sm border bg-muted flex items-center justify-center text-xs"
            >
              +{{ project.filamentUsage.length - 8 }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div class="text-muted-foreground text-xs">Gewicht</div>
              <div class="font-medium">{{ getTotalWeight(project).toFixed(0) }}g</div>
            </div>
            <div v-if="project.printTime">
              <div class="text-muted-foreground text-xs">Druckzeit</div>
              <div class="font-medium">{{ formatDuration(project.printTime) }}</div>
            </div>
            <div v-if="getTotalCost(project) > 0">
              <div class="text-muted-foreground text-xs">Kosten</div>
              <div class="font-medium">{{ getTotalCost(project).toFixed(2) }}€</div>
            </div>
            <div v-if="project.slicerName">
              <div class="text-muted-foreground text-xs">Slicer</div>
              <div class="font-medium truncate">{{ project.slicerName }}</div>
            </div>
          </div>
        </CardContent>

        <CardFooter class="flex justify-between text-xs text-muted-foreground pt-0">
          <span>{{ formatDate(project.updatedAt) }}</span>
          <div class="flex gap-1" @click.stop>
            <Button variant="ghost" size="sm" @click="toggleStatus(project)" class="h-7 px-2">
              <Icon icon="lucide:refresh-cw" class="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" @click="confirmDelete(project)" class="h-7 px-2 text-destructive">
              <Icon icon="lucide:trash-2" class="w-3 h-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>

    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Projekt löschen?</DialogTitle>
          <DialogDescription>
            Möchtest du "{{ selectedProject?.name }}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">Abbrechen</Button>
          <Button variant="destructive" @click="handleDelete">
            <Icon icon="lucide:trash-2" class="w-4 h-4 mr-2" />
            Löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { 
  getProjects, 
  deleteProject, 
  updateProject, 
  getProjectStats,
  type Project 
} from '@/api/projects';
import { formatDuration } from '@/lib/fileParser';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const emit = defineEmits<{
  'openImport': [];
}>();

const router = useRouter();
const projects = ref<Project[]>([]);
const selectedProject = ref<Project | null>(null);
const showDeleteDialog = ref(false);
const filterStatus = ref<string>('all');

const stats = computed(() => getProjectStats());

const filteredProjects = computed(() => {
  if (filterStatus.value === 'all') return projects.value;
  return projects.value.filter(p => p.status === filterStatus.value);
});

const sortedProjects = computed(() => {
  return [...filteredProjects.value].sort((a, b) => {
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
});

function loadProjects() {
  projects.value = getProjects();
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
    case 'planning': return 'Planung';
    case 'in-progress': return 'In Arbeit';
    case 'completed': return 'Fertig';
    case 'archived': return 'Archiviert';
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

function getTotalWeight(project: Project): number {
  return project.filamentUsage.reduce((sum, f) => {
    return sum + (f.actualWeight || f.estimatedWeight || 0);
  }, 0);
}

function getTotalCost(project: Project): number {
  return project.filamentUsage.reduce((sum, f) => sum + (f.cost || 0), 0);
}

function confirmDelete(project: Project) {
  selectedProject.value = project;
  showDeleteDialog.value = true;
}

function handleDelete() {
  if (selectedProject.value) {
    deleteProject(selectedProject.value.id);
    loadProjects();
  }
  showDeleteDialog.value = false;
  selectedProject.value = null;
}

function toggleStatus(project: Project) {
  const statusFlow = ['planning', 'in-progress', 'completed', 'archived'] as const;
  const currentIndex = statusFlow.indexOf(project.status);
  const nextIndex = (currentIndex + 1) % statusFlow.length;
  
  updateProject(project.id, { status: statusFlow[nextIndex] });
  loadProjects();
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Heute';
  if (days === 1) return 'Gestern';
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Wochen`;
  
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

onMounted(() => {
  loadProjects();
});

defineExpose({
  reload: loadProjects
});
</script>
