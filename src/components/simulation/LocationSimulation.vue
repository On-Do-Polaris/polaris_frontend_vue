<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Trash2, Play, Loader2 } from 'lucide-vue-next'
import { useSimulation } from '@/composables/useSimulation'
import { toast } from 'vue-sonner'
import type { Site } from '@/api/types'

interface Props {
  selectedSiteId: string
  sites: Site[]
}

interface Candidate {
  location: string
  address: string
  latitude: number
  longitude: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedSiteId': [value: string]
}>()

const { compareRelocation, relocationResult, loading } = useSimulation()

const candidates = ref<Candidate[]>([])
const newCandidate = ref<Candidate>({
  location: '',
  address: '',
  latitude: 0,
  longitude: 0
})
const isRunning = ref(false)

// 후보지 추가
const addCandidate = () => {
  if (!newCandidate.value.location || !newCandidate.value.address) {
    toast.error('위치명과 주소를 입력해주세요')
    return
  }

  if (newCandidate.value.latitude === 0 || newCandidate.value.longitude === 0) {
    toast.error('위도와 경도를 입력해주세요')
    return
  }

  candidates.value.push({ ...newCandidate.value })
  newCandidate.value = {
    location: '',
    address: '',
    latitude: 0,
    longitude: 0
  }
  toast.success('후보지가 추가되었습니다')
}

// 후보지 삭제
const removeCandidate = (index: number) => {
  candidates.value.splice(index, 1)
  toast.success('후보지가 삭제되었습니다')
}

// 시뮬레이션 실행
const handleRunSimulation = async () => {
  if (!props.selectedSiteId) {
    toast.error('사업장을 선택해주세요')
    return
  }

  if (candidates.value.length === 0) {
    toast.error('최소 1개의 후보지를 추가해주세요')
    return
  }

  isRunning.value = true

  try {
    await compareRelocation({
      currentSiteId: props.selectedSiteId,
      candidates: candidates.value
    })

    toast.success('위치 시뮬레이션이 완료되었습니다')
  } catch (error) {
    console.error('위치 시뮬레이션 실패:', error)
    toast.error('위치 시뮬레이션에 실패했습니다')
  } finally {
    isRunning.value = false
  }
}

// 리스크 레벨 색상
const getRiskLevelColor = (level: string) => {
  if (level === 'CRITICAL') return 'bg-[#EA002C] text-white'
  if (level === 'HIGH') return 'bg-[#F47725] text-white'
  if (level === 'MODERATE') return 'bg-[#F4C430] text-white'
  return 'bg-[#B3CF0A] text-white'
}

// 리스크 레벨 텍스트
const getRiskLevelText = (level: string) => {
  if (level === 'CRITICAL') return '매우 높음'
  if (level === 'HIGH') return '높음'
  if (level === 'MODERATE') return '보통'
  return '낮음'
}
</script>

