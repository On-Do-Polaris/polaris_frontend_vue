<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Building2, Trash2, Save, Search, X, Loader2 } from 'lucide-vue-next'
import { useSitesStore, type Site } from '@/store/sites'
import { useMeta } from '@/composables/useMeta'
import { toast } from 'vue-sonner'
import type { CreateSiteRequest, UpdateSiteRequest } from '@/api/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const sitesStore = useSitesStore()
const { industries, fetchIndustries } = useMeta()
const sites = computed(() => sitesStore.allSites)
const loading = computed(() => sitesStore.loading)
const error = computed(() => sitesStore.error)

const editingSiteId = ref<string | null>(null)
const editFormData = ref<{
  name?: string
  location?: string
  address?: string
  type?: string
}>({})
const deleteConfirmDialog = ref<{ open: boolean; siteId: string | null }>({
  open: false,
  siteId: null
})

const newSite = ref({
  name: '',
  location: '',
  address: '',
  type: ''
})

// 컴포넌트 마운트 시 사업장 목록 및 산업 분류 로드
onMounted(async () => {
  await sitesStore.fetchSites()
  await fetchIndustries()
})

const handleDelete = (siteId: string) => {
  deleteConfirmDialog.value = { open: true, siteId }
}

const confirmDelete = async () => {
  if (deleteConfirmDialog.value.siteId) {
    try {
      await sitesStore.deleteSite(deleteConfirmDialog.value.siteId)
    } catch (err) {
      // 에러는 store에서 처리됨
      console.error('삭제 실패:', err)
    }
  }
  deleteConfirmDialog.value = { open: false, siteId: null }
}

const handleEdit = (site: Site) => {
  editingSiteId.value = site.siteId
  editFormData.value = {
    name: site.siteName,
    location: site.location,
    address: site.location, // API 응답에 address가 없으므로 location 사용
    type: site.siteType
  }
}

const handleCancelEdit = () => {
  editingSiteId.value = null
  editFormData.value = {}
}

const handleSaveEdit = async () => {
  if (!editingSiteId.value) return

  // 폼 입력 검증
  if (!editFormData.value.name || !editFormData.value.location || !editFormData.value.type) {
    toast.error('필수 항목을 모두 입력해주세요.')
    return
  }

  try {
    const updateData: UpdateSiteRequest = {
      name: editFormData.value.name,
      location: editFormData.value.location,
      address: editFormData.value.address,
      type: editFormData.value.type
    }
    await sitesStore.updateSite(editingSiteId.value, updateData)
    editingSiteId.value = null
    editFormData.value = {}
  } catch (err) {
    // 에러는 store에서 처리됨
    console.error('수정 실패:', err)
  }
}

const handleAddSite = async () => {
  // 폼 입력 검증
  if (!newSite.value.name || !newSite.value.location || !newSite.value.type) {
    toast.error('필수 항목을 모두 입력해주세요.')
    return
  }

  try {
    const createData: CreateSiteRequest = {
      name: newSite.value.name,
      location: newSite.value.location,
      address: newSite.value.address || newSite.value.location,
      type: newSite.value.type
    }
    await sitesStore.createSite(createData)
    // 폼 초기화
    newSite.value = {
      name: '',
      location: '',
      address: '',
      type: ''
    }
  } catch (err) {
    // 에러는 store에서 처리됨
    console.error('생성 실패:', err)
  }
}
</script>

