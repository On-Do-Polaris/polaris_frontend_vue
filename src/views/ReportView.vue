<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Download, FileText, Trash2, Loader2, Plus } from 'lucide-vue-next'
import { useSitesStore } from '@/store/sites'
import { useReports } from '@/composables/useReports'
import { toast } from 'vue-sonner'

console.log('[ReportView] Component loaded')

const sitesStore = useSitesStore()
const reports = useReports()

// 리포트 생성 폼
const showCreateForm = ref(false)
const createForm = ref({
  siteId: '',
  reportType: 'FULL' as 'FULL' | 'SUMMARY' | 'EXECUTIVE',
  includeCharts: true,
  includeRecommendations: true
})

// 웹 뷰 표시
const showWebView = ref(false)

// 사업장 목록 로드
onMounted(async () => {
  if (sitesStore.allSites.length === 0) {
    await sitesStore.fetchSites()
  }
})

// 리포트 생성
const handleCreateReport = async () => {
  if (!createForm.value.siteId) {
    toast.error('사업장을 선택해주세요')
    return
  }

  try {
    await reports.createReport(createForm.value)
    toast.success('리포트가 생성되었습니다')
    showCreateForm.value = false
    // 생성 후 웹 뷰 자동 조회
    await handleViewWebReport()
  } catch (error) {
    console.error('리포트 생성 실패:', error)
    toast.error('리포트 생성에 실패했습니다')
  }
}

// 웹 뷰 보기
const handleViewWebReport = async () => {
  try {
    await reports.getReportWebView()
    showWebView.value = true
    toast.success('리포트를 불러왔습니다')
  } catch (error) {
    console.error('리포트 조회 실패:', error)
    toast.error('리포트 조회에 실패했습니다')
  }
}

// PDF 다운로드
const handleDownloadPdf = async () => {
  try {
    await reports.downloadPdf()
    toast.success('PDF 다운로드를 시작합니다')
  } catch (error) {
    console.error('PDF 다운로드 실패:', error)
    toast.error('PDF 다운로드에 실패했습니다')
  }
}

// 리포트 삭제
const handleDeleteReport = async () => {
  if (!confirm('리포트를 삭제하시겠습니까?')) {
    return
  }

  try {
    await reports.deleteReport()
    showWebView.value = false
    toast.success('리포트가 삭제되었습니다')
  } catch (error) {
    console.error('리포트 삭제 실패:', error)
    toast.error('리포트 삭제에 실패했습니다')
  }
}

// 인쇄
const handlePrint = () => {
  window.print()
}

