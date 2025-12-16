<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Loader2, Upload, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useSitesStore } from '@/store/sites'
import { reportsAPI } from '@/api/reports'
import { analysisAPI } from '@/api/analysis'
import { toast } from 'vue-sonner'
import apiClient from '@/api/client'

console.log('[ReportView] Component loaded')

const sitesStore = useSitesStore()

// 보고서 타입 정의
interface ReportBlock {
  type: 'text' | 'table'
  subheading?: string
  content?: string
  title?: string
  headers?: Array<{ text: string; value: string }>
  items?: Array<Record<string, { value: string; bg_color: string } | string>>
  legend?: Array<{ color: string; label: string }>
}

interface ReportSection {
  section_id: string
  title: string
  blocks: ReportBlock[]
}

interface ReportData {
  report_id: string
  meta: {
    title: string
  }
  sections: ReportSection[]
}

// 추가 데이터 등록 팝업
const showAdditionalDataDialog = ref(false)
const dialogStep = ref(1) // 1: 초기 화면, 2: 목록 화면, 3: 파일 업로드 화면
const selectedSiteId = ref('')
const additionalDataList = ref<Array<{ id: string; name: string }>>([])
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 분석 진행 상태
const isAnalyzing = ref(false)

// 보고서 데이터
const reportData = ref<ReportData | null>(null)

// 현재 활성화된 섹션
const activeSection = ref('')

// Intersection Observer
let observer: IntersectionObserver | null = null

// 보고서 데이터 가져오기
const fetchReportData = async () => {
  try {
    console.log('보고서 데이터 로드 시작...')
    const response = await apiClient.get('/report')
    console.log('보고서 데이터 전체 응답:', response.data)

    // API 응답이 { result: 'success', data: {...} } 형태인 경우
    if (response.data.data) {
      reportData.value = response.data.data
    } else {
      reportData.value = response.data
    }

    console.log('파싱된 보고서 데이터:', reportData.value)

    // 첫 번째 섹션을 활성화
    if (
      reportData.value?.sections &&
      Array.isArray(reportData.value.sections) &&
      reportData.value.sections.length > 0
    ) {
      activeSection.value = reportData.value.sections[0]?.section_id || ''
      console.log('첫 번째 섹션 활성화:', activeSection.value)
    }
  } catch (error) {
    console.error('보고서 데이터 로드 실패:', error)
    toast.error('보고서 데이터를 불러오는데 실패했습니다')
  }
}

