<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVWorld } from '@/composables/useVWorld'
import { fromLonLat, transformExtent } from 'ol/proj'

interface Location {
  location: string
  latitude: number
  longitude: number
  overallRiskScore?: number
  riskLevel?: string
}

interface SimulationMapProps {
  currentSite: Location | null
  candidates: Location[]
  bestCandidate?: Location | null
}

const props = defineProps<SimulationMapProps>()

// 지도 중심 (EPSG:4326 -> EPSG:3857 변환)
const center = computed(() => {
  if (props.currentSite) {
    return fromLonLat([props.currentSite.longitude, props.currentSite.latitude])
  }
  return fromLonLat([127.0, 37.5])
})
const zoom = ref(8)

// VWorld 제공 범위 제한 (대한민국 영역)
// 경도 최소/최대, 위도 최소/최대
const vworldExtent = transformExtent([124, 33, 132, 43], 'EPSG:4326', 'EPSG:3857')

// VWorld WMTS 타일 URL - 커스텀 함수로 {y}/{x} 순서 처리
const { getWMTSUrl: getBaseWMTSUrl } = useVWorld()
const vworldTileUrl = (tileCoord: number[]) => {
  const z = tileCoord[0]
  const x = tileCoord[1]
  const y = tileCoord[2]
  // VWorld는 {y}/{x} 순서 사용
  const baseUrl = getBaseWMTSUrl('Base').replace('{z}', String(z)).replace('{x}', String(y)).replace('{y}', String(x))
  return baseUrl
}

// 모든 마커
const allLocations = computed(() => {
  const locations: Array<{ location: Location; type: 'current' | 'candidate' | 'best' }> = []

  if (props.currentSite) {
    locations.push({ location: props.currentSite, type: 'current' })
  }

  props.candidates.forEach((candidate) => {
    const isBest = props.bestCandidate && candidate.location === props.bestCandidate.location
    locations.push({
      location: candidate,
      type: isBest ? 'best' : 'candidate'
    })
  })

  return locations
})

// 마커 색상
const getMarkerColor = (type: 'current' | 'candidate' | 'best') => {
  switch (type) {
    case 'current':
      return '#6b7280' // gray-500
    case 'best':
      return '#10b981' // green-500
    case 'candidate':
      return '#f59e0b' // yellow-500
    default:
      return '#6b7280'
  }
}
</script>

<template>
  <div class="w-full h-full">
    <ol-map
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      style="height: 100%"
    >
      <!-- 지도 뷰 설정 -->
      <ol-view
        ref="view"
        :center="center"
        :rotation="0"
        :zoom="zoom"
        :min-zoom="6"
        :max-zoom="19"
        :extent="vworldExtent"
        :projection="'EPSG:3857'"
      />

      <!-- 배경 지도 (VWorld Base Map) -->
      <ol-tile-layer>
        <ol-source-xyz :tileUrlFunction="vworldTileUrl" :crossOrigin="'anonymous'" />
      </ol-tile-layer>

      <!-- 마커 레이어 -->
      <ol-vector-layer>
        <ol-source-vector>
          <ol-feature
            v-for="(item, index) in allLocations"
            :key="`${item.type}-${index}`"
          >
            <ol-geom-point
              :coordinates="fromLonLat([item.location.longitude, item.location.latitude])"
            ></ol-geom-point>
            <ol-style>
              <ol-style-circle :radius="item.type === 'best' ? 14 : 10">
                <ol-style-fill :color="getMarkerColor(item.type)"></ol-style-fill>
                <ol-style-stroke
                  :color="item.type === 'best' ? '#065f46' : 'white'"
                  :width="item.type === 'best' ? 3 : 2"
                ></ol-style-stroke>
              </ol-style-circle>
            </ol-style>
          </ol-feature>
        </ol-source-vector>
      </ol-vector-layer>

      <!-- 줌 컨트롤 -->
      <ol-zoom-control />

      <!-- 전체 화면 컨트롤 -->
      <ol-fullscreen-control />
    </ol-map>

    <!-- 범례 -->
    <div
      class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-300 p-3 shadow-lg z-10"
    >
      <div class="text-xs text-gray-900 mb-2 font-medium">범례</div>
      <div class="space-y-2">
        <div v-if="currentSite" class="flex items-center gap-2">
          <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span class="text-xs text-gray-700">현재 사업장</span>
        </div>
        <div v-if="bestCandidate" class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span class="text-xs text-gray-700">최적 후보지</span>
        </div>
        <div v-if="candidates.length > 0" class="flex items-center gap-2">
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span class="text-xs text-gray-700">후보지</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.ol-zoom) {
  top: 0.5rem;
  right: 0.5rem;
  left: auto;
}

:deep(.ol-zoom button) {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #d1d5db;
  color: #374151;
  width: 2rem;
  height: 2rem;
  font-size: 1.125rem;
}

:deep(.ol-zoom button):hover {
  background-color: #f9fafb;
}

:deep(.ol-full-screen) {
  top: 5.5rem;
  right: 0.5rem;
  left: auto;
}

:deep(.ol-full-screen button) {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #d1d5db;
  color: #374151;
}
</style>
