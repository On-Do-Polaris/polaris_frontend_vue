<script setup lang="ts">
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type TooltipItem,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

type RiskData = {
  id: string;
  name: string;
  nameEn: string;
  score: number;
  H: number;
  V: number;
  E: number;
  financialLoss: number; // 원화 금액
};

const graphTab = ref<'physical' | 'financial'>('physical');

const physicalRisks: RiskData[] = [
  { id: 'extreme_heat', name: '이상 고온', nameEn: 'Extreme Heat', score: 60, H: 85, V: 40, E: 55, financialLoss: 5200000 },
  { id: 'water_stress', name: '물 부족', nameEn: 'Water Stress', score: 58, H: 60, V: 70, E: 45, financialLoss: 4100000 },
  { id: 'coastal_flood', name: '해안 홍수', nameEn: 'Coastal Flood', score: 52, H: 30, V: 85, E: 40, financialLoss: 6100000 },
  { id: 'fluvial_flood', name: '하천 범람', nameEn: 'Fluvial Flood', score: 58, H: 45, V: 80, E: 50, financialLoss: 7400000 },
  { id: 'pluvial_flood', name: '폭우 침수', nameEn: 'Pluvial Flood', score: 63, H: 55, V: 75, E: 60, financialLoss: 5800000 },
  { id: 'tropical_cyclone', name: '태풍', nameEn: 'Tropical Cyclone', score: 70, H: 70, V: 65, E: 75, financialLoss: 8800000 },
  { id: 'landslide', name: '산사태', nameEn: 'Landslide', score: 43, H: 40, V: 55, E: 35, financialLoss: 3200000 },
  { id: 'drought', name: '가뭄', nameEn: 'Drought', score: 50, H: 50, V: 60, E: 40, financialLoss: 3900000 },
  { id: 'wildfire', name: '산불', nameEn: 'Wildfire', score: 37, H: 35, V: 45, E: 30, financialLoss: 2100000 },
];

const financialLosses: RiskData[] = [
  { id: 'extreme_heat', name: '이상 고온', nameEn: 'Extreme Heat', score: 12.5, H: 85, V: 40, E: 55, financialLoss: 5200000 },
  { id: 'water_stress', name: '물 부족', nameEn: 'Water Stress', score: 8.2, H: 60, V: 70, E: 45, financialLoss: 4100000 },
  { id: 'coastal_flood', name: '해안 홍수', nameEn: 'Coastal Flood', score: 15.3, H: 30, V: 85, E: 40, financialLoss: 6100000 },
  { id: 'fluvial_flood', name: '하천 범람', nameEn: 'Fluvial Flood', score: 18.7, H: 45, V: 80, E: 50, financialLoss: 7400000 },
  { id: 'pluvial_flood', name: '폭우 침수', nameEn: 'Pluvial Flood', score: 14.6, H: 55, V: 75, E: 60, financialLoss: 5800000 },
  { id: 'tropical_cyclone', name: '태풍', nameEn: 'Tropical Cyclone', score: 22.1, H: 70, V: 65, E: 75, financialLoss: 8800000 },
  { id: 'landslide', name: '산사태', nameEn: 'Landslide', score: 6.4, H: 40, V: 55, E: 35, financialLoss: 3200000 },
  { id: 'drought', name: '가뭄', nameEn: 'Drought', score: 9.8, H: 50, V: 60, E: 40, financialLoss: 3900000 },
  { id: 'wildfire', name: '산불', nameEn: 'Wildfire', score: 4.2, H: 35, V: 45, E: 30, financialLoss: 2100000 },
];

const currentData = computed(() =>
  graphTab.value === 'physical' ? physicalRisks : financialLosses
);

const topRisk = computed<RiskData>(() => {
  if (physicalRisks.length === 0) {
    return { id: '', name: '', nameEn: '', score: 0, H: 0, V: 0, E: 0, financialLoss: 0 };
  }
  return physicalRisks.reduce((max, risk) => (risk.score > max.score ? risk : max), physicalRisks[0]!);
});

const getBarColor = (score: number) => {
  if (graphTab.value === 'physical') {
    if (score >= 65) return '#EA002C';
    if (score >= 55) return '#F47725';
    if (score >= 45) return '#FBBC05';
    return '#B3CF0A';
  } else {
    if (score >= 18) return '#EA002C';
    if (score >= 12) return '#F47725';
    if (score >= 8) return '#FBBC05';
    return '#B3CF0A';
  }
};

const chartData = computed(() => ({
  labels: currentData.value.map((d) => d.name),
  datasets: [
    {
      label: graphTab.value === 'physical' ? '점수' : '손실률 (%)',
      data: currentData.value.map((d) => d.score),
      backgroundColor: currentData.value.map((d) => getBarColor(d.score)),
      borderRadius: 4,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title: (tooltipItems: TooltipItem<'bar'>[]) => {
          const index = tooltipItems[0]?.dataIndex;
          if (index === undefined) return '';
          return currentData.value[index]?.name || '';
        },
        label: (tooltipItem: TooltipItem<'bar'>) => {
          const index = tooltipItem?.dataIndex;
          if (index === undefined) return '';
          const data = currentData.value[index];
          if (!data) return '';
          if (graphTab.value === 'financial') {
            return `손실금액: ${data.financialLoss.toLocaleString('ko-KR')}원`;
          }
          return `점수: ${data.score}, H: ${data.H}, V: ${data.V}, E: ${data.E}`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 12,
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 12,
        },
      },
      title: {
        display: true,
        text: graphTab.value === 'financial' ? '손실률 (%)' : '점수',
        font: {
          size: 12,
        },
      },
    },
  },
}));
</script>

<template>
  <div>
    <!-- 주요 물리적 리스크 박스 -->
    <div class="bg-white border border-gray-200 shadow-sm mb-6 mt-6">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">주요 물리적 리스크</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-3 gap-4">
          <div class="border border-gray-200 p-6">
            <div class="text-xs text-gray-500 mb-2">종류</div>
            <div class="text-2xl text-gray-900">{{ topRisk.name }}</div>
          </div>

          <div class="border border-gray-200 p-6">
            <div class="text-xs text-gray-500 mb-2">점수</div>
            <div class="flex items-end gap-2">
              <div class="text-2xl text-[#EA002C]">{{ topRisk.score }}</div>
              <div class="text-sm text-gray-500 mb-0.5">점</div>
            </div>
          </div>

          <div class="border border-gray-200 p-6">
            <div class="text-xs text-gray-500 mb-2">예상 재무손실</div>
            <div class="flex items-end gap-2">
              <div class="text-2xl text-gray-900">17</div>
              <div class="text-sm text-gray-500 mb-0.5">%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 그래프 섹션 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div
        class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between"
      >
        <h3 class="text-sm text-gray-900">물리적 리스크 평가</h3>
        <div class="flex items-center gap-2">
          <button
            @click="graphTab = 'physical'"
            :class="[
              'px-4 py-1.5 text-xs transition-colors',
              graphTab === 'physical'
                ? 'bg-[#EA002C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            물리평가
          </button>
          <button
            @click="graphTab = 'financial'"
            :class="[
              'px-4 py-1.5 text-xs transition-colors',
              graphTab === 'financial'
                ? 'bg-[#EA002C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            재무손실률
          </button>
        </div>
      </div>
      <div class="p-6 h-[400px]">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>