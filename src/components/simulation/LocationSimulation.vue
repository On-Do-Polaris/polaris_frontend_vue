<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { SiteInfo } from '@/api/types'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Style, Circle, Fill, Stroke } from 'ol/style'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import 'ol/ol.css'
import { useMeta } from '@/composables/useMeta'
import { useDaumPostcode, type AddressResult } from '@/composables/useDaumPostcode'
import { useVWorld } from '@/composables/useVWorld'
import { toast } from 'vue-sonner'

// Chart.js 등록
ChartJS.register(Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler)

interface Props {
  selectedSiteId: string
  sites: SiteInfo[]
}

const props = defineProps<Props>()

const { hazardTypes, fetchHazardTypes } = useMeta()
const { openAddressPopup } = useDaumPostcode()
const { geocodeAddress, reverseGeocode } = useVWorld()

// 지도 ref
const mapContainer = ref<HTMLElement | null>(null)
let map: Map | null = null
let markerLayer: VectorLayer<VectorSource> | null = null

// 검색어 및 선택된 주소 정보
const searchQuery = ref('')
const selectedAddress = ref<{
  roadAddress: string
  jibunAddress: string
  latitude: number
  longitude: number
} | null>(null)
const isSearching = ref(false)
const isPopupOpen = ref(false)

// 선택된 후보지 인덱스 (0: candidate1, 1: candidate2, 2: candidate3)
const selectedCandidateIndex = ref(0)

// 추천 후보지 API 응답
const recommendationsData = ref<any>(null)
const recommendationsLoading = ref(false)

// 현재 사업장 분석 데이터
const currentSiteData = ref<any>(null)
const currentSiteLoading = ref(false)

// 검색한 새 장소의 시뮬레이션 결과
const searchedLocationData = ref<any>(null)

// 추천 후보지 목록 (ref로 변경 - 비동기 역지오코딩 처리)
const recommendedSites = ref<any[]>([])

// 추천 후보지 데이터 가공
const processRecommendations = async () => {
  if (!recommendationsData.value) {
    recommendedSites.value = []
    return
  }

  const site = recommendationsData.value.site
  if (!site) {
    recommendedSites.value = []
    return
  }

  const candidates = [site.candidate1, site.candidate2, site.candidate3]

  // 각 후보지에 대해 역지오코딩 수행
  const processedCandidates = await Promise.all(
    candidates.map(async (candidate: any, index: number) => {
      // riskscore에 따른 배지 설정
      let badge = '낮음'
      let badgeColor = 'bg-[#B3CF0A]'

      if (candidate.riskscore >= 70) {
        badge = '높음'
        badgeColor = 'bg-[#EA002C]'
      } else if (candidate.riskscore >= 40) {
        badge = '보통'
        badgeColor = 'bg-[#FBBC05]'
      }

      // 역지오코딩으로 도로명 주소 가져오기
      let roadAddress = '주소 로딩 중...'
      if (candidate.latitude && candidate.longitude) {
        const address = await reverseGeocode(candidate.latitude, candidate.longitude)
        if (address) {
          roadAddress = address
        } else {
          roadAddress = `위도: ${candidate.latitude}, 경도: ${candidate.longitude}`
        }
      }

      return {
        candidateId: candidate.candidateId,
        name: `후보지${index + 1}`, // 후보지1, 후보지2, 후보지3
        badge,
        badgeColor,
        location: roadAddress,
        riskScore: candidate.riskscore,
        aal: candidate.aalscore,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        physicalRiskScores: candidate['physical-risk-scores'],
        aalScores: candidate['aal-scores'],
        pros: candidate.pros,
        cons: candidate.cons,
      }
    }),
  )

  recommendedSites.value = processedCandidates
}

// 선택된 후보지 (검색 결과가 있으면 검색 결과 사용, -1이면 검색 결과)
const selectedCandidate = computed(() => {
  if (selectedCandidateIndex.value === -1 && searchedLocationData.value) {
    // 검색한 새 장소 데이터
    return searchedLocationData.value
  }
  return recommendedSites.value[selectedCandidateIndex.value] || null
})

// 추천 후보지 데이터 로드
const loadRecommendations = async () => {
  if (!props.selectedSiteId) {
    return
  }

  recommendationsLoading.value = true

  try {
    const { simulationAPI } = await import('@/api/simulation')
    const response = await simulationAPI.getLocationRecommendations(props.selectedSiteId)
    recommendationsData.value = response

    // 데이터 로드 후 역지오코딩 수행
    await processRecommendations()
  } catch (err: any) {
    console.error('Failed to load recommendations:', err)
    toast.error('추천 후보지를 불러오는데 실패했습니다')
  } finally {
    recommendationsLoading.value = false
  }
}

