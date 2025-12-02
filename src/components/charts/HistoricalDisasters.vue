<script setup lang="ts">
import { AlertCircle, Wind, Droplets, Flame } from 'lucide-vue-next';

const disasters = [
  { year: 2022, type: '태풍', name: '힌남노', damage: '3,240만원', severity: 'high', icon: Wind },
  { year: 2020, type: '집중호우', name: '8월 장마', damage: '1,850만원', severity: 'medium', icon: Droplets },
  { year: 2018, type: '폭염', name: '여름 폭염', damage: '580만원', severity: 'low', icon: Flame },
  { year: 2016, type: '태풍', name: '차바', damage: '2,100만원', severity: 'high', icon: Wind },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-700 border-red-300';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'low': return 'bg-green-100 text-green-700 border-green-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 text-gray-600 bg-blue-50 p-3 border border-blue-200">
      <AlertCircle :size="16" class="text-blue-600" />
      <span class="text-sm">행정안전부 재해연보 및 기상청 데이터 기반 자동 수집</span>
    </div>

    <div class="space-y-3">
      <div
        v-for="(disaster, index) in disasters"
        :key="index"
        class="flex items-center justify-between p-4 border border-gray-200 hover:bg-gray-50"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-100 flex items-center justify-center">
            <component :is="disaster.icon" :size="24" class="text-[#dc042b]" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-gray-900">{{ disaster.year }}년 {{ disaster.type }}</span>
              <span
                :class="`px-2 py-0.5 text-xs border ${getSeverityColor(
                  disaster.severity
                )}`"
              >
                {{
                  disaster.severity === 'high'
                    ? '심각'
                    : disaster.severity === 'medium'
                    ? '보통'
                    : '경미'
                }}
              </span>
            </div>
            <div class="text-sm text-gray-500 mt-1">{{ disaster.name }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-gray-900">피해액</div>
          <div class="text-sm text-[#dc042b]">{{ disaster.damage }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
      <div class="text-center">
        <div class="text-2xl text-gray-900">4</div>
        <div class="text-xs text-gray-500 mt-1">총 재해 건수 (최근 10년)</div>
      </div>
      <div class="text-center">
        <div class="text-2xl text-[#dc042b]">7,770만원</div>
        <div class="text-xs text-gray-500 mt-1">누적 피해액</div>
      </div>
      <div class="text-center">
        <div class="text-2xl text-gray-900">태풍</div>
        <div class="text-xs text-gray-500 mt-1">주요 재해 유형</div>
      </div>
    </div>
  </div>
</template>