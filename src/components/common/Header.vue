<script setup lang="ts">
import { ref } from 'vue'
import { User } from 'lucide-vue-next'
import { useUiStore, type Page } from '@/store/ui'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'
import skLogo from '@/assets/sk-logo.png'

const uiStore = useUiStore()
const authStore = useAuthStore()
const router = useRouter()

const showUserMenu = ref(false)

const pageRoutes: Record<Page, string> = {
  dashboard: '/',
  analysis: '/analysis',
  report: '/report',
  settings: '/',
  simulation: '/simulation',
  disaster: '/disaster',
  'my-account': '/my-account',
  'site-management': '/site-management',
}

const onNavigate = (page: Page) => {
  uiStore.setCurrentPage(page)
  router.push(pageRoutes[page] ?? '/')
}

const onLogout = () => {
  // handleLogout()이 이미 window.location.href로 리다이렉트 처리
  authStore.handleLogout()
}
</script>

<template>
  <header class="bg-white flex-shrink-0">
    <div class="px-8 h-16 flex items-center justify-between relative border-b border-gray-200">
      <div class="flex items-center gap-8">
        <img :src="skLogo" alt="SK Logo" class="h-8 w-auto" />
        <nav class="flex gap-6">
          <button
            @click="onNavigate('dashboard')"
            :class="[
              'text-sm transition-colors h-16 flex items-center relative',
              uiStore.currentPage === 'dashboard'
                ? 'text-[#EA002C]'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            대시보드
            <div
              v-if="uiStore.currentPage === 'dashboard'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA002C]"
            ></div>
          </button>
          <button
            @click="onNavigate('analysis')"
            :class="[
              'text-sm transition-colors h-16 flex items-center relative',
              uiStore.currentPage === 'analysis'
                ? 'text-[#EA002C]'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            분석
            <div
              v-if="uiStore.currentPage === 'analysis'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA002C]"
            ></div>
          </button>
          <button
            @click="onNavigate('simulation')"
            :class="[
              'text-sm transition-colors h-16 flex items-center relative',
              uiStore.currentPage === 'simulation'
                ? 'text-[#EA002C]'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            시뮬레이션
            <div
              v-if="uiStore.currentPage === 'simulation'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA002C]"
            ></div>
          </button>
          <button
            @click="onNavigate('disaster')"
            :class="[
              'text-sm transition-colors h-16 flex items-center relative',
              uiStore.currentPage === 'disaster'
                ? 'text-[#EA002C]'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            재해 이력
            <div
              v-if="uiStore.currentPage === 'disaster'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA002C]"
            ></div>
          </button>
          <button
            @click="onNavigate('report')"
            :class="[
              'text-sm transition-colors h-16 flex items-center relative',
              uiStore.currentPage === 'report'
                ? 'text-[#EA002C]'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            리포트
            <div
              v-if="uiStore.currentPage === 'report'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA002C]"
            ></div>
          </button>
          <button
            @click="onNavigate('site-management')"
            :class="[
              'text-sm transition-colors h-16 flex items-center relative',
              uiStore.currentPage === 'site-management'
                ? 'text-[#EA002C]'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            사업장 관리
            <div
              v-if="uiStore.currentPage === 'site-management'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA002C]"
            ></div>
          </button>
        </nav>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <button @click="showUserMenu = !showUserMenu" class="p-2 hover:bg-gray-100 rounded">
            <User :size="20" class="text-gray-600" />
          </button>

          <div v-if="showUserMenu">
            <div class="fixed inset-0 z-10" @click="showUserMenu = false"></div>
            <div
              class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg z-20"
            >
              <div class="py-2">
                <button
                  @click="((showUserMenu = false), onNavigate('my-account'))"
                  class="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  내 정보
                </button>
                <div class="border-t border-gray-200 my-1"></div>
                <button
                  @click="((showUserMenu = false), onLogout())"
                  class="w-full px-4 py-2.5 text-sm text-left text-[#EA002C] hover:bg-gray-100 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
