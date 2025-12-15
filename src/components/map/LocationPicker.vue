<script setup lang="ts">
import { ref, watch } from 'vue'
import { useVWorld } from '@/composables/useVWorld'
import { fromLonLat, transformExtent } from 'ol/proj'

interface LocationPickerProps {
  latitude?: number
  longitude?: number
}

interface LocationPickerEmits {
  (e: 'update:location', value: { latitude: number; longitude: number }): void
}

const props = defineProps<LocationPickerProps>()
const emit = defineEmits<LocationPickerEmits>()

// 초기 지도 중심 및 줌 레벨 (한국 중심) - EPSG:3857로 변환
const INITIAL_CENTER = fromLonLat([127.0, 37.5])
const INITIAL_ZOOM = 7

const center = ref(
  props.latitude && props.longitude
    ? fromLonLat([props.longitude, props.latitude])
    : INITIAL_CENTER
)
const zoom = ref(props.latitude && props.longitude ? 12 : INITIAL_ZOOM)

// VWorld 제공 범위 제한 (대한민국 영역)
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

// 선택된 위치 (EPSG:3857)
const selectedLocation = ref(
  props.latitude && props.longitude
    ? fromLonLat([props.longitude, props.latitude])
    : null
)

// props 변경 시 지도 업데이트
watch(
  () => [props.latitude, props.longitude],
  ([lat, lng]) => {
    console.log('[LocationPicker] props 변경 감지:', { lat, lng })
    if (lat && lng) {
      const coords = fromLonLat([lng, lat])
      console.log('[LocationPicker] 좌표 변환:', coords)
      selectedLocation.value = coords
      center.value = coords
      zoom.value = 12
      console.log('[LocationPicker] 지도 업데이트 완료')
    } else {
      console.log('[LocationPicker] 좌표가 없음, 지도 초기화')
      // 좌표가 undefined이면 마커 제거 및 지도 초기화
      selectedLocation.value = null
      center.value = INITIAL_CENTER
      zoom.value = INITIAL_ZOOM
    }
  }
)

// 지도 클릭 이벤트 - 비활성화 (주소 검색으로만 위치 설정)
// const handleMapClick = (event: any) => {
//   const coordinates = event.coordinate // EPSG:3857 좌표
//   selectedLocation.value = coordinates

//   // EPSG:3857 -> WGS84 (경도, 위도) 변환
//   const lonLat = toLonLat(coordinates)
//   const lng = lonLat[0] || 0
//   const lat = lonLat[1] || 0

//   emit('update:location', {
//     latitude: lat,
//     longitude: lng
//   })
// }
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

      <!-- 선택된 위치 마커 -->
      <ol-vector-layer v-if="selectedLocation">
        <ol-source-vector>
          <ol-feature>
            <ol-geom-point :coordinates="selectedLocation"></ol-geom-point>
            <ol-style>
              <ol-style-circle :radius="10">
                <ol-style-fill color="#EA002C"></ol-style-fill>
                <ol-style-stroke color="white" :width="2"></ol-style-stroke>
              </ol-style-circle>
            </ol-style>
          </ol-feature>
        </ol-source-vector>
      </ol-vector-layer>

      <!-- 줌 컨트롤 -->
      <ol-zoom-control />
    </ol-map>
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

:deep(.ol-viewport) {
  cursor: default !important;
}
</style>
