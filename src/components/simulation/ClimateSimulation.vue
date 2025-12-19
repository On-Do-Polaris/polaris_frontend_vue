<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { SiteInfo } from '@/api/types'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import XYZ from 'ol/source/XYZ'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Stroke, Fill } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import 'ol/ol.css'
import { useSimulation } from '@/composables/useSimulation'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface Props {
  sites: SiteInfo[]
}

const props = defineProps<Props>()

const { runClimateSimulation, climateResult, loading } = useSimulation()

// 지도 ref
const mapContainer = ref<HTMLElement | null>(null)
let adminLayer: VectorLayer<VectorSource> | null = null

// 시뮬레이션 설정
const sspScenario = ref<'SSP1-2.6' | 'SSP2-4.5' | 'SSP3-7.0' | 'SSP5-8.5'>('SSP5-8.5')
const climateVariable = ref('극심한 고온')

// SSP 시나리오 옵션
const sspOptions = [
  { label: 'SSP1-2.6', value: 'SSP1-2.6' },
  { label: 'SSP2-4.5', value: 'SSP2-4.5' },
  { label: 'SSP3-7.0', value: 'SSP3-7.0' },
  { label: 'SSP5-8.5', value: 'SSP5-8.5' },
]

// 기후 변수 옵션
const climateVariables = [
  '극심한 고온',
  '극심한 한파',
  '하천 홍수',
  '도시 홍수',
  '가뭄',
  '물 부족',
  '해수면 상승',
  '태풍',
  '산불',
]

// 연도 범위 (2025-2100)
const MIN_YEAR = 2025
const MAX_YEAR = 2100

// 선택된 연도 (타임라인)
const currentYear = ref(2025)

// 자동 실행 상태
const isAutoRunning = ref(false)
let autoRunInterval: number | null = null

// 행정구역별 기후 점수 데이터 (API에서 받은 regionScores)
const regionScores = computed(() => {
  if (!climateResult.value?.regionScores) return {}
  return climateResult.value.regionScores
})

// 현재 연도의 행정구역별 점수
const currentRegionScores = computed(() => {
  const scores: Record<string, number> = {}
  const yearKey = currentYear.value.toString()

  Object.keys(regionScores.value).forEach((regionCode) => {
    const yearlyData = regionScores.value[regionCode]
    if (yearlyData && yearlyData[yearKey] !== undefined) {
      scores[regionCode] = yearlyData[yearKey]
    }
  })

  return scores
})

// 동적 등급 범위 계산 (전체 데이터의 점수 기준)
const riskLevels = computed(() => {
  // 모든 연도, 모든 지역의 점수를 수집
  const allScores: number[] = []

  Object.values(regionScores.value).forEach((yearlyData) => {
    Object.values(yearlyData).forEach((score) => {
      if (score > 0) {
        allScores.push(score)
      }
    })
  })

  if (allScores.length === 0) {
    return {
      min: 0,
      max: 100,
      veryLow: { min: 0, max: 20 },
      low: { min: 20, max: 40 },
      medium: { min: 40, max: 60 },
      high: { min: 60, max: 80 },
      veryHigh: { min: 80, max: 100 },
    }
  }

  const minScore = Math.floor(Math.min(...allScores))
  const maxScore = Math.ceil(Math.max(...allScores))
  const range = maxScore - minScore
  const step = Math.ceil(range / 5)

  const boundary1 = minScore + step
  const boundary2 = minScore + step * 2
  const boundary3 = minScore + step * 3
  const boundary4 = minScore + step * 4

  return {
    min: minScore,
    max: maxScore,
    veryLow: { min: minScore, max: boundary1 },
    low: { min: boundary1, max: boundary2 },
    medium: { min: boundary2, max: boundary3 },
    high: { min: boundary3, max: boundary4 },
    veryHigh: { min: boundary4, max: maxScore },
  }
})

