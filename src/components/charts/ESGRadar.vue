<script setup lang="ts">
import { computed } from 'vue';

interface ESGRadarProps {
  score: number;
}

const props = defineProps<ESGRadarProps>();

const categories = [
  { name: '온실가스 관리', score: 75, max: 100 },
  { name: '에너지 효율', score: 68, max: 100 },
  { name: '자원순환', score: 82, max: 100 },
  { name: '폐기물 관리', score: 71, max: 100 },
  { name: '수자원 관리', score: 79, max: 100 },
  { name: '환경경영 체계', score: 85, max: 100 },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const getBarColor = (score: number) => {
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-yellow-600';
  return 'bg-red-600';
};

const scoreDifference = computed(() => props.score - 78);
</script>

<template>
  <div class="space-y-4">
    <div v-for="(category, index) in categories" :key="index">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-gray-700">{{ category.name }}</span>
        <span :class="getScoreColor(category.score)">
          {{ category.score }}점
        </span>
      </div>
      <div class="w-full bg-gray-200 h-3">
        <div
          :class="`${getBarColor(category.score)} h-3 transition-all`"
          :style="{ width: `${category.score}%` }"
        />
      </div>
    </div>

    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <span class="text-gray-900">종합 평가</span>
        <span class="text-2xl text-green-600">{{ score }}점</span>
      </div>
      <p class="text-sm text-gray-600 mt-2">
        업계 평균(78점) 대비
        {{ scoreDifference > 0 ? `+${scoreDifference}` : scoreDifference }}점
      </p>
    </div>
  </div>
</template>