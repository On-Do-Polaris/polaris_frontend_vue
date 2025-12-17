<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Building2, Trash2, Save, Search, X, Loader2, ChevronDown } from 'lucide-vue-next'
import { useSitesStore, type SiteInfo } from '@/store/sites'
import { useMeta } from '@/composables/useMeta'
import { toast } from 'vue-sonner'
import type { CreateSiteRequest, UpdateSiteRequest } from '@/api/types'
import { analysisAPI } from '@/api'
import LocationPicker from '@/components/map/LocationPicker.vue'
import { useDaumPostcode } from '@/composables/useDaumPostcode'
import { useVWorld } from '@/composables/useVWorld'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

console.log('[SiteManagementView] Component loaded')

const sitesStore = useSitesStore()
const { industries, fetchIndustries } = useMeta()
const sites = computed(() => sitesStore.allSites)
const loading = computed(() => sitesStore.loading)
const error = computed(() => sitesStore.error)

// 산업 분류 코드를 한국어 이름으로 변환
const getIndustryName = (code: string) => {
  const industry = industries.value.find((i) => i.code === code)
  return industry?.name || code
}

const editingSiteId = ref<string | null>(null)
const editFormData = ref<{
  name?: string
  location?: string
  address?: string
  type?: string
  latitude?: number
  longitude?: number
  roadAddress?: string
  jibunAddress?: string
}>({})
const deleteConfirmDialog = ref<{ open: boolean; siteId: string | null }>({
  open: false,
  siteId: null,
})

const newSite = ref<{
  name: string
  location: string
  address: string
  type: string
  latitude?: number
  longitude?: number
  roadAddress?: string
  jibunAddress?: string
}>({
  name: '',
  location: '',
  address: '',
  type: '',
  latitude: undefined,
  longitude: undefined,
  roadAddress: undefined,
  jibunAddress: undefined,
})
const isGeocoding = ref(false)

// 주소 검색 API (Daum Postcode)
const { openAddressPopup } = useDaumPostcode()

// VWorld Geocoder API
const { geocodeAddress } = useVWorld()

// 주소 검색 팝업 열기 (신규 등록)
const handleSearchAddress = async () => {
  openAddressPopup(async (result) => {
    console.log('주소 선택:', result)
    // 화면 표시용: 전체 주소
    newSite.value.address = result.fullAddress
    // 시도 + 시군구로 location 설정
    newSite.value.location = result.location
    // 도로명 주소
    newSite.value.roadAddress = result.roadAddress
    // 지번 주소
    newSite.value.jibunAddress = result.jibunAddress || undefined
    console.log('설정된 주소:', newSite.value.address)
    console.log('설정된 위치:', newSite.value.location)
    console.log('도로명 주소:', newSite.value.roadAddress)
    console.log('지번 주소:', newSite.value.jibunAddress)

    // 카카오 Geocoder API로 주소에서 좌표 변환
    isGeocoding.value = true
    try {
      console.log('[SiteManagement] 지오코딩 시작:', result.roadAddress)
      // 좌표 변환용 도로명주소 사용
      const coords = await geocodeAddress(result.roadAddress)
      console.log('[SiteManagement] 지오코딩 결과:', coords)

      if (coords) {
        newSite.value.latitude = coords.latitude
        newSite.value.longitude = coords.longitude
        console.log('[SiteManagement] 좌표 저장 완료:', {
          latitude: newSite.value.latitude,
          longitude: newSite.value.longitude,
        })
        toast.success('주소와 좌표가 설정되었습니다')
      } else {
        console.warn('[SiteManagement] 좌표 변환 실패')
        toast.warning('주소는 설정되었으나 좌표 변환에 실패했습니다. 지도에서 직접 선택해주세요.')
      }
    } catch (error) {
      console.error('[SiteManagement] 좌표 변환 오류:', error)
      toast.warning('좌표 변환 중 오류가 발생했습니다. 지도에서 직접 선택해주세요.')
    } finally {
      isGeocoding.value = false
    }
  })
}

