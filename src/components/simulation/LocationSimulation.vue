<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  MapPin,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-vue-next';
import type { Site } from '@/assets/data/sites';
import {
  Bar,
  Radar,
} from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  site: Site;
  selectedCandidateData?: any;
}

const props = defineProps<Props>();

const newAddress = ref('');
const isSimulating = ref(false);
const simulationResult = computed(() => props.selectedCandidateData || null);

// Mock locations with different risk profiles
const candidateLocations = [
  {
    name: '세종특별자치시 연기면',
    address: '세종특별자치시 연기면 세종로 209',
    coordinates: { lat: 36.5040, lng: 127.2494 },
    riskLevel: 'low',
    riskScore: 32,
    risks: {
      flood: 15,
      typhoon: 25,
      heatwave: 45,
      earthquake: 20,
      drought: 30,
      heavyRain: 35,
      coldWave: 40,
    },
    aal: 3200,
    cvar: 48,
    advantages: ['내륙 지역으로 태풍 피해 적음', '신도시로 인프라 우수', '정부 지원 정책 혜택'],
    disadvantages: ['물류비 증가 (항만 거리)', '인력 수급 어려움'],
    carbonImpact: -8500,
    costChange: 25000,
  },
  {
    name: '충청남도 당진시 송악읍',
    address: '충청남도 당진시 송악읍 한진1길 15',
    coordinates: { lat: 36.9005, lng: 126.6471 },
    riskLevel: 'medium',
    riskScore: 48,
    risks: {
      flood: 40,
      typhoon: 35,
      heatwave: 50,
      earthquake: 25,
      drought: 45,
      heavyRain: 55,
      coldWave: 50,
    },
    aal: 6800,
    cvar: 95,
    advantages: ['항만 접근성 우수', '산업단지 조성', '전력 공급 안정'],
    disadvantages: ['해안가로 태풍 리스크', '홍수 취약 지역'],
    carbonImpact: -3500,
    costChange: 8000,
  },
  {
    name: '경상북도 구미시 임수동',
    address: '경상북도 구미시 임수동 산업로 55',
    coordinates: { lat: 36.1136, lng: 128.3445 },
    riskLevel: 'low',
    riskScore: 38,
    risks: {
      flood: 30,
      typhoon: 20,
      heatwave: 55,
      earthquake: 35,
      drought: 40,
      heavyRain: 35,
      coldWave: 45,
    },
    aal: 4100,
    cvar: 62,
    advantages: ['국가산단 인프라', '기술인력 풍부', '중부권 물류 거점'],
    disadvantages: ['하천 범람 위험', '여름 폭염 심화'],
    carbonImpact: -5200,
    costChange: 12000,
  },
];

const handleSimulate = () => {
  isSimulating.value = true;
  // Simulate API call
  setTimeout(() => {
    // Find matching location or use random
    const result = candidateLocations[Math.floor(Math.random() * candidateLocations.length)];
    simulationResult.value = result;
    isSimulating.value = false;
  }, 1500);
};

const currentRiskScore = 68;
const currentAAL = 12500;
const currentCVaR = 185;

const currentRisks = computed(() => [
  { category: '홍수', current: 65, simulated: simulationResult.value?.risks.flood || 0 },
  { category: '태풍', current: 75, simulated: simulationResult.value?.risks.typhoon || 0 },
  { category: '폭염', current: 55, simulated: simulationResult.value?.risks.heatwave || 0 },
  { category: '지진', current: 30, simulated: simulationResult.value?.risks.earthquake || 0 },
  { category: '가뭄', current: 40, simulated: simulationResult.value?.risks.drought || 0 },
  { category: '집중호우', current: 70, simulated: simulationResult.value?.risks.heavyRain || 0 },
  { category: '한파', current: 45, simulated: simulationResult.value?.risks.coldWave || 0 },
]);

