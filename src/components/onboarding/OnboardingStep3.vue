<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'

interface Props {
  industries: Array<{ code: string; name: string }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  submit: [data: { name: string; address: string; location: string; type: string }]
  searchAddress: []
}>()

const formData = ref({
  name: '',
  address: '',
  location: '',
  type: ''
})

const isFormValid = computed(() => {
  return formData.value.name && formData.value.address && formData.value.type
})

const handleCancel = () => {
  emit('cancel')
}

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', { ...formData.value })
  }
}

const handleSearchAddress = () => {
  emit('searchAddress')
}

// 부모 컴포넌트에서 주소 설정할 수 있도록 expose
defineExpose({
  setAddress: (address: string, location: string) => {
    formData.value.address = address
    formData.value.location = location
  }
})
</script>

<template>
  <div class="py-2">
    <h3 class="text-xl font-semibold text-gray-900 mb-2">사업장 추가</h3>
    <p class="text-sm text-gray-600 mb-6">새로운 사업장 정보를 입력하세요</p>

    <div class="space-y-4">
      <!-- 사업장명 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          사업장명<span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="예: 부산 물류센터"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#EA002C] focus:border-transparent"
        />
      </div>

      <!-- 주소 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          주소<span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            v-model="formData.address"
            type="text"
            placeholder="예: 부산광역시 해운대구 센텀중앙로 78"
            class="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#EA002C] focus:border-transparent cursor-pointer"
            readonly
            @click="handleSearchAddress"
          />
          <button
            @click="handleSearchAddress"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
          >
            <Search :size="18" />
          </button>
        </div>
      </div>

      <!-- 업종 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          업종<span class="text-red-500">*</span>
        </label>
        <select
          v-model="formData.type"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#EA002C] focus:border-transparent"
        >
          <option value="" disabled>예: 물류</option>
          <option v-for="industry in industries" :key="industry.code" :value="industry.code">
            {{ industry.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 버튼들 -->
    <div class="mt-8 flex justify-center gap-3">
      <button
        @click="handleCancel"
        class="px-8 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
      >
        취소
      </button>
      <button
        @click="handleSubmit"
        :disabled="!isFormValid"
        class="px-8 py-2 bg-[#EA002C] text-white rounded hover:bg-[#C4002A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        추가
      </button>
    </div>
  </div>
</template>
