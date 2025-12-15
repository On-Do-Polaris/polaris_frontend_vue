<script setup lang="ts">
import { Building2, Plus } from 'lucide-vue-next'

const emit = defineEmits<{
  addSite: []
}>()

const handleAddClick = () => {
  emit('addSite')
}
</script>

<template>
  <div class="py-6">
    <h3 class="text-xl font-semibold text-gray-900 mb-8">사업장 목록</h3>

    <div class="grid grid-cols-2 gap-6">
      <!-- 왼쪽: 빈 상태 -->
      <div class="flex flex-col items-center justify-center py-12 px-4">
        <div class="mb-4">
          <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 :size="32" class="text-gray-400" />
          </div>
        </div>
        <p class="text-gray-900 font-medium mb-2">등록된 사업장이 없습니다</p>
        <p class="text-sm text-gray-500 text-center">
          오른쪽 '+' 버튼을 눌러 첫 사업장을<br />추가해보세요
        </p>
      </div>

      <!-- 오른쪽: 사업장 추가 카드 -->
      <button
        @click="handleAddClick"
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 hover:bg-gray-50 transition-all flex flex-col items-center justify-center"
      >
        <div class="mb-3">
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Plus :size="24" class="text-gray-400" />
          </div>
        </div>
        <p class="text-gray-900 font-medium mb-1">사업장 추가</p>
        <p class="text-sm text-gray-500 text-center">
          새로운 사업장을 등록하고<br />리스크 분석을 시작하세요
        </p>
      </button>
    </div>
  </div>
</template>
