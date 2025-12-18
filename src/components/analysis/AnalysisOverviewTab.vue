<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type TooltipItem,
} from 'chart.js'
import { analysisAPI } from '@/api/analysis'
import { useMeta } from '@/composables/useMeta'
import { Loader2, AlertTriangle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { AnalysisSummaryResponse } from '@/api/types'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  siteId: string
}>()

const { hazardTypes, fetchHazardTypes } = useMeta()

const summary = ref<AnalysisSummaryResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedScoreType = ref<'physical-risk' | 'aal'>('physical-risk')

// 데이터 로드
const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    // 재해 유형 목록과 분석 요약 병렬로 가져오기
    await fetchHazardTypes()
    summary.value = await analysisAPI.getAnalysisSummary(props.siteId)
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || '데이터를 불러오는데 실패했습니다.'
    error.value = errorMsg
    toast.error(errorMsg)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

// siteId 변경 시 데이터 재로드
watch(
  () => props.siteId,
  async () => {
    await loadData()
  },
)

// API 데이터를 차트용 형식으로 변환
const physicalRisks = computed(() => {
  if (!summary.value) return []

  // 선택된 타입에 따라 다른 스코어 사용
  const scores =
    selectedScoreType.value === 'physical-risk'
      ? summary.value['physical-risk-scores']
      : summary.value['aal-scores']

  if (!scores) return []

  // hazardTypes 순서대로 정렬하여 차트 데이터 생성
  return hazardTypes.value
    .map((hazard) => {
      const scoreData = scores[hazard.code]
      // undefined나 null일 때만 제외 (0은 유효한 값)
      if (scoreData === undefined || scoreData === null) return null

      // scoreData가 객체 형태 { total, h, e, v } 인 경우
      let totalScore = 0
      let h: number | undefined
      let e: number | undefined
      let v: number | undefined

      if (typeof scoreData === 'object' && scoreData !== null && 'total' in scoreData) {
        totalScore = (scoreData as { total: number; h?: number; e?: number; v?: number }).total
        h = (scoreData as { total: number; h?: number; e?: number; v?: number }).h
        e = (scoreData as { total: number; h?: number; e?: number; v?: number }).e
        v = (scoreData as { total: number; h?: number; e?: number; v?: number }).v
      } else if (typeof scoreData === 'number') {
        totalScore = scoreData
      }

      let level = 'LOW'
      if (totalScore >= 70) level = 'CRITICAL'
      else if (totalScore >= 50) level = 'HIGH'
      else if (totalScore >= 30) level = 'MODERATE'

      return {
        code: hazard.code,
        name: hazard.name,
        score: totalScore,
        h,
        e,
        v,
        level,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
})

const mainRisk = computed(() => {
  if (!summary.value) {
    return { name: '-', score: 0, aal: 0 }
  }
  return {
    name: summary.value.mainClimateRisk,
    score: summary.value.mainClimateRiskScore,
    aal: summary.value.mainClimateRiskAAL,
  }
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
      borderRadius: 4,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
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

          const labels = [`total: ${data.score}`]

          if (data.h !== undefined) {
            labels.push(`h: ${data.h}`)
          }
          if (data.e !== undefined) {
            labels.push(`e: ${data.e}`)
          }
          if (data.v !== undefined) {
            labels.push(`v: ${data.v}`)
          }

          return labels
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 12,
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 12,
        },
      },
      title: {
        display: true,
        text: selectedScoreType.value === 'physical-risk' ? '점수' : 'AAL',
        font: {
          size: 12,
        },
      },
      min: 0,
      max: 100,
    },
  },
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
      <p class="text-sm text-gray-600">{{ error }}</p>
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="!summary || physicalRisks.length === 0"
      class="flex flex-col items-center justify-center py-20"
    >
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
          <div class="grid grid-cols-3 gap-4">
            <div class="border border-gray-200 p-6">
              <div class="text-xs text-gray-500 mb-2">종류</div>
              <div class="text-2xl text-gray-900">{{ mainRisk.name }}</div>
            </div>

            <div class="border border-gray-200 p-6">
              <div class="text-xs text-gray-500 mb-2">물리적 리스크 점수</div>
              <div class="flex items-end gap-2">
                <div class="text-2xl text-[#EA002C]">{{ mainRisk.score }}</div>
                <div class="text-sm text-gray-500 mb-0.5">점</div>
              </div>
            </div>

            <div class="border border-gray-200 p-6">
              <div class="text-xs text-gray-500 mb-2">연평균 자산 손실률(AAL)</div>
              <div class="flex items-end gap-2">
                <div class="text-2xl text-[#EA002C]">{{ mainRisk.aal }}</div>
                <div class="text-sm text-gray-500 mb-0.5">%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 그래프 섹션 -->
      <div class="bg-white border border-gray-200 shadow-sm">
        <div
          class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between"
        >
          <h3 class="text-sm text-gray-900">
            물리적 리스크별 그래프 (SSP2-4.5&2040년도 기준 점수)
          </h3>
          <div class="flex gap-2">
            <button
              @click="selectedScoreType = 'physical-risk'"
              :class="[
                'w-28 px-4 py-1.5 text-xs transition-colors',
                selectedScoreType === 'physical-risk'
                  ? 'bg-[#EA002C] text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300',
              ]"
            >
              물리적 리스크
            </button>
            <button
              @click="selectedScoreType = 'aal'"
              :class="[
                'w-28 px-4 py-1.5 text-xs transition-colors',
                selectedScoreType === 'aal'
                  ? 'bg-[#EA002C] text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300',
              ]"
            >
              AAL
            </button>
          </div>
        </div>
        <div class="p-6 h-[400px]">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>
