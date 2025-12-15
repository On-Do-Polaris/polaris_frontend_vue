<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import skLogo from '@/assets/sk-logo.png'

const authStore = useAuthStore()

// 뒤로 가기 막기
onMounted(() => {
  // 히스토리에 현재 페이지를 추가하여 뒤로 가기를 막음
  window.history.pushState(null, '', window.location.href)

  // popstate 이벤트 리스너 등록 (뒤로 가기 버튼 클릭 시)
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  window.removeEventListener('popstate', handlePopState)
})

const handlePopState = () => {
  // 뒤로 가기 시도 시 다시 현재 페이지로 이동
  window.history.pushState(null, '', window.location.href)
}

// 로그아웃 처리
const handleLogout = async () => {
  await authStore.handleLogout()
  // 로그아웃 완료 후 강제로 로그인 페이지로 이동
  window.location.href = '/login'
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-white relative">
    <!-- 로그아웃 버튼 -->
    <button
      @click="handleLogout"
      class="absolute top-4 right-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
    >
      로그아웃
    </button>

    <!-- 중앙 콘텐츠 -->
    <div class="flex flex-col items-center justify-center space-y-8">
      <!-- SK 로고 -->
      <img :src="skLogo" alt="SK Logo" class="h-16 w-auto" />

      <!-- 메시지 -->
      <div class="text-center space-y-2">
        <p class="text-xl text-gray-800 font-medium">사업장 분석은 시간이 소요됩니다.</p>
        <p class="text-xl text-gray-800">분석이 끝나면 이메일로 알림을 발송드립니다.</p>
      </div>
    </div>
  </div>
</template>
