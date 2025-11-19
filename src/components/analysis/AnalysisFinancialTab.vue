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
  type TooltipItem,
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
  | '태풍'
  | '폭염'
  | '홍수'
  | '가뭄'
  | '한파'
  | '폭설'
  | '산사태'
  | '해수면상승'
  | '산불';

const selectedPeriod = ref<Period>('장기');
const selectedRiskFactor = ref<RiskFactor>('태풍');
const isPeriodDropdownOpen = ref(false);
const isRiskDropdownOpen = ref(false);

const periods: Period[] = ['단기', '중기', '장기'];
const riskFactors: RiskFactor[] = [
  '태풍',
  '폭염',
  '홍수',
  '가뭄',
  '한파',
  '폭설',
  '산사태',
  '해수면상승',
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
  if (period === '단기') {
    return [
      { period: '1분기', SSP1: 120, SSP2: 180, SSP4: 250, SSP5: 320 },
      { period: '2분기', SSP1: 150, SSP2: 220, SSP4: 310, SSP5: 400 },
      { period: '3분기', SSP1: 180, SSP2: 260, SSP4: 370, SSP5: 480 },
      { period: '4분기', SSP1: 160, SSP2: 240, SSP4: 340, SSP5: 450 },
    ];
  } else if (period === '중기') {
    return [
      { period: '26년', SSP1: 200, SSP2: 300, SSP4: 450, SSP5: 600 },
      { period: '27년', SSP1: 250, SSP2: 380, SSP4: 550, SSP5: 720 },
      { period: '28년', SSP1: 300, SSP2: 460, SSP4: 650, SSP5: 850 },
      { period: '29년', SSP1: 350, SSP2: 540, SSP4: 750, SSP5: 980 },
      { period: '30년', SSP1: 400, SSP2: 620, SSP4: 860, SSP5: 1100 },
    ];
  } else {
    return [
      { period: '20년대', SSP1: 500, SSP2: 750, SSP4: 1100, SSP5: 1500 },
      { period: '30년대', SSP1: 800, SSP2: 1200, SSP4: 1800, SSP5: 2400 },
      { period: '40년대', SSP1: 1100, SSP2: 1700, SSP4: 2500, SSP5: 3300 },
      { period: '50년대', SSP1: 1400, SSP2: 2100, SSP4: 3100, SSP5: 4200 },
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
    tooltip: {
      callbacks: {
        label: function(context: TooltipItem<'line'>) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(context.parsed.y * 1000000);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: '금액 (백만원)',
      },
    },
  },
};

const getFinancialImpactByRiskFactor = (riskFactor: RiskFactor): string => {
  const impacts: Record<RiskFactor, string> = {
      태풍:
        "태풍으로 인한 시설 피해 복구 비용, 생산 중단에 따른 매출 손실, 비상 대응 인력 투입 비용 등이 예상됩니다. 특히 SSP5 시나리오에서는 태풍 강도 및 빈도 증가로 인해 장기적으로 연평균 42억원의 재무 손실이 예상됩니다.",
      폭염:
        "폭염으로 인한 냉방 전력 비용 증가, 근로자 생산성 저하, 온도 민감 설비 고장 및 교체 비용 등이 발생합니다. SSP5 시나리오에서는 폭염일수 증가로 연평균 38억원의 추가 비용이 예상됩니다.",
      홍수:
        "홍수 피해로 인한 재고 손실, 설비 복구 비용, 운영 중단에 따른 매출 감소가 주요 재무 영향입니다. SSP5 시나리오 기준 장기적으로 연평균 45억원의 손실이 예상됩니다.",
      가뭄:
        "가뭄으로 인한 용수 확보 비용 증가, 생산 공정 차질, 대체 수원 개발 투자 등이 필요합니다. SSP5 시나리오에서는 연평균 35억원의 추가 비용이 예상됩니다.",
      한파:
        "한파로 인한 난방비 증가, 배관 동파 복구 비용, 생산 지연에 따른 손실이 발생합니다. SSP5 시나리오 기준 연평균 32억원의 재무 영향이 예상됩니다.",
      폭설:
        "폭설로 인한 제설 비용, 물류 지연 손실, 시설 붕괴 위험 대비 보강 비용 등이 필요합니다. SSP5 시나리오에서는 연평균 30억원의 추가 비용이 예상됩니다.",
      산사태:
        "산사태로 인한 부지 복구 비용, 안전 시설 투자, 사업장 이전 검토 비용 등이 발생합니다. SSP5 시나나리오 기준 연평균 40억원의 재무 영향이 예상됩니다.",
      해수면상승:
        "해수면 상승으로 인한 해안 방어 시설 투자, 침수 위험 대비 설비 이전, 부지 재평가 비용 등이 필요합니다. SSP5 시나리오에서는 연평균 50억원의 장기 투자가 예상됩니다.",
      산불:
        "산불로 인한 시설 소실 위험, 방화 설비 투자, 보험료 증가, 대피 및 복구 비용 등이 발생합니다. SSP5 시나리오 기준 연평균 36억원의 재무 영향이 예상됩니다.",
    };
  return impacts[riskFactor];
};
</script>

<template>
  <div class="mt-6">
    <!-- 재무 영향 그래프 섹션 -->
    <div class="bg-white border border-gray-200 shadow-sm mb-6">
      <div
        class="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between"
      >
        <h3 class="text-sm text-gray-900">
          SSP 시나리오별 재무 영향 전망
        </h3>

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

    <!-- 재무 영향 설명 섹션 -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">재무 영향 설명</h3>
      </div>
      <div class="p-6">
        <div class="border-l-4 border-[#EA002C] bg-red-50 p-5">
          <div class="flex items-start gap-3">
            <div class="text-sm text-gray-900 leading-relaxed">
              <span class="text-[#EA002C]">▶</span>
              {{ getFinancialImpactByRiskFactor(selectedRiskFactor) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>