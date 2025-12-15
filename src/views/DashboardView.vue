<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, AlertTriangle, Loader2 } from 'lucide-vue-next'
import { useSitesStore, type SiteInfo } from '@/store/sites'
import { useUiStore } from '@/store/ui'
import { useDashboard } from '@/composables/useDashboard'
import { useMeta } from '@/composables/useMeta'
import RiskHeatmap from '@/components/charts/RiskHeatmap.vue'
import { useRouter } from 'vue-router'

console.log('[DashboardView] Component loaded')

const sitesStore = useSitesStore()
const uiStore = useUiStore()
const router = useRouter()
const { summary, loading: dashboardLoading, error: dashboardError, fetchSummary } = useDashboard()
const { industries, fetchIndustries } = useMeta()

const searchTerm = ref('')

const sites = computed(() => sitesStore.allSites)
const loading = computed(() => sitesStore.loading)
const error = computed(() => sitesStore.error)

const filteredSites = computed(() =>
  sites.value.filter(
    (site) =>
      site.siteName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (site.location?.toLowerCase().includes(searchTerm.value.toLowerCase()) ?? false) ||
      (site.roadAddress?.toLowerCase().includes(searchTerm.value.toLowerCase()) ?? false) ||
      (site.jibunAddress?.toLowerCase().includes(searchTerm.value.toLowerCase()) ?? false),
  ),
)

// 검색어로 필터링된 summary 또는 sites 데이터
const filteredSummaryOrSites = computed(() => {
  const searchLower = searchTerm.value.toLowerCase()

  // summary 데이터가 있으면 summary.sites를 필터링
  if (summary.value?.sites) {
    if (!searchLower) return summary.value.sites

    return summary.value.sites.filter(
      (site) =>
        site.siteName.toLowerCase().includes(searchLower) ||
        site.roadAddress?.toLowerCase().includes(searchLower) ||
        site.jibunAddress?.toLowerCase().includes(searchLower) ||
        site.siteType?.toLowerCase().includes(searchLower),
    )
  }

  // summary가 없으면 기존 filteredSites 사용
  return filteredSites.value
})

// API에서 가져온 대시보드 요약 정보 기반 통계 계산
const totalSites = computed(() => summary.value?.sites?.length ?? 0)
const safeSites = computed(
  () => summary.value?.sites?.filter((s) => s.totalRiskScore < 40).length ?? 0,
)
const highRiskSites = computed(
  () => summary.value?.sites?.filter((s) => s.totalRiskScore >= 80).length ?? 0,
)
const mainClimateRisk = computed(() => summary.value?.mainClimateRisk ?? '-')

const getRiskColor = (score: number) => {
  if (score >= 80) {
    return 'bg-red-600 text-white'
  } else if (score >= 60) {
    return 'bg-orange-500 text-white'
  } else if (score >= 40) {
    return 'bg-yellow-500 text-white'
  } else if (score >= 20) {
    return 'bg-green-500 text-white'
  } else {
    return 'bg-cyan-500 text-white'
  }
}

const getRiskLabel = (score: number) => {
  if (score >= 80) {
    return '매우 높음'
  } else if (score >= 60) {
    return '높음'
  } else if (score >= 40) {
    return '보통'
  } else if (score >= 20) {
    return '낮음'
  } else {
    return '매우 낮음'
  }
}

const onViewAnalysis = (siteId: string) => {
  uiStore.setSelectedSiteId(siteId)
  router.push('/analysis')
}

const onSelectSite = (site: SiteInfo) => {
  uiStore.setSelectedSiteId(site.siteId)
  router.push('/analysis')
}

// 사업장 유형 코드를 한글 이름으로 변환
const getSiteTypeName = (siteTypeCode: string): string => {
  const industry = industries.value.find((i) => i.code === siteTypeCode)
  return industry?.name || siteTypeCode
}

// 컴포넌트 마운트 시 사업장 목록 및 대시보드 요약 정보 로드
onMounted(async () => {
  await fetchIndustries()
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
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">사업장 통계</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="border border-gray-200 p-5">
              <div class="text-xs text-gray-500 mb-2">총 사업장</div>
              <div class="text-2xl text-gray-900">{{ totalSites }}</div>
            </div>

            <div class="border border-gray-200 p-5">
              <div class="text-xs text-gray-500 mb-2">안전 사업장</div>
              <div class="text-2xl text-green-600">{{ safeSites }}</div>
            </div>

            <div class="border border-gray-200 p-5">
              <div class="text-xs text-gray-500 mb-2">고위험 사업장</div>
              <div class="text-2xl text-[#EA002C]">{{ highRiskSites }}</div>
            </div>

            <div class="border border-gray-200 p-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-gray-500 mb-2">주요 기후 리스크</div>
                  <div class="text-xl text-gray-900 truncate" :title="mainClimateRisk">
                    {{ mainClimateRisk }}
                  </div>
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
          <h3 class="text-sm text-gray-900">
            사업장 리스크 지도(SSP2-4.5&2040년도의 물리적 리스크 점수)
          </h3>
        </div>
        <div class="relative h-[calc(100vh-300px)] min-h-[600px]">
          <!-- Legend - Left Side -->
          <div
            class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-300 p-3 shadow-lg z-10"
          >
            <div class="text-xs text-gray-900 mb-2">범례</div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-red-600 rounded-full"></div>
                <span class="text-xs text-gray-700">매우 높음 (80~100점)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span class="text-xs text-gray-700">높음 (60~79점)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span class="text-xs text-gray-700">보통 (40~59점)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-xs text-gray-700">낮음 (20~39점)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span class="text-xs text-gray-700">매우 낮음 (0~19점)</span>
              </div>
            </div>
          </div>

          <!-- Map -->
          <RiskHeatmap :sites="filteredSummaryOrSites" @select-site="onSelectSite" />
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
                <th class="px-6 py-4 text-center text-xs text-gray-600 bg-gray-50">사업장명</th>
                <th class="px-6 py-4 text-center text-xs text-gray-600 bg-gray-50">위치</th>
                <th class="px-6 py-4 text-center text-xs text-gray-600 bg-gray-50">사업장 유형</th>
                <th class="px-6 py-4 text-center text-xs text-gray-600 bg-gray-50">
                  사업장 종합 리스크 점수
                </th>
                <th class="px-6 py-4 text-center text-xs text-gray-600 bg-gray-50">상세</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                v-for="(site, index) in filteredSummaryOrSites"
                :key="site.siteId"
                :class="[
                  'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  index === filteredSummaryOrSites.length - 1 ? 'border-b-0' : '',
                ]"
              >
                <td class="px-6 py-4 text-center text-gray-900">{{ site.siteName }}</td>
                <td class="px-6 py-4 text-center text-gray-600">
                  {{ (site as any).roadAddress || (site as any).jibunAddress || '-' }}
                </td>
                <td class="px-6 py-4 text-center text-gray-600">
                  {{ getSiteTypeName(site.siteType) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span v-if="summary" class="text-gray-900">
                    {{ (site as any).totalRiskScore ?? '-' }}점
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
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
