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
  if (eventType.includes('폭염') || eventType.includes('HEATWAVE')) return Flame
  return Wind // 기본 아이콘
}

// Severity를 한글로 변환
const getSeverityLabel = (severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL') => {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return '심각'
    case 'MODERATE':
      return '보통'
    case 'LOW':
      return '경미'
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return 'bg-red-100 text-red-700 border-red-300'
    case 'MODERATE':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'LOW':
      return 'bg-green-100 text-green-700 border-green-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

// 재난 데이터 가공
const disasters = computed(() => {
  if (!pastEvents.value?.events) return []
  return pastEvents.value.events.map((event) => ({
    year: new Date(event.date).getFullYear(),
    type: event.eventName,
    name: event.eventName,
    damage: `${event.damage.toLocaleString()}만원`,
    severity: event.severity,
    icon: getEventIcon(event.eventType)
  }))
})

// 통계 계산
const totalEvents = computed(() => pastEvents.value?.totalEvents || 0)
const totalDamage = computed(() => {
  if (!pastEvents.value?.events) return 0
  return pastEvents.value.events.reduce((sum, event) => sum + event.damage, 0)
})
const mainDisasterType = computed(() => {
  if (!pastEvents.value?.events || pastEvents.value.events.length === 0) return '-'
  // 가장 많이 발생한 재해 유형 찾기
  const typeCount: Record<string, number> = {}
  pastEvents.value.events.forEach((event) => {
    typeCount[event.eventName] = (typeCount[event.eventName] || 0) + 1
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
                :class="`px-2 py-0.5 text-xs border ${getSeverityColor(
                  disaster.severity
                )}`"
              >
                {{ getSeverityLabel(disaster.severity) }}
              </span>
            </div>
            <div class="text-sm text-gray-500 mt-1">{{ disaster.name }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-gray-900">피해액</div>
          <div class="text-sm text-[#dc042b]">{{ disaster.damage }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
      <div class="text-center">
        <div class="text-2xl text-gray-900">{{ totalEvents }}</div>
        <div class="text-xs text-gray-500 mt-1">총 재해 건수 (최근 10년)</div>
      </div>
      <div class="text-center">
        <div class="text-2xl text-[#dc042b]">{{ totalDamage.toLocaleString() }}만원</div>
        <div class="text-xs text-gray-500 mt-1">누적 피해액</div>
      </div>
      <div class="text-center">
        <div class="text-2xl text-gray-900">{{ mainDisasterType }}</div>
        <div class="text-xs text-gray-500 mt-1">주요 재해 유형</div>
      </div>
    </div>
  </div>
</template>