// 행정구역 점수에 따른 색상 (동적 등급 기준)
const getRegionColor = (score: number) => {
  if (!score || score === 0) return 'rgba(220, 220, 220, 0.4)' // 회색 (데이터 없음)

  const levels = riskLevels.value

  if (score < levels.low.min) return 'rgba(0, 188, 212, 0.7)' // 청록 (매우 낮음)
  if (score < levels.medium.min) return 'rgba(139, 195, 74, 0.7)' // 연두 (낮음)
  if (score < levels.high.min) return 'rgba(253, 216, 53, 0.7)' // 노랑 (보통)
  if (score < levels.veryHigh.min) return 'rgba(247, 162, 95, 0.7)' // 주황 (높음)
  return 'rgba(234, 0, 44, 0.7)' // 빨강 (매우 높음)
}

// 분석 데이터
const siteAnalysis = computed(() => {
  if (!climateResult.value?.sites || climateResult.value.sites.length === 0) return []

  const yearKey = currentYear.value.toString()

  return climateResult.value.sites.map((siteData) => {
    // 현재 연도의 AAL 값 가져오기
    const aalScore = siteData.aalByYear[yearKey] || 0

    // AAL 점수에 따른 상태 결정
    let status = 'low'
    if (aalScore >= 30) status = 'high'
    else if (aalScore >= 15) status = 'medium'

    // 2025년 대비 증가율 계산
    const baseAAL = siteData.aalByYear['2025'] || aalScore
    const increasePercent =
      baseAAL > 0 ? (((aalScore - baseAAL) / baseAAL) * 100).toFixed(1) : '0.0'
    const sign = aalScore >= baseAAL ? '+' : ''

    // 행정구역 코드로 현재 연도의 평균 기온(점수) 가져오기
    const regionTemperature = regionScores.value[siteData.regionCode]?.[yearKey] || null

    return {
      name: siteData.siteName,
      aalIncrease: `${sign}${increasePercent}%`,
      status,
      temperature: regionTemperature !== null ? `${regionTemperature.toFixed(1)}` : '-',
    }
  })
})

// 행정구역 레이어 스타일 함수
const getRegionStyle = (feature: any) => {
  const code = feature.get('code') // 행정구역코드
  const score = currentRegionScores.value[code] || 0
  const fillColor = getRegionColor(score)

  return new Style({
    stroke: new Stroke({
      color: '#999', // 경계선 색상 (회색)
      width: 1, // 경계선 두께
    }),
    fill: new Fill({
      color: fillColor,
    }),
  })
}

// 시뮬레이션 실행 핸들러 (조회 버튼)
const handleRunSimulation = async () => {
  if (props.sites.length === 0) {
    toast.error('등록된 사업장이 없습니다.')
    return
  }

  // 자동 실행 중이면 중지
  if (isAutoRunning.value) {
    stopAutoRun()
  }

  try {
    await runClimateSimulation({
      scenario: sspScenario.value,
      hazardType: climateVariable.value,
    })

    // API 응답 후 2025년으로 초기화
    currentYear.value = MIN_YEAR
    toast.success('시뮬레이션이 완료되었습니다.')
  } catch (e) {
    console.error('시뮬레이션 에러:', e)
  }
}

// 자동 실행 핸들러
const handleAutoRun = () => {
  if (!climateResult.value?.regionScores) {
    toast.error('먼저 시뮬레이션을 조회해주세요.')
    return
  }

  if (isAutoRunning.value) {
    stopAutoRun()
    return
  }

  // 자동 실행 시작
  isAutoRunning.value = true
  currentYear.value = MIN_YEAR

  autoRunInterval = window.setInterval(() => {
    if (currentYear.value >= MAX_YEAR) {
      stopAutoRun()
      toast.success('자동 실행이 완료되었습니다.')
      return
    }
    currentYear.value += 5
  }, 500) // 500ms (0.5초) 간격으로 5년씩 증가
}

