<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, MapPin, Building2, Download } from 'lucide-vue-next'
import { useSitesStore } from '@/store/sites'
import { useUiStore } from '@/store/ui'
import { useRouter } from 'vue-router'
import HistoricalDisasters from '@/components/charts/HistoricalDisasters.vue'
import TCFDScenario from '@/components/simulation/TCFDScenario.vue'
import FinancialImpact from '@/components/simulation/FinancialImpact.vue'
import AssetVulnerability from '@/components/simulation/AssetVulnerability.vue'
import LocationSimulation from '@/components/simulation/LocationSimulation.vue'

const sitesStore = useSitesStore()
const uiStore = useUiStore()
const router = useRouter()

// 컴포넌트 마운트 시 사업장 목록 로드
onMounted(() => {
  if (sitesStore.allSites.length === 0) {
    sitesStore.fetchSites()
  }
})

const currentSite = computed(() => {
  const selectedId = uiStore.selectedSiteId
  if (selectedId) {
    return sitesStore.allSites.find((s) => s.siteId === selectedId) || uiStore.selectedSite
  }
  return uiStore.selectedSite
})

const activeTab = ref<
  'overview' | 'history' | 'scenario' | 'financial' | 'vulnerability' | 'simulation'
>('overview')

const onBack = () => {
  router.back()
}

const goToDashboard = () => {
  router.push('/')
}
</script>

<template>
  <div v-if="currentSite" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="onBack" class="p-2 hover:bg-gray-100">
            <ArrowLeft :size="20" class="text-gray-600" />
          </button>
          <h3 class="text-gray-900">SK AX</h3>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Download :size="16" />
            리포트 다운로드
          </button>
        </div>
      </div>
    </header>

    <div class="p-6 max-w-7xl mx-auto">
      <!-- Site Info -->
      <div class="bg-white border-l-4 border-l-[#dc042b] p-6 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-gray-900 mb-4">{{ currentSite.siteName }}</h2>
            <div class="flex items-center gap-6 text-gray-600">
              <div class="flex items-center gap-2">
                <MapPin :size="16" />
                <span>{{ currentSite.location }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Building2 :size="16" />
                <span>{{ currentSite.siteType }}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-600 mb-1">사업장 유형</div>
            <div class="inline-block px-4 py-2 border bg-gray-100 text-gray-700 border-gray-300">
              {{ currentSite.siteType }}
            </div>
          </div>
        </div>
      </div>
      <!-- Tabs -->
      <div class="bg-white border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-900">자세한 분석</h3>
          <div class="flex items-center gap-4">
            <button
              @click="activeTab = 'overview'"
              :class="`px-4 py-2 ${
                activeTab === 'overview'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`"
            >
              개요
            </button>
            <button
              @click="activeTab = 'history'"
              :class="`px-4 py-2 ${
                activeTab === 'history'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`"
            >
              과거 재난
            </button>
            <button
              @click="activeTab = 'scenario'"
              :class="`px-4 py-2 ${
                activeTab === 'scenario'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`"
            >
              TCFD 시나리오
            </button>
            <button
              @click="activeTab = 'financial'"
              :class="`px-4 py-2 ${
                activeTab === 'financial'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`"
            >
              재무 영향
            </button>
            <button
              @click="activeTab = 'vulnerability'"
              :class="`px-4 py-2 ${
                activeTab === 'vulnerability'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`"
            >
              자산 취약성
            </button>
            <button
              @click="activeTab = 'simulation'"
              :class="`px-4 py-2 ${
                activeTab === 'simulation'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`"
            >
              위치 시뮬레이션
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div v-if="activeTab === 'overview'">
          <p class="text-sm text-gray-600">
            사이트의 종합적인 리스크 분석입니다.
          </p>
        </div>
        <div v-if="activeTab === 'history'">
          <HistoricalDisasters />
        </div>
        <div v-if="activeTab === 'scenario'">
          <TCFDScenario />
        </div>
        <div v-if="activeTab === 'financial'">
          <FinancialImpact :site="currentSite" />
        </div>
        <div v-if="activeTab === 'vulnerability'">
          <AssetVulnerability :site="currentSite" />
        </div>
        <div v-if="activeTab === 'simulation'">
          <LocationSimulation :site="currentSite" />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="min-h-screen bg-gray-50 flex items-center justify-center px-6">
    <div class="text-center space-y-4">
      <p class="text-gray-700">선택된 사업장이 없습니다.</p>
      <p class="text-sm text-gray-500">
        대시보드에서 분석할 사업장을 선택해 주세요.
      </p>
      <button
        @click="goToDashboard"
        class="px-6 py-2 bg-[#EA002C] text-white text-sm hover:bg-[#C4002A] transition-colors"
      >
        대시보드로 이동
      </button>
    </div>
  </div>
</template>
