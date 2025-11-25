<script setup lang="ts">
import { ref, computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { ChevronDown } from 'lucide-vue-next';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

type Period = '단기' | '중기' | '장기';
type RiskFactor =
  | '이상 고온'
  | '물 부족'
  | '폭우 침수'
  | '하천 범람'
  | '산사태'
  | '해안 홍수'
  | '태풍'
  | '가뭄'
  | '산불';

const selectedPeriod = ref<Period>('장기');
const selectedRiskFactor = ref<RiskFactor>('이상 고온');
const isPeriodDropdownOpen = ref(false);
const isRiskDropdownOpen = ref(false);

const periods: Period[] = ['단기', '중기', '장기'];
const riskFactors: RiskFactor[] = [
  '이상 고온',
  '물 부족',
  '폭우 침수',
  '하천 범람',
  '산사태',
  '해안 홍수',
  '태풍',
  '가뭄',
  '산불',
];

interface PeriodData {
  period: string;
  SSP1: number;
  SSP2: number;
  SSP4: number;
  SSP5: number;
}

const getDataByPeriod = (
  period: Period,
  riskFactor: RiskFactor
): PeriodData[] => {
  const currentRiskScores: Record<RiskFactor, number> = {
    '이상 고온': 85,
    '물 부족': 72,
    '폭우 침수': 80,
    '하천 범람': 55,
    '산사태': 25,
    '해안 홍수': 0,
    '태풍': 30,
    '가뭄': 40,
    '산불': 20,
  };

  const baseScore = currentRiskScores[riskFactor];

  if (period === '단기') {
    return [
      { period: '1분기', SSP1: Math.round(baseScore * 0.6), SSP2: Math.round(baseScore * 0.7), SSP4: Math.round(baseScore * 0.85), SSP5: Math.round(baseScore * 1.0) },
      { period: '2분기', SSP1: Math.round(baseScore * 0.65), SSP2: Math.round(baseScore * 0.75), SSP4: Math.round(baseScore * 0.9), SSP5: Math.round(baseScore * 1.05) },
      { period: '3분기', SSP1: Math.round(baseScore * 0.7), SSP2: Math.round(baseScore * 0.8), SSP4: Math.round(baseScore * 0.95), SSP5: Math.round(baseScore * 1.1) },
      { period: '4분기', SSP1: Math.round(baseScore * 0.68), SSP2: Math.round(baseScore * 0.78), SSP4: Math.round(baseScore * 0.92), SSP5: Math.round(baseScore * 1.08) },
    ];
  } else if (period === '중기') {
    return [
      { period: '26년', SSP1: Math.round(baseScore * 0.75), SSP2: Math.round(baseScore * 0.9), SSP4: Math.round(baseScore * 1.05), SSP5: Math.round(baseScore * 1.2) },
      { period: '27년', SSP1: Math.round(baseScore * 0.8), SSP2: Math.round(baseScore * 0.95), SSP4: Math.round(baseScore * 1.1), SSP5: Math.round(baseScore * 1.25) },
      { period: '28년', SSP1: Math.round(baseScore * 0.85), SSP2: Math.round(baseScore * 1.0), SSP4: Math.round(baseScore * 1.15), SSP5: Math.round(baseScore * 1.3) },
      { period: '29년', SSP1: Math.round(baseScore * 0.9), SSP2: Math.round(baseScore * 1.05), SSP4: Math.round(baseScore * 1.2), SSP5: Math.round(baseScore * 1.35) },
      { period: '30년', SSP1: Math.round(baseScore * 0.95), SSP2: Math.round(baseScore * 1.1), SSP4: Math.round(baseScore * 1.25), SSP5: Math.round(baseScore * 1.4) },
    ];
  } else {
    return [
      { period: '20년대', SSP1: Math.round(baseScore * 0.85), SSP2: Math.round(baseScore * 1.0), SSP4: Math.round(baseScore * 1.15), SSP5: Math.round(baseScore * 1.3) },
      { period: '30년대', SSP1: Math.round(baseScore * 1.0), SSP2: Math.round(baseScore * 1.2), SSP4: Math.round(baseScore * 1.4), SSP5: Math.round(baseScore * 1.6) },
      { period: '40년대', SSP1: Math.round(baseScore * 1.1), SSP2: Math.round(baseScore * 1.35), SSP4: Math.round(baseScore * 1.6), SSP5: Math.round(baseScore * 1.85) },
      { period: '50년대', SSP1: Math.round(baseScore * 1.15), SSP2: Math.round(baseScore * 1.45), SSP4: Math.round(baseScore * 1.75), SSP5: Math.round(baseScore * 2.0) },
    ];
  }
};

const chartData = computed(() => {
  const data = getDataByPeriod(selectedPeriod.value, selectedRiskFactor.value);
  return {
    labels: data.map(d => d.period),
    datasets: [
      {
        label: 'SSP1',
        borderColor: '#B3CF0A',
        data: data.map(d => d.SSP1),
        fill: false,
        tension: 0.4,
      },
      {
        label: 'SSP2',
        borderColor: '#EA002C',
        data: data.map(d => d.SSP2),
        fill: false,
        tension: 0.4,
      },
      {
        label: 'SSP4',
        borderColor: '#009DA3',
        data: data.map(d => d.SSP4),
        fill: false,
        tension: 0.4,
      },
      {
        label: 'SSP5',
        borderColor: '#F47725',
        data: data.map(d => d.SSP5),
        fill: false,
        tension: 0.4,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: '리스크 점수',
      },
    },
  },
};

const getStrategyByRiskFactor = (riskFactor: RiskFactor): string => {
  const strategies: Record<RiskFactor, string> = {
    '이상 고온': '냉각 시스템 강화 및 단열재 보강',
    '물 부족': '용수 저장 시설 확보 및 절수 설비 도입',
    '폭우 침수': '침수 방지 설비 설치 및 배수 펌프 증',
    '하천 범람': '배수로 및 물막이판 등 정비 실시',
    '산사태': '사면 안정화 공사 및 배수로 정비',
    '해안 홍수': '방조제 보강 및 해안 시설 이전 검토',
    '태풍': '배수로 및 물막이판 등 정비 실시',
    '가뭄': '용수 저장 시설 확보 및 절수 설비 도입',
    '산불': '방화대 설치 및 소화 설비 확충',
  };
  return strategies[riskFactor];
};
</script>

<template>
  <div class="mt-6">
    <!-- SSP 그래프 섹션 -->
    <div class="bg-white border border-gray-200 shadow-sm mb-6">
      <div
        class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between"
      >
        <h3 class="text-sm text-gray-900">SSP 시나리오별 리스크 전망</h3>

        <!-- 드롭다운 영역 -->
        <div class="flex items-center gap-3">
          <!-- 기간 선택 드롭다운 -->
          <div class="relative">
            <button
              @click="isPeriodDropdownOpen = !isPeriodDropdownOpen; isRiskDropdownOpen = false;"
              class="bg-white px-4 py-2 text-sm border border-gray-300 hover:border-[#EA002C] focus:outline-none focus:border-[#EA002C] transition-colors flex items-center gap-2"
            >
              <span class="text-gray-900">{{ selectedPeriod }}</span>
              <ChevronDown
                :size="16"
                :class="['text-gray-500 transition-transform', isPeriodDropdownOpen ? 'rotate-180' : '']"
              />
            </button>

            <div
              v-if="isPeriodDropdownOpen"
              class="absolute z-20 right-0 w-32 mt-1 bg-white border border-gray-300 shadow-lg"
            >
              <button
                v-for="period in periods"
                :key="period"
                @click="selectedPeriod = period; isPeriodDropdownOpen = false;"
                :class="['w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0', period === selectedPeriod ? 'bg-gray-50' : '']"
              >
                {{ period }}
              </button>
            </div>
          </div>

          <!-- 리스크 요소 선택 드롭다운 -->
          <div class="relative">
            <button
              @click="isRiskDropdownOpen = !isRiskDropdownOpen; isPeriodDropdownOpen = false;"
              class="bg-white px-4 py-2 text-sm border border-gray-300 hover:border-[#EA002C] focus:outline-none focus:border-[#EA002C] transition-colors flex items-center gap-2"
            >
              <span class="text-gray-900">{{ selectedRiskFactor }}</span>
              <ChevronDown
                :size="16"
                :class="['text-gray-500 transition-transform', isRiskDropdownOpen ? 'rotate-180' : '']"
              />
            </button>

            <div
              v-if="isRiskDropdownOpen"
              class="absolute z-20 right-0 w-40 mt-1 bg-white border border-gray-300 shadow-lg max-h-80 overflow-y-auto"
            >
              <button
                v-for="factor in riskFactors"
                :key="factor"
                @click="selectedRiskFactor = factor; isRiskDropdownOpen = false;"
                :class="['w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0', factor === selectedRiskFactor ? 'bg-gray-50' : '']"
              >
                {{ factor }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 h-[400px]">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- 대응 방안 섹션 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">대응 방안</h3>
      </div>
      <div class="p-6">
        <div class="border-l-4 border-[#EA002C] bg-red-50 p-5">
          <div class="flex items-start gap-3">
            <div class="text-sm text-gray-900">
              <span class="text-[#EA002C]">▶</span> {{ getStrategyByRiskFactor(selectedRiskFactor) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>