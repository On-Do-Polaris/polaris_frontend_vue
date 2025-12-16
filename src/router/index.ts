import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import OnboardingView from '../views/OnboardingView.vue'
import AnalysisWaitingView from '../views/AnalysisWaitingView.vue'
import DashboardView from '../views/DashboardView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import SiteDetailView from '../views/SiteDetailView.vue'
import ReportView from '../views/ReportView.vue'
import SimulationView from '../views/SimulationView.vue'
import PastDisasterView from '../views/PastDisasterView.vue'
import SiteManagementView from '../views/SiteManagementView.vue'
import MyAccountView from '../views/MyAccountView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import { useAuthStore } from '@/store/auth'
import { useUiStore, type Page } from '@/store/ui'
import { sitesAPI } from '@/api/sites'
import { analysisAPI } from '@/api/analysis'

const routeToPage: Partial<Record<string, Page>> = {
  dashboard: 'dashboard',
  analysis: 'analysis',
  report: 'report',
  simulation: 'simulation',
  disaster: 'disaster',
  'site-management': 'site-management',
  'my-account': 'my-account',
}

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
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView,
      meta: { requiresAuth: true },
    },
    {
      path: '/analysis-waiting',
      name: 'analysis-waiting',
      component: AnalysisWaitingView,
      meta: { requiresAuth: true, hideHeader: true },
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
      path: '/disaster',
      name: 'disaster',
      component: PastDisasterView,
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
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
      meta: { requiresAuth: true },
    },
  ],
})

// 전역 네비게이션 가드
router.beforeEach(async (to, _from, next) => {
  try {
    const authStore = useAuthStore()

    // 인증이 필요한 페이지인지 확인
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    // 실제 토큰 확인 (authStore.isLoggedIn은 accessToken 기반)
    const hasToken = !!authStore.accessToken

    if (requiresAuth && !hasToken) {
      // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
      // 원래 가려던 페이지를 redirect 쿼리로 저장
      console.log('[Router] Redirecting to login')
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }

    if (!requiresAuth && hasToken && to.path === '/login') {
      // 이미 로그인한 사용자가 로그인 페이지 접근 시
      // 분석 상태 확인 후 적절한 페이지로 리다이렉트
      try {
        const sitesResponse = await sitesAPI.getSites()

        // 사업장이 없으면 온보딩으로
        if (!sitesResponse.sites || sitesResponse.sites.length === 0) {
          console.log('[Router] No sites found, redirecting to onboarding')
          next('/onboarding')
          return
        }

        // 사업장이 있으면 분석 상태 확인
        try {
          const analysisStatusResponse = await analysisAPI.getOverallAnalysisStatus()

          if (analysisStatusResponse.data.status === 'ing') {
            // 분석 진행 중이면 대기 페이지로
            console.log('[Router] Analysis in progress, redirecting to analysis-waiting')
            next('/analysis-waiting')
            return
          }
          // 분석 완료면 대시보드로
          console.log('[Router] Analysis done, redirecting to dashboard')
          next('/')
          return
        } catch (error) {
          console.error('[Router] Failed to fetch analysis status:', error)
          // 분석 상태 확인 실패 시 대시보드로
          next('/')
          return
        }
      } catch (error) {
        console.error('[Router] Failed to fetch sites:', error)
        // API 에러 시 대시보드로
        next('/')
        return
      }
    }

    // 로그인한 사용자가 인증이 필요한 페이지로 이동할 때 사업장 체크
    if (requiresAuth && hasToken && to.path !== '/onboarding' && to.path !== '/analysis-waiting') {
      try {
        const sitesResponse = await sitesAPI.getSites()

        // 사업장이 없으면 온보딩으로 리다이렉트
        if (!sitesResponse.sites || sitesResponse.sites.length === 0) {
          console.log('[Router] No sites found, redirecting to onboarding')
          next('/onboarding')
          return
        }
      } catch (error) {
        console.error('[Router] Failed to fetch sites:', error)
        // API 에러 시에도 일단 통과 (온보딩 페이지에서 처리)
      }
    }

    next()
  } catch (error) {
    console.error('[Router] Navigation guard error:', error)
    // 에러 발생 시에도 로그인 페이지로 이동하여 앱이 작동하도록 함
    if (to.path !== '/login') {
      next('/login')
    } else {
      next()
    }
  }
})

router.afterEach((to) => {
  try {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return

    const page = routeToPage[to.name as string]
    if (page) {
      const uiStore = useUiStore()
      uiStore.setCurrentPage(page)
    }
  } catch (error) {
    console.error('[Router] AfterEach hook error:', error)
  }
})

router.onError((error) => {
  console.error('[Router] Error:', error)
})

export default router
