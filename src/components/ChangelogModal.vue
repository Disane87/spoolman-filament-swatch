<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon icon="lucide:sparkles" class="w-5 h-5 text-yellow-500" />
          <span>What's New</span>
          <span v-if="latestRelease" class="text-sm font-mono text-[rgb(var(--text-muted))]">
            v{{ latestRelease.tag_name }}
          </span>
        </DialogTitle>
        <DialogDescription>
          {{ latestRelease ? `Released ${formatDate(latestRelease.published_at)}` : 'Loading changelog...' }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--text-muted))]" />
      </div>

      <div v-else-if="error" class="text-sm text-red-500 py-4">
        {{ error }}
      </div>

      <div v-else-if="latestRelease" class="flex-1 overflow-y-auto space-y-4">
        <!-- Release Header -->
        <div class="flex items-start gap-3 pb-4 border-b border-[rgb(var(--border))]">
          <img
            v-if="latestRelease.author?.avatar_url"
            :src="latestRelease.author.avatar_url"
            :alt="latestRelease.author.login"
            class="w-10 h-10 rounded-full ring-2 ring-[rgb(var(--border))]"
          />
          <div class="flex-1">
            <h3 class="font-semibold text-lg">{{ latestRelease.name || latestRelease.tag_name }}</h3>
            <p class="text-sm text-[rgb(var(--text-muted))]">
              by <a :href="latestRelease.author?.html_url" target="_blank" class="hover:underline">{{ latestRelease.author?.login }}</a>
            </p>
          </div>
          <a
            :href="latestRelease.html_url"
            target="_blank"
            class="text-xs text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] flex items-center gap-1"
          >
            View on GitHub
            <Icon icon="lucide:external-link" class="w-3 h-3" />
          </a>
        </div>

        <!-- Changelog Content -->
        <div class="prose prose-sm dark:prose-invert max-w-none">
          <div v-html="formattedChangelog" class="changelog-content" />
        </div>

        <!-- Previous Releases Link -->
        <div class="pt-4 border-t border-[rgb(var(--border))] text-center">
          <a
            :href="`https://github.com/${repoOwner}/${repoName}/releases`"
            target="_blank"
            class="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] inline-flex items-center gap-1"
          >
            <Icon icon="lucide:history" class="w-4 h-4" />
            View all releases
          </a>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-[rgb(var(--border))]">
        <Button variant="outline" size="sm" @click="dontShowAgain">
          Don't show again
        </Button>
        <Button size="sm" @click="isOpen = false">
          Got it!
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Release {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

const repoOwner = 'Disane87';
const repoName = 'spoolman-filament-swatch';
const STORAGE_KEY = 'last-seen-version';

const isOpen = ref(false);
const loading = ref(false);
const error = ref('');
const latestRelease = ref<Release | null>(null);

const formattedChangelog = computed(() => {
  if (!latestRelease.value?.body) return '';
  
  let html = latestRelease.value.body;
  
  // Convert markdown to HTML (basic)
  html = html
    // Headers
    .replace(/### (.*?)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/## (.*?)$/gm, '<h2 class="text-lg font-bold mt-6 mb-3">$1</h2>')
    // Lists
    .replace(/^\* (.*?)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-500 hover:underline">$1</a>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Code
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-[rgb(var(--surface-alt))] rounded text-sm font-mono">$1</code>')
    // Line breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
  
  // Wrap lists in ul
  html = html.replace(/(<li.*?<\/li>(\s*<br>)*)+/g, (match) => {
    return `<ul class="list-disc space-y-1 my-2">${match.replace(/<br>/g, '')}</ul>`;
  });
  
  return html;
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const fetchLatestRelease = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch release information');
    }
    
    latestRelease.value = await response.json();
    
    // Check if user has seen this version
    const lastSeenVersion = localStorage.getItem(STORAGE_KEY);
    if (lastSeenVersion !== latestRelease.value?.tag_name) {
      isOpen.value = true;
    }
  } catch (err) {
    console.error('Error fetching changelog:', err);
    error.value = 'Could not load changelog. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const dontShowAgain = () => {
  if (latestRelease.value) {
    localStorage.setItem(STORAGE_KEY, latestRelease.value.tag_name);
  }
  isOpen.value = false;
};

watch(isOpen, (newValue) => {
  if (!newValue && latestRelease.value) {
    // Mark as seen when modal is closed
    localStorage.setItem(STORAGE_KEY, latestRelease.value.tag_name);
  }
});

onMounted(() => {
  fetchLatestRelease();
});

defineExpose({
  open: () => {
    isOpen.value = true;
  }
});
</script>

<style scoped>
.changelog-content :deep(h2),
.changelog-content :deep(h3) {
  color: rgb(var(--text));
}

.changelog-content :deep(li) {
  color: rgb(var(--text));
  margin-bottom: 0.25rem;
}

.changelog-content :deep(code) {
  font-size: 0.875rem;
}

.changelog-content :deep(a) {
  color: rgb(var(--accent-2));
}

.changelog-content :deep(a:hover) {
  text-decoration: underline;
}
</style>
