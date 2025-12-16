<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { ChevronDown, Loader2 } from 'lucide-vue-next'
import { useMeta } from '@/composables/useMeta'
import { analysisAPI } from '@/api/analysis'
import type { PhysicalRiskResponse } from '@/api/types'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps<{
  siteId: string
}>()

const { hazardTypes, fetchHazardTypes } = useMeta()

type Period = '장기' | '중기' | '단기'

const selectedPeriod = ref<Period>('장기')
const selectedRiskFactor = ref<string>('')
const loading = ref(false)
const error = ref<string | null>(null)
const aalData = ref<PhysicalRiskResponse | null>(null)

const periods: Period[] = ['장기', '중기', '단기']

// hazards API에서 받아온 name 목록
const riskFactors = computed(() => hazardTypes.value.map((h) => h.name))

// 시나리오 이름 매핑
const scenarioNames: Record<string, string> = {
  scenarios1: 'SSP1-2.6',
  scenarios2: 'SSP2-4.5',
  scenarios3: 'SSP3-7.0',
  scenarios4: 'SSP5-8.5',
}

// 기간을 API term으로 변환
const periodToTerm = (period: Period): 'short' | 'mid' | 'long' => {
  switch (period) {
    case '단기':
      return 'short'
    case '중기':
      return 'mid'
    case '장기':
      return 'long'
    default:
      return 'long'
  }
}

// API 데이터 로드
const loadAALData = async () => {
  if (!selectedRiskFactor.value) return

  loading.value = true
  error.value = null

  try {
    // hazardTypes와 AAL 데이터 로드
    await fetchHazardTypes()

    const term = periodToTerm(selectedPeriod.value)
    const response = await analysisAPI.getAAL(props.siteId, selectedRiskFactor.value, term)

    aalData.value = response
  } catch (err) {
    console.error('AAL 데이터 로드 실패:', err)
    error.value = '데이터를 불러오는데 실패했습니다'
  } finally {
    loading.value = false
  }
}

// 레이블 포맷팅
const formatLabel = (key: string): string => {
  // 숫자만 있는 경우 '년' 붙이기
  if (/^\d+$/.test(key)) {
    return `${key}년`
  }
  return key
}

// 컴포넌트 마운트 시 hazardTypes 로드
onMounted(async () => {
  await fetchHazardTypes()
})

// siteId 변경 감지
watch(
  () => props.siteId,
  () => {
    if (selectedRiskFactor.value) {
      loadAALData()
    }
  },
)

// hazardTypes가 로드되면 첫 번째 값을 selectedRiskFactor로 설정
watch(
  hazardTypes,
  (newHazardTypes) => {
    if (newHazardTypes.length > 0 && !selectedRiskFactor.value) {
      const firstHazard = newHazardTypes[0]
      if (firstHazard) {
        selectedRiskFactor.value = firstHazard.name
      }
    }
  },
  { immediate: true },
)

// selectedRiskFactor나 selectedPeriod가 변경되면 데이터 다시 로드
watch([selectedRiskFactor, selectedPeriod], () => {
  if (selectedRiskFactor.value) {
    loadAALData()
  }
})

