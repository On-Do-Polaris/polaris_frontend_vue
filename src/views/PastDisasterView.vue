<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSitesStore } from '@/store/sites'
import { useUiStore } from '@/store/ui'
import { ChevronDown, AlertTriangle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { disasterHistoryAPI } from '@/api/disasterHistory'
import type { PastDisasterItem, PastDisasterQueryParams } from '@/api/types'
import { toast } from 'vue-sonner'

console.log('[PastDisasterView] Component loaded')

const sitesStore = useSitesStore()
const uiStore = useUiStore()
const router = useRouter()

const selectedSiteId = ref(uiStore.selectedSiteId || '')

// 필터 상태
const selectedYear = ref('0000')
const selectedDisasterType = ref('0000')
const selectedDisasterLevel = ref('0000')

// 연도 목록 생성 (전체 + 2023 ~ 2025)
const years = computed(() => {
  const yearList = [{ label: '전체', value: '0000' }]
  for (let year = 2025; year >= 2023; year--) {
    yearList.push({ label: year.toString(), value: year.toString() })
  }
  return yearList
})

// 재해 유형
const disasterTypes = [
  { label: '전체', value: '0000' },
  { label: '폭염', value: '폭염' },
  { label: '호우', value: '호우' },
  { label: '대설', value: '대설' },
  { label: '강풍', value: '강풍' },
  { label: '한파', value: '한파' },
  { label: '건조', value: '건조' },
  { label: '풍랑', value: '풍랑' },
  { label: '황사', value: '황사' },
  { label: '태풍', value: '태풍' },
  { label: '지진해일', value: '지진해일' },
]

// 재해 수준
const disasterLevels = [
  { label: '전체', value: '0000' },
  { label: '주의보', value: '주의보' },
  { label: '경보', value: '경보' },
]

// 재해 데이터
const disasters = ref<PastDisasterItem[]>([])
const isLoading = ref(false)

// 조회 핸들러
const handleSearch = async () => {
  isLoading.value = true
  try {
    // "0000"이 아닌 값만 파라미터에 포함
    const params: PastDisasterQueryParams = {}

    if (selectedYear.value !== '0000') {
      params.year = selectedYear.value
    }

    if (selectedDisasterType.value !== '0000') {
      params.disaster_type = selectedDisasterType.value
    }

    if (selectedDisasterLevel.value !== '0000') {
      params.severity = selectedDisasterLevel.value
    }

    const response = await disasterHistoryAPI.getPastDisasters(params)

    disasters.value = response.data.items
  } catch (error) {
    console.error('Failed to fetch disasters:', error)
    toast.error('재해 이력 조회에 실패했습니다')
  } finally {
    isLoading.value = false
  }
}

// 재해 수준에 따른 색상 결정
const getSeverityColor = (severity: string) => {
  if (severity === '경보') {
    return 'text-red-600'
  } else if (severity === '주의보') {
    return 'text-orange-500'
  }
  return 'text-gray-900'
}

// 컴포넌트 마운트 시 사업장 목록 로드 및 전체 재해 이력 조회
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

  // 초기 로드 시 전체 재해 이력 자동 조회
  await handleSearch()
})

const sites = computed(() => sitesStore.allSites)
const currentSite = computed(() => sites.value.find((s) => s.siteId === selectedSiteId.value))

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
  <div class="bg-white">
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
    <div v-else class="min-h-screen">
      <!-- 상단 헤더 -->
      <div class="border-b border-gray-200 px-8 py-6 bg-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-gray-900 text-xl">재해 이력</h2>
            <p class="text-sm text-gray-600 mt-1">
              국내 특정 기간 동안의 재해 이력을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div class="px-8 py-6">
        <!-- 필터 영역 -->
        <div class="bg-white border border-gray-200 shadow-sm mb-6">
          <div class="p-6">
            <div class="flex items-center gap-4">
              <!-- 연도 드롭다운 -->
              <div class="flex-1">
                <label class="block text-sm text-gray-700 mb-2">연도</label>
                <div class="relative">
                  <select
                    v-model="selectedYear"
                    class="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer"
                  >
                    <option v-for="year in years" :key="year.value" :value="year.value">
                      {{ year.label }}
                    </option>
                  </select>
                  <ChevronDown
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    :size="18"
                  />
                </div>
              </div>

              <!-- 재해 유형 드롭다운 -->
              <div class="flex-1">
                <label class="block text-sm text-gray-700 mb-2">재해 유형</label>
                <div class="relative">
                  <select
                    v-model="selectedDisasterType"
                    class="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer"
                  >
                    <option v-for="type in disasterTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                  <ChevronDown
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    :size="18"
                  />
                </div>
              </div>

              <!-- 재해 수준 드롭다운 -->
              <div class="flex-1">
                <label class="block text-sm text-gray-700 mb-2">재해 수준</label>
                <div class="relative">
                  <select
                    v-model="selectedDisasterLevel"
                    class="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer"
                  >
                    <option v-for="level in disasterLevels" :key="level.value" :value="level.value">
                      {{ level.label }}
                    </option>
                  </select>
                  <ChevronDown
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    :size="18"
                  />
                </div>
              </div>

              <!-- 조회 버튼 -->
              <div>
                <label class="block text-sm text-gray-700 mb-2">&nbsp;</label>
                <button
                  @click="handleSearch"
                  :disabled="isLoading"
                  class="px-8 py-2 bg-[#EA002C] text-white text-sm hover:bg-[#C4002A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  조회
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 재해 목록 -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div
              class="w-12 h-12 border-4 border-gray-200 border-t-[#EA002C] rounded-full animate-spin mx-auto mb-4"
            ></div>
            <p class="text-sm text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>

        <div v-else-if="disasters.length === 0" class="flex items-center justify-center py-12">
          <p class="text-sm text-gray-500">조회된 재해 이력이 없습니다.</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-6 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
          <div
            v-for="(disaster, index) in disasters"
            :key="index"
            class="bg-white border border-gray-200 shadow-sm p-6"
          >
            <!-- 상단: 날짜, 재해 유형, 재해 수준 -->
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="text-center">
                <p class="text-3xl text-gray-900 font-semibold">{{ disaster.date }}</p>
              </div>
              <div class="text-center">
                <p class="text-3xl text-gray-900 font-semibold">{{ disaster.disaster_type }}</p>
              </div>
              <div class="text-center">
                <p class="text-3xl font-semibold" :class="getSeverityColor(disaster.severity)">
                  {{ disaster.severity }}
                </p>
              </div>
            </div>

            <!-- 구분선 -->
            <div class="border-t border-gray-200 my-4"></div>

            <!-- 하단: 지역 목록 -->
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm text-gray-700 font-medium">발생 지역:</p>
              <span
                v-for="(regionName, idx) in disaster.region"
                :key="idx"
                class="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {{ regionName }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
