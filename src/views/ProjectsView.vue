<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
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
import ProjectImportDialog from '@/components/ProjectImportDialog.vue';

const { t } = useI18n();
const router = useRouter();
const projects = ref<Project[]>([]);
const selectedProject = ref<Project | null>(null);
const showDeleteDialog = ref(false);
const showImportDialog = ref(false);
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

function handleProjectCreated(projectId: string) {
  loadProjects();
  router.push(`/app/projects/${projectId}`);
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

function getTotalWeight(project: Project): number {
  return project.filamentUsage.reduce((sum, f) => {
    return sum + (f.actualWeight || f.estimatedWeight || 0);
  }, 0);
}

function getTotalCost(project: Project): number {
  return project.filamentUsage.reduce((sum, f) => {
    const weight = f.actualWeight || f.estimatedWeight || 0;
    const costPerGram = f.cost && f.spoolWeight ? (f.cost / f.spoolWeight) : 0;
    return sum + (weight * costPerGram);
  }, 0);
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
  
  if (days === 0) return t('projects.time.today');
  if (days === 1) return t('projects.time.yesterday');
  if (days < 7) return t('projects.time.daysAgo', { count: days });
  if (days < 30) return t('projects.time.weeksAgo', { count: Math.floor(days / 7) });
  
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

onMounted(() => {
  loadProjects();
});
</script>

<template>
  <div class="container mx-auto p-6 md:p-8 space-y-8 max-w-7xl min-h-screen overflow-y-auto flex flex-col">
    <!-- Header -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-4xl font-bold tracking-tight">{{ t('projects.title') }}</h1>
        <p class="text-muted-foreground mt-2 text-lg">
          {{ t('projects.subtitle') }}
        </p>
      </div>
      <Button @click="showImportDialog = true" size="lg" class="shadow-sm">
        <Icon icon="lucide:plus" class="w-5 h-5 mr-2" />
        {{ t('projects.import') }}
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="hover:shadow-md transition-shadow border-l-4 border-l-primary">
        <CardHeader class="pb-3">
          <CardDescription class="text-sm">{{ t('projects.stats.total') }}</CardDescription>
          <CardTitle class="text-4xl font-bold">{{ stats.totalProjects }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-sm text-muted-foreground flex items-center gap-1.5">
            <Icon icon="lucide:folder" class="w-4 h-4" />
            {{ t('projects.stats.projects') }}
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
        <CardHeader class="pb-3">
          <CardDescription class="text-sm">{{ t('projects.stats.active') }}</CardDescription>
          <CardTitle class="text-4xl font-bold">{{ stats.activeProjects }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-sm text-muted-foreground flex items-center gap-1.5">
            <Icon icon="lucide:printer" class="w-4 h-4" />
            {{ t('projects.status.inProgress') }}
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
        <CardHeader class="pb-3">
          <CardDescription class="text-sm">{{ t('projects.stats.printTime') }}</CardDescription>
          <CardTitle class="text-3xl font-bold">{{ formatDuration(stats.totalPrintTime) }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-sm text-muted-foreground flex items-center gap-1.5">
            <Icon icon="lucide:clock" class="w-4 h-4" />
            {{ t('projects.stats.estimated') }}
          </div>
        </CardContent>
      </Card>

      <Card class="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
        <CardHeader class="pb-3">
          <CardDescription class="text-sm">{{ t('projects.stats.filament') }}</CardDescription>
          <CardTitle class="text-4xl font-bold">{{ (stats.totalFilamentUsed / 1000).toFixed(1) }}kg</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-sm text-muted-foreground flex items-center gap-1.5">
            <Icon icon="lucide:weight" class="w-4 h-4" />
            {{ t('projects.stats.used') }}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 flex-wrap items-center">
      <span class="text-sm font-medium text-muted-foreground">{{ t('filters.filter') }}:</span>
      <Button
        :variant="filterStatus === 'all' ? 'default' : 'outline'"
        size="default"
        @click="filterStatus = 'all'"
      >
        {{ t('projects.status.all') }}
      </Button>
      <Button
        :variant="filterStatus === 'planning' ? 'default' : 'outline'"
        size="default"
        @click="filterStatus = 'planning'"
      >
        <Icon icon="lucide:clipboard-list" class="w-4 h-4 mr-2" />
        {{ t('projects.status.planning') }}
      </Button>
      <Button
        :variant="filterStatus === 'in-progress' ? 'default' : 'outline'"
        size="default"
        @click="filterStatus = 'in-progress'"
      >
        <Icon icon="lucide:printer" class="w-4 h-4 mr-2" />
        {{ t('projects.status.inProgress') }}
      </Button>
      <Button
        :variant="filterStatus === 'completed' ? 'default' : 'outline'"
        size="default"
        @click="filterStatus = 'completed'"
      >
        <Icon icon="lucide:check-circle" class="w-4 h-4 mr-2" />
        {{ t('projects.status.completed') }}
      </Button>
    </div>

    <!-- Projects Grid -->
    <div v-if="sortedProjects.length === 0" class="text-center py-12">
      <Icon icon="lucide:folder-open" class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-xl font-medium mb-2">{{ t('projects.noProjects') }}</h3>
      <p class="text-muted-foreground mb-4">
        {{ t('projects.noProjectsHint') }}
      </p>
      <Button @click="showImportDialog = true">
        <Icon icon="lucide:upload" class="w-4 h-4 mr-2" />
        {{ t('projects.import') }}
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card
        v-for="project in sortedProjects"
        :key="project.id"
        class="hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] border-2 hover:border-primary/20 overflow-hidden"
        @click="router.push(`projects/${project.id}`)"
      >
        <!-- Thumbnail Image -->
        <div 
          v-if="project.imageUrl || (project.plateImages && project.plateImages.length > 0)" 
          class="w-full h-48 bg-accent flex items-center justify-center overflow-hidden border-b"
        >
          <img 
            :src="project.plateImages?.[0] || project.imageUrl" 
            :alt="project.name"
            class="w-full h-full object-contain bg-gradient-to-br from-accent to-muted"
          />
        </div>
        <div 
          v-else 
          class="w-full h-48 bg-gradient-to-br from-accent to-muted flex items-center justify-center border-b"
        >
          <Icon icon="lucide:box" class="w-16 h-16 text-muted-foreground/30" />
        </div>

        <CardHeader class="pb-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <CardTitle class="truncate text-xl">{{ project.name }}</CardTitle>
              <CardDescription class="line-clamp-2 mt-2 text-base">
                {{ project.description || t('projects.noDescription') }}
              </CardDescription>
            </div>
            <Badge :variant="getStatusColor(project.status)" class="flex-shrink-0 px-3 py-1">
              <Icon :icon="getStatusIcon(project.status)" class="w-3.5 h-3.5 mr-1.5" />
              {{ getStatusLabel(project.status) }}
            </Badge>
          </div>
        </CardHeader>

        <CardContent class="space-y-4">
          <!-- Filament Colors -->
          <div class="flex gap-2 flex-wrap">
            <div
              v-for="(filament, idx) in project.filamentUsage.slice(0, 8)"
              :key="idx"
              class="w-8 h-8 rounded-md border-2 shadow-sm hover:scale-110 transition-transform"
              :style="{ backgroundColor: filament.colorHex || '#ccc' }"
              :title="filament.material"
            />
            <div
              v-if="project.filamentUsage.length > 8"
              class="w-8 h-8 rounded-md border-2 bg-muted flex items-center justify-center text-xs font-medium"
            >
              +{{ project.filamentUsage.length - 8 }}
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-accent/50 rounded-lg p-3">
              <div class="text-muted-foreground text-xs mb-1">{{ t('projects.fields.weight') }}</div>
              <div class="font-semibold text-base">{{ getTotalWeight(project).toFixed(0) }}g</div>
            </div>
            <div v-if="project.printTime" class="bg-accent/50 rounded-lg p-3">
              <div class="text-muted-foreground text-xs mb-1">{{ t('projects.fields.printTime') }}</div>
              <div class="font-semibold text-base">{{ formatDuration(project.printTime) }}</div>
            </div>
            <div v-if="getTotalCost(project) > 0" class="bg-accent/50 rounded-lg p-3">
              <div class="text-muted-foreground text-xs mb-1">{{ t('projects.fields.costs') }}</div>
              <div class="font-semibold text-base">{{ getTotalCost(project).toFixed(2) }}€</div>
            </div>
            <div v-if="project.slicerName" class="bg-accent/50 rounded-lg p-3">
              <div class="text-muted-foreground text-xs mb-1">{{ t('projects.fields.slicer') }}</div>
              <div class="font-semibold text-sm truncate">{{ project.slicerName }}</div>
            </div>
          </div>
        </CardContent>

        <CardFooter class="flex justify-between text-sm text-muted-foreground pt-4 border-t">
          <span class="flex items-center gap-1.5">
            <Icon icon="lucide:calendar" class="w-3.5 h-3.5" />
            {{ formatDate(project.updatedAt) }}
          </span>
          <div class="flex gap-2" @click.stop>
            <Button variant="ghost" size="sm" @click="toggleStatus(project)" class="h-8 px-3">
              <Icon icon="lucide:refresh-cw" class="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" @click="confirmDelete(project)" class="h-8 px-3 text-destructive hover:text-destructive">
              <Icon icon="lucide:trash-2" class="w-4 h-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>

    <!-- Import Dialog -->
    <ProjectImportDialog
      v-model:open="showImportDialog"
      @project-created="handleProjectCreated"
    />

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('projects.confirmDelete') }}</DialogTitle>
          <DialogDescription>
            {{ t('projects.confirmDeleteMessage', { name: selectedProject?.name }) }}
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
