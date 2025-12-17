<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

interface Props {
  title: string
  progress: number // 0-100
  showPrevButton?: boolean
  showNextButton?: boolean
  nextButtonText?: string
  nextButtonDisabled?: boolean
  onClose?: () => void
  onPrev?: () => void
  onNext?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  showPrevButton: true,
  showNextButton: true,
  nextButtonText: '다음',
  nextButtonDisabled: false
})

const emit = defineEmits<{
  close: []
  prev: []
  next: []
}>()

const handleClose = () => {
  // X 버튼 클릭 시 로그아웃 처리 후 로그인 페이지로 이동
  authStore.handleLogout()
}

const handlePrev = () => {
  emit('prev')
}

const handleNext = () => {
  emit('next')
}
</script>

<template>
  <div class="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 px-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="p-6 pb-4 border-b border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#EA002C] transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <slot></slot>
      </div>

      <!-- Footer -->
      <div class="p-6 pt-4 flex justify-between border-t border-gray-100">
        <button
          v-if="showPrevButton"
          @click="handlePrev"
          class="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <div v-else></div>

        <button
          v-if="showNextButton"
          @click="handleNext"
          :disabled="nextButtonDisabled"
          class="px-6 py-2 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ nextButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>
