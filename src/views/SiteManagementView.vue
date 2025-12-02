<script setup lang="ts">
import { ref } from 'vue';
import { Building2, Trash2, Save, Search, X } from 'lucide-vue-next';
import { useSitesStore, type Site } from '@/store/sites';
import { toast } from 'vue-sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const sitesStore = useSitesStore();
const sites = ref([...sitesStore.allSites]);
const editingSiteId = ref<string | null>(null);
const editFormData = ref<Partial<Site>>({});
const deleteConfirmDialog = ref<{ open: boolean; siteId: string | null }>({
  open: false,
  siteId: null,
});

const newSite = ref({
  name: '',
  location: '',
  address: '',
  type: '',
});

const handleDelete = (id: string) => {
  deleteConfirmDialog.value = { open: true, siteId: id };
};

const confirmDelete = () => {
  if (deleteConfirmDialog.value.siteId) {
    sites.value = sites.value.filter(
      (site) => site.id !== deleteConfirmDialog.value.siteId
    );
    toast.success('사업장이 삭제되었습니다.');
  }
  deleteConfirmDialog.value = { open: false, siteId: null };
};

const handleEdit = (site: Site) => {
  editingSiteId.value = site.id;
  editFormData.value = { ...site };
};

const handleCancelEdit = () => {
  editingSiteId.value = null;
  editFormData.value = {};
};

const handleSaveEdit = () => {
  if (!editingSiteId.value) return;

  sites.value = sites.value.map((site) =>
    site.id === editingSiteId.value
      ? ({ ...site, ...editFormData.value } as Site)
      : site
  );
  editingSiteId.value = null;
  editFormData.value = {};
  toast.success('사업장 정보가 수정되었습니다.');
};

const handleAddSite = () => {
  if (
    !newSite.value.name ||
    !newSite.value.location ||
    !newSite.value.address ||
    !newSite.value.type
  ) {
    toast.error('필수 항목을 모두 입력해주세요.');
    return;
  }

  const maxId =
    sites.value.length > 0
      ? Math.max(...sites.value.map((s) => parseInt(s.id) || 0))
      : 0;
  const newId = (maxId + 1).toString();

  const site: Site = {
    id: newId,
    name: newSite.value.name,
    location: newSite.value.location,
    address: newSite.value.address,
    type: newSite.value.type,
    assetType: '업무시설',
    constructionYear: new Date().getFullYear(),
    buildingStructure: '철근콘크리트',
    latitude: '37.5',
    longitude: '127.0',
    coordinates: { lat: 37.5, lng: 127.0 },
    riskLevel: 'low',
    carbonEmission: 0,
    esgScore: 0,
  };

  sites.value = [...sites.value, site];
  newSite.value = {
    name: '',
    location: '',
    address: '',
    type: '',
  };
  toast.success('새 사업장이 추가되었습니다.');
};
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
          <div v-if="sites.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Building2 :size="40" class="text-gray-400" />
            </div>
            <p class="text-gray-500 mb-2">등록된 사업장이 없습니다</p>
            <p class="text-sm text-gray-400">
              오른쪽 패널에서 새 사업장을 추가해보세요
            </p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="site in sites" :key="site.id" class="p-4 bg-white border border-gray-200 shadow-sm group relative">
              <div v-if="editingSiteId === site.id" class="space-y-3">
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
                  <label class="block text-xs text-gray-600 mb-1">유형 *</label>
                  <input
                    type="text"
                    v-model="editFormData.type"
                    class="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#EA002C]"
                  />
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
                  @click="handleDelete(site.id)"
                  class="absolute top-2 right-2 p-1 text-gray-400 hover:text-[#EA002C] hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 :size="16" />
                </button>
                <div class="flex items-center gap-2 mb-2">
                  <Building2 :size="18" class="text-[#EA002C]" />
                  <span class="text-gray-900">{{ site.name }}</span>
                </div>
                <div class="text-sm text-gray-500 mb-2">
                  {{ site.address }}
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700">{{
                    site.type
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
                  유형 <span class="text-[#EA002C]">*</span>
                </label>
                <input
                  type="text"
                  v-model="newSite.type"
                  class="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] transition-colors"
                  placeholder="예: 물류"
                  required
                />
              </div>

              <div class="pt-4">
                <button
                  type="submit"
                  :disabled="!newSite.name || !newSite.location || !newSite.address || !newSite.type"
                  class="w-full bg-[#EA002C] text-white py-2.5 hover:bg-[#C4002A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                  사업장 추가
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