<template>
  <div class="bg-white">
    <!-- 상단 헤더 -->
    <div class="border-b border-gray-200 px-8 py-6 bg-white">
      <h2 class="text-gray-900 text-xl">사업장 관리</h2>
      <p class="text-sm text-gray-600 mt-1">
        등록된 사업장을 관리하고 새로운 사업장을 추가할 수 있습니다.
      </p>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="flex">
      <!-- 왼쪽: 사업장 목록 -->
      <div class="w-1/2 border-r border-gray-200 p-8 bg-white">
        <div>
          <h3 class="text-gray-800 mb-4">등록된 사업장</h3>

          <!-- 로딩 상태 -->
          <div v-if="loading && sites.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 class="animate-spin text-[#EA002C] mb-4" :size="40" />
            <p class="text-gray-500">사업장 목록을 불러오는 중입니다...</p>
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <X :size="40" class="text-red-600" />
            </div>
            <p class="text-gray-900 font-medium mb-2">데이터를 불러오는데 실패했습니다</p>
            <p class="text-sm text-gray-500 mb-4">{{ error.message }}</p>
            <button
              @click="sitesStore.fetchSites()"
              class="px-6 py-2.5 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
            >
              다시 시도
            </button>
          </div>

          <!-- 빈 상태 -->
          <div v-else-if="!loading && sites.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Building2 :size="40" class="text-gray-400" />
            </div>
            <p class="text-gray-500 mb-2">등록된 사업장이 없습니다</p>
            <p class="text-sm text-gray-400">
              오른쪽 패널에서 새 사업장을 추가해보세요
            </p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="site in sites" :key="site.siteId" class="p-4 bg-white border border-gray-200 shadow-sm group relative">
              <div v-if="editingSiteId === site.siteId" class="space-y-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">사업장명 *</label>
                  <input
                    type="text"
                    v-model="editFormData.name"
                    class="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#EA002C]"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">위치 *</label>
                  <input
                    type="text"
                    v-model="editFormData.location"
                    class="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#EA002C]"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">주소 *</label>
                  <input
                    type="text"
                    v-model="editFormData.address"
                    class="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#EA002C]"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">산업 분류 *</label>
                  <select
                    v-model="editFormData.type"
                    class="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#EA002C] bg-white"
                  >
                    <option value="">산업 분류 선택</option>
                    <option v-for="industry in industries" :key="industry.id" :value="industry.code">
                      {{ industry.name }}
                    </option>
                  </select>
                </div>
                <div class="flex gap-2 pt-2">
                  <button
                    @click="handleSaveEdit"
                    class="flex-1 px-4 py-2 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Save :size="16" />
                    저장
                  </button>
                  <button
                    @click="handleCancelEdit"
                    class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <X :size="16" />
                    취소
                  </button>
                </div>
              </div>
              <div v-else>
                <button
                  @click="handleDelete(site.siteId)"
                  class="absolute top-2 right-2 p-1 text-gray-400 hover:text-[#EA002C] hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 :size="16" />
                </button>
                <div class="flex items-center gap-2 mb-2">
                  <Building2 :size="18" class="text-[#EA002C]" />
                  <span class="text-gray-900">{{ site.siteName }}</span>
                </div>
                <div class="text-sm text-gray-500 mb-2">
                  {{ site.location }}
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700">{{
                    site.siteType
                  }}</span>
                  <button
                    @click="handleEdit(site)"
                    class="text-xs text-[#F47725] hover:underline"
                  >
                    수정
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 오른쪽: 새 사업장 추가 -->
      <div class="w-1/2 p-8 bg-white">
        <div>
          <h3 class="text-gray-800 mb-4">새 사업장 추가</h3>
          <div class="bg-white border border-gray-200 p-6">
            <form @submit.prevent="handleAddSite" class="space-y-5">
              <div>
                <label class="block text-sm mb-2 text-gray-700">
                  사업장명 <span class="text-[#EA002C]">*</span>
                </label>
                <input
                  type="text"
                  v-model="newSite.name"
                  class="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] transition-colors"
                  placeholder="예: 부산 물류센터"
                  required
                />
              </div>

              <div>
                <label class="block text-sm mb-2 text-gray-700">
                  위치 <span class="text-[#EA002C]">*</span>
                </label>
                <input
                  type="text"
                  v-model="newSite.location"
                  class="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] transition-colors"
                  placeholder="예: 부산광역시 해운대구"
                  required
                />
              </div>

              <div>
                <label class="block text-sm mb-2 text-gray-700">
                  주소 <span class="text-[#EA002C]">*</span>
                </label>
                <div class="relative">
                  <input
                    type="text"
                    v-model="newSite.address"
                    class="w-full px-4 py-2.5 pr-12 border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] transition-colors"
                    placeholder="예: 부산광역시 해운대구 센텀중앙로 78"
                    required
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#EA002C] hover:bg-gray-100 rounded transition-colors"
                    @click="toast.info('주소 검색 기능은 준비 중입니다.')"
                  >
                    <Search :size="18" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm mb-2 text-gray-700">
                  산업 분류 <span class="text-[#EA002C]">*</span>
                </label>
                <select
                  v-model="newSite.type"
                  class="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] transition-colors bg-white"
                  required
                >
                  <option value="">산업 분류를 선택하세요</option>
                  <option v-for="industry in industries" :key="industry.id" :value="industry.code">
                    {{ industry.name }} ({{ industry.category }})
                  </option>
                </select>
              </div>

              <div class="pt-4">
                <button
                  type="submit"
                  :disabled="!newSite.name || !newSite.location || !newSite.type || loading"
                  class="w-full bg-[#EA002C] text-white py-2.5 hover:bg-[#C4002A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center flex items-center justify-center gap-2"
                >
                  <Loader2 v-if="loading" class="animate-spin" :size="18" />
                  <span>{{ loading ? '처리 중...' : '사업장 추가' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <Dialog :open="deleteConfirmDialog.open" @update:open="deleteConfirmDialog.open = $event">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>사업장 삭제 확인</DialogTitle>
          <DialogDescription>
            이 사업장을 삭제하시겠습니까? 삭제된 사업장은 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            @click="deleteConfirmDialog.open = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            @click="confirmDelete"
            class="px-4 py-2 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
          >
            삭제
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
