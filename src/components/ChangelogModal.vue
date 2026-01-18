<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon icon="lucide:sparkles" class="w-5 h-5 text-yellow-500" />
          <span>{{ $t('changelog.title') }}</span>
        </DialogTitle>
        <DialogDescription>
          {{ releases?.length > 0 ? $t('changelog.released', { date: formatDate(releases[0].published_at) }) : $t('changelog.loading') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-[rgb(var(--text-muted))]" />
      </div>

      <div v-else-if="error" class="text-sm text-red-500 py-4">
        {{ $t('changelog.error') }}
      </div>

      <div v-else-if="releases?.length > 0" class="flex-1 overflow-y-auto">
        <div 
          class="bg-[rgb(var(--foreground))]/5 backdrop-blur-sm rounded-2xl p-6 border border-input hover:shadow-lg transition-all duration-300"
        >
          <!-- Card Header -->
          <div class="flex items-start gap-4 mb-4">
            <img
              v-if="releases[0].author?.avatar_url"
              :src="releases[0].author.avatar_url"
              :alt="releases[0].author.login"
              class="w-10 h-10 rounded-full ring-2 ring-[rgb(var(--border))] shrink-0"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-bold text-lg">{{ releases[0].name || releases[0].tag_name }}</h3>
                <span class="text-xs text-[rgb(var(--text-muted))] font-mono bg-[rgb(var(--foreground))]/10 px-2 py-1 rounded">
                  {{ releases[0].tag_name }}
                </span>
                <span class="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
                  Neu
                </span>
              </div>
              <p class="text-xs text-[rgb(var(--text-muted))] mt-1.5">
                {{ formatDate(releases[0].published_at) }} · {{ $t('changelog.by') }} {{ releases[0].author?.login }}
              </p>
            </div>
            <a
              :href="releases[0].html_url"
              target="_blank"
              class="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-colors p-2 hover:bg-[rgb(var(--foreground))]/5 rounded-lg"
              :title="$t('changelog.viewOnGithub')"
            >
              <Icon icon="lucide:external-link" class="w-5 h-5" />
            </a>
          </div>
          
          <!-- Card Content -->
          <div class="prose prose-sm dark:prose-invert max-w-none">
            <div v-html="formatReleaseNotes(releases[0].body)" class="changelog-content" />
          </div>
        </div>

        <!-- All Releases Link -->
        <div class="pt-4 text-center">
          <a
            :href="`https://github.com/${repoOwner}/${repoName}/releases`"
            target="_blank"
            class="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] inline-flex items-center gap-1"
          >
            <Icon icon="lucide:history" class="w-4 h-4" />
            {{ $t('changelog.viewAllReleases') }}
          </a>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <Button variant="outline" size="sm" @click="dontShowAgain">
          {{ $t('changelog.dontShowAgain') }}
        </Button>
        <Button size="sm" @click="isOpen = false">
          {{ $t('changelog.gotIt') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import DOMPurify from 'dompurify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
const MAX_RELEASES = 5; // Zeige die letzten 5 Releases

const isOpen = ref(false);
const loading = ref(false);
const error = ref('');
const releases = ref<Release[]>([]);

const formatReleaseNotes = (body: string): string => {
  if (!body) return '';
  
  // Einfache Markdown-zu-HTML Konvertierung
  let html = body;
  
  // Überschriften
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Listen
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Absätze
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Aufräumen
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[123]>)/g, '$1');
  html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  
  // Replace @username mentions with avatar images and links
  html = html.replace(
    /by <a href="([^"]+)" target="_blank" rel="noopener noreferrer">@([^<]+)<\/a>/g,
    (match, url, username) => {
      const avatarUrl = `https://github.com/${username}.png?size=32`;
      return `<span class="inline-flex items-center gap-2">
        <span class="text-sm text-[rgb(var(--text-muted))]">by</span>
        <img src="${avatarUrl}" alt="${username}" class="w-6 h-6 rounded-full ring-1 ring-[rgb(var(--border))]" />
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium hover:underline">@${username}</a>
      </span>`;
    }
  );
  
  // Sanitize HTML to prevent XSS
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
    ADD_TAGS: ['img']
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const locale = navigator.language || 'en-US';
  
  return date.toLocaleDateString(locale, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const fetchReleases = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases?per_page=${MAX_RELEASES}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch release information');
    }
    
    releases.value = await response.json();
    
    // Check if user has seen the latest version
    if (releases.value.length > 0) {
      const lastSeenVersion = localStorage.getItem(STORAGE_KEY);
      if (lastSeenVersion !== releases.value[0].tag_name) {
        isOpen.value = true;
      }
    }
  } catch (err) {
    console.error('Error fetching changelog:', err);
    error.value = 'Could not load changelog. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const dontShowAgain = () => {
  if (releases.value?.length > 0) {
    localStorage.setItem(STORAGE_KEY, releases.value[0].tag_name);
  }
  isOpen.value = false;
};

watch(isOpen, (newValue) => {
  if (!newValue && releases.value?.length > 0) {
    // Mark as seen when modal is closed
    localStorage.setItem(STORAGE_KEY, releases.value[0].tag_name);
  }
});

onMounted(() => {
  // Check for nover parameter in dev mode
  if (import.meta.env.DEV) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const noVersion = urlParams.get('nover');
      if (noVersion === 'true' || noVersion === '1') {
        console.log('🚫 Changelog disabled via nover parameter (dev mode)');
        return; // Don't fetch or show changelog
      }
    } catch (err) {
      console.warn('Could not read nover parameter', err);
    }
  }
  
  fetchReleases();
});

defineExpose({
  open: () => {
    isOpen.value = true;
  }
});
</script>

<style scoped>
.changelog-content :deep(h1),
.changelog-content :deep(h2),
.changelog-content :deep(h3),
.changelog-content :deep(h4) {
  color: rgb(var(--text));
  font-weight: 700;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
}

.changelog-content :deep(h2) {
  font-size: 1.25rem;
  border-bottom: 2px solid rgb(var(--border));
  padding-bottom: 0.5rem;
  margin-top: 1.5rem;
}

.changelog-content :deep(h3) {
  font-size: 1.1rem;
  margin-top: 1.25rem;
}

.changelog-content :deep(h4) {
  font-size: 1rem;
}

.changelog-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  color: rgb(var(--text));
}

.changelog-content :deep(ul) {
  list-style-type: none;
  padding-left: 0;
  margin-bottom: 0.75rem;
}

.changelog-content :deep(li) {
  color: rgb(var(--text));
  line-height: 1.6;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.changelog-content :deep(li::before) {
  content: "•";
  position: absolute;
  left: 0.5rem;
  color: rgb(var(--text-muted));
}

/* Avatar and username styling */
.changelog-content :deep(li span.inline-flex) {
  margin-left: 0;
}

.changelog-content :deep(li img) {
  flex-shrink: 0;
  vertical-align: middle;
}

.changelog-content :deep(code) {
  font-size: 0.875rem;
  padding: 0.125rem 0.375rem;
  background: rgb(var(--surface-alt));
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  color: rgb(var(--text));
}

.changelog-content :deep(pre) {
  background: rgb(var(--surface-alt));
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.75rem;
}

.changelog-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.changelog-content :deep(a) {
  color: rgb(var(--accent-2));
  text-decoration: none;
}

.changelog-content :deep(a:hover) {
  text-decoration: underline;
}

.changelog-content :deep(strong) {
  font-weight: 600;
  color: rgb(var(--text));
}

.changelog-content :deep(em) {
  font-style: italic;
}
</style>
