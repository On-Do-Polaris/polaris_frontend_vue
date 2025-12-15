<script setup lang="ts">
import { Building2, Plus, Trash2 } from 'lucide-vue-next'

interface Site {
  name: string
  location: string
  type: string
  roadAddress?: string
  siteId?: string
}

interface Props {
  sites: Site[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'add-site'): void
  (e: 'delete-site', index: number): void
}>()

const handleAddSite = () => {
  emit('add-site')
}

const handleDeleteSite = (index: number) => {
  emit('delete-site', index)
}
</script>

<template>
  <div class="py-6">
    <h3 class="text-xl font-semibold text-gray-900 mb-6">사업장 목록</h3>

    <div class="grid grid-cols-2 gap-4">
      <!-- 등록된 사업장들 -->
      <div
        v-for="(site, index) in sites"
        :key="index"
        class="px-3 pt-3 pb-1.5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group"
      >
        <div class="flex items-center gap-2 mb-1.5">
          <Building2 :size="16" class="text-[#EA002C]" />
          <span class="text-sm font-medium text-gray-900">{{ site.name }}</span>
        </div>
        <div class="text-xs text-gray-600 mb-2">{{ site.roadAddress || site.location }}</div>
        <div class="flex items-center justify-between">
          <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{{ site.type }}</span>

          <!-- 삭제 버튼 -->
          <button
            @click="handleDeleteSite(index)"
            class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="삭제"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>

      <!-- 사업장 추가 카드 -->
      <button
        @click="handleAddSite"
        class="p-4 border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center hover:border-[#EA002C] hover:bg-red-50 transition-colors cursor-pointer"
      >
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-4 h-4 flex items-center justify-center">
            <Plus :size="16" class="text-[#EA002C]" />
          </div>
          <span class="text-sm font-medium text-gray-900">사업장 추가</span>
        </div>
        <div class="text-xs text-gray-600 text-center">
          새로운 사업장을 등록하고 리스크 분석을 시작하세요
        </div>
      </button>
    </div>
  </div>
</template>
