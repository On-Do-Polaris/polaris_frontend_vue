<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Building2, Trash2, Search } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

type SiteEntry = {
  id: string
  name: string
  address: string
  type: string
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  complete: []
}>()

const currentStep = ref(0)
const showAddSiteDialog = ref(false)
const siteList = ref<SiteEntry[]>([])
const siteName = ref('')
const siteAddress = ref('')
const siteType = ref('')

const steps = [
  { title: '사업장 추가 방법', singleColumn: true },
  { title: '사업장 등록', singleColumn: false },
] as const

const instructions = [
  { label: '사업장명 입력', description: "대시보드에서 '+' 버튼을 클릭하여 사업장명을 입력하세요" },
  {
    label: '자동 매핑',
    description: '내부 DB와 공식 데이터(기상청, 환경부 등)가 자동으로 매핑됩니다',
  },
  {
    label: '리스크 분석',
    description: '물리적 리스크, 연평균 자산 손실률(AAL) 및 취약성을 분석합니다.',
  },
  { label: '리포트 생성', description: '종합 리포트가 자동으로 생성되어 다운로드 가능합니다' },
]

const currentStepData = computed(() => steps[currentStep.value] ?? steps[0])

const resetFlow = () => {
  currentStep.value = 0
  siteList.value = []
  siteName.value = ''
  siteAddress.value = ''
  siteType.value = ''
  showAddSiteDialog.value = false
}

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      resetFlow()
    }
  },
)

const handleNext = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value += 1
  } else {
    emit('complete')
    resetFlow()
  }
}

const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1
  }
}

const handleModalChange = (open: boolean) => {
  if (!open) {
    // X 버튼 클릭 시 로그아웃 처리
    authStore.handleLogout()
  }
}

const handleDeleteSite = (id: string) => {
  siteList.value = siteList.value.filter((site) => site.id !== id)
}

const handleAddSite = () => {
  if (!siteName.value || !siteAddress.value || !siteType.value) return

  siteList.value = [
    ...siteList.value,
    {
      id: Date.now().toString(),
      name: siteName.value,
      address: siteAddress.value,
      type: siteType.value,
    },
  ]

  siteName.value = ''
  siteAddress.value = ''
  siteType.value = ''
  showAddSiteDialog.value = false
}

const isAddDisabled = computed(() => !siteName.value || !siteAddress.value || !siteType.value)
</script>

