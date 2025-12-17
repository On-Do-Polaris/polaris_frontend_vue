<script setup lang="ts">
// 사업장 추가 방법 안내
</script>

<template>
  <div class="py-6">
    <h3 class="text-2xl font-bold text-center text-gray-900 mb-12">사업장 추가는 이렇게 해요</h3>

    <div class="space-y-6">
      <!-- Step 1 -->
      <div class="flex items-start gap-4">
        <div
          class="w-10 h-10 rounded-full bg-[#EA002C] text-white flex items-center justify-center font-bold flex-shrink-0"
        >
          1
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 mb-1">사업장명 입력</h4>
          <p class="text-sm text-gray-600">
            대시보드에서 '+' 버튼을 클릭하여 사업장명을 입력하세요
          </p>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="flex items-start gap-4">
        <div
          class="w-10 h-10 rounded-full bg-[#EA002C] text-white flex items-center justify-center font-bold flex-shrink-0"
        >
          2
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 mb-1">자동 매핑</h4>
          <p class="text-sm text-gray-600">
            내부 DB와 공식 데이터(기상청, 환경부 등)가 자동으로 매핑됩니다
          </p>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="flex items-start gap-4">
        <div
          class="w-10 h-10 rounded-full bg-[#EA002C] text-white flex items-center justify-center font-bold flex-shrink-0"
        >
          3
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 mb-1">리스크 분석</h4>
          <p class="text-sm text-gray-600">
            물리적 리스크, 연평균 자산 손실률(AAL) 및 취약성을 분석합니다.
          </p>
        </div>
      </div>

      <!-- Step 4 -->
      <div class="flex items-start gap-4">
        <div
          class="w-10 h-10 rounded-full bg-[#EA002C] text-white flex items-center justify-center font-bold flex-shrink-0"
        >
          4
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 mb-1">리포트 생성</h4>
          <p class="text-sm text-gray-600">종합 리포트가 자동으로 생성되어 다운로드 가능합니다</p>
        </div>
      </div>
    </div>
  </div>
</template>