// 주소 검색 팝업 열기 (수정)
const handleSearchAddressForEdit = async () => {
  openAddressPopup(async (result) => {
    console.log('주소 선택:', result)
    // 화면 표시용: 전체 주소
    editFormData.value.address = result.fullAddress
    // 시도 + 시군구로 location 설정
    editFormData.value.location = result.location
    // 도로명 주소
    editFormData.value.roadAddress = result.roadAddress
    // 지번 주소
    editFormData.value.jibunAddress = result.jibunAddress || undefined

    // 카카오 Geocoder API로 주소에서 좌표 변환
    isGeocoding.value = true
    try {
      const coords = await geocodeAddress(result.roadAddress)
      if (coords) {
        editFormData.value.latitude = coords.latitude
        editFormData.value.longitude = coords.longitude
        toast.success('주소와 좌표가 설정되었습니다')
      } else {
        toast.warning('주소는 설정되었으나 좌표 변환에 실패했습니다. 지도에서 직접 선택해주세요.')
      }
    } catch (error) {
      console.error('좌표 변환 오류:', error)
      toast.warning('좌표 변환 중 오류가 발생했습니다. 지도에서 직접 선택해주세요.')
    } finally {
      isGeocoding.value = false
    }
  })
}

// 지도에서 위치 선택 핸들러 (신규 등록)
const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
  newSite.value.latitude = location.latitude
  newSite.value.longitude = location.longitude
}

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

const handleEdit = (site: SiteInfo) => {
  editingSiteId.value = site.siteId
  editFormData.value = {
    name: site.siteName,
    location: site.location || `${site.roadAddress || site.jibunAddress || ''}`,
    address: site.roadAddress || site.jibunAddress || site.location || '',
    type: site.siteType,
    latitude: site.latitude,
    longitude: site.longitude,
    roadAddress: site.roadAddress,
    jibunAddress: site.jibunAddress,
  }
}

const handleCancelEdit = () => {
  editingSiteId.value = null
  editFormData.value = {}
}

const handleSaveEdit = async () => {
  if (!editingSiteId.value) return

  // 폼 입력 검증
  if (!editFormData.value.name || !editFormData.value.address || !editFormData.value.type) {
    toast.error('필수 항목을 모두 입력해주세요.')
    return
  }

  try {
    const updateData: UpdateSiteRequest = {
      name: editFormData.value.name,
      roadAddress: editFormData.value.roadAddress,
      jibunAddress: editFormData.value.jibunAddress,
      latitude: editFormData.value.latitude,
      longitude: editFormData.value.longitude,
      type: editFormData.value.type,
    }
    await sitesStore.updateSite(editingSiteId.value, updateData)
    editingSiteId.value = null
    editFormData.value = {}
  } catch (err) {
    console.error('수정 실패:', err)
  }
}

