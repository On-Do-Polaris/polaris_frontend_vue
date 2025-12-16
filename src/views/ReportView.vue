<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Loader2, Upload, ChevronDown } from 'lucide-vue-next'
import { useSitesStore } from '@/store/sites'
import { reportsAPI } from '@/api/reports'
import { analysisAPI } from '@/api/analysis'
import { toast } from 'vue-sonner'

console.log('[ReportView] Component loaded')

const sitesStore = useSitesStore()

// 추가 데이터 등록 팝업
const showAdditionalDataDialog = ref(false)
const dialogStep = ref(1) // 1: 초기 화면, 2: 목록 화면, 3: 파일 업로드 화면
const selectedSiteId = ref('')
const additionalDataList = ref<Array<{ id: string; name: string }>>([])
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 분석 진행 상태
const isAnalyzing = ref(false)

// 현재 활성화된 섹션
const activeSection = ref('governance')

// Intersection Observer
let observer: IntersectionObserver | null = null

// 사업장 목록 로드 및 팝업 표시
onMounted(async () => {
  if (sitesStore.allSites.length === 0) {
    await sitesStore.fetchSites()
  }

  // 분석 상태 확인
  try {
    const statusResponse = await analysisAPI.getOverallAnalysisStatus()
    if (statusResponse.data.status === 'ing') {
      // 분석 진행 중이면 로딩 화면 표시
      isAnalyzing.value = true
      return // 팝업 표시하지 않음
    }
    if (statusResponse.data.status === 'done-a') {
      // done-a 상태면 팝업 표시하지 않음
      return
    }
  } catch (error) {
    console.error('분석 상태 확인 실패:', error)
    // 에러 시 무시하고 계속 진행
  }

  // done 상태일 때만 페이지 진입 시 추가 데이터 등록 팝업 자동 표시
  showAdditionalDataDialog.value = true

  // Intersection Observer 설정
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Intersection Observer 설정
const setupIntersectionObserver = () => {
  const options = {
    root: null,
    rootMargin: '-20% 0px -80% 0px',
    threshold: 0,
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id
      }
    })
  }, options)

  // 모든 섹션 관찰
  const sections = [
    'governance',
    'governance-1',
    'governance-2',
    'strategy',
    'strategy-1',
    'strategy-2',
    'strategy-3',
    'risk-management',
    'risk-management-1',
    'risk-management-2',
    'risk-management-3',
    'metrics',
    'metrics-1',
    'metrics-2',
    'appendix',
    'appendix-1',
    'appendix-2',
    'appendix-3',
  ]

  sections.forEach((sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      observer?.observe(element)
    }
  })
}

// 팝업 닫기
const handleCloseDialog = () => {
  showAdditionalDataDialog.value = false
  dialogStep.value = 1
  selectedSiteId.value = ''
  additionalDataList.value = []
  selectedFile.value = null
}

// 추가 버튼 클릭 (step 1 -> step 2)
const handleAddData = () => {
  dialogStep.value = 2
}

// 등록 버튼 클릭 (step 2 -> step 3)
const handleRegisterClick = () => {
  dialogStep.value = 3
  selectedFile.value = null
}

// 파일 업로드 박스 클릭
const handleFileBoxClick = () => {
  fileInputRef.value?.click()
}

// 파일 선택 시
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

// 추가 버튼 클릭 (step 3에서 실제 추가)
const handleAddFile = async () => {
  if (!selectedSiteId.value) {
    toast.error('사업장을 선택해주세요')
    return
  }

  if (!selectedFile.value) {
    toast.error('파일을 선택해주세요')
    return
  }

  try {
    // API 호출하여 파일 업로드
    await reportsAPI.uploadAdditionalData(selectedSiteId.value, selectedFile.value)

    // 성공 시 목록에 추가 (파일명만 표시)
    const newData = {
      id: Date.now().toString(),
      name: selectedFile.value.name,
    }
    additionalDataList.value.push(newData)
    toast.success('추가 데이터가 등록되었습니다')

    // Step 2로 돌아가기
    dialogStep.value = 2
    selectedSiteId.value = ''
    selectedFile.value = null

    // 파일 input 초기화
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } catch (error) {
    console.error('파일 업로드 실패:', error)
    toast.error('파일 업로드에 실패했습니다')
  }
}

