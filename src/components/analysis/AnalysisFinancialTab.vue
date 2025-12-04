<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useAnalysis } from '@/composables/useAnalysis'
import { Loader2, AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  siteId: string
}>()

const { financialImpact, loading, error, fetchFinancialImpact } = useAnalysis(props.siteId)

// 데이터 로드
onMounted(async () => {
  await fetchFinancialImpact()
})

// siteId 변경 시 데이터 재로드
watch(
  () => props.siteId,
  async () => {
    await fetchFinancialImpact()
  }
)

const impacts = computed(() => financialImpact.value?.impacts || [])

const totalAAL = computed(() => {
  if (impacts.value.length === 0) return 0
  return impacts.value.reduce((sum, impact) => sum + impact.annualizedLoss, 0)
})

const getLevelColor = (annualizedLoss: number) => {
  if (annualizedLoss >= 10000) return 'text-[#EA002C]'
  if (annualizedLoss >= 5000) return 'text-[#F47725]'
  if (annualizedLoss >= 1000) return 'text-[#FBBC05]'
  return 'text-[#B3CF0A]'
}
</script>

<template>
  <div class="mt-6">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="animate-spin text-[#EA002C]" :size="40" />
      <span class="ml-3 text-gray-600">재무 영향 데이터를 불러오는 중...</span>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
      <AlertTriangle class="text-red-600 mb-4" :size="48" />
      <p class="text-gray-900 font-medium mb-2">데이터를 불러오는데 실패했습니다</p>
      <p class="text-sm text-gray-600">{{ error.message }}</p>
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="!financialImpact || impacts.length === 0"
      class="flex flex-col items-center justify-center py-20"
    >
      <AlertTriangle class="text-gray-400 mb-4" :size="48" />
      <p class="text-gray-900 font-medium mb-2">재무 영향 분석 결과가 없습니다</p>
      <p class="text-sm text-gray-600">해당 사업장에 대한 재무 영향 분석을 먼저 실행해주세요.</p>
    </div>

    <!-- 데이터가 있을 때 -->
    <div v-else>
      <!-- 총 AAL 요약 -->
      <div class="bg-white border border-gray-200 shadow-sm mb-6">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">총 연간 예상 손실 (AAL)</h3>
        </div>
        <div class="p-8 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            모든 위험 요인을 고려한 연간 예상 손실액입니다
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl text-[#EA002C]">{{ totalAAL.toLocaleString() }}</span>
            <span class="text-2xl text-gray-400">만원</span>
          </div>
        </div>
      </div>

      <!-- 위험 요인별 재무 영향 -->
      <div class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">위험 요인별 재무 영향</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="(impact, index) in impacts"
              :key="index"
              class="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="text-sm text-gray-900 w-32">{{ impact.hazardType }}</div>
                  <div class="text-sm text-gray-600">{{ impact.description }}</div>
                </div>
                <div :class="`text-lg font-medium ${getLevelColor(impact.annualizedLoss)}`">
                  {{ impact.annualizedLoss.toLocaleString() }} 만원
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-gray-100 h-2 overflow-hidden">
                  <div
                    class="h-full bg-[#EA002C] transition-all duration-500"
                    :style="{ width: `${Math.min((impact.annualizedLoss / totalAAL) * 100, 100)}%` }"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 w-12 text-right">
                  {{ Math.round((impact.annualizedLoss / totalAAL) * 100) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
