<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useAnalysis } from '@/composables/useAnalysis'
import { Loader2, AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  siteId: string
}>()

const { pastEvents, loading, error, fetchPastEvents } = useAnalysis(props.siteId)

// 데이터 로드
onMounted(async () => {
  await fetchPastEvents()
})

// siteId 변경 시 데이터 재로드
watch(
  () => props.siteId,
  async () => {
    await fetchPastEvents()
  }
)

const disasters = computed(() => pastEvents.value?.events || [])

const severeDisasters = computed(() =>
  disasters.value.filter((d) => d.severity === 'CRITICAL' || d.severity === 'HIGH').length
)

const avgImpact = computed(() => {
  if (disasters.value.length === 0) return 0
  const total = disasters.value.reduce((sum, d) => sum + (d.damage || 0), 0)
  return Math.round(total / disasters.value.length)
})

const getStatusColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-[#EA002C] text-white'
    case 'HIGH':
      return 'bg-[#F47725] text-white'
    case 'MODERATE':
      return 'bg-[#FBBC05] text-white'
    case 'LOW':
      return 'bg-[#B3CF0A] text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return '심각'
    case 'HIGH':
      return '높음'
    case 'MODERATE':
      return '보통'
    case 'LOW':
      return '낮음'
    default:
      return severity
  }
}
</script>

<template>
  <div class="mt-6">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="animate-spin text-[#EA002C]" :size="40" />
      <span class="ml-3 text-gray-600">과거 재난 데이터를 불러오는 중...</span>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
      <AlertTriangle class="text-red-600 mb-4" :size="48" />
      <p class="text-gray-900 font-medium mb-2">데이터를 불러오는데 실패했습니다</p>
      <p class="text-sm text-gray-600">{{ error.message }}</p>
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="!pastEvents || disasters.length === 0"
      class="flex flex-col items-center justify-center py-20"
    >
      <AlertTriangle class="text-gray-400 mb-4" :size="48" />
      <p class="text-gray-900 font-medium mb-2">과거 재난 이력이 없습니다</p>
      <p class="text-sm text-gray-600">해당 사업장에 대한 재난 이력 데이터가 없습니다.</p>
    </div>

    <!-- 데이터가 있을 때 -->
    <div v-else>
      <!-- 요약 통계 -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white border border-gray-200 shadow-sm p-5">
          <div class="text-xs text-gray-500 mb-2">총 재난 건수</div>
          <div class="flex items-end gap-2">
            <div class="text-2xl text-gray-900">{{ disasters.length }}</div>
            <div class="text-sm text-gray-500 mb-0.5">건</div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 shadow-sm p-5">
          <div class="text-xs text-gray-500 mb-2">고위험 재난</div>
          <div class="flex items-end gap-2">
            <div class="text-2xl text-[#EA002C]">{{ severeDisasters }}</div>
            <div class="text-sm text-gray-500 mb-0.5">건</div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 shadow-sm p-5">
          <div class="text-xs text-gray-500 mb-2">평균 경제적 영향</div>
          <div class="flex items-end gap-2">
            <div class="text-2xl text-gray-900">{{ avgImpact.toLocaleString() }}</div>
            <div class="text-sm text-gray-500 mb-0.5">만원</div>
          </div>
        </div>
      </div>

      <!-- 재난 카드 리스트 -->
      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="disaster in disasters"
          :key="disaster.eventId"
          class="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="px-6 py-4 flex items-center justify-between">
            <!-- 왼쪽: 날짜와 재난 종류 -->
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-3">
                <span class="text-lg text-gray-900">{{ disaster.date }}</span>
                <span class="text-gray-400">|</span>
                <span class="text-lg text-gray-900">{{ disaster.eventName }}</span>
              </div>
            </div>

            <!-- 중간: 설명 -->
            <div class="flex-1 px-6">
              <p class="text-sm text-gray-600">{{ disaster.description }}</p>
            </div>

            <!-- 오른쪽: 상태 배지 -->
            <div>
              <span :class="`inline-block px-5 py-2 text-sm ${getStatusColor(disaster.severity)}`">
                {{ getSeverityLabel(disaster.severity) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