const chartData = computed(() => {
  if (!aalData.value) {
    return {
      labels: [],
      datasets: [],
    }
  }

  const data = aalData.value

  // 첫 번째 시나리오의 키를 추출해서 레이블로 사용
  const firstScenario = data.scenarios1 || data.scenarios2 || data.scenarios3 || data.scenarios4
  if (!firstScenario) {
    return {
      labels: [],
      datasets: [],
    }
  }

  const dataKeys = Object.keys(firstScenario).sort()
  const period = selectedPeriod.value
  const isShortTerm = period === '단기'

  // 단기일 때는 중앙에 배치하기 위해 빈 라벨 추가
  let labels: string[]
  if (isShortTerm && dataKeys.length > 0) {
    labels = ['', formatLabel(dataKeys[0]!), '']
  } else {
    labels = dataKeys.map(formatLabel)
  }

  // 시나리오별 색상 매핑
  const colors: Record<string, string> = {
    'SSP1-2.6': '#B3CF0A',
    'SSP2-4.5': '#EA002C',
    'SSP3-7.0': '#009DA3',
    'SSP5-8.5': '#F47725',
  }

  const datasets = []

  // scenarios1 ~ scenarios4 처리
  if (data.scenarios1) {
    let scenarioData: (number | null)[]
    if (isShortTerm && dataKeys.length > 0) {
      // 단기일 때는 중앙에만 값, 앞뒤는 null
      scenarioData = [null, (data.scenarios1 as any)[dataKeys[0]!], null]
    } else {
      scenarioData = dataKeys.map((key) => (data.scenarios1 as any)[key])
    }
    datasets.push({
      label: scenarioNames.scenarios1,
      borderColor: colors['SSP1-2.6'],
      backgroundColor: colors['SSP1-2.6'],
      data: scenarioData,
      fill: false,
      tension: 0.4,
      pointRadius: isShortTerm ? 8 : 4,
      pointHoverRadius: isShortTerm ? 10 : 6,
      showLine: !isShortTerm,
    })
  }
  if (data.scenarios2) {
    let scenarioData: (number | null)[]
    if (isShortTerm && dataKeys.length > 0) {
      scenarioData = [null, (data.scenarios2 as any)[dataKeys[0]!], null]
    } else {
      scenarioData = dataKeys.map((key) => (data.scenarios2 as any)[key])
    }
    datasets.push({
      label: scenarioNames.scenarios2,
      borderColor: colors['SSP2-4.5'],
      backgroundColor: colors['SSP2-4.5'],
      data: scenarioData,
      fill: false,
      tension: 0.4,
      pointRadius: isShortTerm ? 8 : 4,
      pointHoverRadius: isShortTerm ? 10 : 6,
      showLine: !isShortTerm,
    })
  }
  if (data.scenarios3) {
    let scenarioData: (number | null)[]
    if (isShortTerm && dataKeys.length > 0) {
      scenarioData = [null, (data.scenarios3 as any)[dataKeys[0]!], null]
    } else {
      scenarioData = dataKeys.map((key) => (data.scenarios3 as any)[key])
    }
    datasets.push({
      label: scenarioNames.scenarios3,
      borderColor: colors['SSP3-7.0'],
      backgroundColor: colors['SSP3-7.0'],
      data: scenarioData,
      fill: false,
      tension: 0.4,
      pointRadius: isShortTerm ? 8 : 4,
      pointHoverRadius: isShortTerm ? 10 : 6,
      showLine: !isShortTerm,
    })
  }
  if (data.scenarios4) {
    let scenarioData: (number | null)[]
    if (isShortTerm && dataKeys.length > 0) {
      scenarioData = [null, (data.scenarios4 as any)[dataKeys[0]!], null]
    } else {
      scenarioData = dataKeys.map((key) => (data.scenarios4 as any)[key])
    }
    datasets.push({
      label: scenarioNames.scenarios4,
      borderColor: colors['SSP5-8.5'],
      backgroundColor: colors['SSP5-8.5'],
      data: scenarioData,
      fill: false,
      tension: 0.4,
      pointRadius: isShortTerm ? 8 : 4,
      pointHoverRadius: isShortTerm ? 10 : 6,
      showLine: !isShortTerm,
    })
  }

  return {
    labels,
    datasets,
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'AAL (연간 평균 손실)',
      },
      min: 0,
    },
  },
}

// 재무 영향
const financialReason = computed(() => {
  return aalData.value?.reason || '재무 영향 설명 정보가 없습니다.'
})
</script>

<template>
  <div class="mt-6">
    <!-- AAL 그래프 섹션 -->
    <div class="bg-white border border-gray-200 shadow-sm mb-6">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
        <h3 class="text-sm text-gray-900">SSP 시나리오별 AAL 전망</h3>

        <!-- 드롭다운 영역 -->
        <div class="flex items-center gap-3">
          <!-- 기간 선택 드롭다운 -->
          <div class="relative">
            <select
              v-model="selectedPeriod"
              class="appearance-none bg-white border border-gray-300 px-4 py-2 pr-14 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer"
            >
              <option v-for="period in periods" :key="period" :value="period">
                {{ period }}
              </option>
            </select>
            <ChevronDown
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              :size="16"
            />
          </div>

          <!-- 리스크 요소 선택 드롭다운 -->
          <div class="relative">
            <select
              v-model="selectedRiskFactor"
              class="appearance-none bg-white border border-gray-300 px-4 py-2 pr-14 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer min-w-[160px]"
            >
              <option v-for="factor in riskFactors" :key="factor" :value="factor">
                {{ factor }}
              </option>
            </select>
            <ChevronDown
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              :size="16"
            />
          </div>
        </div>
      </div>

      <div class="p-6 h-[400px]">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="flex items-center justify-center h-full">
          <Loader2 class="animate-spin text-[#EA002C]" :size="40" />
          <span class="ml-3 text-gray-600">AAL 데이터를 불러오는 중...</span>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="flex items-center justify-center h-full text-red-500">
          {{ error }}
        </div>

        <!-- 데이터가 있을 때 -->
        <Line v-else-if="aalData" :data="chartData" :options="chartOptions" />

        <!-- 데이터가 없을 때 -->
        <div v-else class="flex items-center justify-center h-full text-gray-500">
          AAL 데이터가 없습니다.
        </div>
      </div>

      <!-- 범례 안내 텍스트 -->
      <div class="px-4 py-3 text-xs text-gray-500 border-t border-gray-100">
        * 범례의 항목을 누르면 해당 시나리오 그래프 선을 비활성화할 수 있습니다.
      </div>
    </div>

    <!-- 재무 영향 설명 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">재무 영향 설명</h3>
      </div>
      <div class="p-6">
        <div class="border-l-4 border-[#EA002C] bg-red-50 p-5">
          <div class="flex items-start gap-3">
            <div class="text-sm text-gray-900">
              <span class="text-[#EA002C]">▶</span>
              {{ financialReason }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
