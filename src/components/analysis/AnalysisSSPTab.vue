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
const sspData = ref<PhysicalRiskResponse | null>(null)

const periods: Period[] = ['장기', '중기', '단기']

// hazards API에서 받아온 name 목록
const riskFactors = computed(() => hazardTypes.value.map((h) => h.name))

// 시나리오 이름 매핑
const scenarioNames = {
  scenarios1: 'SSP1-2.6',
  scenarios2: 'SSP2-4.5',
  scenarios3: 'SSP3-7.0',
  scenarios4: 'SSP5-8.5',
} as const

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
const loadSSPData = async () => {
  if (!selectedRiskFactor.value) return

  loading.value = true
  error.value = null

  try {
    // hazardTypes와 physical-risk 데이터 로드
    await fetchHazardTypes()

    const term = periodToTerm(selectedPeriod.value)
    const response = await analysisAPI.getPhysicalRisk(props.siteId, selectedRiskFactor.value, term)

    sspData.value = response
  } catch (err) {
    console.error('SSP 데이터 로드 실패:', err)
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
      loadSSPData()
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
    loadSSPData()
  }
})

// 원본 데이터를 저장 (툴팁에서 사용)
const rawDataMap = ref<Record<string, Record<string, any>>>({})

const chartData = computed(() => {
  if (!sspData.value) {
    return {
      labels: [],
      datasets: [],
    }
  }

  const data = sspData.value

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

  // 값을 추출하는 헬퍼 함수 (객체 형태 또는 숫자 처리)
  const extractValue = (value: any): number => {
    if (typeof value === 'object' && value !== null && 'total' in value) {
      return value.total
    }
    return typeof value === 'number' ? value : 0
  }

  // 원본 데이터 맵 초기화
  rawDataMap.value = {}

  // scenarios1 ~ scenarios4 처리
  if (data.scenarios1) {
    const scenarioName = scenarioNames.scenarios1
    let scenarioData: (number | null)[]
    if (isShortTerm && dataKeys.length > 0) {
      // 단기일 때는 중앙에만 값, 앞뒤는 null
      scenarioData = [null, extractValue((data.scenarios1 as any)[dataKeys[0]!]), null]
    } else {
      scenarioData = dataKeys.map((key) => extractValue((data.scenarios1 as any)[key]))
    }
    datasets.push({
      label: scenarioName,
      borderColor: colors['SSP1-2.6'],
      backgroundColor: colors['SSP1-2.6'],
      data: scenarioData,
      fill: false,
      tension: 0.4,
      pointRadius: isShortTerm ? 8 : 4,
      pointHoverRadius: isShortTerm ? 10 : 6,
      showLine: !isShortTerm,
    })
    rawDataMap.value[scenarioName] = data.scenarios1
  }
  if (data.scenarios2) {
    const scenarioName = scenarioNames.scenarios2
    let scenarioData: (number | null)[]
    if (isShortTerm && dataKeys.length > 0) {
      scenarioData = [null, extractValue((data.scenarios2 as any)[dataKeys[0]!]), null]
    } else {
      scenarioData = dataKeys.map((key) => extractValue((data.scenarios2 as any)[key]))
    }
    datasets.push({
      label: scenarioName,
      borderColor: colors['SSP2-4.5'],
      backgroundColor: colors['SSP2-4.5'],
      data: scenarioData,
      fill: false,
      tension: 0.4,
      pointRadius: isShortTerm ? 8 : 4,
      pointHoverRadius: isShortTerm ? 10 : 6,
      showLine: !isShortTerm,
    })
    rawDataMap.value[scenarioName] = data.scenarios2
  }
  if (data.scenarios3) {
    const scenarioName = scenarioNames.scenarios3
    let scenarioData: (number | null)[]
    if (isShortTerm && dataKeys.length > 0) {
      scenarioData = [null, extractValue((data.scenarios3 as any)[dataKeys[0]!]), null]
    } else {
      scenarioData = dataKeys.map((key) => extractValue((data.scenarios3 as any)[key]))
    }
    datasets.push({
      label: scenarioName,
      borderColor: colors['SSP3-7.0'],
      backgroundColor: colors['SSP3-7.0'],
      data: scenarioData,
      fill: false,
      tension: 0.4,
      pointRadius: isShortTerm ? 8 : 4,
      pointHoverRadius: isShortTerm ? 10 : 6,
      showLine: !isShortTerm,
    })
    rawDataMap.value[scenarioName] = data.scenarios3
  }
  if (data.scenarios4) {
    const scenarioName = scenarioNames.scenarios4
    let scenarioData: (number | null)[]
    if (isShortTerm && dataKeys.length > 0) {
      scenarioData = [null, extractValue((data.scenarios4 as any)[dataKeys[0]!]), null]
    } else {
      scenarioData = dataKeys.map((key) => extractValue((data.scenarios4 as any)[key]))
    }
    datasets.push({
      label: scenarioName,
      borderColor: colors['SSP5-8.5'],
      backgroundColor: colors['SSP5-8.5'],
      data: scenarioData,
      fill: false,
      tension: 0.4,
      pointRadius: isShortTerm ? 8 : 4,
      pointHoverRadius: isShortTerm ? 10 : 6,
      showLine: !isShortTerm,
    })
    rawDataMap.value[scenarioName] = data.scenarios4
  }

  return {
    labels,
    datasets,
  }
})