// 리스크 레벨 색상
const getRiskLevelColor = (level: string) => {
  if (level === 'CRITICAL') return 'bg-[#EA002C] text-white'
  if (level === 'HIGH') return 'bg-[#F47725] text-white'
  if (level === 'MODERATE') return 'bg-[#F4C430] text-white'
  return 'bg-[#B3CF0A] text-white'
}
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- 상단 헤더 -->
    <div class="border-b border-gray-200 px-8 py-6 bg-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-gray-900 text-xl">리포트 관리</h2>
          <p class="text-sm text-gray-600 mt-1">
            사업장별 기후 리스크 분석 리포트를 생성하고 관리합니다.
          </p>
        </div>
        <button
          @click="showCreateForm = !showCreateForm"
          class="px-4 py-2 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors flex items-center gap-2 text-sm"
        >
          <Plus :size="16" />
          새 리포트 생성
        </button>
      </div>
    </div>

    <div class="px-8 py-6">
      <!-- 리포트 생성 폼 -->
      <div v-if="showCreateForm" class="bg-white border border-gray-200 shadow-sm mb-6">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">리포트 생성</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4 max-w-2xl">
            <!-- 사업장 선택 -->
            <div>
              <label class="block text-sm text-gray-700 mb-2">사업장 선택</label>
              <select
                v-model="createForm.siteId"
                class="w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
              >
                <option value="">사업장을 선택하세요</option>
                <option v-for="site in sitesStore.allSites" :key="site.siteId" :value="site.siteId">
                  {{ site.siteName }}
                </option>
              </select>
            </div>

            <!-- 리포트 타입 -->
            <div>
              <label class="block text-sm text-gray-700 mb-2">리포트 타입</label>
              <div class="flex gap-4">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    v-model="createForm.reportType"
                    value="FULL"
                    class="mr-2 text-[#EA002C] focus:ring-[#EA002C]"
                  />
                  <span class="text-sm text-gray-700">전체 리포트</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    v-model="createForm.reportType"
                    value="SUMMARY"
                    class="mr-2 text-[#EA002C] focus:ring-[#EA002C]"
                  />
                  <span class="text-sm text-gray-700">요약 리포트</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    v-model="createForm.reportType"
                    value="EXECUTIVE"
                    class="mr-2 text-[#EA002C] focus:ring-[#EA002C]"
                  />
                  <span class="text-sm text-gray-700">경영진 리포트</span>
                </label>
              </div>
            </div>

            <!-- 옵션 -->
            <div>
              <label class="block text-sm text-gray-700 mb-2">포함 옵션</label>
              <div class="space-y-2">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="createForm.includeCharts"
                    class="mr-2 rounded border-gray-300 text-[#EA002C] focus:ring-[#EA002C]"
                  />
                  <span class="text-sm text-gray-700">차트 포함</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="createForm.includeRecommendations"
                    class="mr-2 rounded border-gray-300 text-[#EA002C] focus:ring-[#EA002C]"
                  />
                  <span class="text-sm text-gray-700">권장사항 포함</span>
                </label>
              </div>
            </div>

            <!-- 버튼 -->
            <div class="flex gap-3 pt-4">
              <button
                @click="handleCreateReport"
                :disabled="reports.loading.value"
                class="px-6 py-2 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Loader2 v-if="reports.loading.value" :size="16" class="animate-spin" />
                <FileText v-else :size="16" />
                <span>{{ reports.loading.value ? '생성 중...' : '리포트 생성' }}</span>
              </button>
              <button
                @click="showCreateForm = false"
                class="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 리포트 웹 뷰 -->
      <div v-if="showWebView && reports.reportWebView.value" class="space-y-6">
        <!-- 리포트 헤더 -->
        <div class="bg-white border border-gray-200 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
            <h3 class="text-sm text-gray-900">리포트 상세</h3>
            <div class="flex gap-2">
              <button
                @click="handlePrint"
                class="px-3 py-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <FileText :size="14" />
                인쇄
              </button>
              <button
                @click="handleDownloadPdf"
                :disabled="reports.loading.value"
                class="px-3 py-1 text-sm bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors flex items-center gap-1 disabled:bg-gray-300"
              >
                <Loader2 v-if="reports.loading.value" :size="14" class="animate-spin" />
                <Download v-else :size="14" />
                PDF 다운로드
              </button>
              <button
                @click="handleDeleteReport"
                :disabled="reports.loading.value"
                class="px-3 py-1 text-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 :size="14" />
                삭제
              </button>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-4 gap-4">
              <div class="border border-gray-200 p-4">
                <div class="text-xs text-gray-600 mb-1">사업장</div>
                <div class="text-sm text-gray-900">{{ reports.reportWebView.value?.siteName }}</div>
              </div>
              <div class="border border-gray-200 p-4">
                <div class="text-xs text-gray-600 mb-1">리포트 ID</div>
                <div class="text-sm text-gray-900 font-mono">{{ reports.reportWebView.value?.reportId.substring(0, 8) }}...</div>
              </div>
              <div class="border border-gray-200 p-4">
                <div class="text-xs text-gray-600 mb-1">생성일시</div>
                <div class="text-sm text-gray-900">{{ reports.reportWebView.value ? new Date(reports.reportWebView.value.generatedAt).toLocaleString('ko-KR') : '' }}</div>
              </div>
              <div class="border border-gray-200 p-4">
                <div class="text-xs text-gray-600 mb-1">사업장 ID</div>
                <div class="text-sm text-gray-900 font-mono">{{ reports.reportWebView.value?.siteId.substring(0, 8) }}...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 요약 -->
        <div v-if="reports.reportWebView.value?.content.summary" class="bg-white border border-gray-200 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">요약</h3>
          </div>
          <div class="p-6">
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ reports.reportWebView.value?.content.summary }}</p>
          </div>
        </div>

        <!-- 리스크 점수 -->
        <div v-if="reports.reportWebView.value?.content.riskScores && reports.reportWebView.value.content.riskScores.length > 0" class="bg-white border border-gray-200 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">물리적 리스크 점수</h3>
          </div>
          <div class="p-6">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left text-xs text-gray-600 pb-3">위험 유형</th>
                  <th class="text-left text-xs text-gray-600 pb-3">점수</th>
                  <th class="text-left text-xs text-gray-600 pb-3">레벨</th>
                  <th class="text-left text-xs text-gray-600 pb-3">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(score, index) in reports.reportWebView.value?.content.riskScores"
                  :key="index"
                  class="border-b border-gray-100"
                >
                  <td class="py-3 text-sm text-gray-900">{{ score.hazardName }}</td>
                  <td class="py-3 text-sm text-gray-900">{{ score.score.toFixed(1) }}</td>
                  <td class="py-3">
                    <span :class="getRiskLevelColor(score.level)" class="inline-block px-2 py-1 text-xs">
                      {{ score.level }}
                    </span>
                  </td>
                  <td class="py-3 text-sm text-gray-600">{{ score.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 과거 재난 이력 -->
        <div v-if="reports.reportWebView.value?.content.pastEvents && reports.reportWebView.value.content.pastEvents.length > 0" class="bg-white border border-gray-200 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">과거 재난 이력</h3>
          </div>
          <div class="p-6">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left text-xs text-gray-600 pb-3">날짜</th>
                  <th class="text-left text-xs text-gray-600 pb-3">재난 유형</th>
                  <th class="text-left text-xs text-gray-600 pb-3">심각도</th>
                  <th class="text-left text-xs text-gray-600 pb-3">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(event, index) in reports.reportWebView.value?.content.pastEvents"
                  :key="index"
                  class="border-b border-gray-100"
                >
                  <td class="py-3 text-sm text-gray-900">{{ new Date(event.date).toLocaleDateString('ko-KR') }}</td>
                  <td class="py-3 text-sm text-gray-900">{{ event.eventName }}</td>
                  <td class="py-3 text-sm text-gray-900">{{ event.severity }}</td>
                  <td class="py-3 text-sm text-gray-600">{{ event.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 재무 영향 -->
        <div v-if="reports.reportWebView.value?.content.financialImpacts && reports.reportWebView.value.content.financialImpacts.length > 0" class="bg-white border border-gray-200 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">재무 영향</h3>
          </div>
          <div class="p-6">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left text-xs text-gray-600 pb-3">위험 유형</th>
                  <th class="text-left text-xs text-gray-600 pb-3">예상 손실액</th>
                  <th class="text-left text-xs text-gray-600 pb-3">연평균 손실액</th>
                  <th class="text-left text-xs text-gray-600 pb-3">발생 확률 (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(impact, index) in reports.reportWebView.value?.content.financialImpacts"
                  :key="index"
                  class="border-b border-gray-100"
                >
                  <td class="py-3 text-sm text-gray-900">{{ impact.hazardType }}</td>
                  <td class="py-3 text-sm text-gray-900">{{ impact.expectedLoss.toLocaleString() }}만원</td>
                  <td class="py-3 text-sm text-gray-900">{{ impact.annualizedLoss.toLocaleString() }}만원</td>
                  <td class="py-3 text-sm text-gray-900">{{ (impact.probability * 100).toFixed(2) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 취약성 분석 -->
        <div v-if="reports.reportWebView.value?.content.vulnerability && reports.reportWebView.value.content.vulnerability.length > 0" class="bg-white border border-gray-200 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">취약성 분석</h3>
          </div>
          <div class="p-6">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left text-xs text-gray-600 pb-3">요인</th>
                  <th class="text-left text-xs text-gray-600 pb-3">점수</th>
                  <th class="text-left text-xs text-gray-600 pb-3">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(factor, index) in reports.reportWebView.value?.content.vulnerability"
                  :key="index"
                  class="border-b border-gray-100"
                >
                  <td class="py-3 text-sm text-gray-900">{{ factor.factor }}</td>
                  <td class="py-3 text-sm text-gray-900">{{ factor.score.toFixed(1) }}</td>
                  <td class="py-3 text-sm text-gray-600">{{ factor.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 권장사항 -->
        <div v-if="reports.reportWebView.value?.content.recommendations && reports.reportWebView.value.content.recommendations.length > 0" class="bg-white border border-gray-200 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">권장사항</h3>
          </div>
          <div class="p-6">
            <ul class="space-y-2">
              <li
                v-for="(recommendation, index) in reports.reportWebView.value?.content.recommendations"
                :key="index"
                class="flex items-start gap-2 text-sm text-gray-900"
              >
                <span class="text-[#EA002C] mt-1">•</span>
                <span>{{ recommendation }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="!showCreateForm" class="bg-white border border-gray-200 shadow-sm p-12 text-center">
        <div class="text-gray-400 mb-2">
          <FileText :size="48" class="mx-auto" />
        </div>
        <div class="text-sm text-gray-600 mb-4">생성된 리포트가 없습니다</div>
        <button
          @click="showCreateForm = true"
          class="px-4 py-2 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors inline-flex items-center gap-2 text-sm"
        >
          <Plus :size="16" />
          새 리포트 생성
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  button {
    display: none;
  }
}
</style>
