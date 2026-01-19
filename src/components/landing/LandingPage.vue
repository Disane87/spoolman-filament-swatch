<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { useI18n } from 'vue-i18n';
import LandingNav from './LandingNav.vue';
import LandingHero from './LandingHero.vue';
import LandingTestimonial from './LandingTestimonial.vue';
import LandingUseCases from './LandingUseCases.vue';
import LandingFeatures from './LandingFeatures.vue';
import LandingFooter from './LandingFooter.vue';

const { t, tm } = useI18n();
const router = useRouter();

const enterApp = () => {
  router.push('/app');
};

const isVisible = ref(false);
const statsAnimated = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);
const scrollY = ref(0);

const githubStats = ref({
  stars: 0,
  contributors: 0,
  latestRelease: '',
});

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
};

const handleScroll = () => {
  scrollY.value = window.scrollY;
};

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

  fetchGitHubStats();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        statsAnimated.value = true;
      }
    });
  }, { threshold: 0.2 });

  const sections = ['stats', 'features', 'useCases', 'problem', 'howItWorks'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  document.title = 'Spool Swatch - Your 3D Printing Filament Color Browser';

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', 'Beautiful, interactive filament color browser for Spoolman. Browse, filter, and manage your 3D printing filament collection with ease.');
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
  <LandingNav :github-stats="githubStats" @scroll-to="scrollToSection" />

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

    <!-- Animated Background Gradients -->
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
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-float-slow"></div>
      <div class="absolute bottom-1/4 right-1/3 w-56 h-56 bg-violet-500/25 rounded-full blur-3xl animate-float-medium"></div>
    </div>

    <!-- Hero Section -->
    <LandingHero
      :is-visible="isVisible"
      :scroll-y="scrollY"
      :stats-animated="statsAnimated"
      @enter-app="enterApp"
      @scroll-to="scrollToSection"
    />

    <!-- Testimonial -->
    <LandingTestimonial :scroll-y="scrollY" />

    <!-- Use Cases -->
    <LandingUseCases :scroll-y="scrollY" />

    <!-- Features -->
    <LandingFeatures :scroll-y="scrollY" />

    <!-- Problem Section -->
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
          <div class="grid grid-rows-2 gap-6">
            <div v-for="(item, index) in tm('landing.problem.items').slice(0, 2)" :key="index" class="group bg-[rgb(var(--foreground))]/5 backdrop-blur-sm rounded-2xl p-8 border border-input transition-all duration-150 flex flex-col">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                  <Icon :icon="index === 0 ? 'lucide:file-search' : 'lucide:eye-off'" class="w-6 h-6 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-2">{{ item.title }}</h3>
                  <p class="text-[rgb(var(--foreground))]/60 leading-relaxed">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-rows-2 gap-6">
            <div v-for="(solution, index) in tm('landing.problem.solutions').slice(0, 2)" :key="index" class="group bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-150 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-150">
                  <Icon :icon="index === 0 ? 'lucide:palette' : 'lucide:zap'" class="w-6 h-6 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-2">{{ solution.title }}</h3>
                  <p class="text-[rgb(var(--foreground))]/60 leading-relaxed">{{ solution.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workflow -->
        <div class="relative bg-gradient-to-br from-[rgb(var(--foreground))]/5 to-transparent backdrop-blur-sm rounded-3xl p-12 border border-input overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

          <div class="relative text-center">
            <h3 class="text-2xl font-bold mb-6">{{ t('landing.problem.workflow.title') }}</h3>
            <div class="grid md:grid-cols-3 gap-6">
              <div v-for="(step, index) in tm('landing.problem.workflow.steps')" :key="index" class="group">
                <div :class="index === 2 ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 group-hover:border-blue-500/30' : 'bg-[rgb(var(--foreground))]/5 border-input'" class="rounded-xl p-6 mb-4 border transition-all duration-150">
                  <div class="text-4xl mb-3">{{ step.emoji }}</div>
                  <div class="text-sm text-[rgb(var(--foreground))]/60">{{ step.text }}</div>
                </div>
                <div :class="index === 2 ? 'text-blue-400/60' : 'text-[rgb(var(--foreground))]/40'" class="text-xs font-mono">
                  {{ index === 2 ? t('landing.problem.workflow.done') : `${t('landing.problem.workflow.step')} ${index + 1}` }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
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
            v-for="(step, index) in tm('landing.howItWorks.steps')"
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
                <p class="text-[rgb(var(--foreground))]/60 leading-relaxed mb-3">{{ step.description }}</p>
                <div class="text-sm text-[rgb(var(--foreground))]/50 italic">{{ step.tip }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <div class="relative group">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
          <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

          <div class="relative bg-gradient-to-br from-[rgb(var(--foreground))]/5 via-[rgb(var(--foreground))]/8 to-[rgb(var(--foreground))]/5 backdrop-blur-md rounded-3xl p-12 border border-input/50 group-hover:border-blue-400/50 transition-all duration-200 hover:shadow-2xl hover:shadow-blue-500/30">
            <h2 class="text-3xl sm:text-4xl font-bold mb-4 relative">
              <span class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-30"></span>
              <span class="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
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
                <span class="relative z-10 flex items-center gap-3">
                  <Icon icon="lucide:arrow-right" class="w-6 h-6 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-1 transition-transform duration-150" />
                  {{ t('landing.cta.primaryButton') }}
                </span>
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
    <LandingFooter />
  </div>
</template>

<style scoped>
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33% { transform: translateY(-30px) translateX(10px); }
  66% { transform: translateY(-10px) translateX(-15px); }
}

@keyframes float-medium {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-40px) translateX(20px); }
}

.animate-float-slow {
  animation: float-slow 3s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 2.5s ease-in-out infinite;
}
</style>
