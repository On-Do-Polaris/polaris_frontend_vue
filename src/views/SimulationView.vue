<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { useSitesStore } from '@/store/sites'
import ClimateSimulation from '@/components/simulation/ClimateSimulation.vue'
import LocationSimulation from '@/components/simulation/LocationSimulation.vue'

console.log('[SimulationView] Component loaded')

type SimulationType = 'location' | 'climate'

const sitesStore = useSitesStore()

const simulationType = ref<SimulationType>('location')
const selectedSiteId = ref<string>('')

// 사업장 목록 로드
onMounted(async () => {
  if (sitesStore.allSites.length === 0) {
    await sitesStore.fetchSites()
  }
  // 첫 번째 사업장 자동 선택
  if (sitesStore.allSites.length > 0 && sitesStore.allSites[0]) {
    selectedSiteId.value = sitesStore.allSites[0].siteId
  }
})
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- 상단 헤더 -->
    <div class="border-b border-gray-200 px-8 py-6 bg-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-gray-900 text-xl">시뮬레이션</h2>
          <p class="text-sm text-gray-600 mt-1">
            새로운 사업장 위치에 대해 기존 사업장과 비교하여 기후 시나리오별 리스크 분석 결과를 확인할 수
            있습니다.<br></br>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- 사업장 선택 드롭다운 -->
          <div class="relative">
            <select
              v-model="selectedSiteId"
              class="appearance-none bg-white border border-gray-300 px-4 py-2 pr-14 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer"
            >
              <option v-for="site in sitesStore.allSites" :key="site.siteId" :value="site.siteId">
                {{ site.siteName }}
              </option>
            </select>
            <ChevronDown
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              :size="18"
            />
          </div>

          <!-- 시뮬레이션 타입 선택 드롭다운 -->
          <div class="relative">
            <select
              v-model="simulationType"
              class="appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer"
            >
              <option value="location">위치 시뮬레이션</option>
              <option value="climate">기후 시뮬레이션</option>
            </select>
            <ChevronDown
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              :size="18"
            />
          </div>
        </div>
        
      </div>
    </div>

    <div class="px-8 py-6">
      <!-- 기후 시뮬레이션 -->
      <ClimateSimulation
        v-if="simulationType === 'climate'"
        :selected-site-id="selectedSiteId"
        :sites="sitesStore.allSites"
        @update:selected-site-id="selectedSiteId = $event"
      />

      <!-- 위치 시뮬레이션 -->
      <LocationSimulation
        v-else
        :selected-site-id="selectedSiteId"
        :sites="sitesStore.allSites"
        @update:selected-site-id="selectedSiteId = $event"
      />
    </div>
  </div>
</template>

