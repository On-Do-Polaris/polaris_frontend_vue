<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type TooltipItem
} from 'chart.js'
import { useAnalysis } from '@/composables/useAnalysis'
import { Loader2, AlertTriangle } from 'lucide-vue-next'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  siteId: string
}>()

const { riskScores, loading, error, fetchPhysicalRiskScores } = useAnalysis(props.siteId)

// 데이터 로드
onMounted(async () => {
  await fetchPhysicalRiskScores()
})

// siteId 변경 시 데이터 재로드
watch(
  () => props.siteId,
  async () => {
    await fetchPhysicalRiskScores()
  }
)

// API 데이터를 차트용 형식으로 변환
const physicalRisks = computed(() => {
  if (!riskScores.value?.scores) return []
  return riskScores.value.scores.map((score) => ({
    id: score.hazardType,
    name: score.hazardName,
    nameEn: score.hazardType,
    score: score.score,
    level: score.level,
    description: score.description
  }))
})

const topRisk = computed(() => {
  if (physicalRisks.value.length === 0) {
    return { id: '', name: '', nameEn: '', score: 0, level: 'LOW' as const, description: '' }
  }
  return physicalRisks.value.reduce(
    (max, risk) => (risk.score > max.score ? risk : max),
    physicalRisks.value[0]!
  )
})

const getBarColor = (level: string) => {
  switch (level) {
    case 'CRITICAL':
      return '#EA002C'
    case 'HIGH':
      return '#F47725'
    case 'MODERATE':
      return '#FBBC05'
    case 'LOW':
      return '#B3CF0A'
    default:
      return '#9CA3AF'
  }
}

const chartData = computed(() => ({
  labels: physicalRisks.value.map((d) => d.name),
  datasets: [
    {
      label: '점수',
      data: physicalRisks.value.map((d) => d.score),
      backgroundColor: physicalRisks.value.map((d) => getBarColor(d.level)),
      borderRadius: 4
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        title: (tooltipItems: TooltipItem<'bar'>[]) => {
          const index = tooltipItems[0]?.dataIndex
          if (index === undefined) return ''
          return physicalRisks.value[index]?.name || ''
        },
        label: (tooltipItem: TooltipItem<'bar'>) => {
          const index = tooltipItem?.dataIndex
          if (index === undefined) return ''
          const data = physicalRisks.value[index]
          if (!data) return ''
          return `점수: ${data.score} (${data.level})`
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 12
        }
      }
    },
    y: {
      ticks: {
        font: {
          size: 12
        }
      },
      title: {
        display: true,
        text: '점수',
        font: {
          size: 12
        }
      }
    }
  }
}))
</script>

<template>
  <div>
    <!-- 로딩 상태 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="animate-spin text-[#EA002C]" :size="40" />
      <span class="ml-3 text-gray-600">분석 데이터를 불러오는 중...</span>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
      <AlertTriangle class="text-red-600 mb-4" :size="48" />
      <p class="text-gray-900 font-medium mb-2">데이터를 불러오는데 실패했습니다</p>
      <p class="text-sm text-gray-600">{{ error.message }}</p>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="!riskScores || physicalRisks.length === 0" class="flex flex-col items-center justify-center py-20">
      <AlertTriangle class="text-gray-400 mb-4" :size="48" />
      <p class="text-gray-900 font-medium mb-2">분석 결과가 없습니다</p>
      <p class="text-sm text-gray-600">해당 사업장에 대한 리스크 분석을 먼저 실행해주세요.</p>
    </div>

    <!-- 데이터가 있을 때 -->
    <div v-else>
      <!-- 주요 물리적 리스크 박스 -->
      <div class="bg-white border border-gray-200 shadow-sm mb-6 mt-6">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">주요 물리적 리스크</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="border border-gray-200 p-6">
              <div class="text-xs text-gray-500 mb-2">종류</div>
              <div class="text-2xl text-gray-900">{{ topRisk.name }}</div>
            </div>

            <div class="border border-gray-200 p-6">
              <div class="text-xs text-gray-500 mb-2">점수</div>
              <div class="flex items-end gap-2">
                <div class="text-2xl text-[#EA002C]">{{ topRisk.score }}</div>
                <div class="text-sm text-gray-500 mb-0.5">점</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 그래프 섹션 -->
      <div class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
          <h3 class="text-sm text-gray-900">물리적 리스크 평가</h3>
        </div>
        <div class="p-6 h-[400px]">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>