// 사업장 목록 로드 및 팝업 표시
onMounted(async () => {
  if (sitesStore.allSites.length === 0) {
    await sitesStore.fetchSites()
  }

  // 스크롤 이벤트 리스너 등록
  window.addEventListener('scroll', handleScroll)

  // 분석 상태 확인
  try {
    const statusResponse = await analysisAPI.getOverallAnalysisStatus()
    const status = statusResponse.data.status

    console.log('분석 상태:', status)

    if (status === 'ing') {
      // 분석 진행 중이면 로딩 화면 표시
      isAnalyzing.value = true
      return // 팝업 표시하지 않음
    }

    // ing가 아니면 보고서 데이터 로드
    await fetchReportData()
    setupIntersectionObserver()

    // done 상태면 추가 데이터 등록 팝업 표시
    if (status === 'done') {
      showAdditionalDataDialog.value = true
    }
    // done-a 상태면 팝업 표시하지 않음
  } catch (error) {
    console.error('분석 상태 확인 실패:', error)
    // 에러 시 무시하고 계속 진행
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  window.removeEventListener('scroll', handleScroll)
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

  // 모든 섹션 관찰 (동적으로 생성된 섹션들)
  setTimeout(() => {
    if (!reportData.value?.sections) return

    reportData.value.sections.forEach((section) => {
      const element = document.getElementById(section.section_id)
      if (element) {
        observer?.observe(element)
      }

      // subheading도 관찰
      section.blocks.forEach((block, index) => {
        if (block.subheading) {
          const subElement = document.getElementById(`${section.section_id}-${index}`)
          if (subElement) {
            observer?.observe(subElement)
          }
        }
      })
    })
  }, 100)
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

    setTimeout(async () => {
      await fetchReportData()
      isAnalyzing.value = false
      setupIntersectionObserver()
    }, 2000)
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

// 테이블 셀 값 가져오기
const getCellValue = (cellData: any): string => {
  if (typeof cellData === 'string') {
    return cellData
  }
  if (cellData && typeof cellData === 'object' && 'value' in cellData) {
    return cellData.value
  }
  return ''
}

// 테이블 셀 배경색 클래스 가져오기
const getCellBgColor = (cellData: any): string => {
  if (cellData && typeof cellData === 'object' && 'bg_color' in cellData) {
    const color = cellData.bg_color
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800'
      case 'orange':
        return 'bg-orange-100 text-orange-800'
      case 'red':
        return 'bg-red-100 text-red-800'
      default:
        return 'text-gray-700'
    }
  }
  return 'text-gray-700'
}

// 범례 색상 클래스 가져오기
const getLegendColorClass = (color: string): string => {
  switch (color) {
    case 'green':
      return 'bg-green-500'
    case 'yellow':
      return 'bg-yellow-500'
    case 'orange':
      return 'bg-orange-500'
    case 'red':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

// 스크롤 투 탑 버튼 표시 여부
const showScrollTop = ref(false)

// 스크롤 이벤트 리스너
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

// 페이지 맨 위로 스크롤
const scrollToTop = () => {
  const topElement = document.getElementById('report-top')
  if (topElement) {
    topElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
                  <option
                    v-for="site in sitesStore.allSites"
                    :key="site.siteId"
                    :value="site.siteId"
                  >
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
    <div id="report-top" class="border-b border-gray-200 px-8 py-6 bg-white">
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

    <!-- 보고서 로딩 중 -->
    <div v-else-if="!reportData" class="px-8 py-32">
      <div class="text-center space-y-4">
        <div class="flex justify-center mb-6">
          <Loader2 :size="48" class="animate-spin text-[#EA002C]" />
        </div>
        <p class="text-lg text-gray-800">보고서를 불러오는 중입니다...</p>
      </div>
    </div>

    <!-- 보고서 내용 표시 -->
    <div v-else class="px-15">
      <!-- 2열 레이아웃 -->
      <div class="flex">
        <!-- 왼쪽 목차 -->
        <div class="w-65 flex-shrink-0 border-r border-gray-200 pt-6 pl-10">
          <div class="sticky top-6">
            <nav class="space-y-1">
              <!-- 동적 목차 -->
              <div v-for="section in reportData?.sections" :key="section.section_id" class="mb-4">
                <button
                  @click="scrollToSection(section.section_id)"
                  :class="[
                    'block text-sm font-semibold py-2 text-left w-full pr-6',
                    activeSection === section.section_id
                      ? 'text-[#EA002C] border-r-4 border-[#EA002C]'
                      : 'text-gray-900 hover:text-[#EA002C]',
                  ]"
                >
                  {{ section.title }}
                </button>
                <!-- subheading 목차 -->
                <div class="ml-3 space-y-1">
                  <button
                    v-for="(block, index) in section.blocks"
                    :key="`${section.section_id}-${index}`"
                    v-show="block.subheading"
                    @click="scrollToSection(`${section.section_id}-${index}`)"
                    :class="[
                      'block text-sm py-1 text-left w-full pr-6',
                      activeSection === `${section.section_id}-${index}`
                        ? 'text-[#EA002C] border-r-4 border-[#EA002C]'
                        : 'text-gray-600 hover:text-[#EA002C]',
                    ]"
                  >
                    {{ block.subheading }}
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>

        <!-- 오른쪽 컨텐츠 -->
        <div class="flex-1 pl-6 pt-6 pr-12">
          <div class="p-8 space-y-12">
            <!-- 동적 섹션 렌더링 -->
            <section
              v-for="section in reportData?.sections"
              :key="section.section_id"
              :id="section.section_id"
            >
              <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ section.title }}</h2>

              <!-- 블록 렌더링 -->
              <div
                v-for="(block, index) in section.blocks"
                :key="`${section.section_id}-${index}`"
                :id="`${section.section_id}-${index}`"
                class="mb-8"
              >
                <!-- Text 블록 -->
                <div v-if="block.type === 'text'">
                  <h3 v-if="block.subheading" class="text-xl font-semibold text-gray-900 mb-4">
                    {{ block.subheading }}
                  </h3>
                  <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {{ block.content }}
                  </div>
                </div>

                <!-- Table 블록 -->
                <div v-else-if="block.type === 'table'">
                  <h3 v-if="block.title" class="text-xl font-semibold text-gray-900 mb-2">
                    {{ block.title }}
                  </h3>
                  <p v-if="block.subheading" class="text-sm text-gray-600 mb-4">
                    {{ block.subheading }}
                  </p>

                  <!-- 테이블 -->
                  <div class="mb-4">
                    <table
                      class="w-full"
                      style="
                        border-top: 1.5px solid rgb(25, 25, 25);
                        border-bottom: 1.5px solid rgb(25, 25, 25);
                      "
                    >
                      <thead style="background-color: rgb(250, 250, 250)">
                        <tr class="border-b border-gray-300">
                          <th
                            v-for="(header, headerIndex) in block.headers"
                            :key="header.value"
                            class="px-4 py-3 text-left text-sm font-medium text-gray-900"
                            :class="{ 'border-l border-gray-300': headerIndex > 0 }"
                          >
                            {{ header.text }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white">
                        <tr
                          v-for="(item, itemIndex) in block.items"
                          :key="itemIndex"
                          class="border-b border-gray-300 last:border-b-0"
                        >
                          <td
                            v-for="(header, headerIndex) in block.headers"
                            :key="`${itemIndex}-${header.value}`"
                            class="px-4 py-3 text-sm"
                            :class="[
                              getCellBgColor(item[header.value]),
                              { 'border-l border-gray-300': headerIndex > 0 },
                            ]"
                          >
                            {{ getCellValue(item[header.value]) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Legend -->
                  <div v-if="block.legend" class="flex flex-wrap gap-4">
                    <div
                      v-for="legendItem in block.legend"
                      :key="legendItem.color"
                      class="flex items-center gap-2"
                    >
                      <div
                        class="w-4 h-4 rounded"
                        :class="getLegendColorClass(legendItem.color)"
                      ></div>
                      <span class="text-sm text-gray-600">{{ legendItem.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- 스크롤 투 탑 버튼 -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <button
        v-if="!isAnalyzing && reportData"
        @click="scrollToTop"
        class="fixed bottom-10 right-10 bg-[#EA002C] text-white p-3 rounded-full hover:bg-[#C4002A] hover:scale-110 transition-all duration-300 z-50"
        aria-label="맨 위로 이동"
      >
        <ChevronUp :size="24" :stroke-width="2.5" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
@media print {
  button {
    display: none;
  }
}
</style>
