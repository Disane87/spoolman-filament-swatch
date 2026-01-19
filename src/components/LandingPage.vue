<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { Button } from './ui/button';
import { useI18n } from 'vue-i18n';
import ThemeSwitch from './ThemeSwitch.vue';
import LocaleSwitch from './LocaleSwitch.vue';

const { t } = useI18n();
const router = useRouter();

const enterApp = () => {
  router.push('/app');
};

const statsIcons = [
  { icon: 'lucide:palette', color: 'text-pink-400' },
  { icon: 'lucide:package', color: 'text-blue-400' },
  { icon: 'lucide:heart', color: 'text-red-400' },
  { icon: 'lucide:zap', color: 'text-yellow-400' }
];

const featuresIcons = [
  { icon: 'lucide:palette', gradient: 'from-pink-500 to-purple-500', color: 'text-pink-500', borderColor: '#ec4899' },
  { icon: 'lucide:filter', gradient: 'from-blue-500 to-cyan-500', color: 'text-blue-500', borderColor: '#3b82f6' },
  { icon: 'lucide:map-pin', gradient: 'from-green-500 to-emerald-500', color: 'text-green-500', borderColor: '#22c55e' },
  { icon: 'lucide:layers', gradient: 'from-orange-500 to-red-500', color: 'text-orange-500', borderColor: '#f97316' },
  { icon: 'lucide:smartphone', gradient: 'from-violet-500 to-purple-500', color: 'text-violet-500', borderColor: '#8b5cf6' },
  { icon: 'lucide:globe', gradient: 'from-cyan-500 to-blue-500', color: 'text-cyan-500', borderColor: '#06b6d4' },
  { icon: 'lucide:zap', gradient: 'from-yellow-500 to-orange-500', color: 'text-yellow-500', borderColor: '#eab308' },
  { icon: 'lucide:moon', gradient: 'from-slate-500 to-zinc-500', color: 'text-slate-500', borderColor: '#64748b' },
  { icon: 'lucide:package-open', gradient: 'from-amber-500 to-orange-500', color: 'text-amber-500', borderColor: '#f59e0b' }
];

const useCasesIcons = [
  { icon: 'lucide:search' },
  { icon: 'lucide:shopping-cart' },
  { icon: 'lucide:warehouse' },
  { icon: 'lucide:layers-3' }
];

const isVisible = ref(false);
const statsAnimated = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);
const scrollY = ref(0);

// GitHub Stats
const githubStats = ref({
  stars: 0,
  contributors: 0,
  latestRelease: ''
});

// Floating color blobs for hero
const colorBlobs = [
  { color: '#ec4899', size: 120, x: 15, y: 20, delay: 0 },
  { color: '#3b82f6', size: 90, x: 75, y: 30, delay: 1.5 },
  { color: '#22c55e', size: 110, x: 85, y: 60, delay: 3 },
  { color: '#f97316', size: 80, x: 10, y: 70, delay: 4.5 },
  { color: '#8b5cf6', size: 100, x: 50, y: 15, delay: 2 },
  { color: '#06b6d4', size: 95, x: 30, y: 85, delay: 3.5 },
  { color: '#eab308', size: 85, x: 65, y: 50, delay: 1 },
  { color: '#ec4899', size: 75, x: 40, y: 40, delay: 2.5 }
];

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
};

const handleScroll = () => {
  scrollY.value = window.scrollY;
};

// Fetch GitHub stats
const fetchGitHubStats = async () => {
  try {
    const repoResponse = await fetch('https://api.github.com/repos/Disane87/spoolman-filament-swatch');
    const repoData = await repoResponse.json();
    githubStats.value.stars = repoData.stargazers_count || 0;
    
    const contributorsResponse = await fetch('https://api.github.com/repos/Disane87/spoolman-filament-swatch/contributors?per_page=100');
    const contributorsData = await contributorsResponse.json();
    githubStats.value.contributors = contributorsData.length || 0;
    
    const releasesResponse = await fetch('https://api.github.com/repos/Disane87/spoolman-filament-swatch/releases/latest');
    const releasesData = await releasesResponse.json();
    githubStats.value.latestRelease = releasesData.tag_name || '';
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
  }
};