<template>
  <div>
    <Dialog :open="isOpen" @update:open="handleModalChange">
      <DialogContent class="max-w-6xl p-0 gap-0">
        <DialogTitle class="sr-only">{{ currentStepData.title }}</DialogTitle>
        <DialogDescription class="sr-only">
          온보딩 가이드 - {{ currentStep + 1 }}/{{ steps.length }} 단계
        </DialogDescription>

        <div class="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 class="text-gray-800">{{ currentStepData.title }}</h2>
          <div class="flex gap-2 mt-3">
            <div
              v-for="(_, index) in steps"
              :key="index"
              :class="[
                'h-1 flex-1 transition-colors',
                index <= currentStep ? 'bg-[#dc042b]' : 'bg-gray-200',
              ]"
            />
          </div>
        </div>

        <div class="p-8">
          <div v-if="currentStep === 0" class="max-w-2xl mx-auto">
            <h3 class="text-xl text-gray-800 mb-6 text-center">사업장 추가는 이렇게 해요</h3>
            <div class="space-y-6">
              <div
                v-for="(instruction, index) in instructions"
                :key="instruction.label"
                class="flex gap-4"
              >
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full bg-[#dc042b] text-white flex items-center justify-center"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="mb-1">{{ instruction.label }}</p>
                  <p class="text-sm text-gray-500">
                    {{ instruction.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="grid grid-cols-2 gap-8">
            <div>
              <h3 class="text-gray-800 mb-4">사업장 목록</h3>
              <div
                v-if="siteList.length === 0"
                class="flex flex-col items-center justify-center py-12 text-center"
              >
                <div
                  class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"
                >
                  <Building2 :size="32" class="text-gray-400" />
                </div>
                <p class="text-gray-500 mb-2">등록된 사업장이 없습니다</p>
                <p class="text-sm text-gray-400">오른쪽 '+' 버튼을 눌러 첫 사업장을 추가해보세요</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="site in siteList"
                  :key="site.id"
                  class="p-4 bg-white border border-gray-200 shadow-sm group relative"
                >
                  <button
                    @click="handleDeleteSite(site.id)"
                    class="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 :size="16" />
                  </button>
                  <div class="flex items-center gap-2 mb-2">
                    <Building2 :size="18" class="text-[#dc042b]" />
                    <span>{{ site.name }}</span>
                  </div>
                  <div class="text-sm text-gray-500 mb-2">
                    {{ site.address }}
                  </div>
                  <div class="flex gap-2">
                    <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {{ site.type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-center h-full">
              <div class="text-center">
                <button
                  @click="showAddSiteDialog = true"
                  class="w-32 h-32 mx-auto mb-4 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#dc042b] hover:bg-[#dc042b]/5 transition-colors cursor-pointer"
                >
                  <div class="text-gray-400 hover:text-[#dc042b] transition-colors">
                    <div class="w-12 h-12 mx-auto mb-2 flex items-center justify-center text-4xl">
                      +
                    </div>
                    <p class="text-sm">사업장 추가</p>
                  </div>
                </button>
                <p class="text-sm text-gray-500 mt-4">
                  새로운 사업장을 등록하고<br />
                  리스크 분석을 시작하세요
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 px-6 py-4 flex justify-between">
          <button
            @click="handlePrev"
            :disabled="currentStep === 0"
            class="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <button
            @click="handleNext"
            class="px-6 py-2 bg-[#dc042b] text-white hover:bg-[#b8031f] transition-colors"
          >
            {{ currentStep === steps.length - 1 ? '시작하기' : '다음' }}
          </button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog :open="showAddSiteDialog" @update:open="showAddSiteDialog = $event">
      <DialogContent class="max-w-lg">
        <DialogTitle>사업장 추가</DialogTitle>
        <DialogDescription> 새로운 사업장 정보를 입력하세요 </DialogDescription>

        <div class="space-y-5 mt-6">
          <div>
            <label class="block text-sm mb-2 text-gray-700">
              사업장명 <span class="text-[#dc042b]">*</span>
            </label>
            <input
              v-model="siteName"
              type="text"
              class="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-[#dc042b] focus:ring-1 focus:ring-[#dc042b] transition-colors"
              placeholder="예: 부산 물류센터"
            />
          </div>

          <div>
            <label class="block text-sm mb-2 text-gray-700">
              주소 <span class="text-[#dc042b]">*</span>
            </label>
            <div class="relative">
              <input
                v-model="siteAddress"
                type="text"
                class="w-full px-4 py-2.5 pr-12 border border-gray-300 focus:outline-none focus:border-[#dc042b] focus:ring-1 focus:ring-[#dc042b] transition-colors"
                placeholder="예: 부산광역시 해운대구 센텀중앙로 78"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#dc042b] hover:bg-gray-100 rounded transition-colors"
              >
                <Search :size="18" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm mb-2 text-gray-700">
              업종 <span class="text-[#dc042b]">*</span>
            </label>
            <input
              v-model="siteType"
              type="text"
              class="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-[#dc042b] focus:ring-1 focus:ring-[#dc042b] transition-colors"
              placeholder="예: 물류"
            />
          </div>
        </div>

        <div class="flex gap-3 mt-8 justify-center">
          <button
            @click="showAddSiteDialog = false"
            class="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
          >
            취소
          </button>
          <button
            @click="handleAddSite"
            :disabled="isAddDisabled"
            class="px-8 py-2.5 bg-[#dc042b] text-white hover:bg-[#b8031f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            추가
          </button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
