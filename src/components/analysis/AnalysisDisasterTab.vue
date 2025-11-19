<script setup lang="ts">
import { ref, computed } from 'vue';

type DisasterRecord = {
  id: string;
  year: number;
  type: string;
  cautionDays: number;
  severeDays: number;
  status: '심각' | '주의' | '경미';
};

const disasters = ref<DisasterRecord[]>([
  {
    id: '1',
    year: 2024,
    type: '태풍',
    cautionDays: 7,
    severeDays: 3,
    status: '심각',
  },
  {
    id: '2',
    year: 2023,
    type: '폭염',
    cautionDays: 12,
    severeDays: 5,
    status: '심각',
  },
  {
    id: '3',
    year: 2022,
    type: '태풍',
    cautionDays: 4,
    severeDays: 2,
    status: '주의',
  },
  {
    id: '4',
    year: 2021,
    type: '홍수',
    cautionDays: 6,
    severeDays: 3,
    status: '심각',
  },
  {
    id: '5',
    year: 2020,
    type: '가뭄',
    cautionDays: 15,
    severeDays: 8,
    status: '심각',
  },
  {
    id: '6',
    year: 2019,
    type: '홍수',
    cautionDays: 3,
    severeDays: 1,
    status: '주의',
  },
  {
    id: '7',
    year: 2018,
    type: '폭염',
    cautionDays: 18,
    severeDays: 7,
    status: '심각',
  },
  {
    id: '8',
    year: 2017,
    type: '태풍',
    cautionDays: 2,
    severeDays: 1,
    status: '경미',
  },
]);

const severeDisasters = computed(
  () => disasters.value.filter((d) => d.status === '심각').length
);

const avgCautionDays = computed(() =>
  Math.round(
    disasters.value.reduce((sum, d) => sum + d.cautionDays, 0) /
      disasters.value.length
  )
);

const avgSevereDays = computed(() =>
  Math.round(
    disasters.value.reduce((sum, d) => sum + d.severeDays, 0) /
      disasters.value.length
  )
);

const getStatusColor = (status: string) => {
  switch (status) {
    case '심각':
      return 'bg-[#EA002C] text-white';
    case '주의':
      return 'bg-[#FBBC05] text-white';
    case '경미':
      return 'bg-[#B3CF0A] text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};
</script>

<template>
  <div class="mt-6">
    <!-- 요약 통계 -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-gray-200 shadow-sm p-5">
        <div class="text-xs text-gray-500 mb-2">총 재난 건수</div>
        <div class="flex items-end gap-2">
          <div class="text-2xl text-gray-900">{{ disasters.length }}</div>
          <div class="text-sm text-gray-500 mb-0.5">건</div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 shadow-sm p-5">
        <div class="text-xs text-gray-500 mb-2">심각 단계</div>
        <div class="flex items-end gap-2">
          <div class="text-2xl text-[#EA002C]">{{ severeDisasters }}</div>
          <div class="text-sm text-gray-500 mb-0.5">건</div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 shadow-sm p-5">
        <div class="text-xs text-gray-500 mb-2">평균 주의 일수</div>
        <div class="flex items-end gap-2">
          <div class="text-2xl text-gray-900">{{ avgCautionDays }}</div>
          <div class="text-sm text-gray-500 mb-0.5">일</div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 shadow-sm p-5">
        <div class="text-xs text-gray-500 mb-2">평균 심각 일수</div>
        <div class="flex items-end gap-2">
          <div class="text-2xl text-[#EA002C]">{{ avgSevereDays }}</div>
          <div class="text-sm text-gray-500 mb-0.5">일</div>
        </div>
      </div>
    </div>

    <!-- 재난 카드 리스트 -->
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="disaster in disasters"
        :key="disaster.id"
        class="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="px-6 py-4 flex items-center justify-between">
          <!-- 왼쪽: 년도와 재난 종류 -->
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-900">{{ disaster.year }}</span>
              <span class="text-gray-400">|</span>
              <span class="text-lg text-gray-900">{{ disaster.type }}</span>
            </div>
          </div>

          <!-- 중간: 주의/심각 일수 -->
          <div class="flex items-center gap-8">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-600">주의</span>
              <span class="text-lg text-gray-900">{{
                disaster.cautionDays
              }}</span>
              <span class="text-xs text-gray-500">일</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-600">심각</span>
              <span class="text-lg text-[#EA002C]">{{
                disaster.severeDays
              }}</span>
              <span class="text-xs text-gray-500">일</span>
            </div>
          </div>

          <!-- 오른쪽: 상태 배지 -->
          <div>
            <span
              :class="`inline-block px-5 py-2 text-sm ${getStatusColor(
                disaster.status
              )}`"
            >
              {{ disaster.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>