// 후보지 선택 핸들러
const handleSiteSelect = (index: number) => {
  selectedCandidateIndex.value = index
}

// 주소 검색 팝업 열기
const openSearchPopup = () => {
  // 이미 팝업이 열려있으면 중복 방지
  if (isPopupOpen.value) return

  isPopupOpen.value = true

  openAddressPopup(async (address: AddressResult) => {
    // 팝업 상태 즉시 초기화 (다시 팝업을 열 수 있도록)
    isPopupOpen.value = false

    // 선택된 주소를 searchQuery에 표시
    searchQuery.value = address.fullAddress

    console.log('[LocationSimulation] 지오코딩 시작:', address.roadAddress)
    // 주소로 좌표 가져오기
    const coords = await geocodeAddress(address.roadAddress)
    console.log('[LocationSimulation] 지오코딩 결과:', coords)

    if (coords) {
      selectedAddress.value = {
        roadAddress: address.roadAddress,
        jibunAddress: address.jibunAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
      console.log('[LocationSimulation] 좌표 저장 완료:', selectedAddress.value)
      toast.success('주소와 좌표가 설정되었습니다')
    } else {
      console.warn('[LocationSimulation] 좌표 변환 실패')
      toast.error('주소의 좌표를 가져오는데 실패했습니다')
      selectedAddress.value = null
    }
  })
}

// 검색 핸들러
const handleSearch = async () => {
  // 주소 선택 확인
  if (!selectedAddress.value) {
    toast.error('주소를 검색해주세요')
    return
  }

  if (!props.selectedSiteId) {
    toast.error('비교할 현재 사업장을 선택해주세요')
    return
  }

  isSearching.value = true

  try {
    const { simulationAPI } = await import('@/api/simulation')
    const response = await simulationAPI.compareRelocation({
      siteId: props.selectedSiteId,
      candidate: {
        latitude: selectedAddress.value.latitude,
        longitude: selectedAddress.value.longitude,
        jibunAddress: selectedAddress.value.jibunAddress,
        roadAddress: selectedAddress.value.roadAddress,
      },
    })

    // API 응답에서 candidate 데이터 추출
    const candidate = response.candidate

    console.log('[handleSearch] API Response:', response)
    console.log('[handleSearch] Candidate data:', candidate)
    console.log('[handleSearch] physical-risk-scores:', candidate['physical-risk-scores'])
    console.log('[handleSearch] aal-scores:', candidate['aal-scores'])

    // 배지 계산
    let badge = '낮음'
    let badgeColor = 'bg-[#B3CF0A]'
    if (candidate.riskscore >= 70) {
      badge = '높음'
      badgeColor = 'bg-[#EA002C]'
    } else if (candidate.riskscore >= 40) {
      badge = '보통'
      badgeColor = 'bg-[#FBBC05]'
    }

    // 검색한 장소 데이터 저장
    searchedLocationData.value = {
      candidateId: candidate.candidateId,
      name: '검색한 위치',
      badge,
      badgeColor,
      location: candidate.roadAddress,
      riskScore: candidate.riskscore,
      aal: candidate.aalscore,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      physicalRiskScores: candidate['physical-risk-scores'],
      aalScores: candidate['aal-scores'],
      pros: candidate.pros,
      cons: candidate.cons,
    }

    console.log('[handleSearch] Saved searchedLocationData:', searchedLocationData.value)

    // 검색 결과를 선택된 후보지로 설정
    selectedCandidateIndex.value = -1

    toast.success('시뮬레이션이 완료되었습니다')
  } catch (err: any) {
    console.error('Failed to run simulation:', err)
    toast.error('시뮬레이션에 실패했습니다')
  } finally {
    isSearching.value = false
  }
}

// 현재 사업장 분석 데이터 로드
const loadCurrentSiteData = async () => {
  if (!props.selectedSiteId) {
    return
  }

  currentSiteLoading.value = true

  try {
    const { analysisAPI } = await import('@/api/analysis')
    const response = await analysisAPI.getAnalysisSummary(props.selectedSiteId)
    currentSiteData.value = response
  } catch (err: any) {
    console.error('Failed to load current site data:', err)
    toast.error('현재 사업장 데이터를 불러오는데 실패했습니다')
  } finally {
    currentSiteLoading.value = false
  }
}

// 현재 사업장의 리스크 데이터 (추천 후보지와 비교하기 위해 필요)
const currentSiteRisks = computed(() => {
  if (!currentSiteData.value || hazardTypes.value.length === 0) {
    return []
  }

  const physicalRiskScores = currentSiteData.value['physical-risk-scores']
  if (!physicalRiskScores) {
    return []
  }

  // hazardTypes 순서대로 리스크 점수를 매핑
  return hazardTypes.value.map((hazard) => {
    return physicalRiskScores[hazard.code] || physicalRiskScores[hazard.name] || 0
  })
})

// 선택된 후보지의 리스크 데이터
const candidateRisks = computed(() => {
  if (!selectedCandidate.value || hazardTypes.value.length === 0) {
    return []
  }

  const physicalRiskScores = selectedCandidate.value.physicalRiskScores
  if (!physicalRiskScores) {
    return []
  }

  // hazardTypes 순서대로 리스크 점수를 매핑
  return hazardTypes.value.map((hazard) => {
    return physicalRiskScores[hazard.code] || physicalRiskScores[hazard.name] || 0
  })
})

// 현재 사업장의 AAL 데이터
const currentSiteAals = computed(() => {
  if (!currentSiteData.value || hazardTypes.value.length === 0) {
    return []
  }

  const aalScores = currentSiteData.value['aal-scores']
  if (!aalScores) {
    return []
  }

  // hazardTypes 순서대로 AAL 점수를 매핑
  return hazardTypes.value.map((hazard) => {
    return aalScores[hazard.code] || aalScores[hazard.name] || 0
  })
})

// 선택된 후보지의 AAL 데이터
const candidateAals = computed(() => {
  if (!selectedCandidate.value || hazardTypes.value.length === 0) {
    return []
  }

  const aalScores = selectedCandidate.value.aalScores
  if (!aalScores) {
    return []
  }

  // hazardTypes 순서대로 AAL 점수를 매핑
  return hazardTypes.value.map((hazard) => {
    return aalScores[hazard.code] || aalScores[hazard.name] || 0
  })
})

// 왼쪽 레이더 차트 - physical-risk-scores (리스크 프로파일)
const riskProfileChartData = computed(() => ({
  labels: hazardTypes.value.map((h) => h.name),
  datasets: [
    {
      label: '현재',
      data: currentSiteRisks.value,
      borderColor: '#EA002C',
      backgroundColor: 'rgba(234, 0, 44, 0.2)',
      pointBackgroundColor: '#EA002C',
    },
    {
      label: '후보지',
      data: candidateRisks.value,
      borderColor: '#B3CF0A',
      backgroundColor: 'rgba(179, 207, 10, 0.2)',
      pointBackgroundColor: '#B3CF0A',
    },
  ],
}))

// 오른쪽 레이더 차트 - aal-scores (연평균 자산 손실률(AAL) 프로파일)
const aalProfileChartData = computed(() => ({
  labels: hazardTypes.value.map((h) => h.name),
  datasets: [
    {
      label: '현재',
      data: currentSiteAals.value,
      borderColor: '#EA002C',
      backgroundColor: 'rgba(234, 0, 44, 0.2)',
      pointBackgroundColor: '#EA002C',
    },
    {
      label: '후보지',
      data: candidateAals.value,
      borderColor: '#B3CF0A',
      backgroundColor: 'rgba(179, 207, 10, 0.2)',
      pointBackgroundColor: '#B3CF0A',
    },
  ],
}))

// 리스크 데이터의 min-max 스케일링
const riskScaleRange = computed(() => {
  const allValues = [...currentSiteRisks.value, ...candidateRisks.value].filter((v) => v > 0)

  if (allValues.length === 0) {
    return { min: 0, max: 100 }
  }

  const min = Math.min(...allValues)
  const max = Math.max(...allValues)

  // 값이 모두 0이면 기본값
  if (max <= 0) {
    return { min: 0, max: 100 }
  }

  // min-max 범위 계산 (여유를 두기 위해 ±10% 적용)
  const range = max - min
  const padding = Math.max(range * 0.1, 5) // 최소 5의 여유

  return {
    min: Math.max(0, Math.floor(min - padding)),
    max: Math.ceil(max + padding),
  }
})

const riskRadarChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
  scales: {
    r: {
      beginAtZero: false,
      min: riskScaleRange.value.min,
      max: riskScaleRange.value.max,
    },
  },
}))