const radarData = computed(() => ({
  labels: ['홍수', '태풍', '폭염', '지진', '가뭄', '집중호우', '한파'],
  datasets: [
    {
      label: '현재 위치',
      data: [65, 75, 55, 30, 40, 70, 45],
      backgroundColor: 'rgba(220, 38, 38, 0.3)',
      borderColor: '#dc2626',
      borderWidth: 2,
      pointBackgroundColor: '#dc2626',
    },
    {
      label: '후보 위치',
      data: [
        simulationResult.value?.risks.flood || 0,
        simulationResult.value?.risks.typhoon || 0,
        simulationResult.value?.risks.heatwave || 0,
        simulationResult.value?.risks.earthquake || 0,
        simulationResult.value?.risks.drought || 0,
        simulationResult.value?.risks.heavyRain || 0,
        simulationResult.value?.risks.coldWave || 0,
      ],
      backgroundColor: 'rgba(16, 185, 129, 0.3)',
      borderColor: '#10b981',
      borderWidth: 2,
      pointBackgroundColor: '#10b981',
    },
  ],
}));

const barChartData = computed(() => ({
  labels: currentRisks.value.map((r) => r.category),
  datasets: [
    {
      label: '현재 위치',
      data: currentRisks.value.map((r) => r.current),
      backgroundColor: '#dc2626',
    },
    {
      label: '후보 위치',
      data: currentRisks.value.map((r) => r.simulated),
      backgroundColor: '#10b981',
    },
  ],
}));

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '리스크 점수',
      },
    },
  },
  plugins: {
    legend: {
      display: true,
    },
  },
};

const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20,
      },
    },
  },
  plugins: {
    legend: {
      display: true,
    },
  },
};

const getRiskLevelColor = (level: string) => {
  if (level === 'high') return 'bg-red-500';
  if (level === 'medium') return 'bg-yellow-500';
  return 'bg-green-500';
};

