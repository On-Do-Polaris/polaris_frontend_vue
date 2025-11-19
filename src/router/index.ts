import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import DashboardView from '../views/DashboardView.vue';
import AnalysisView from '../views/AnalysisView.vue';
import SiteDetailView from '../views/SiteDetailView.vue';
import ReportView from '../views/ReportView.vue';
import SimulationView from '../views/SimulationView.vue';
import SiteManagementView from '../views/SiteManagementView.vue';
import MyAccountView from '../views/MyAccountView.vue';
import { useAuthStore } from '@/store/auth';
import { useUiStore, type Page } from '@/store/ui';

const routeToPage: Partial<Record<string, Page>> = {
  dashboard: 'dashboard',
  analysis: 'analysis',
  report: 'report',
  simulation: 'simulation',
  'site-management': 'site-management',
  'my-account': 'my-account',
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: AnalysisView,
      meta: { requiresAuth: true },
    },
    {
      path: '/site-detail',
      name: 'site-detail',
      component: SiteDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: '/report',
      name: 'report',
      component: ReportView,
      meta: { requiresAuth: true },
    },
    {
      path: '/simulation',
      name: 'simulation',
      component: SimulationView,
      meta: { requiresAuth: true },
    },
    {
      path: '/site-management',
      name: 'site-management',
      component: SiteManagementView,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-account',
      name: 'my-account',
      component: MyAccountView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

router.afterEach((to) => {
  const authStore = useAuthStore();
  if (!authStore.isLoggedIn) return;

  const page = routeToPage[to.name as string];
  if (page) {
    const uiStore = useUiStore();
    uiStore.setCurrentPage(page);
  }
});

export default router;