// AAL 데이터의 min-max 스케일링
const aalScaleRange = computed(() => {
  const allValues = [...currentSiteAals.value, ...candidateAals.value].filter((v) => v > 0)

  if (allValues.length === 0) {
    return { min: 0, max: 0.1 }
  }

  const min = Math.min(...allValues)
  const max = Math.max(...allValues)

  // 값이 모두 0이거나 매우 작으면 기본값
  if (max <= 0) {
    return { min: 0, max: 0.1 }
  }

  // min-max 범위 계산 (여유를 두기 위해 ±10% 적용)
  const range = max - min
  const padding = Math.max(range * 0.1, 0.01) // 최소 0.01의 여유

  return {
    min: Math.max(0, min - padding),
    max: max + padding,
  }
})

const aalRadarChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
  scales: {
    r: {
      beginAtZero: false,
      min: aalScaleRange.value.min,
      max: aalScaleRange.value.max,
    },
  },
}))

// 지도에 마커 업데이트
const updateMapMarkers = () => {
  if (!map) return

  // 기존 마커 레이어 제거
  if (markerLayer) {
    map.removeLayer(markerLayer)
  }

  const features: Feature<Point>[] = []

  // 현재 사업장 마커 (빨간색)
  const currentSite = props.sites.find((site) => site.siteId === props.selectedSiteId)
  if (currentSite && currentSite.latitude && currentSite.longitude) {
    const currentMarker = new Feature({
      geometry: new Point(fromLonLat([currentSite.longitude, currentSite.latitude])),
      type: 'current',
    })
    currentMarker.setStyle(
      new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#EA002C' }), // 빨간색
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      }),
    )
    features.push(currentMarker)
  }

  // 선택된 후보지 마커만 표시 (초록색) - 추천 후보지 또는 검색한 위치
  if (
    selectedCandidate.value &&
    selectedCandidate.value.latitude &&
    selectedCandidate.value.longitude
  ) {
    const candidateMarker = new Feature({
      geometry: new Point(
        fromLonLat([selectedCandidate.value.longitude, selectedCandidate.value.latitude]),
      ),
      type: 'candidate',
      candidateId: selectedCandidate.value.candidateId,
    })
    candidateMarker.setStyle(
      new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#B3CF0A' }), // 초록색
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      }),
    )
    features.push(candidateMarker)
  }

  // 새 마커 레이어 생성 및 추가
  markerLayer = new VectorLayer({
    source: new VectorSource({
      features,
    }),
  })
  map.addLayer(markerLayer)

  // 모든 마커가 보이도록 지도 뷰 조정
  if (features.length > 0) {
    const extent = markerLayer.getSource()?.getExtent()
    if (extent) {
      map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 12,
      })
    }
  }
}