onMounted(() => {
  isVisible.value = true;
  
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Fetch GitHub stats
  fetchGitHubStats();
  
  // Animate stats when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        statsAnimated.value = true;
      }
    });
  }, { threshold: 0.2 });
  
  // Observe multiple sections
  const sections = ['stats', 'features', 'useCases', 'problem', 'howItWorks'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
  
  // Update meta tags
  document.title = 'Spool Swatch - Your 3D Printing Filament Color Browser';
  
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', 'Beautiful, interactive filament color browser for Spoolman. Browse, filter, and manage your 3D printing filament collection with ease. Track colors, materials, locations, and more.');
  }
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('scroll', handleScroll);
});

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <!-- Top Navigation -->
  <nav style="position: fixed !important;" class="top-0 left-0 right-0 z-50 backdrop-blur-md bg-[rgb(var(--background))]/95 border-b border-border/40 transition-all duration-150 hover:bg-[rgb(var(--background))]/98 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2 group cursor-pointer" @click="scrollToSection('hero')">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-150"></div>
              <Icon icon="lucide:palette" class="w-6 h-6 text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-150" />
            </div>
            <span class="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-150">Spool Swatch</span>
          </div>

          <!-- GitHub Stats in Nav -->
          <div class="hidden lg:flex items-center gap-2">
            <a 
              href="https://github.com/Donkie/Spoolman/stargazers" 
              target="_blank"
              class="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-full border border-input/50 hover:border-yellow-400/50 hover:bg-yellow-500/10 transition-all duration-150 hover:scale-105"
            >
              <Icon icon="lucide:star" class="w-3.5 h-3.5 text-yellow-400 group-hover:rotate-180 transition-transform duration-200" />
              <span class="text-xs font-semibold">{{ githubStats.stars.toLocaleString() }}</span>
            </a>

            <a 
              href="https://github.com/Donkie/Spoolman/graphs/contributors" 
              target="_blank"
              class="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-full border border-input/50 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all duration-150 hover:scale-105"
            >
              <Icon icon="lucide:users" class="w-3.5 h-3.5 text-blue-400 group-hover:scale-125 transition-transform duration-150" />
              <span class="text-xs font-semibold">{{ githubStats.contributors }}</span>
            </a>

            <a 
              v-if="githubStats.latestRelease"
              href="https://github.com/Donkie/Spoolman/releases/latest" 
              target="_blank"
              class="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-full border border-input/50 hover:border-green-400/50 hover:bg-green-500/10 transition-all duration-150 hover:scale-105"
            >
              <Icon icon="lucide:tag" class="w-3.5 h-3.5 text-green-400 group-hover:rotate-12 transition-transform duration-150" />
              <span class="text-xs font-semibold">{{ githubStats.latestRelease }}</span>
            </a>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <a
            href="https://github.com/sponsors/Disane87"
            target="_blank"
            rel="noopener noreferrer"
            class="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 backdrop-blur-md rounded-full border border-pink-400/30 hover:border-pink-400/60 hover:bg-pink-500/20 transition-all duration-150 hover:scale-105 mr-2"
          >
            <Icon icon="lucide:heart" class="w-3.5 h-3.5 text-pink-400 group-hover:scale-125 transition-transform duration-150" />
            <span class="text-xs font-semibold text-pink-400">{{ t('landing.sponsor.nav') }}</span>
          </a>
          <LocaleSwitch variant="ghost" />
          <ThemeSwitch variant="ghost" />
        </div>
      </div>
    </div>
  </nav>

  <div class="min-h-screen bg-gradient-to-br from-[rgb(var(--background))] via-[rgb(var(--background))] to-[rgb(var(--background))]/90 relative">
    <!-- Interactive Cursor Glow Effect -->
    <div 
      class="fixed w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-150 ease-out z-0"
      :style="{
        left: mouseX - 192 + 'px',
        top: mouseY - 192 + 'px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.3) 50%, transparent 70%)'
      }"
    ></div>

    <!-- Enhanced Animated Background Gradients with Parallax -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div 
        class="absolute top-0 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float-slow"
        :style="{ transform: `translateY(${scrollY * 0.1}px)` }"
      ></div>
      <div 
        class="absolute top-40 right-0 w-[32rem] h-[32rem] bg-purple-500/30 rounded-full blur-3xl animate-float-medium"
        :style="{ transform: `translateY(${scrollY * 0.15}px)` }"
      ></div>
      <div 
        class="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl animate-float-slow"
        :style="{ transform: `translateY(${-scrollY * 0.08}px)` }"
      ></div>
      <div 
        class="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl animate-float-medium"
        :style="{ transform: `translateY(${scrollY * 0.12}px)` }"
      ></div>
      <!-- Additional floating orbs -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-float-slow"></div>
      <div class="absolute bottom-1/4 right-1/3 w-56 h-56 bg-violet-500/25 rounded-full blur-3xl animate-float-medium"></div>
    </div>

    <!-- Hero Section -->
    <section id="hero" class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <!-- Floating Color Blobs -->
      <div class="absolute inset-0 pointer-events-none z-0">
        <div 
          v-for="(blob, index) in colorBlobs" 
          :key="index"
          class="absolute rounded-full blur-3xl opacity-30 animate-float-blob"
          :style="{
            background: `radial-gradient(circle, ${blob.color}88 0%, ${blob.color}44 50%, transparent 70%)`,
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            animationDelay: `${blob.delay}s`,
            transform: `translateY(${scrollY * 0.05}px)`
          }"
        ></div>

        <!-- 3D Printer Animation (Experimental) -->
        <div class="absolute bottom-10 right-10 opacity-10 animate-print-slow">
          <svg width="120" height="120" viewBox="0 0 120 120" class="text-blue-400/50">
            <!-- Printer Frame -->
            <rect x="20" y="30" width="80" height="60" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
            <rect x="25" y="35" width="70" height="8" fill="currentColor" opacity="0.3"/>
            
            <!-- Print Bed -->
            <rect x="30" y="70" width="60" height="4" fill="currentColor" opacity="0.5"/>
            
            <!-- Print Head (animated) -->
            <g class="animate-print-head">
              <rect x="45" y="50" width="30" height="12" rx="2" fill="currentColor" opacity="0.6"/>
              <circle cx="60" cy="64" r="2" fill="currentColor" opacity="0.8"/>
            </g>
            
            <!-- Filament -->
            <path d="M 60 40 Q 65 45 60 50" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.4" class="animate-pulse"/>
          </svg>
        </div>

        <!-- Filament Spool Animations (Experimental) -->
        <div class="absolute top-20 left-10 opacity-10 animate-roll-slow">
          <svg width="80" height="80" viewBox="0 0 80 80" class="text-pink-400/50">
            <g class="animate-spin-slow origin-center">
              <!-- Spool outer rim -->
              <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" stroke-width="3"/>
              <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>
              
              <!-- Spool center -->
              <circle cx="40" cy="40" r="15" fill="currentColor" opacity="0.2"/>
              
              <!-- Filament layers -->
              <circle cx="40" cy="40" r="22" fill="none" stroke="currentColor" stroke-width="6" opacity="0.4"/>
              
              <!-- Spokes -->
              <line x1="40" y1="25" x2="40" y2="10" stroke="currentColor" stroke-width="2" opacity="0.5"/>
              <line x1="40" y1="55" x2="40" y2="70" stroke="currentColor" stroke-width="2" opacity="0.5"/>
              <line x1="25" y1="40" x2="10" y2="40" stroke="currentColor" stroke-width="2" opacity="0.5"/>
              <line x1="55" y1="40" x2="70" y2="40" stroke="currentColor" stroke-width="2" opacity="0.5"/>
            </g>
          </svg>
        </div>

        <div class="absolute bottom-32 left-1/4 opacity-10 animate-roll-medium">
          <svg width="60" height="60" viewBox="0 0 80 80" class="text-green-400/50">
            <g class="animate-spin-slow origin-center" style="animation-direction: reverse;">
              <circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" stroke-width="2"/>
              <circle cx="40" cy="40" r="12" fill="currentColor" opacity="0.2"/>
              <circle cx="40" cy="40" r="18" fill="none" stroke="currentColor" stroke-width="5" opacity="0.4"/>
              <line x1="40" y1="28" x2="40" y2="15" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
              <line x1="40" y1="52" x2="40" y2="65" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
              <line x1="28" y1="40" x2="15" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
              <line x1="52" y1="40" x2="65" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
            </g>
          </svg>
        </div>
      </div>

      <div 
        class="max-w-6xl mx-auto text-center transition-all duration-150 transform relative z-10"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <!-- Enhanced Logo/Icon Animation -->
        <div class="mb-8 inline-block animate-float group cursor-pointer" @click="enterApp">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-60 animate-pulse scale-125 group-hover:scale-150 transition-transform duration-200"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-40 animate-pulse" style="animation-delay: 1s;"></div>
            <div class="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 rounded-3xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-200 hover:shadow-blue-500/50">
              <div class="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm"></div>
              <Icon icon="lucide:palette" class="w-24 h-24 text-white relative z-10 group-hover:rotate-12 transition-transform duration-200" />
            </div>
            <!-- Glowing ring -->
            <div class="absolute inset-0 border-4 border-blue-500/30 rounded-3xl group-hover:border-blue-400/50 transition-colors duration-200 animate-ping" style="animation-duration: 3s;"></div>
          </div>
        </div>

        <!-- Enhanced Heading with multiple gradients -->
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 relative">
          <span class="relative inline-block">
            <span class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-2xl opacity-50 animate-pulse"></span>
            <span class="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              {{ t('landing.hero.title') }}
            </span>
          </span>
        </h1>
        
        <p class="text-xl sm:text-2xl text-[rgb(var(--foreground))]/80 mb-4 max-w-3xl mx-auto font-medium leading-relaxed">
          {{ t('landing.hero.subtitle') }}
        </p>
        
        <i18n-t keypath="landing.hero.description" tag="p" class="text-base sm:text-lg text-[rgb(var(--foreground))]/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          <template #spoolman>
            <a href="https://github.com/Donkie/Spoolman/" target="_blank" class="text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-4 transition-all hover:scale-105 inline-block">Spoolman</a>
          </template>
        </i18n-t>

        <!-- Enhanced Requirements Notice -->
        <div class="max-w-2xl mx-auto mb-12 relative group">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-150"></div>
          <div class="relative bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-md group-hover:border-blue-400/50 transition-all duration-150 hover:shadow-2xl hover:shadow-blue-500/20">
            <div class="flex items-start gap-3">
              <div class="relative flex-shrink-0 mt-0.5">
                <div class="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                <Icon icon="lucide:info" class="w-6 h-6 text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-150" />
              </div>
              <div class="text-sm text-[rgb(var(--foreground))]/80 leading-relaxed">
                <strong class="text-[rgb(var(--foreground))] block mb-2 text-base font-semibold">{{ t('landing.hero.requiresTitle') }}</strong>
                <i18n-t keypath="landing.hero.requiresText" tag="span">
                  <template #spoolman>
                    <a href="https://github.com/Donkie/Spoolman/" target="_blank" class="text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors font-medium">Spoolman</a>
                  </template>
                </i18n-t>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 flex-wrap">
          <Button 
            @click="enterApp"
            size="lg"
            class="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-10 py-7 text-lg font-bold transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1"
          >
            <span class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
            <span class="relative z-10 flex items-center gap-3">
              <Icon icon="lucide:rocket" class="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-150" />
              {{ t('landing.hero.launchApp') }}
            </span>
            <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <!-- Shine effect -->
            <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-150 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </Button>
          
          <Button
            @click="scrollToSection('features')"
            size="lg"
            variant="outline"
            class="group relative px-10 py-7 text-lg font-semibold border-2 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-150 hover:scale-105 hover:border-blue-400/50 hover:shadow-xl backdrop-blur-sm"
          >
            <Icon icon="lucide:sparkles" class="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-200" />
            {{ t('landing.hero.exploreFeatures') }}
          </Button>
          
          <Button
            as="a"
            href="https://github.com/Disane87/spoolman-filament-swatch"
            target="_blank"
            size="lg"
            variant="ghost"
            class="group relative px-10 py-7 text-lg font-semibold hover:bg-[rgb(var(--foreground))]/10 transition-all duration-150 hover:scale-105 rounded-xl backdrop-blur-sm"
          >
            <Icon icon="lucide:github" class="w-5 h-5 mr-2 group-hover:scale-125 transition-transform duration-150" />
            {{ t('landing.hero.github') }}
          </Button>
        </div>

        <!-- Enhanced Stats -->
        <div id="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div 
            v-for="(stat, index) in $tm('landing.stats')"
            :key="index"
            class="group relative bg-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-2xl p-6 border border-input/50 transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/50 cursor-pointer"
            :class="{ 'animate-fade-in-up': statsAnimated }"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <!-- Glowing background on hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            
            <div class="relative z-10">
              <div class="mb-4 flex justify-center">
                <div class="relative">
                  <div class="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <Icon :icon="statsIcons[index]?.icon" class="w-10 h-10 relative z-10 mx-auto group-hover:scale-125 transition-transform duration-150" :class="statsIcons[index]?.color" />
                </div>
              </div>
              <div class="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-150">
                {{ stat.value }}
              </div>
              <div class="text-sm text-[rgb(var(--foreground))]/60 mt-2 font-medium group-hover:text-[rgb(var(--foreground))]/80 transition-colors duration-150">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Scroll indicator -->
      <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer group" @click="scrollToSection('features')">
        <div class="relative">
          <div class="absolute inset-0 bg-blue-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
          <Icon icon="lucide:chevron-down" class="w-8 h-8 text-[rgb(var(--foreground))]/40 group-hover:text-blue-400 relative z-10 transition-colors duration-150" />
        </div>
      </div>
    </section>

    <!-- Why I Built This Section (Testimonial) -->
    <section 
      class="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[rgb(var(--foreground))]/5"
      :style="{ transform: `translateY(${scrollY * 0.08}px)` }"
    >
      <div class="max-w-5xl mx-auto">
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
          <div class="relative bg-[rgb(var(--foreground))]/5 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-input">
            <div class="flex items-start gap-4 mb-6">
              <div class="flex-shrink-0">
                <img 
                  src="/landing/disane87-avatar.jpg?t=1" 
                  :alt="t('landing.testimonial.name')" 
                  class="w-16 h-16 rounded-full ring-2 ring-[rgb(var(--foreground))]/10 object-cover"
                  onerror="this.style.display='none'"
                />
              </div>
              <div>
                <h3 class="text-xl font-bold mb-1">{{ t('landing.testimonial.name') }}</h3>
                <p class="text-sm text-[rgb(var(--foreground))]/60">{{ t('landing.testimonial.role') }}</p>
              </div>
            </div>
            
            <div class="space-y-4 text-[rgb(var(--foreground))]/70">
              <p class="text-lg leading-relaxed">
                <span class="text-4xl text-blue-400 mr-1">"</span>
                {{ t('landing.testimonial.quote1') }} 
                <strong class="text-[rgb(var(--foreground))]">{{ t('landing.testimonial.quote1Bold') }}</strong>
              </p>
              
              <p class="text-lg leading-relaxed">
                {{ t('landing.testimonial.quote2') }} <strong class="text-[rgb(var(--foreground))]">{{ t('landing.testimonial.quote2Bold') }}</strong>{{ t('landing.testimonial.quote2Continue') }}
              </p>
              
              <p class="text-lg leading-relaxed">
                {{ t('landing.testimonial.quote3') }}
              </p>
              
              <p class="text-lg leading-relaxed">
                {{ t('landing.testimonial.quote4') }}
                <span class="text-4xl text-blue-400 ml-1">"</span>
              </p>
            </div>
            
            <div class="mt-8 pt-6 border-t border-border">
              <div class="flex items-start gap-3 text-sm text-[rgb(var(--foreground))]/60">
                <Icon icon="lucide:heart" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="mb-2">{{ t('landing.testimonial.madeWithLove') }}</p>
                  <i18n-t keypath="landing.testimonial.poweredBy" tag="p">
                    <template #spoolman>
                      <a href="https://github.com/Donkie/Spoolman/" target="_blank" class="text-blue-400 hover:text-blue-300 underline font-semibold">Spoolman</a>
                    </template>
                    <template #donkie>
                      <a href="https://github.com/Donkie" target="_blank" class="text-blue-400 hover:text-blue-300 underline">Donkie</a>
                    </template>
                  </i18n-t>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Use Cases Section -->
    <section 
      class="relative py-20 px-4 sm:px-6 lg:px-8"
      :style="{ transform: `translateY(${scrollY * 0.05}px)` }"
    >
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {{ t('landing.useCases.title') }}
          </h2>
          <p class="text-lg text-[rgb(var(--foreground))]/60 max-w-2xl mx-auto">
            {{ t('landing.useCases.subtitle') }}
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div
            v-for="(useCase, index) in $tm('landing.useCases.items')"
            :key="index"
            class="group relative bg-[rgb(var(--card))] rounded-2xl p-8 border border-input transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 cursor-pointer"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div class="flex items-start gap-6">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-xl border-2 border-blue-500 flex items-center justify-center group-hover:scale-110 transition-all duration-150 bg-blue-500/10">
                  <Icon :icon="useCasesIcons[index]?.icon" class="w-8 h-8 text-blue-500 group-hover:scale-125 transition-transform duration-150" />
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold mb-3 text-[rgb(var(--foreground))] group-hover:text-blue-400 transition-colors duration-150">
                  {{ useCase.title }}
                </h3>
                <p class="text-[rgb(var(--foreground))]/60 leading-relaxed group-hover:text-[rgb(var(--foreground))]/80 transition-colors duration-150">
                  {{ useCase.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section 
      id="features" 
      class="relative py-20 px-4 sm:px-6 lg:px-8 bg-[rgb(var(--foreground))]/5"
      :style="{ transform: `translateY(${scrollY * 0.03}px)` }"
    >
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {{ t('landing.features.title') }}
          </h2>
          <p class="text-lg text-[rgb(var(--foreground))]/60 max-w-2xl mx-auto">
            {{ t('landing.features.subtitle') }}
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(feature, index) in $tm('landing.features.items')"
            :key="index"
            class="group relative bg-[rgb(var(--card))] rounded-2xl p-8 border transition-all duration-150 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl cursor-pointer will-change-transform"
            :style="{ 
              animationDelay: `${index * 100}ms`,
              borderColor: featuresIcons[index]?.borderColor,
              '--shadow-color': featuresIcons[index]?.borderColor
            }"
          >
            <!-- Icon centered horizontally -->
            <div class="mb-6 flex justify-center">
              <Icon :icon="featuresIcons[index]?.icon" class="w-10 h-10 group-hover:scale-110 transition-transform duration-150" :class="featuresIcons[index]?.color" />
            </div>
            
            <!-- Content -->
            <h3 class="text-xl font-bold mb-3 text-[rgb(var(--foreground))] text-center transition-colors duration-150"
                :style="{ '--hover-color': featuresIcons[index]?.borderColor }"
                @mouseenter="$event.currentTarget.style.color = featuresIcons[index]?.borderColor"
                @mouseleave="$event.currentTarget.style.color = ''"
            >
              {{ feature.title }}
            </h3>
            <p class="text-[rgb(var(--foreground))]/60 mb-4 leading-relaxed text-center group-hover:text-[rgb(var(--foreground))]/80 transition-colors duration-150">
              {{ feature.description }}
            </p>
            
            <!-- Details -->
            <ul v-if="feature.details && feature.details.length > 0" class="space-y-2">
              <li v-for="detail in feature.details" :key="detail" class="flex items-center gap-2 text-sm text-[rgb(var(--foreground))]/50 group-hover:text-[rgb(var(--foreground))]/70 transition-colors duration-100">
                <Icon icon="lucide:check" class="w-4 h-4 text-green-400 shrink-0 group-hover:scale-110 transition-transform duration-100" />
                <span>{{ detail }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- The Problem Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <div class="inline-block px-4 py-2 bg-orange-500/20 rounded-full text-orange-400 text-sm font-semibold mb-6">
            <Icon icon="lucide:lightbulb" class="w-4 h-4 inline mr-2" />
            {{ t('landing.problem.title') }}
          </div>
          <h2 class="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {{ t('landing.problem.mainTitle') }}
          </h2>
        </div>

        <div class="grid lg:grid-cols-2 gap-12 mb-16">
          <!-- Problem -->
          <div class="grid grid-rows-2 gap-6">
            <div class="group bg-[rgb(var(--foreground))]/5 backdrop-blur-sm rounded-2xl p-8 border border-input transition-all duration-150 flex flex-col">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                  <Icon icon="lucide:file-search" class="w-6 h-6 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-2">{{ $tm('landing.problem.items')[0].title }}</h3>
                  <p class="text-[rgb(var(--foreground))]/60 leading-relaxed">
                    {{ $tm('landing.problem.items')[0].description }}
                  </p>
                </div>
              </div>
            </div>

            <div class="group bg-[rgb(var(--foreground))]/5 backdrop-blur-sm rounded-2xl p-8 border border-input transition-all duration-150 flex flex-col">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                  <Icon icon="lucide:eye-off" class="w-6 h-6 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-2">{{ $tm('landing.problem.items')[1].title }}</h3>
                  <p class="text-[rgb(var(--foreground))]/60 leading-relaxed">
                    {{ $tm('landing.problem.items')[1].description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Solution -->
          <div class="grid grid-rows-2 gap-6">
            <div class="group bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-150 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-150">
                  <Icon icon="lucide:palette" class="w-6 h-6 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-2">{{ $tm('landing.problem.solutions')[0].title }}</h3>
                  <p class="text-[rgb(var(--foreground))]/60 leading-relaxed">
                    {{ $tm('landing.problem.solutions')[0].description }}
                  </p>
                </div>
              </div>
            </div>

            <div class="group bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-150 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-150">
                  <Icon icon="lucide:zap" class="w-6 h-6 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-2">{{ $tm('landing.problem.solutions')[1].title }}</h3>
                  <p class="text-[rgb(var(--foreground))]/60 leading-relaxed">
                    {{ $tm('landing.problem.solutions')[1].description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Demonstration -->
        <div class="relative bg-gradient-to-br from-[rgb(var(--foreground))]/5 to-transparent backdrop-blur-sm rounded-3xl p-12 border border-input overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div class="relative text-center">
            <h3 class="text-2xl font-bold mb-6">{{ t('landing.problem.workflow.title') }}</h3>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="group">
                <div class="bg-[rgb(var(--foreground))]/5 rounded-xl p-6 mb-4 border border-input transition-all duration-150">
                  <div class="text-4xl mb-3">{{ $tm('landing.problem.workflow.steps')[0].emoji }}</div>
                  <div class="text-sm text-[rgb(var(--foreground))]/60">
                    {{ $tm('landing.problem.workflow.steps')[0].text }}
                  </div>
                </div>
                <div class="text-xs text-[rgb(var(--foreground))]/40 font-mono">{{ t('landing.problem.workflow.step') }} 1</div>
              </div>
              <div class="group">
                <div class="bg-[rgb(var(--foreground))]/5 rounded-xl p-6 mb-4 border border-input transition-all duration-150">
                  <div class="text-4xl mb-3">{{ $tm('landing.problem.workflow.steps')[1].emoji }}</div>
                  <div class="text-sm text-[rgb(var(--foreground))]/60">
                    {{ $tm('landing.problem.workflow.steps')[1].text }}
                  </div>
                </div>
                <div class="text-xs text-[rgb(var(--foreground))]/40 font-mono">{{ t('landing.problem.workflow.step') }} 2</div>
              </div>
              <div class="group">
                <div class="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 mb-4 border border-blue-500/20 group-hover:border-blue-500/30 transition-all duration-150">
                  <div class="text-4xl mb-3">{{ $tm('landing.problem.workflow.steps')[2].emoji }}</div>
                  <div class="text-sm text-[rgb(var(--foreground))]/60">
                    {{ $tm('landing.problem.workflow.steps')[2].text }}
                  </div>
                </div>
                <div class="text-xs text-blue-400/60 font-mono">{{ t('landing.problem.workflow.done') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8 bg-[rgb(var(--foreground))]/5">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {{ t('landing.howItWorks.title') }}
          </h2>
          <p class="text-lg text-[rgb(var(--foreground))]/60 max-w-2xl mx-auto">
            {{ t('landing.howItWorks.subtitle') }}
          </p>
        </div>

        <div class="space-y-8">
          <div 
            v-for="(step, index) in $tm('landing.howItWorks.steps')"
            :key="index"
            class="group relative bg-[rgb(var(--foreground))]/5 backdrop-blur-sm rounded-2xl p-8 border border-input hover:border-blue-500/20 transition-all duration-200"
          >
            <div class="flex items-start gap-6">
              <div class="flex-shrink-0">
                <div 
                  class="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl"
                  :class="index === 0 ? 'from-blue-500 to-cyan-500' : index === 1 ? 'from-purple-500 to-pink-500' : 'from-green-500 to-emerald-500'"
                >
                  {{ index + 1 }}
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold mb-2">{{ step.title }}</h3>
                <p class="text-[rgb(var(--foreground))]/60 leading-relaxed mb-3">
                  {{ step.description }}
                </p>
                <div class="text-sm text-[rgb(var(--foreground))]/50 italic">
                  {{ step.tip }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Enhanced CTA Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <div class="relative group">
          <!-- Multiple glow layers -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
          <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          
          <div class="relative bg-gradient-to-br from-[rgb(var(--foreground))]/5 via-[rgb(var(--foreground))]/8 to-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-3xl p-12 border border-input/50 group-hover:border-blue-400/50 transition-all duration-200 hover:shadow-2xl hover:shadow-blue-500/30">
            <h2 class="text-3xl sm:text-4xl font-bold mb-4 relative">
              <span class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-30"></span>
              <span class="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                {{ t('landing.cta.title') }}
              </span>
            </h2>
            <p class="text-lg text-[rgb(var(--foreground))]/70 mb-8 max-w-2xl mx-auto leading-relaxed group-hover:text-[rgb(var(--foreground))]/80 transition-colors duration-150">
              {{ t('landing.cta.subtitle') }}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                @click="enterApp"
                size="lg"
                class="group/btn relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-10 py-7 text-lg font-bold transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1"
              >
                <span class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></span>
                <span class="relative z-10 flex items-center gap-3">
                  <Icon icon="lucide:arrow-right" class="w-6 h-6 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-1 transition-transform duration-150" />
                  {{ t('landing.cta.primaryButton') }}
                </span>
                <div class="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></div>
                <div class="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-150 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </Button>
              
              <Button
                as="a"
                href="https://github.com/Disane87/spoolman-filament-swatch"
                target="_blank"
                size="lg"
                variant="outline"
                class="group/btn relative px-10 py-7 text-lg font-semibold border-2 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-150 hover:scale-105 hover:border-blue-400/50 hover:shadow-xl backdrop-blur-sm"
              >
                <Icon icon="lucide:star" class="w-5 h-5 mr-2 group-hover/btn:rotate-180 group-hover/btn:scale-125 transition-all duration-200" />
                {{ t('landing.cta.secondaryButton') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sponsor Section -->
    <section class="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative" id="sponsor">
      <div class="max-w-4xl mx-auto text-center">
        <div class="group relative">
          <!-- Glow effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
          
          <div class="relative bg-gradient-to-br from-pink-500/5 via-red-500/8 to-orange-500/5 backdrop-blur-md rounded-3xl p-12 border border-pink-400/30 group-hover:border-pink-400/50 transition-all duration-200 hover:shadow-2xl hover:shadow-pink-500/20">
            <div class="flex justify-center mb-6">
              <div class="relative">
                <div class="absolute inset-0 bg-pink-500 blur-xl opacity-50 rounded-full"></div>
                <Icon icon="lucide:heart" class="w-16 h-16 text-pink-400 relative z-10 animate-pulse" />
              </div>
            </div>
            <h2 class="text-3xl sm:text-4xl font-bold mb-4 relative">
              <span class="bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
                {{ t('landing.sponsor.title') }}
              </span>
            </h2>
            <p class="text-lg text-[rgb(var(--foreground))]/70 mb-6 max-w-2xl mx-auto leading-relaxed">
              {{ t('landing.sponsor.description') }}
            </p>
            <ul class="text-left max-w-md mx-auto mb-8 space-y-3">
              <li class="flex items-center gap-3 text-[rgb(var(--foreground))]/80">
                <Icon icon="lucide:server" class="w-5 h-5 text-pink-400" />
                <span>{{ t('landing.sponsor.benefit1') }}</span>
              </li>
              <li class="flex items-center gap-3 text-[rgb(var(--foreground))]/80">
                <Icon icon="lucide:coffee" class="w-5 h-5 text-pink-400" />
                <span>{{ t('landing.sponsor.benefit2') }}</span>
              </li>
              <li class="flex items-center gap-3 text-[rgb(var(--foreground))]/80">
                <Icon icon="lucide:rocket" class="w-5 h-5 text-pink-400" />
                <span>{{ t('landing.sponsor.benefit3') }}</span>
              </li>
            </ul>
            <a 
              href="https://github.com/sponsors/Disane87" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                class="group/btn relative overflow-hidden bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 text-white border-0 px-10 py-7 text-lg font-bold transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-pink-500/50 hover:-translate-y-1"
              >
                <span class="relative z-10 flex items-center gap-3">
                  <Icon icon="lucide:heart" class="w-6 h-6 group-hover/btn:scale-125 transition-transform duration-150" />
                  {{ t('landing.sponsor.button') }}
                </span>
                <div class="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-150 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </Button>
            </a>
            <p class="mt-6 text-sm text-[rgb(var(--foreground))]/50">
              {{ t('landing.sponsor.note') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Feedback Section -->
    <section class="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative" id="feedback">
      <div class="max-w-4xl mx-auto text-center">
        <div class="group relative">
          <!-- Glow effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl blur-3xl opacity-15 group-hover:opacity-25 transition-opacity duration-200"></div>
          
          <div class="relative bg-gradient-to-br from-blue-500/5 via-cyan-500/8 to-teal-500/5 backdrop-blur-md rounded-3xl p-10 border border-cyan-400/30 group-hover:border-cyan-400/50 transition-all duration-200 hover:shadow-2xl hover:shadow-cyan-500/20">
            <div class="flex justify-center mb-5">
              <div class="relative">
                <div class="absolute inset-0 bg-cyan-500 blur-xl opacity-50 rounded-full"></div>
                <Icon icon="lucide:message-circle" class="w-14 h-14 text-cyan-400 relative z-10" />
              </div>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold mb-3 relative">
              <span class="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {{ t('landing.feedback.title') }}
              </span>
            </h2>
            <p class="text-base text-[rgb(var(--foreground))]/70 mb-6 max-w-xl mx-auto leading-relaxed">
              {{ t('landing.feedback.description') }}
            </p>
            <a 
              href="https://github.com/Disane87/spoolman-filament-swatch/discussions" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                variant="outline"
                class="group/btn relative overflow-hidden border-2 border-cyan-400/50 hover:border-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-base font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
              >
                <span class="relative z-10 flex items-center gap-2">
                  <Icon icon="lucide:message-circle" class="w-5 h-5 text-cyan-400 group-hover/btn:scale-110 transition-transform duration-150" />
                  {{ t('landing.feedback.button') }}
                </span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Bug Report Section -->
    <section class="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative" id="bugs">
      <div class="max-w-4xl mx-auto text-center">
        <div class="group relative">
          <!-- Glow effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl blur-3xl opacity-15 group-hover:opacity-25 transition-opacity duration-200"></div>
          
          <div class="relative bg-gradient-to-br from-amber-500/5 via-orange-500/8 to-red-500/5 backdrop-blur-md rounded-3xl p-10 border border-orange-400/30 group-hover:border-orange-400/50 transition-all duration-200 hover:shadow-2xl hover:shadow-orange-500/20">
            <div class="flex justify-center mb-5">
              <div class="relative">
                <div class="absolute inset-0 bg-orange-500 blur-xl opacity-50 rounded-full"></div>
                <Icon icon="lucide:bug" class="w-14 h-14 text-orange-400 relative z-10" />
              </div>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold mb-3 relative">
              <span class="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                {{ t('landing.bugs.title') }}
              </span>
            </h2>
            <p class="text-base text-[rgb(var(--foreground))]/70 mb-6 max-w-xl mx-auto leading-relaxed">
              {{ t('landing.bugs.description') }}
            </p>
            <a 
              href="https://github.com/Disane87/spoolman-filament-swatch/issues" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                variant="outline"
                class="group/btn relative overflow-hidden border-2 border-orange-400/50 hover:border-orange-400 hover:bg-orange-500/10 px-8 py-6 text-base font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20"
              >
                <span class="relative z-10 flex items-center gap-2">
                  <Icon icon="lucide:bug" class="w-5 h-5 text-orange-400 group-hover/btn:scale-110 transition-transform duration-150" />
                  {{ t('landing.bugs.button') }}
                </span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div class="md:col-span-2">
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
              <Icon icon="lucide:palette" class="w-5 h-5" />
              Spool Swatch
            </h3>
            <p class="text-[rgb(var(--foreground))]/60 text-sm mb-4">
              {{ t('landing.footer.description') }}
            </p>
            <div class="flex gap-3">
              <a href="https://github.com/Disane87/spoolman-filament-swatch" target="_blank" class="hover:text-blue-400 transition-colors">
                <Icon icon="lucide:github" class="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 class="font-bold text-lg mb-4">{{ t('landing.footer.links.title') }}</h3>
            <ul class="space-y-2 text-sm text-[rgb(var(--foreground))]/60">
              <li><a href="https://github.com/Disane87/spoolman-filament-swatch" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.links.items.github') }}</a></li>
              <li><a href="https://github.com/Donkie/Spoolman/" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.links.items.spoolman') }}</a></li>
              <li><a href="https://github.com/Disane87/spoolman-filament-swatch/issues" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.links.items.issues') }}</a></li>
              <li><a href="https://github.com/Disane87/spoolman-filament-swatch/blob/main/CONTRIBUTING.md" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.links.items.contributing') }}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-bold text-lg mb-4">{{ t('landing.footer.resources.title') }}</h3>
            <ul class="space-y-2 text-sm text-[rgb(var(--foreground))]/60">
              <li><a href="#features" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.resources.items.features') }}</a></li>
              <li><a href="/app" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.resources.items.launchApp') }}</a></li>
              <li><a href="https://github.com/Disane87/spoolman-filament-swatch#readme" target="_blank" class="hover:text-blue-400 transition-colors">{{ t('landing.footer.resources.items.documentation') }}</a></li>
              <li><a href="https://github.com/Donkie/Spoolman/" target="_blank" class="hover:text-blue-400 transition-colors flex items-center gap-1">
                <Icon icon="lucide:star" class="w-3 h-3" />
                {{ t('landing.footer.resources.items.spoolmanProject') }}
              </a></li>
            </ul>
          </div>
        </div>
        
        <div class="text-center text-sm text-[rgb(var(--foreground))]/40 pt-8 border-t border-border">
          <p>&copy; 2026 {{ t('landing.footer.copyright') }}</p>
          <p class="mt-2">
            <i18n-t keypath="landing.footer.madeWith" tag="span">
              <template #heart>
                <Icon icon="lucide:heart" class="w-4 h-4 inline text-red-400" />
              </template>
              <template #author>
                <a href="https://github.com/Disane87" target="_blank" class="hover:text-blue-400 transition-colors">Disane87</a>
              </template>
            </i18n-t>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% auto;
  animation: gradient 2s ease infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 1.5s ease-in-out infinite;
}

@keyframes float-slow {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  33% {
    transform: translateY(-30px) translateX(10px);
  }
  66% {
    transform: translateY(-10px) translateX(-15px);
  }
}

@keyframes float-medium {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-40px) translateX(20px);
  }
}

.animate-float-slow {
  animation: float-slow 3s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 2.5s ease-in-out infinite;
}

/* Floating color blobs animation */
@keyframes float-blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(-20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(20px, -50px) scale(0.9);
  }
  75% {
    transform: translate(-15px, -25px) scale(1.05);
  }
}

.animate-float-blob {
  animation: float-blob 4s ease-in-out infinite;
}

/* 3D Printer Animation */
@keyframes print-slow {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
}

@keyframes print-head {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}

.animate-print-slow {
  animation: print-slow 1.5s ease-in-out infinite;
}

.animate-print-head {
  animation: print-head 1.2s ease-in-out infinite;
  transform-origin: center;
}

/* Filament Spool Animations */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes roll-slow {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  50% {
    transform: translateX(10px) rotate(5deg);
  }
}

@keyframes roll-medium {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(-3deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

.animate-roll-slow {
  animation: roll-slow 2.5s ease-in-out infinite;
}

.animate-roll-medium {
  animation: roll-medium 2s ease-in-out infinite;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fade-in-up 0.3s ease-out forwards;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Enhanced hover effects */
.group:hover .group-hover\:scale-125 {
  transform: scale(1.25);
}

/* Glow animation for icons */
@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

/* Text shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

/* Stagger animation for grid items */
@keyframes stagger-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Parallax effect classes */
.parallax-fast {
  will-change: transform;
}

.parallax-medium {
  will-change: transform;
}

.parallax-slow {
  will-change: transform;
}

/* Improved button hover states */
button:active {
  transform: scale(0.98);
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Force nav to be fixed */
nav {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 9999 !important;
}
</style>