// 자동 실행 중지
const stopAutoRun = () => {
  if (autoRunInterval !== null) {
    clearInterval(autoRunInterval)
    autoRunInterval = null
  }
  isAutoRunning.value = false
}

// 지도 초기화 및 초기 데이터 로드
onMounted(async () => {
  if (mapContainer.value) {
    // 1. 배경 레이어
    const baseLayer = new TileLayer({
      source: new XYZ({
        url: 'https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous',
      }),
    })

    // 2. 행정구역 경계 레이어 (로컬 GeoJSON 파일)
    adminLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: '/data/skorea-municipalities-2018-geo.json', // public/data/skorea-municipalities-2018-geo.json
      }),
      style: getRegionStyle,
    })

    // 3. 지도 생성
    new Map({
      target: mapContainer.value,
      layers: [baseLayer, adminLayer],
      view: new View({
        center: fromLonLat([127.5, 36.5]),
        zoom: 7,
      }),
      controls: [],
    })
  }

  // 4. 초기 데이터 로드 (기본값으로 시뮬레이션 실행)
  if (props.sites.length > 0) {
    await handleRunSimulation()
  }

  // 언마운트 시 자동 실행 정리
  return () => {
    stopAutoRun()
  }
})

// currentRegionScores 변경 시 지도 스타일 업데이트
watch(currentRegionScores, () => {
  if (adminLayer) {
    adminLayer.setStyle(getRegionStyle)
    adminLayer.changed() // 레이어 강제 리렌더링
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 시뮬레이션 설정 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">시뮬레이션 설정</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-3 gap-4">
          <!-- SSP 시나리오 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">SSP 시나리오</label>
            <select
              v-model="sspScenario"
              class="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            >
              <option v-for="option in sspOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- 기후 변수 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">기후 변수</label>
            <select
              v-model="climateVariable"
              class="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            >
              <option v-for="variable in climateVariables" :key="variable" :value="variable">
                {{ variable }}
              </option>
            </select>
          </div>

          <!-- 조회 버튼 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">&nbsp;</label>
            <button
              @click="handleRunSimulation"
              :disabled="loading"
              class="w-full px-4 py-2 text-sm bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Loader2 v-if="loading" class="animate-spin" :size="16" />
              <span v-else>조회</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 타임라인 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
        <h3 class="text-sm text-gray-900">타임라인</h3>
        <button
          @click="handleAutoRun"
          :disabled="loading || !climateResult?.regionScores"
          class="px-4 py-2 text-sm bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span v-if="isAutoRunning">■ 중지</span>
          <span v-else>▶ 자동 실행</span>
        </button>
      </div>
      <div class="p-6">
        <div class="relative">
          <!-- 슬라이더 -->
          <div class="relative px-2">
            <input
              type="range"
              v-model.number="currentYear"
              :min="MIN_YEAR"
              :max="MAX_YEAR"
              :step="5"
              :disabled="loading"
              class="w-full h-2 bg-gradient-to-r from-[#b3cf0a] via-[#f4c430] via-[#f47725] to-[#ea002c] rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <!-- 연도 라벨 -->
          <div class="flex justify-between text-xs text-gray-600 mt-2 px-2">
            <span>2025년</span>
            <span>2040년</span>
            <span>2060년</span>
            <span>2080년</span>
            <span>2100년</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 지도 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
        <h3 class="text-sm text-gray-900">기후 변화 지도</h3>
        <div class="text-base font-medium text-gray-900">{{ currentYear }}년</div>
      </div>
      <div class="p-6">
        <!-- 지도 컨테이너 -->
        <div class="relative h-[500px]">
          <!-- 지도 -->
          <div ref="mapContainer" class="absolute inset-0"></div>

          <!-- 로딩 오버레이 -->
          <div
            v-if="loading"
            class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div class="flex flex-col items-center gap-3">
              <Loader2 class="animate-spin text-[#EA002C]" :size="48" />
              <div class="text-sm text-gray-700">기후 데이터 로딩 중...</div>
            </div>
          </div>

          <!-- 기후 위험도 범례 (왼쪽) -->
          <div
            class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-300 p-3 shadow-lg rounded"
          >
            <div class="text-xs text-gray-700 mb-2 font-medium">기후 위험도</div>
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <div class="w-5 h-3" style="background-color: rgba(234, 0, 44, 0.7)"></div>
                <span class="text-xs text-gray-800">
                  매우 높음 ({{ Math.round(riskLevels.veryHigh.min) }}~{{
                    Math.round(riskLevels.veryHigh.max)
                  }})
                </span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-3" style="background-color: rgba(247, 162, 95, 0.7)"></div>
                <span class="text-xs text-gray-800">
                  높음 ({{ Math.round(riskLevels.high.min) }}~{{ Math.round(riskLevels.high.max) }})
                </span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-3" style="background-color: rgba(253, 216, 53, 0.7)"></div>
                <span class="text-xs text-gray-800">
                  보통 ({{ Math.round(riskLevels.medium.min) }}~{{
                    Math.round(riskLevels.medium.max)
                  }})
                </span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-3" style="background-color: rgba(139, 195, 74, 0.7)"></div>
                <span class="text-xs text-gray-800">
                  낮음 ({{ Math.round(riskLevels.low.min) }}~{{ Math.round(riskLevels.low.max) }})
                </span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-3" style="background-color: rgba(0, 188, 212, 0.7)"></div>
                <span class="text-xs text-gray-800">
                  매우 낮음 ({{ Math.round(riskLevels.veryLow.min) }}~{{
                    Math.round(riskLevels.veryLow.max)
                  }})
                </span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-3" style="background-color: rgba(220, 220, 220, 0.4)"></div>
                <span class="text-xs text-gray-800">데이터 없음</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 시뮬레이션 사업장 목록 분석 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
        <h3 class="text-sm text-gray-900">사업장 목록별 분석</h3>
      </div>
      <div class="p-6">
        <div v-if="loading" class="flex items-center justify-center h-full">
          <Loader2 class="animate-spin text-[#EA002C]" :size="32" />
        </div>
        <div
          v-else-if="siteAnalysis.length === 0"
          class="flex items-center justify-center h-full text-gray-500"
        >
          시뮬레이션 결과가 없습니다.
        </div>
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full overflow-y-auto"
        >
          <div
            v-for="(site, index) in siteAnalysis"
            :key="index"
            class="border border-gray-200 px-5 py-3 space-y-2"
          >
            <!-- 첫 번째 행: 사업장 이름 + 상태 원 -->
            <div class="flex items-center justify-between">
              <div class="text-base text-gray-900">{{ site.name }}</div>
              <div
                class="w-3 h-3 rounded-full flex-shrink-0"
                :class="{
                  'bg-[#EA002C]': site.status === 'high',
                  'bg-[#F47725]': site.status === 'medium',
                  'bg-[#B3CF0A]': site.status === 'low',
                }"
              ></div>
            </div>

            <!-- 두 번째 행: 평균 기온 -->
            <div class="flex items-start justify-between gap-2">
              <div class="text-xs text-gray-600 leading-tight">기후 위험 지수</div>
              <div class="text-base text-gray-900 flex-shrink-0">{{ site.temperature }}</div>
            </div>

            <!-- 세 번째 행: AAL 변화 -->
            <div class="flex items-start justify-between gap-2">
              <div class="text-xs text-gray-600 leading-tight">연평균 재무 손실률(AAL) 변화</div>
              <div class="text-base font-medium text-[#EA002C] flex-shrink-0">
                {{ site.aalIncrease }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 슬라이더 스타일 */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #000;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #000;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.slider:disabled::-moz-range-thumb {
  cursor: not-allowed;
}
</style>