// 완료 버튼 클릭
const handleComplete = async () => {
  try {
    // 팝업 닫기
    showAdditionalDataDialog.value = false
    dialogStep.value = 1

    // 분석 진행 상태로 변경
    isAnalyzing.value = true

    // 사업장 목록 가져오기
    await sitesStore.fetchSites()
    const siteIds = sitesStore.allSites.map((site) => site.siteId)

    if (siteIds.length === 0) {
      toast.error('등록된 사업장이 없습니다.')
      isAnalyzing.value = false
      return
    }

    // 분석 시작 API 호출
    await analysisAPI.startAllSitesAnalysis(siteIds)

    toast.success('데이터 분석을 시작했습니다')
  } catch (error) {
    console.error('분석 시작 실패:', error)
    toast.error('분석 시작에 실패했습니다')
    isAnalyzing.value = false
  }
}

// 스크롤 함수
const scrollToSection = (sectionId: string) => {
  activeSection.value = sectionId
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="bg-white min-h-screen" :class="{ 'pointer-events-none': showAdditionalDataDialog }">
    <!-- 추가 데이터 등록 팝업 오버레이 -->
    <div
      v-if="showAdditionalDataDialog"
      class="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full pointer-events-auto">
        <!-- Header -->
        <div class="p-6 pb-4 border-b border-gray-100">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">추가 데이터 등록</h2>

          <!-- Progress Bar -->
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-[#EA002C] transition-all duration-300"
              :style="{ width: dialogStep === 1 ? '33%' : dialogStep === 2 ? '66%' : '100%' }"
            ></div>
          </div>
        </div>

        <!-- Step 1: 초기 화면 -->
        <div v-if="dialogStep === 1" class="p-16">
          <div class="space-y-6 text-center">
            <p class="text-lg text-gray-800">
              사업장에 대한 추가 데이터 입력 시 상세한 리포트 생성이 가능합니다.
            </p>
            <p class="text-lg text-gray-700">
              취소를 누르시면 추가 데이터 없이<br />
              기본 데이터를 바탕으로 보고서를 생성합니다.
            </p>
            <p class="text-lg text-gray-700">추가 데이터 등록을 원하시면 추가 버튼을 눌러주세요.</p>
          </div>
        </div>

        <!-- Step 2: 추가 데이터 목록 화면 -->
        <div v-else-if="dialogStep === 2" class="p-6">
          <!-- 추가 데이터 목록 -->
          <div class="border border-gray-200 rounded min-h-[200px]">
            <div
              class="border-b border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between"
            >
              <h3 class="text-sm font-medium text-gray-900">
                추가 데이터 목록 (최대 2건까지 등록 가능)
              </h3>
              <!-- 등록 버튼 -->
              <button
                @click="handleRegisterClick"
                class="px-8 py-1.5 text-sm bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                :disabled="additionalDataList.length >= 2"
              >
                등록
              </button>
            </div>

            <div class="p-4">
              <div v-if="additionalDataList.length === 0" class="text-center py-8 text-gray-500">
                등록된 추가 데이터가 없습니다
              </div>
              <ul v-else class="space-y-2">
                <li
                  v-for="data in additionalDataList"
                  :key="data.id"
                  class="px-4 py-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between"
                >
                  <span class="text-sm text-gray-800">{{ data.name }}</span>
                  <button
                    @click="additionalDataList = additionalDataList.filter((d) => d.id !== data.id)"
                    class="text-xs text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Step 3: 사업장 선택 및 파일 업로드 화면 -->
        <div v-else-if="dialogStep === 3" class="p-6">
          <div class="space-y-6">
            <!-- 사업장 선택 -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">
                사업장명<span class="text-[#EA002C]">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="selectedSiteId"
                  class="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer"
                >
                  <option value="">사업장을 선택해주세요</option>
                  <option v-for="site in sitesStore.allSites" :key="site.siteId" :value="site.siteId">
                    {{ site.siteName }}
                  </option>
                </select>
                <ChevronDown
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  :size="18"
                />
              </div>
            </div>

            <!-- 추가 데이터 파일 -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">
                추가 데이터 파일<span class="text-[#EA002C]">*</span>
              </label>
              <input
                ref="fileInputRef"
                type="file"
                @change="handleFileChange"
                class="hidden"
                accept=".xlsx,.xls,.csv"
              />
              <div
                @click="handleFileBoxClick"
                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#EA002C] hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center justify-center gap-2">
                  <Upload :size="14" :class="selectedFile ? 'text-[#EA002C]' : 'text-gray-500'" />
                  <p class="text-sm" :class="selectedFile ? 'text-[#EA002C]' : 'text-gray-500'">
                    {{ selectedFile ? selectedFile.name : '파일 업로드' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 pt-4 flex justify-center gap-4 border-t border-gray-100">
          <button
            @click="handleCloseDialog"
            class="px-12 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            v-if="dialogStep === 1"
            @click="handleAddData"
            class="px-12 py-3 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
          >
            추가
          </button>
          <button
            v-else-if="dialogStep === 2"
            @click="handleComplete"
            :disabled="additionalDataList.length === 0"
            class="px-12 py-3 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            완료
          </button>
          <button
            v-else-if="dialogStep === 3"
            @click="handleAddFile"
            :disabled="!selectedSiteId || !selectedFile"
            class="px-12 py-3 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            추가
          </button>
        </div>
      </div>
    </div>

    <!-- 상단 헤더 -->
    <div class="border-b border-gray-200 px-8 py-6 bg-white">
      <div>
        <h2 class="text-gray-900 text-xl">기후변화대응(TCFD) 리포트</h2>
        <p class="text-sm text-gray-600 mt-1">
          SK AX의 직접 사업장에 대한 기후 리스크를 분석하고 이를 바탕으로 AI가 작성한
          기후변화대응(TCFD) 보고서를 확인할 수 있습니다.
        </p>
      </div>
    </div>

    <!-- 분석 진행 중 대기 화면 -->
    <div v-if="isAnalyzing" class="px-8 py-32">
      <div class="text-center space-y-4">
        <div class="flex justify-center mb-6">
          <Loader2 :size="48" class="animate-spin text-[#EA002C]" />
        </div>
        <p class="text-lg text-gray-800">데이터 분석 후 리포트를 재작성합니다.</p>
        <p class="text-lg text-gray-700">
          보고서 생성까지 다소 시간이 소요되며, 분석이 끝나면 이메일로 알림을 발송드립니다.
        </p>
      </div>
    </div>

    <div v-else class="px-8">
      <!-- 2열 레이아웃 -->
      <div class="flex">
        <!-- 왼쪽 목차 -->
        <div class="w-64 flex-shrink-0 border-r border-gray-200 pt-6">
          <div class="sticky top-6">
            <nav class="space-y-1">
              <!-- Governance -->
              <div class="mb-4">
                <button
                  @click="scrollToSection('governance')"
                  :class="[
                    'block text-sm font-semibold py-2 text-left w-full pr-6',
                    activeSection === 'governance' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-900 hover:text-[#EA002C]'
                  ]"
                >
                  Governance
                </button>
                <div class="ml-3 space-y-1">
                  <button
                    @click="scrollToSection('governance-1')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'governance-1' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    이사회의 감독
                  </button>
                  <button
                    @click="scrollToSection('governance-2')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'governance-2' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    경영진의 역할
                  </button>
                </div>
              </div>

              <!-- Strategy -->
              <div class="mb-4">
                <button
                  @click="scrollToSection('strategy')"
                  :class="[
                    'block text-sm font-semibold py-2 text-left w-full pr-6',
                    activeSection === 'strategy' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-900 hover:text-[#EA002C]'
                  ]"
                >
                  Strategy
                </button>
                <div class="ml-3 space-y-1">
                  <button
                    @click="scrollToSection('strategy-1')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'strategy-1' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    리스크 및 기회 식별
                  </button>
                  <button
                    @click="scrollToSection('strategy-2')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'strategy-2' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    사업 및 재무 영향
                  </button>
                  <button
                    @click="scrollToSection('strategy-3')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'strategy-3' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    주요 리스크별 영향 분석 및 대응 방안
                  </button>
                </div>
              </div>

              <!-- Risk Management -->
              <div class="mb-4">
                <button
                  @click="scrollToSection('risk-management')"
                  :class="[
                    'block text-sm font-semibold py-2 text-left w-full pr-6',
                    activeSection === 'risk-management' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-900 hover:text-[#EA002C]'
                  ]"
                >
                  Risk Management
                </button>
                <div class="ml-3 space-y-1">
                  <button
                    @click="scrollToSection('risk-management-1')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'risk-management-1' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    리스크 식별 및 평가 프로세스
                  </button>
                  <button
                    @click="scrollToSection('risk-management-2')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'risk-management-2' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    전사적 리스크 관리 체계(ERM) 통합
                  </button>
                  <button
                    @click="scrollToSection('risk-management-3')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'risk-management-3' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    주요 대응 전략
                  </button>
                </div>
              </div>

              <!-- Metrics and Targets -->
              <div class="mb-4">
                <button
                  @click="scrollToSection('metrics')"
                  :class="[
                    'block text-sm font-semibold py-2 text-left w-full pr-6',
                    activeSection === 'metrics' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-900 hover:text-[#EA002C]'
                  ]"
                >
                  Metrics and Targets
                </button>
                <div class="ml-3 space-y-1">
                  <button
                    @click="scrollToSection('metrics-1')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'metrics-1' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    주요 지표: 연평균 자산 손실률(AAL)
                  </button>
                  <button
                    @click="scrollToSection('metrics-2')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'metrics-2' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    목표 및 이행 계획
                  </button>
                </div>
              </div>

              <!-- Appendix -->
              <div>
                <button
                  @click="scrollToSection('appendix')"
                  :class="[
                    'block text-sm font-semibold py-2 text-left w-full pr-6',
                    activeSection === 'appendix' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-900 hover:text-[#EA002C]'
                  ]"
                >
                  Appendix
                </button>
                <div class="ml-3 space-y-1">
                  <button
                    @click="scrollToSection('appendix-1')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'appendix-1' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    용어 정의
                  </button>
                  <button
                    @click="scrollToSection('appendix-2')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'appendix-2' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    시나리오 설명
                  </button>
                  <button
                    @click="scrollToSection('appendix-3')"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === 'appendix-3' ? 'text-[#EA002C] border-r-4 border-[#EA002C]' : 'text-gray-600 hover:text-[#EA002C]'
                    ]"
                  >
                    방법론 상세
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>

        <!-- 오른쪽 컨텐츠 -->
        <div class="flex-1 pl-6 pt-6">
          <div class="p-8 space-y-12">
            <!-- Governance -->
            <section id="governance">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Governance</h2>

              <div id="governance-1" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">이사회의 감독</h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>

              <div id="governance-2" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">경영진의 역할</h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>
            </section>

            <!-- Strategy -->
            <section id="strategy">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Strategy</h2>

              <div id="strategy-1" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">리스크 및 기회 식별</h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>

              <div id="strategy-2" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">사업 및 재무 영향</h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>

              <div id="strategy-3" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">
                  주요 리스크별 영향 분석 및 대응 방안
                </h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>
            </section>

            <!-- Risk Management -->
            <section id="risk-management">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Risk Management</h2>

              <div id="risk-management-1" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">
                  리스크 식별 및 평가 프로세스
                </h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>

              <div id="risk-management-2" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">
                  전사적 리스크 관리 체계(ERM) 통합
                </h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>

              <div id="risk-management-3" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">주요 대응 전략</h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>
            </section>

            <!-- Metrics and Targets -->
            <section id="metrics">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Metrics and Targets</h2>

              <div id="metrics-1" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">
                  주요 지표: 연평균 손실(AAL)
                </h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>

              <div id="metrics-2" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">목표 및 이행 계획</h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>
            </section>

            <!-- Appendix -->
            <section id="appendix">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Appendix</h2>

              <div id="appendix-1" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">용어 정의</h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>

              <div id="appendix-2" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">시나리오 설명</h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>

              <div id="appendix-3" class="mb-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">방법론 상세</h3>
                <div class="text-gray-700 leading-relaxed">(내용)</div>
              </div>
            </section>
          </div>
        </div>
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