// 지도 초기화 및 hazard 목록 로드
onMounted(async () => {
  // hazard 목록 먼저 로드
  await fetchHazardTypes()

  // 지도 초기화
  if (mapContainer.value) {
    map = new Map({
      target: mapContainer.value,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png',
            crossOrigin: 'anonymous',
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([127.0, 37.5]), // 한국 중심
        zoom: 7,
      }),
      controls: [],
    })
  }
})

// selectedSiteId 변경 시 추천 데이터 재로드
watch(
  () => props.selectedSiteId,
  async (newSiteId) => {
    // selectedSiteId가 없으면 실행하지 않음
    if (!newSiteId) return

    // 현재 사업장 분석 데이터 로드
    await loadCurrentSiteData()
    // 추천 후보지 데이터 로드
    await loadRecommendations()
    // 선택된 후보지 인덱스 초기화
    selectedCandidateIndex.value = 0
    // 검색 결과 초기화
    searchedLocationData.value = null
    searchQuery.value = ''
    selectedAddress.value = null
  },
  { immediate: true }, // 컴포넌트 마운트 시 즉시 실행
)

// 추천 후보지 데이터가 변경되면 지도 마커 업데이트
watch(recommendedSites, () => {
  updateMapMarkers()
})

// 선택된 후보지가 변경되면 지도 마커 업데이트
watch(selectedCandidateIndex, () => {
  updateMapMarkers()
})
</script>

