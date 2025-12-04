<script setup lang="ts">
import { ref } from 'vue'
import { Play, Loader2 } from 'lucide-vue-next'
import { useSimulation } from '@/composables/useSimulation'
import { toast } from 'vue-sonner'
import type { Site } from '@/api/types'

interface Props {
  selectedSiteId: string
  sites: Site[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedSiteId': [value: string]
}>()

const { runClimateSimulation, climateResult, loading } = useSimulation()

const sspScenario = ref<'SSP1-2.6' | 'SSP2-4.5' | 'SSP5-8.5'>('SSP5-8.5')
const selectedYear = ref(2050)
const selectedHazardTypes = ref<string[]>([])
const isRunning = ref(false)

// 연도 옵션 (2025-2100, 5년 단위)
const years = Array.from({ length: 16 }, (_, i) => 2025 + i * 5)

// 위험 유형 옵션
const hazardTypeOptions = [
  { value: 'FLOOD', label: '홍수' },
  { value: 'TYPHOON', label: '태풍' },
  { value: 'HEATWAVE', label: '폭염' },
  { value: 'COLD_WAVE', label: '한파' },
  { value: 'EARTHQUAKE', label: '지진' },
  { value: 'LANDSLIDE', label: '산사태' },
  { value: 'HEAVY_SNOW', label: '폭설' },
  { value: 'DROUGHT', label: '가뭄' },
  { value: 'SEA_LEVEL_RISE', label: '해수면상승' }
]

// 시뮬레이션 실행
const handleRunSimulation = async () => {
  if (!props.selectedSiteId) {
    toast.error('사업장을 선택해주세요')
    return
  }

  isRunning.value = true

  try {
    await runClimateSimulation({
      siteId: props.selectedSiteId,
      scenario: sspScenario.value,
      targetYear: selectedYear.value,
      hazardTypes: selectedHazardTypes.value.length > 0 ? selectedHazardTypes.value : undefined
    })

    toast.success('기후 시뮬레이션이 완료되었습니다')
  } catch (error) {
    console.error('기후 시뮬레이션 실패:', error)
    toast.error('기후 시뮬레이션에 실패했습니다')
  } finally {
    isRunning.value = false
  }
}

// 변화량 색상 계산
const getTemperatureColor = (change: number) => {
  if (change < 1) return '#B3CF0A'
  if (change < 2) return '#F4C430'
  if (change < 3) return '#F47725'
  return '#EA002C'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Control Panel -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">시뮬레이션 설정</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-4 gap-4">
          <!-- 사업장 선택 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">사업장</label>
            <select
              :value="selectedSiteId"
              @change="emit('update:selectedSiteId', ($event.target as HTMLSelectElement).value)"
              class="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            >
              <option value="">사업장 선택</option>
              <option v-for="site in sites" :key="site.siteId" :value="site.siteId">
                {{ site.siteName }}
              </option>
            </select>
          </div>

          <!-- SSP 시나리오 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">SSP 시나리오</label>
            <select
              v-model="sspScenario"
              class="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            >
              <option value="SSP1-2.6">SSP1-2.6 (저탄소)</option>
              <option value="SSP2-4.5">SSP2-4.5 (중간)</option>
              <option value="SSP5-8.5">SSP5-8.5 (고탄소)</option>
            </select>
          </div>

          <!-- 목표 연도 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">목표 연도</label>
            <select
              v-model="selectedYear"
              class="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            >
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}년
              </option>
            </select>
          </div>

          <!-- 시뮬레이션 실행 버튼 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">&nbsp;</label>
            <button
              @click="handleRunSimulation"
              :disabled="loading || isRunning || !selectedSiteId"
              class="w-full px-4 py-2 text-sm bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="loading || isRunning" :size="16" class="animate-spin" />
              <Play v-else :size="16" />
              <span>{{ loading || isRunning ? '실행 중...' : '시뮬레이션 실행' }}</span>
            </button>
          </div>
        </div>

        <!-- 위험 유형 선택 (선택사항) -->
        <div class="mt-4">
          <label class="block text-xs text-gray-600 mb-2">위험 유형 (선택사항)</label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="hazard in hazardTypeOptions"
              :key="hazard.value"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="hazard.value"
                v-model="selectedHazardTypes"
                class="rounded border-gray-300 text-[#EA002C] focus:ring-[#EA002C]"
              />
              <span class="text-sm text-gray-700">{{ hazard.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 결과 표시 -->
    <div v-if="climateResult" class="space-y-6">
      <!-- 요약 정보 -->
      <div class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">시뮬레이션 결과 요약</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="border border-gray-200 p-4">
              <div class="text-xs text-gray-600 mb-1">사업장</div>
              <div class="text-lg text-gray-900">{{ climateResult.siteName }}</div>
            </div>
            <div class="border border-gray-200 p-4">
              <div class="text-xs text-gray-600 mb-1">시나리오</div>
              <div class="text-lg text-gray-900">{{ climateResult.scenario }}</div>
            </div>
            <div class="border border-gray-200 p-4">
              <div class="text-xs text-gray-600 mb-1">목표 연도</div>
              <div class="text-lg text-gray-900">{{ climateResult.targetYear }}년</div>
            </div>
          </div>

          <div v-if="climateResult.summary" class="bg-gray-50 border border-gray-200 p-4">
            <div class="text-xs text-gray-600 mb-2">요약</div>
            <div class="text-sm text-gray-900 whitespace-pre-line">{{ climateResult.summary }}</div>
          </div>
        </div>
      </div>

      <!-- 예측 변화 -->
      <div v-if="climateResult.projections && climateResult.projections.length > 0" class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">예측 변화</h3>
        </div>
        <div class="p-6">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left text-xs text-gray-600 pb-3">위험 유형</th>
                <th class="text-left text-xs text-gray-600 pb-3">현재 점수</th>
                <th class="text-left text-xs text-gray-600 pb-3">예측 점수</th>
                <th class="text-left text-xs text-gray-600 pb-3">변화량</th>
                <th class="text-left text-xs text-gray-600 pb-3">변화율</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(projection, index) in climateResult.projections"
                :key="index"
                class="border-b border-gray-100"
              >
                <td class="py-3 text-sm text-gray-900">{{ projection.hazardType }}</td>
                <td class="py-3 text-sm text-gray-900">{{ projection.currentScore.toFixed(1) }}</td>
                <td class="py-3 text-sm text-gray-900">{{ projection.projectedScore.toFixed(1) }}</td>
                <td class="py-3 text-sm" :style="{ color: getTemperatureColor(projection.change) }">
                  {{ projection.change >= 0 ? '+' : '' }}{{ projection.change.toFixed(1) }}
                </td>
                <td class="py-3 text-sm" :style="{ color: getTemperatureColor(projection.change) }">
                  {{ projection.changePercent >= 0 ? '+' : '' }}{{ projection.changePercent.toFixed(1) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 권장사항 -->
      <div v-if="climateResult.recommendations && climateResult.recommendations.length > 0" class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">권장사항</h3>
        </div>
        <div class="p-6">
          <ul class="space-y-2">
            <li
              v-for="(recommendation, index) in climateResult.recommendations"
              :key="index"
              class="flex items-start gap-2 text-sm text-gray-900"
            >
              <span class="text-[#EA002C] mt-1">•</span>
              <span>{{ recommendation }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="bg-white border border-gray-200 shadow-sm p-12 text-center">
      <div class="text-gray-400 mb-2">
        <Play :size="48" class="mx-auto" />
      </div>
      <div class="text-sm text-gray-600">시뮬레이션을 실행하여 결과를 확인하세요</div>
    </div>
  </div>
</template>
