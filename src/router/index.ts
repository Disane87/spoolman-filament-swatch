import { createRouter, createWebHistory } from 'vue-router';
import { LandingPage } from '@/components/landing';
import MainApp from '@/views/MainApp.vue';
import ProjectsView from '@/views/ProjectsView.vue';
import ProjectDetailView from '@/views/ProjectDetailView.vue';
import { isHostedMode } from '@/composables/useHostedMode';

const hostedRoot = '/app/swatch';
const hostedTitle = 'Filament Swatch';
const standaloneTitle = 'Spool Swatch';
export const createAppRouter = () => {
  const hostedMode = isHostedMode();
  const hostedQuery = hostedMode ? Object.fromEntries(
    [...new URLSearchParams(window.location.search)].filter(([key]) =>
      key.startsWith('filaman_') || key.startsWith('spoolman_')
    )
  ) : {};
  const titlePrefix = hostedMode ? hostedTitle : standaloneTitle;

  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      hostedMode
        ? {
            path: '/',
            redirect: hostedRoot,
          }
        : {
            path: '/',
            name: 'landing',
            component: LandingPage,
            meta: {
              title: `${titlePrefix} - Your 3D Printing Filament Color Browser`
            }
          },
      {
        path: '/app',
        component: MainApp,
        redirect: hostedRoot,
        children: [
          {
            path: 'swatch',
            name: 'swatch',
            component: () => import('@/views/FilamentsView.vue'),
            meta: {
              title: `${titlePrefix} - Browse Your Collection`
            }
          },
          {
            path: 'projects',
            name: 'projects',
            component: ProjectsView,
            meta: {
              title: `${titlePrefix} - Projects`
            }
          },
          {
            path: 'projects/:id',
            name: 'project-detail',
            component: ProjectDetailView,
            meta: {
              title: `${titlePrefix} - Project Details`
            }
          }
        ]
      },
      // Catch-all redirect for unknown routes
      {
        path: '/:pathMatch(.*)*',
        redirect: hostedMode ? hostedRoot : '/'
      }
    ],
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { top: 0 };
      }
    }
  });

  router.beforeEach((to) => {
    if (Object.entries(hostedQuery).some(([key, value]) => to.query[key] !== value)) {
      return { ...to, query: { ...to.query, ...hostedQuery } };
    }
    document.title = (to.meta.title as string) || titlePrefix;
  });

  return router;
};