<template>
  <div class="relative space-y-6">
    <!-- 로딩 오버레이 -->
    <div
      v-if="isSearching"
      class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
        <div
          class="w-16 h-16 border-4 border-gray-200 border-t-[#EA002C] rounded-full animate-spin"
        ></div>
        <p class="text-gray-900 font-medium">분석 중입니다...</p>
        <p class="text-sm text-gray-600">분석까지 다소 시간이 걸릴 수 있습니다</p>
      </div>
    </div>

    <!-- 추천 후보지 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">추천 후보지</h3>
      </div>
      <div class="p-6">
        <div v-if="recommendationsLoading" class="flex items-center justify-center py-12">
          <span class="text-sm text-gray-600">추천 후보지를 불러오는 중...</span>
        </div>
        <div
          v-else-if="recommendedSites.length === 0"
          class="flex items-center justify-center py-12"
        >
          <span class="text-sm text-gray-600">추천 후보지가 없습니다</span>
        </div>
        <div v-else class="grid grid-cols-3 gap-4">
          <div
            v-for="(site, index) in recommendedSites"
            :key="index"
            :class="[
              'border-2 p-4 cursor-pointer transition-all',
              selectedCandidateIndex === index
                ? 'border-[#EA002C] bg-red-50'
                : 'border-gray-200 hover:border-gray-300',
            ]"
            @click="handleSiteSelect(index)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="text-sm text-gray-900 font-medium">{{ site.name }}</div>
              <span :class="[site.badgeColor, 'px-2 py-1 text-xs text-white']">
                {{ site.badge }}
              </span>
            </div>
            <div class="text-xs text-gray-600 mb-3">{{ site.location }}</div>
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-gray-600">리스크 점수</span>
                <span class="text-gray-900">{{ site.riskScore }}점</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-600">AAL</span>
                <span class="text-gray-900">{{ site.aal.toLocaleString() }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 시뮬레이션 검색 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">시뮬레이션 검색</h3>
      </div>
      <div class="p-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="새로운 후보지 주소를 검색하세요"
            readonly
            :disabled="isSearching"
            class="w-full px-4 py-3 pr-24 text-sm border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
            @click="openSearchPopup"
          />
          <button
            @click="handleSearch"
            :disabled="isSearching"
            class="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#EA002C] text-white text-sm hover:bg-[#C4002A] transition-colors disabled:opacity-50"
          >
            {{ isSearching ? '분석 중...' : '검색' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 위치 비교 지도 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
        <h3 class="text-sm text-gray-900">위치 비교 (SSP2-4.5&2040년도의 물리적 리스크 점수)</h3>
        <div v-if="selectedCandidate" class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[#EA002C]"></div>
            <span class="text-gray-600">현재</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[#B3CF0A]"></div>
            <span class="text-gray-600">후보 ({{ selectedCandidate.name }})</span>
          </div>
        </div>
      </div>
      <div ref="mapContainer" class="h-[400px]"></div>
    </div>

    <!-- 분석 결과 (선택된 후보지가 있을 때만 표시) -->
    <div v-if="selectedCandidate" class="space-y-6">
      <!-- 분석 결과 요약 -->
      <div class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">분석 결과 - {{ selectedCandidate.name }}</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4">
            <!-- 종합 리스크 점수 -->
            <div class="border border-gray-200 p-4">
              <div class="text-xs text-gray-600 mb-2">종합 리스크 점수</div>
              <div class="text-2xl text-gray-900 mb-1">
                {{ selectedCandidate.riskScore }}<span class="text-sm text-gray-600"> /100</span>
              </div>
            </div>

            <!-- 연평균 자산 손실률 (AAL) -->
            <div class="border border-gray-200 p-4">
              <div class="text-xs text-gray-600 mb-2">연평균 자산 손실률 (AAL)</div>
              <div class="text-2xl text-gray-900 mb-1">
                {{ selectedCandidate.aal.toLocaleString()
                }}<span class="text-sm text-gray-600"> %</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 차트 섹션 -->
      <div class="grid grid-cols-2 gap-6">
        <!-- 리스크 프로파일 -->
        <div class="bg-white border border-gray-200 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">리스크 프로파일</h3>
          </div>
          <div class="p-6 h-[400px]">
            <Radar
              :key="`risk-${selectedCandidateIndex}`"
              :data="riskProfileChartData"
              :options="riskRadarChartOptions"
            />
          </div>
        </div>

        <!-- 연평균 자산 손실률(AAL) 프로파일 -->
        <div class="bg-white border border-gray-200 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">연평균 자산 손실률(AAL) 프로파일</h3>
          </div>
          <div class="p-6 h-[400px]">
            <Radar
              :key="`aal-${selectedCandidateIndex}`"
              :data="aalProfileChartData"
              :options="aalRadarChartOptions"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