// Y축 스케일 계산 (min-max 스케일링 - physical-risk-scores의 max 값 기준)
const calculateYScale = (): { min: number; max: number } => {
  const data = sspData.value
  if (!data) return { min: 0, max: 100 }

  // physical-risk-scores 필드에서 max 값 찾기
  const physicalRiskScores = (data as any)['physical-risk-scores']
  if (physicalRiskScores && typeof physicalRiskScores === 'object') {
    const values = Object.values(physicalRiskScores).filter(
      (v): v is number => typeof v === 'number' && v > 0
    )

    if (values.length > 0) {
      const maxValue = Math.max(...values)
      // max 값에 20% 여유를 두고 범례 설정
      return {
        min: 0,
        max: Math.ceil(maxValue * 1.2),
      }
    }
  }

  // physical-risk-scores가 없으면 scenarios 데이터 사용 (fallback)
  const allValues: number[] = []
  const scenarios = [data.scenarios1, data.scenarios2, data.scenarios3, data.scenarios4]
  scenarios.forEach((scenario) => {
    if (scenario) {
      Object.values(scenario).forEach((value: any) => {
        if (typeof value === 'object' && value !== null && 'total' in value) {
          allValues.push(value.total)
        } else if (typeof value === 'number' && value > 0) {
          allValues.push(value)
        }
      })
    }
  })

  if (allValues.length === 0) return { min: 0, max: 100 }

  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)

  // 모든 값이 같으면 범위를 설정
  if (minValue === maxValue) {
    return { min: Math.max(0, minValue - 10), max: minValue + 10 }
  }

  // min-max 스케일링: 범위의 20% 패딩 추가
  const range = maxValue - minValue
  const padding = Math.max(range * 0.2, 5)

  return {
    min: Math.max(0, Math.floor(minValue - padding)),
    max: Math.ceil(maxValue + padding),
  }
}

const chartOptions = computed(() => {
  const data = sspData.value
  const yScale = calculateYScale()

  if (!data) {
    return {
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
            text: '리스크 점수',
          },
          beginAtZero: false,
          min: yScale.min,
          max: yScale.max,
        },
      },
    }
  }

  const firstScenario = data.scenarios1 || data.scenarios2 || data.scenarios3 || data.scenarios4
  if (!firstScenario) {
    return {
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
            text: '리스크 점수',
          },
          beginAtZero: false,
          min: yScale.min,
          max: yScale.max,
        },
      },
    }
  }

  const dataKeys = Object.keys(firstScenario).sort()
  const period = selectedPeriod.value
  const isShortTerm = period === '단기'

  // 실제 데이터 키 (단기일 때는 중간 인덱스 1이 실제 데이터)
  const getActualKey = (index: number): string | null => {
    if (isShortTerm) {
      return index === 1 ? dataKeys[0] || null : null
    }
    return dataKeys[index] || null
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label || ''
            const dataIndex = context.dataIndex
            const actualKey = getActualKey(dataIndex)

            if (!actualKey) return `${datasetLabel}: ${context.parsed.y}`

            // rawDataMap에서 해당 시나리오의 원본 데이터 가져오기
            const scenarioData = rawDataMap.value[datasetLabel]
            if (!scenarioData) return `${datasetLabel}: ${context.parsed.y}`

            const rawValue = scenarioData[actualKey]

            // 객체 형태인지 확인
            if (typeof rawValue === 'object' && rawValue !== null && 'total' in rawValue) {
              const lines = [`${datasetLabel}:`, `  total: ${rawValue.total}`]
              if ('h' in rawValue && rawValue.h !== undefined) {
                lines.push(`  h: ${rawValue.h}`)
              }
              if ('e' in rawValue && rawValue.e !== undefined) {
                lines.push(`  e: ${rawValue.e}`)
              }
              if ('v' in rawValue && rawValue.v !== undefined) {
                lines.push(`  v: ${rawValue.v}`)
              }
              return lines
            }

            // 숫자인 경우
            return `${datasetLabel}: ${rawValue}`
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '리스크 점수',
        },
        beginAtZero: false,
        min: yScale.min,
        max: yScale.max,
      },
    },
  }
})

// 대응 방안
const strategy = computed(() => {
  return sspData.value?.Strategy || '대응 방안 정보가 없습니다.'
})
</script>

<template>
  <div class="mt-6">
    <!-- SSP 그래프 섹션 -->
    <div class="bg-white border border-gray-200 shadow-sm mb-6">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
        <h3 class="text-sm text-gray-900">SSP 시나리오별 리스크 전망</h3>

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
          <span class="ml-3 text-gray-600">SSP 시나리오 데이터를 불러오는 중...</span>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="flex items-center justify-center h-full text-red-500">
          {{ error }}
        </div>

        <!-- 데이터가 있을 때 -->
        <Line v-else-if="sspData" :data="chartData" :options="chartOptions" />

        <!-- 데이터가 없을 때 -->
        <div v-else class="flex items-center justify-center h-full text-gray-500">
          SSP 시나리오 데이터가 없습니다.
        </div>
      </div>

      <!-- 범례 안내 텍스트 -->
      <div class="px-4 py-3 text-xs text-gray-500 border-t border-gray-100">
        * 범례의 항목을 누르면 해당 시나리오 그래프 선을 비활성화할 수 있습니다.
      </div>
    </div>

    <!-- 대응 방안 섹션 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">대응 방안</h3>
      </div>
      <div class="p-6">
        <div class="border-l-4 border-[#EA002C] bg-red-50 p-5">
          <div class="flex items-start gap-3">
            <div class="text-sm text-gray-900">
              <span class="text-[#EA002C]">▶</span>
              {{ strategy }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