const handleAddSite = async () => {
  // 폼 입력 검증
  if (!newSite.value.name || !newSite.value.address || !newSite.value.type) {
    toast.error('필수 항목을 모두 입력해주세요.')
    return
  }

  try {
    const createData: CreateSiteRequest = {
      name: newSite.value.name,
      location: newSite.value.location, // 시도 + 시군구
      address: newSite.value.address, // 도로명주소
      type: newSite.value.type,
      latitude: newSite.value.latitude,
      longitude: newSite.value.longitude,
      roadAddress: newSite.value.roadAddress,
      jibunAddress: newSite.value.jibunAddress,
    }
    const createdSite = await sitesStore.createSite(createData)

    // 사업장 생성 성공 후 분석 시작
    await analysisAPI.startAllSitesAnalysis([createdSite.siteId])

    // 폼 초기화
    newSite.value = {
      name: '',
      location: '',
      address: '',
      type: '',
      latitude: undefined,
      longitude: undefined,
      roadAddress: undefined,
      jibunAddress: undefined,
    }
  } catch (err) {
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
          <div
            v-if="loading && sites.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <Loader2 class="animate-spin text-[#EA002C] mb-4" :size="40" />
            <p class="text-gray-500">사업장 목록을 불러오는 중입니다...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="error"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
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
          <div
            v-else-if="!loading && sites.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Building2 :size="40" class="text-gray-400" />
            </div>
            <p class="text-gray-500 mb-2">등록된 사업장이 없습니다</p>
            <p class="text-sm text-gray-400">오른쪽 패널에서 새 사업장을 추가해보세요</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="site in sites"
              :key="site.siteId"
              class="p-4 bg-white border border-gray-200 shadow-sm group relative"
            >
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
                  <label class="block text-xs text-gray-600 mb-1">주소 *</label>
                  <div class="relative">
                    <input
                      type="text"
                      v-model="editFormData.address"
                      @click="handleSearchAddressForEdit"
                      readonly
                      :style="editFormData.address ? 'color: #000 !important;' : ''"
                      class="w-full px-3 py-2 pr-14 border border-gray-300 text-sm focus:outline-none focus:border-[#EA002C] cursor-pointer bg-white placeholder:text-gray-400"
                      :placeholder="editFormData.address ? '' : '클릭하여 주소 입력'"
                    />
                    <button
                      type="button"
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#EA002C] hover:bg-gray-100 rounded transition-colors"
                      @click="handleSearchAddressForEdit"
                    >
                      <Search :size="16" />
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">산업 분류 *</label>
                  <div class="relative">
                    <select
                      v-model="editFormData.type"
                      class="w-full appearance-none px-3 py-2 pr-10 border border-gray-300 text-sm focus:outline-none focus:border-[#EA002C] bg-white cursor-pointer"
                    >
                      <option value="">산업 분류 선택</option>
                      <option
                        v-for="industry in industries"
                        :key="industry.id"
                        :value="industry.code"
                      >
                        {{ industry.name }}
                      </option>
                    </select>
                    <ChevronDown
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      :size="16"
                    />
                  </div>
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
                  {{ site.roadAddress || site.jibunAddress || site.location || '-' }}
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700">{{
                    getIndustryName(site.siteType)
                  }}</span>
                  <button @click="handleEdit(site)" class="text-xs text-[#F47725] hover:underline">
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
                  주소 <span class="text-[#EA002C]">*</span>
                </label>
                <div class="relative">
                  <input
                    type="text"
                    v-model="newSite.address"
                    @click="handleSearchAddress"
                    readonly
                    :style="newSite.address ? 'color: #000 !important;' : ''"
                    class="w-full px-4 py-2.5 pr-12 border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] transition-colors cursor-pointer bg-white placeholder:text-gray-400"
                    :placeholder="newSite.address ? '' : '클릭하여 주소 입력'"
                    required
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#EA002C] hover:bg-gray-100 rounded transition-colors"
                    @click="handleSearchAddress"
                  >
                    <Search :size="18" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm mb-2 text-gray-700">
                  산업 분류 <span class="text-[#EA002C]">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="newSite.type"
                    class="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] transition-colors bg-white cursor-pointer"
                    required
                  >
                    <option value="">산업 분류를 선택하세요</option>
                    <option
                      v-for="industry in industries"
                      :key="industry.id"
                      :value="industry.code"
                    >
                      {{ industry.name }}
                    </option>
                  </select>
                  <ChevronDown
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    :size="18"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm mb-2 text-gray-700">지도</label>
                <div class="border border-gray-300 h-[300px]">
                  <LocationPicker
                    :latitude="newSite.latitude || undefined"
                    :longitude="newSite.longitude || undefined"
                    @update:location="handleLocationUpdate"
                  />
                </div>
              </div>

              <div class="pt-4">
                <button
                  type="submit"
                  :disabled="!newSite.name || !newSite.address || !newSite.type || loading"
                  class="w-full bg-[#EA002C] text-white py-2.5 hover:bg-[#C4002A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center flex items-center justify-center gap-2"
                >
                  <Loader2 v-if="loading" class="animate-spin" :size="18" />
                  <span>{{ loading ? '처리 중...' : '사업장 추가' }}</span>
                </button>
              </div>

              <div class="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                <p class="text-sm text-gray-600 leading-relaxed">
                  새로 추가되는 사업장에 대한 분석은 분석이 완료된 후 사이트에서 확인할 수 있습니다.
                  <br />사업장 분석이 완료되면 메일을 발송드리며, 메일 발송 전까지는 새로 추가된
                  사업장에 대해서는 반영되지 않은 결과임을 참고해주시길 바랍니다.
                </p>
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
