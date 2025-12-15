<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { AlertCircle, Wind, Droplets, Flame } from 'lucide-vue-next'
import { useAnalysis } from '@/composables/useAnalysis'

interface Props {
  siteId: string
}

const props = defineProps<Props>()
const { pastEvents, fetchPastEvents } = useAnalysis(props.siteId)

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

// 이벤트 타입에 따른 아이콘 매핑
const getEventIcon = (eventType: string) => {
  if (eventType.includes('태풍') || eventType.includes('TYPHOON')) return Wind
  if (eventType.includes('홍수') || eventType.includes('호우') || eventType.includes('FLOOD')) return Droplets
  if (eventType.includes('폭염') || eventType.includes('HEATWAVE') || eventType.includes('고온')) return Flame
  return Wind // 기본 아이콘
}

// Status를 한글로 변환 (API가 이미 한글로 줄 수도 있음)
const getStatusLabel = (status: string) => {
  return status
}

const getStatusColor = (status: string) => {
  switch (status) {
    case '심각':
      return 'bg-red-100 text-red-700 border-red-300'
    case '주의':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case '경미':
      return 'bg-green-100 text-green-700 border-green-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

// 재난 데이터 가공
const disasters = computed(() => {
  if (!pastEvents.value?.disasters) return []
  return pastEvents.value.disasters.map((event) => ({
    year: event.year,
    type: event.disasterType,
    name: event.disasterType,
    severity: event.overallStatus,
    icon: getEventIcon(event.disasterType),
    warningDays: event.warningDays,
    severeDays: event.severeDays
  }))
})

// 통계 계산
const totalEvents = computed(() => disasters.value.length)

const mainDisasterType = computed(() => {
  if (disasters.value.length === 0) return '-'
  // 가장 많이 발생한 재해 유형 찾기
  const typeCount: Record<string, number> = {}
  disasters.value.forEach((event) => {
    typeCount[event.type] = (typeCount[event.type] || 0) + 1
  })
  const keys = Object.keys(typeCount)
  if (keys.length === 0) return '-'
  return keys.reduce((a, b) => ((typeCount[a] || 0) > (typeCount[b] || 0) ? a : b))
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 text-gray-600 bg-blue-50 p-3 border border-blue-200">
      <AlertCircle :size="16" class="text-blue-600" />
      <span class="text-sm">행정안전부 재해연보 및 기상청 데이터 기반 자동 수집</span>
    </div>

    <div class="space-y-3">
      <div
        v-for="(disaster, index) in disasters"
        :key="index"
        class="flex items-center justify-between p-4 border border-gray-200 hover:bg-gray-50"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-100 flex items-center justify-center">
            <component :is="disaster.icon" :size="24" class="text-[#dc042b]" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-gray-900">{{ disaster.year }}년 {{ disaster.type }}</span>
              <span
                :class="`px-2 py-0.5 text-xs border ${getStatusColor(
                  disaster.severity
                )}`"
              >
                {{ getStatusLabel(disaster.severity) }}
              </span>
            </div>
            <div class="text-sm text-gray-500 mt-1">주의보: {{ disaster.warningDays }}일 / 경보: {{ disaster.severeDays }}일</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
      <div class="text-center">
        <div class="text-2xl text-gray-900">{{ totalEvents }}</div>
        <div class="text-xs text-gray-500 mt-1">총 재해 건수 (데이터 보유 기간)</div>
      </div>
      <div class="text-center">
        <div class="text-2xl text-gray-900">{{ mainDisasterType }}</div>
        <div class="text-xs text-gray-500 mt-1">주요 재해 유형</div>
      </div>
    </div>
  </div>
</template>