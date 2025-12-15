<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSitesStore } from '@/store/sites'
import { useUiStore } from '@/store/ui'
import { ChevronDown, AlertTriangle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import AnalysisOverviewTab from '@/components/analysis/AnalysisOverviewTab.vue'
import AnalysisSSPTab from '@/components/analysis/AnalysisSSPTab.vue'
import AnalysisFinancialTab from '@/components/analysis/AnalysisFinancialTab.vue'
import AnalysisVulnerabilityTab from '@/components/analysis/AnalysisVulnerabilityTab.vue'

console.log('[AnalysisView] Component loaded')

const sitesStore = useSitesStore()
const uiStore = useUiStore()
const router = useRouter()

const selectedSiteId = ref(uiStore.selectedSiteId || '')
const activeTab = ref('overview')

// 컴포넌트 마운트 시 사업장 목록 로드
onMounted(async () => {
  if (sitesStore.allSites.length === 0) {
    await sitesStore.fetchSites()
  }
  // 선택된 사업장이 없으면 첫 번째 사업장으로 자동 선택
  if (!selectedSiteId.value && sitesStore.allSites.length > 0) {
    const firstSite = sitesStore.allSites[0]
    if (firstSite) {
      selectedSiteId.value = firstSite.siteId
    }
  }
})

const tabs = [
  { id: 'overview', label: '개요' },
  { id: 'ssp', label: 'SSP' },
  { id: 'financial', label: '재무 영향' },
  { id: 'vulnerability', label: '취약성' }
]

const sites = computed(() => sitesStore.allSites)
const currentSite = computed(() =>
  sites.value.find((s) => s.siteId === selectedSiteId.value)
)

// selectedSiteId 변경 시 uiStore 업데이트
watch(selectedSiteId, (newId) => {
  if (newId) {
    uiStore.setSelectedSiteId(newId)
  }
})

const goToDashboard = () => {
  router.push('/')
}
</script>

<template>
  <div class="bg-white min-h-full">
    <!-- 선택된 사업장이 없을 때 -->
    <div
      v-if="!selectedSiteId || !currentSite"
      class="min-h-screen flex items-center justify-center px-6"
    >
      <div class="text-center space-y-4">
        <div
          class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"
        >
          <AlertTriangle :size="40" class="text-gray-400" />
        </div>
        <p class="text-gray-900 font-medium">선택된 사업장이 없습니다.</p>
        <p class="text-sm text-gray-500">대시보드에서 분석할 사업장을 선택해 주세요.</p>
        <button
          @click="goToDashboard"
          class="px-6 py-2 bg-[#EA002C] text-white text-sm hover:bg-[#C4002A] transition-colors"
        >
          대시보드로 이동
        </button>
      </div>
    </div>

    <!-- 사업장이 선택된 경우 -->
    <div v-else>
      <!-- 상단 헤더 -->
      <div class="border-b border-gray-200 px-8 py-6 bg-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-gray-900 text-xl">분석</h2>
            <p class="text-sm text-gray-600 mt-1">
              선택한 사업장의 물리적 리스크, 전환 리스크, ESG 진단 결과를 확인할 수 있습니다.
            </p>
          </div>
          <div class="relative">
            <select
              v-model="selectedSiteId"
              class="appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer"
            >
              <option v-for="site in sites" :key="site.siteId" :value="site.siteId">
                {{ site.siteName }}
              </option>
            </select>
            <ChevronDown
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              :size="18"
            />
          </div>
        </div>
      </div>

      <div class="px-8 py-6">
        <!-- 탭 메뉴 -->
        <div class="flex items-end justify-between border-b border-gray-200">
          <div class="flex gap-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-5 pb-2.5 pt-0 text-sm transition-colors relative',
                activeTab === tab.id ? 'text-[#EA002C]' : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              {{ tab.label }}
              <div
                v-if="activeTab === tab.id"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA002C] translate-y-px"
              ></div>
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="mt-6">
          <AnalysisOverviewTab v-if="activeTab === 'overview'" :site-id="selectedSiteId" />
          <AnalysisSSPTab v-if="activeTab === 'ssp'" :site-id="selectedSiteId" />
          <AnalysisFinancialTab v-if="activeTab === 'financial'" :site-id="selectedSiteId" />
          <AnalysisVulnerabilityTab
            v-if="activeTab === 'vulnerability'"
            :site-id="selectedSiteId"
          />
        </div>
      </div>
    </div>
  </div>
</template>
