<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, AlertTriangle, Loader2 } from 'lucide-vue-next'
import { useSitesStore, type Site } from '@/store/sites'
import { useUiStore } from '@/store/ui'
import { useDashboard } from '@/composables/useDashboard'
import RiskHeatmap from '@/components/charts/RiskHeatmap.vue'
import { useRouter } from 'vue-router'

console.log('[DashboardView] Component loaded')

const sitesStore = useSitesStore()
const uiStore = useUiStore()
const router = useRouter()
const { summary, loading: dashboardLoading, error: dashboardError, fetchSummary } = useDashboard()

const searchTerm = ref('')

const sites = computed(() => sitesStore.allSites)
const loading = computed(() => sitesStore.loading)
const error = computed(() => sitesStore.error)

const filteredSites = computed(() =>
  sites.value.filter(
    (site) =>
      site.siteName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      site.location.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
)

// API에서 가져온 대시보드 요약 정보 또는 폴백
const totalSites = computed(() => summary.value?.totalSites ?? sites.value.length)
const analyzedSites = computed(() => summary.value?.analyzedSites ?? 0)
const highRiskSites = computed(() => summary.value?.highRiskSites ?? 0)
const recentAnalysisCount = computed(() => summary.value?.recentAnalysisCount ?? 0)

const getRiskColor = (type: string) => {
  // API 응답의 siteType을 기반으로 색상 결정
  if (type.includes('HIGH') || type.includes('CRITICAL')) {
    return 'bg-red-600 text-white'
  } else if (type.includes('MEDIUM') || type.includes('MODERATE')) {
    return 'bg-yellow-500 text-white'
  } else if (type.includes('LOW')) {
    return 'bg-green-600 text-white'
  }
  return 'bg-gray-600 text-white'
}

const getRiskLabel = (type: string) => {
  if (type.includes('HIGH') || type.includes('CRITICAL')) {
    return '높음'
  } else if (type.includes('MEDIUM') || type.includes('MODERATE')) {
    return '보통'
  } else if (type.includes('LOW')) {
    return '낮음'
  }
  return type
}

const onViewAnalysis = (siteId: string) => {
  uiStore.setSelectedSiteId(siteId)
  router.push('/analysis')
}

const onSelectSite = (site: Site) => {
  uiStore.setSelectedSiteId(site.siteId)
  router.push('/analysis')
}

// 컴포넌트 마운트 시 사업장 목록 및 대시보드 요약 정보 로드
onMounted(async () => {
  sitesStore.fetchSites()
  await fetchSummary()
})
</script>

<template>
  <div class="bg-white">
    <!-- 상단 헤더 -->
    <div class="border-b border-gray-200 px-8 py-6 bg-white">
      <h2 class="text-gray-900 text-xl">대시보드</h2>
      <p class="text-sm text-gray-600 mt-1">
        전체 사업장의 기후 리스크 현황을 한눈에 확인할 수 있습니다.
      </p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading && sites.length === 0" class="px-8 py-20 text-center">
      <Loader2 class="animate-spin text-[#EA002C] mx-auto mb-4" :size="48" />
      <p class="text-gray-600">사업장 데이터를 불러오는 중입니다...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="px-8 py-20 text-center">
      <AlertTriangle class="text-red-600 mx-auto mb-4" :size="48" />
      <p class="text-gray-900 font-medium mb-2">데이터를 불러오는데 실패했습니다</p>
      <p class="text-gray-600 mb-4">{{ error.message }}</p>
      <button
        @click="sitesStore.fetchSites()"
        class="px-6 py-2.5 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
      >
        다시 시도
      </button>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="!loading && sites.length === 0" class="px-8 py-20 text-center">
      <AlertTriangle class="text-gray-400 mx-auto mb-4" :size="48" />
      <p class="text-gray-900 font-medium mb-2">등록된 사업장이 없습니다</p>
      <p class="text-gray-600 mb-4">사업장을 추가하여 리스크 분석을 시작하세요.</p>
      <button
        @click="router.push('/site-management')"
        class="px-6 py-2.5 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
      >
        사업장 추가하기
      </button>
    </div>

    <!-- 데이터가 있을 때 -->
    <div v-else class="px-8 py-6">
      <!-- 사업장 현황 Section -->
      <div class="bg-white border border-gray-200 mb-6 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3">
          <h3 class="text-sm text-gray-900">사업장 현황</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="border border-gray-200 p-5">
              <div class="text-xs text-gray-500 mb-2">총 사업장</div>
              <div class="text-2xl text-gray-900">{{ totalSites }}</div>
            </div>

            <div class="border border-gray-200 p-5">
              <div class="text-xs text-gray-500 mb-2">분석된 사업장</div>
              <div class="text-2xl text-green-600">{{ analyzedSites }}</div>
            </div>

            <div class="border border-gray-200 p-5">
              <div class="text-xs text-gray-500 mb-2">고위험 사업장</div>
              <div class="text-2xl text-[#EA002C]">{{ highRiskSites }}</div>
            </div>

            <div class="border border-gray-200 p-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-gray-500 mb-2">최근 분석 수</div>
                  <div class="text-2xl text-gray-900">{{ recentAnalysisCount }}</div>
                </div>
                <div class="text-[#F47725]">
                  <AlertTriangle :size="24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 검색 Section -->
      <div class="bg-white border border-gray-200 mb-6 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">사업장 검색</h3>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-3">
            <div class="flex-1 relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                :size="18"
              />
              <input
                type="text"
                v-model="searchTerm"
                placeholder="사업장명 또는 위치를 입력하세요"
                class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
              />
            </div>
            <button
              class="px-6 py-2.5 text-sm bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      <!-- Risk Heatmap Section -->
      <div class="bg-white border border-gray-200 shadow-sm mb-6">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">리스크 히트맵</h3>
        </div>
        <div class="relative h-[calc(100vh-500px)] min-h-[400px]">
          <!-- Legend - Left Side -->
          <div
            class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-300 p-3 shadow-lg z-10"
          >
            <div class="text-xs text-gray-900 mb-2">범례</div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-red-600 rounded-full"></div>
                <span class="text-xs text-gray-700">높음</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span class="text-xs text-gray-700">보통</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-xs text-gray-700">낮음</span>
              </div>
            </div>
          </div>

          <!-- Zoom Controls - Right Side -->
          <div class="absolute top-4 right-4 flex flex-col gap-1 z-10">
            <button
              class="bg-white/95 backdrop-blur-sm border border-gray-300 w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            >
              <span class="text-lg text-gray-700">+</span>
            </button>
            <button
              class="bg-white/95 backdrop-blur-sm border border-gray-300 w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            >
              <span class="text-lg text-gray-700">-</span>
            </button>
          </div>

          <!-- Map -->
          <RiskHeatmap :sites="sites" @select-site="onSelectSite" />
        </div>
      </div>

      <!-- Sites List Section -->
      <div class="bg-white border border-gray-200 mb-6 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">사업장 목록</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-6 py-4 text-left text-xs text-gray-600 bg-gray-50">사업장 명</th>
                <th class="px-6 py-4 text-left text-xs text-gray-600 bg-gray-50">위치</th>
                <th class="px-6 py-4 text-left text-xs text-gray-600 bg-gray-50">리스크 수준</th>
                <th class="px-6 py-4 text-left text-xs text-gray-600 bg-gray-50">유형</th>
                <th class="px-6 py-4 text-center text-xs text-gray-600 bg-gray-50">상세</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                v-for="(site, index) in filteredSites"
                :key="site.siteId"
                :class="[
                  'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  index === filteredSites.length - 1 ? 'border-b-0' : ''
                ]"
              >
                <td class="px-6 py-4 text-gray-900">{{ site.siteName }}</td>
                <td class="px-6 py-4 text-gray-600">{{ site.location }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="`inline-block px-3 py-1 text-xs ${getRiskColor(site.siteType)}`"
                  >
                    {{ getRiskLabel(site.siteType) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ site.siteType }}</td>
                <td class="px-6 py-4 text-center">
                  <button
                    @click="onViewAnalysis(site.siteId)"
                    class="inline-flex items-center justify-center px-5 py-2 text-xs bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
