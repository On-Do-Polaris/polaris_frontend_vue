<script setup lang="ts">
import { ref, computed } from 'vue'
import { fromLonLat, transformExtent } from 'ol/proj'
import { useVWorld } from '@/composables/useVWorld'
import type { SiteInfo } from '@/store/sites'
import type { SiteSummary } from '@/api/types'

interface RiskHeatmapProps {
  sites: SiteInfo[] | SiteSummary[]
}

const props = defineProps<RiskHeatmapProps>()
const emit = defineEmits(['select-site'])

// 지도 중심 (한국 중심 - EPSG:3857 변환)
const center = ref(fromLonLat([127.0, 37.5]))
const zoom = ref(7)

// VWorld 제공 범위 제한 (대한민국 영역)
const vworldExtent = transformExtent([124, 33, 132, 43], 'EPSG:4326', 'EPSG:3857')

// VWorld WMTS 타일 URL
const { getWMTSUrl: getBaseWMTSUrl } = useVWorld()
const vworldTileUrl = (tileCoord: number[]) => {
  const z = tileCoord[0]
  const x = tileCoord[1]
  const y = tileCoord[2]
  // VWorld는 {y}/{x} 순서 사용
  const baseUrl = getBaseWMTSUrl('Base').replace('{z}', String(z)).replace('{x}', String(y)).replace('{y}', String(x))
  return baseUrl
}

// 좌표 가져오기 (백엔드에서 위경도가 없으면 임시 좌표 사용)
const getCoordinates = (site: SiteInfo | SiteSummary, index: number): [number, number] => {
  if (site.latitude && site.longitude) {
    return [site.longitude, site.latitude] // [경도, 위도]
  }
  // fallback: 임시로 한국 중심부 근처에 분산된 좌표 생성
  const baseLatitude = 36.5 + Math.sin(index * 0.7) * 2
  const baseLongitude = 127.5 + Math.cos(index * 0.7) * 2
  return [baseLongitude, baseLatitude]
}

// 리스크 레벨 결정 (totalRiskScore 기반)
const getRiskLevel = (site: SiteInfo | SiteSummary): 'high' | 'medium' | 'low' => {
  // SiteSummary 타입이면 totalRiskScore 사용
  const score = (site as SiteSummary).totalRiskScore
  if (score !== undefined) {
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }
  // fallback: siteType 기반 (이전 로직)
  const type = site.siteType.toUpperCase()
  if (type.includes('HIGH') || type.includes('CRITICAL')) return 'high'
  if (type.includes('MEDIUM') || type.includes('MODERATE')) return 'medium'
  return 'low'
}

// 리스크 색상
const getRiskColor = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high':
      return '#dc2626' // red-600 (빨간색)
    case 'medium':
      return '#eab308' // yellow-500 (노란색)
    case 'low':
      return '#16a34a' // green-600 (초록색)
    default:
      return '#6b7280' // gray-500
  }
}

// 좌표를 포함한 사이트 목록 (위경도가 있는 사이트만 표시)
const sitesWithCoordinates = computed(() =>
  props.sites
    .map((site, index) => {
      const coords = getCoordinates(site, index)
      return {
        ...site,
        coordinates: fromLonLat(coords),
        riskLevel: getRiskLevel(site),
        hasRealCoords: !!(site.latitude && site.longitude)
      }
    })
    .filter(site => site.coordinates) // 좌표가 있는 사이트만 필터링
)

// 마커 클릭 이벤트
const handleMarkerClick = (site: SiteInfo | SiteSummary) => {
  emit('select-site', site)
}
</script>

<template>
  <div class="w-full h-full">
    <ol-map
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      style="height: 100%"
    >
      <!-- 지도 뷰 설정 (EPSG:3857) -->
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

      <!-- 사업장 마커 레이어 -->
      <ol-vector-layer>
        <ol-source-vector>
          <ol-feature
            v-for="(site, index) in sitesWithCoordinates"
            :key="site.siteId || index"
            @click="handleMarkerClick(site)"
          >
            <ol-geom-point :coordinates="site.coordinates"></ol-geom-point>
            <ol-style>
              <ol-style-circle :radius="12">
                <ol-style-fill :color="getRiskColor(site.riskLevel)"></ol-style-fill>
                <ol-style-stroke
                  :color="'white'"
                  :width="2"
                ></ol-style-stroke>
              </ol-style-circle>
            </ol-style>
          </ol-feature>
        </ol-source-vector>
      </ol-vector-layer>

      <!-- 전체 화면 컨트롤 -->
      <ol-fullscreen-control />
    </ol-map>
  </div>
</template>

<style scoped>
/* OpenLayers 스타일 커스터마이징 */
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
  top: auto;
  bottom: 0.5rem;
  right: 0.5rem;
  left: auto;
}

:deep(.ol-full-screen button) {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #d1d5db;
  color: #374151;
  width: 2rem;
  height: 2rem;
  font-size: 1.125rem;
}

:deep(.ol-full-screen button):hover {
  background-color: #f9fafb;
}

:deep(.ol-attribution) {
  font-size: 0.625rem;
}

:deep(.ol-viewport) {
  cursor: default !important;
}
</style>