<template>
  <div class="space-y-6">
    <!-- 설정 패널 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">시뮬레이션 설정</h3>
      </div>
      <div class="p-6 space-y-4">
        <!-- 현재 사업장 선택 -->
        <div>
          <label class="block text-xs text-gray-600 mb-2">현재 사업장</label>
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

        <!-- 후보지 추가 -->
        <div class="border-t border-gray-200 pt-4">
          <label class="block text-xs text-gray-600 mb-2">후보지 추가</label>
          <div class="grid grid-cols-2 gap-3 mb-2">
            <input
              v-model="newCandidate.location"
              type="text"
              placeholder="위치명 (예: 세종 데이터센터)"
              class="px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            />
            <input
              v-model="newCandidate.address"
              type="text"
              placeholder="주소"
              class="px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            />
            <input
              v-model.number="newCandidate.latitude"
              type="number"
              step="0.000001"
              placeholder="위도 (예: 36.5040)"
              class="px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            />
            <input
              v-model.number="newCandidate.longitude"
              type="number"
              step="0.000001"
              placeholder="경도 (예: 127.2494)"
              class="px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            />
          </div>
          <button
            @click="addCandidate"
            class="px-4 py-2 text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Plus :size="16" />
            <span>후보지 추가</span>
          </button>
        </div>

        <!-- 추가된 후보지 목록 -->
        <div v-if="candidates.length > 0" class="border-t border-gray-200 pt-4">
          <label class="block text-xs text-gray-600 mb-2">추가된 후보지 ({{ candidates.length }}개)</label>
          <div class="space-y-2">
            <div
              v-for="(candidate, index) in candidates"
              :key="index"
              class="flex items-center justify-between border border-gray-200 p-3"
            >
              <div class="flex-1">
                <div class="text-sm text-gray-900">{{ candidate.location }}</div>
                <div class="text-xs text-gray-600">{{ candidate.address }}</div>
                <div class="text-xs text-gray-500 mt-1">
                  위도: {{ candidate.latitude }}, 경도: {{ candidate.longitude }}
                </div>
              </div>
              <button
                @click="removeCandidate(index)"
                class="px-2 py-1 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- 실행 버튼 -->
        <div class="border-t border-gray-200 pt-4">
          <button
            @click="handleRunSimulation"
            :disabled="loading || isRunning || !selectedSiteId || candidates.length === 0"
            class="w-full px-4 py-2 text-sm bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading || isRunning" :size="16" class="animate-spin" />
            <Play v-else :size="16" />
            <span>{{ loading || isRunning ? '실행 중...' : '시뮬레이션 실행' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 결과 표시 -->
    <div v-if="relocationResult" class="space-y-6">
      <!-- 현재 사업장 정보 -->
      <div class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">현재 사업장</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="border border-gray-200 p-4">
              <div class="text-xs text-gray-600 mb-1">위치</div>
              <div class="text-sm text-gray-900">{{ relocationResult.currentSite.location }}</div>
            </div>
            <div class="border border-gray-200 p-4">
              <div class="text-xs text-gray-600 mb-1">종합 리스크 점수</div>
              <div class="text-lg text-gray-900">{{ relocationResult.currentSite.overallRiskScore.toFixed(1) }}</div>
            </div>
            <div class="border border-gray-200 p-4">
              <div class="text-xs text-gray-600 mb-1">리스크 레벨</div>
              <div
                :class="getRiskLevelColor(relocationResult.currentSite.riskLevel)"
                class="inline-block px-2 py-1 text-xs"
              >
                {{ getRiskLevelText(relocationResult.currentSite.riskLevel) }}
              </div>
            </div>
            <div class="border border-gray-200 p-4">
              <div class="text-xs text-gray-600 mb-1">예상 비용</div>
              <div class="text-lg text-gray-900">{{ relocationResult.currentSite.estimatedCost.toLocaleString() }}만원</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 최적 후보지 -->
      <div class="bg-green-50 border border-green-200 shadow-sm">
        <div class="border-b border-green-200 px-6 py-3 bg-green-100">
          <h3 class="text-sm text-green-900">✅ 최적 후보지</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-4 gap-4 mb-4">
            <div class="border border-green-200 p-4 bg-white">
              <div class="text-xs text-gray-600 mb-1">위치</div>
              <div class="text-sm text-gray-900">{{ relocationResult.bestCandidate.location }}</div>
            </div>
            <div class="border border-green-200 p-4 bg-white">
              <div class="text-xs text-gray-600 mb-1">종합 리스크 점수</div>
              <div class="text-lg text-green-600 font-semibold">{{ relocationResult.bestCandidate.overallRiskScore.toFixed(1) }}</div>
            </div>
            <div class="border border-green-200 p-4 bg-white">
              <div class="text-xs text-gray-600 mb-1">리스크 레벨</div>
              <div
                :class="getRiskLevelColor(relocationResult.bestCandidate.riskLevel)"
                class="inline-block px-2 py-1 text-xs"
              >
                {{ getRiskLevelText(relocationResult.bestCandidate.riskLevel) }}
              </div>
            </div>
            <div class="border border-green-200 p-4 bg-white">
              <div class="text-xs text-gray-600 mb-1">예상 비용</div>
              <div class="text-lg text-gray-900">{{ relocationResult.bestCandidate.estimatedCost.toLocaleString() }}만원</div>
            </div>
          </div>
          <div class="bg-white border border-green-200 p-4">
            <div class="text-xs text-gray-600 mb-2">권장사항</div>
            <div class="text-sm text-gray-900">{{ relocationResult.bestCandidate.recommendation }}</div>
          </div>
        </div>
      </div>

      <!-- 전체 후보지 비교 -->
      <div class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">전체 후보지 비교</h3>
        </div>
        <div class="p-6">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left text-xs text-gray-600 pb-3">위치</th>
                <th class="text-left text-xs text-gray-600 pb-3">주소</th>
                <th class="text-left text-xs text-gray-600 pb-3">종합 점수</th>
                <th class="text-left text-xs text-gray-600 pb-3">리스크 레벨</th>
                <th class="text-left text-xs text-gray-600 pb-3">예상 비용</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(candidate, index) in relocationResult.candidates"
                :key="index"
                class="border-b border-gray-100"
              >
                <td class="py-3 text-sm text-gray-900">{{ candidate.location }}</td>
                <td class="py-3 text-sm text-gray-600">{{ candidate.address }}</td>
                <td class="py-3 text-sm text-gray-900">{{ candidate.overallRiskScore.toFixed(1) }}</td>
                <td class="py-3">
                  <div
                    :class="getRiskLevelColor(candidate.riskLevel)"
                    class="inline-block px-2 py-1 text-xs"
                  >
                    {{ getRiskLevelText(candidate.riskLevel) }}
                  </div>
                </td>
                <td class="py-3 text-sm text-gray-900">{{ candidate.estimatedCost.toLocaleString() }}만원</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 분석 요약 -->
      <div v-if="relocationResult.analysis" class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">분석 요약</h3>
        </div>
        <div class="p-6">
          <div class="text-sm text-gray-900 whitespace-pre-line">{{ relocationResult.analysis }}</div>
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