const selectCandidateLocation = (location: any) => {
  newAddress.value = location.address;
  simulationResult.value = location;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Simulation Result -->
    <template v-if="simulationResult">
      <!-- Map Visualization -->
      <div class="border border-gray-200 bg-white p-6">
        <h4 class="text-gray-900 mb-4">위치 비교</h4>
        <div class="relative w-full h-[400px] bg-gray-100 border border-gray-300">
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 1000 400">
            <!-- Korea outline -->
            <path
              d="M 400 80 L 450 60 L 500 80 L 520 130 L 550 180 L 560 260 L 540 330 L 500 370 L 450 380 L 400 370 L 380 330 L 370 260 L 390 180 L 400 130 Z"
              fill="none"
              stroke="#d1d5db"
              stroke-width="2"
            />

            <!-- Connection Line -->
            <line
              :x1="400 + (site.coordinates.lng - 127) * 50"
              :y1="250 - (site.coordinates.lat - 35) * 50"
              :x2="400 + (simulationResult.coordinates.lng - 127) * 50"
              :y2="250 - (simulationResult.coordinates.lat - 35) * 50"
              stroke="#3b82f6"
              stroke-width="2"
              stroke-dasharray="5,5"
            />

            <!-- Current Location -->
            <g>
              <circle
                :cx="400 + (site.coordinates.lng - 127) * 50"
                :cy="250 - (site.coordinates.lat - 35) * 50"
                r="20"
                fill="#dc2626"
                opacity="0.8"
              />
              <text
                :x="400 + (site.coordinates.lng - 127) * 50"
                :y="250 - (site.coordinates.lat - 35) * 50 - 30"
                text-anchor="middle"
                font-size="14"
                font-weight="600"
                fill="#111827"
              >
                현재 위치
              </text>
              <text
                :x="400 + (site.coordinates.lng - 127) * 50"
                :y="250 - (site.coordinates.lat - 35) * 50 - 15"
                text-anchor="middle"
                font-size="12"
                fill="#dc2626"
              >
                {{ site.name }}
              </text>
            </g>

            <!-- New Location -->
            <g>
              <circle
                :cx="400 + (simulationResult.coordinates.lng - 127) * 50"
                :cy="250 - (simulationResult.coordinates.lat - 35) * 50"
                r="20"
                fill="#10b981"
                opacity="0.8"
              />
              <text
                :x="400 + (simulationResult.coordinates.lng - 127) * 50"
                :y="250 - (simulationResult.coordinates.lat - 35) * 50 - 30"
                text-anchor="middle"
                font-size="14"
                font-weight="600"
                fill="#111827"
              >
                후보 위치
              </text>
              <text
                :x="400 + (simulationResult.coordinates.lng - 127) * 50"
                :y="250 - (simulationResult.coordinates.lat - 35) * 50 - 15"
                text-anchor="middle"
                font-size="12"
                fill="#10b981"
              >
                {{ simulationResult.name }}
              </text>
            </g>
          </svg>

          <!-- Legend -->
          <div class="absolute bottom-4 left-4 bg-white p-3 border border-gray-300 shadow-sm">
            <div class="space-y-2 text-xs">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full bg-red-600"></div>
                <span>현재 위치 (리스크: {{ currentRiskScore }})</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full bg-green-500"></div>
                <span>후보 위치 (리스크: {{ simulationResult.riskScore }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Comparison -->
      <div class="grid grid-cols-3 gap-4">
        <div class="border border-gray-200 bg-white p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-700">종합 리스크 점수</span>
          </div>
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-3xl text-gray-900">{{ simulationResult.riskScore }}</span>
            <span class="text-sm text-gray-500">/ 100</span>
          </div>
          <div class="text-sm text-[#B3CF0A]">
            현재 대비 {{ simulationResult.riskScore < currentRiskScore ? '-' : '+' }}{{
              Math.abs(currentRiskScore - simulationResult.riskScore)
            }} 개선
          </div>
        </div>

        <div class="border border-gray-200 bg-white p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-700">연평균 손실 (AAL)</span>
          </div>
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-3xl text-gray-900">{{ simulationResult.aal.toLocaleString() }}</span>
            <span class="text-sm text-gray-500">만원</span>
          </div>
          <div class="text-sm text-[#B3CF0A]">
            현재 대비 -{{ Math.abs(currentAAL - simulationResult.aal).toLocaleString() }}만원 절감
          </div>
        </div>

        <div class="border border-gray-200 bg-white p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-700">CVaR 손실</span>
          </div>
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-3xl text-gray-900">{{ simulationResult.cvar }}</span>
            <span class="text-sm text-gray-500">억원</span>
          </div>
          <div class="text-sm text-[#B3CF0A]">
            현재 대비 -{{ Math.abs(currentCVaR - simulationResult.cvar) }}억원 개선
          </div>
        </div>
      </div>

      <!-- Detailed Risk Comparison Charts -->
      <div class="grid grid-cols-2 gap-6">
        <!-- Bar Chart -->
        <div class="border border-gray-200 bg-white p-6">
          <h4 class="text-gray-900 mb-4">기후 리스크 요소별 비교</h4>
          <div class="h-80">
            <Bar :data="barChartData" :options="barChartOptions" />
          </div>
        </div>

        <!-- Radar Chart -->
        <div class="border border-gray-200 bg-white p-6">
          <h4 class="text-gray-900 mb-4">종합 리스크 프로필리오</h4>
          <div class="h-80">
            <Radar :data="radarData" :options="radarChartOptions" />
          </div>
        </div>
      </div>

      <!-- Pros and Cons -->
      <div class="grid grid-cols-2 gap-6">
        <div class="border border-green-300 bg-green-50 p-6">
          <div class="flex items-center gap-2 mb-4">
            <CheckCircle class="text-green-600" :size="20" />
            <h4 class="text-gray-900">후보지 장점</h4>
          </div>
          <ul class="space-y-2">
            <li
              v-for="(adv, index) in simulationResult.advantages"
              :key="index"
              class="flex items-start gap-2 text-sm text-gray-700"
            >
              <span class="text-green-600 mt-1">•</span>
              <span>{{ adv }}</span>
            </li>
          </ul>
        </div>

        <div class="border border-red-300 bg-red-50 p-6">
          <div class="flex items-center gap-2 mb-4">
            <XCircle class="text-red-600" :size="20" />
            <h4 class="text-gray-900">후보지 단점</h4>
          </div>
          <ul class="space-y-2">
            <li
              v-for="(dis, index) in simulationResult.disadvantages"
              :key="index"
              class="flex items-start gap-2 text-sm text-gray-700"
            >
              <span class="text-red-600 mt-1">•</span>
              <span>{{ dis }}</span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>
