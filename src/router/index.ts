import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/components/LandingPage.vue';
import MainApp from '@/views/MainApp.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
      meta: {
        title: 'Spool Swatch - Your 3D Printing Filament Color Browser'
      }
    },
    {
      path: '/app',
      name: 'app',
      component: MainApp,
      meta: {
        title: 'Spool Swatch - Browse Your Collection'
      }
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

// Update document title on route change
router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'Spool Swatch';
  next();
});

export default router;
