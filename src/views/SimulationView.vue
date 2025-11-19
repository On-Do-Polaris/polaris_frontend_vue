<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, ChevronDown, MapPin, AlertTriangle, CheckCircle2, XCircle } from 'lucide-vue-next';
import { useSitesStore } from '@/store/sites';
import ClimateSimulation from '@/components/simulation/ClimateSimulation.vue';
import LocationSimulation from '@/components/simulation/LocationSimulation.vue';
import { Bar, Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement
);

type SimulationType = 'location' | 'climate';

interface CandidateLocation {
  name: string;
  region: string;
  rating: 'low' | 'medium' | 'high';
  ratingLabel: string;
  coordinates: { lat: number; lng: number };
  riskScore: number;
  aal: number;
  cvar: number;
  risks: {
    flood: number;
    typhoon: number;
    heatwave: number;
    earthquake: number;
    drought: number;
    heavyRain: number;
    coldWave: number;
  };
  advantages: string[];
  disadvantages: string[];
}

const sitesStore = useSitesStore();
const simulationType = ref<SimulationType>('location');
const searchTerm = ref('');
const selectedSite = ref(sitesStore.allSites[4]);
const selectedCandidate = ref(0);

const candidateLocations: CandidateLocation[] = [
  {
    name: '세종 데이터센터 부지',
    region: '세종시 조치원읍',
    rating: 'low',
    ratingLabel: '낮음',
    coordinates: { lat: 36.6002, lng: 127.2875 },
    riskScore: 28,
    aal: 4200,
    cvar: 58,
    risks: { flood: 15, typhoon: 25, heatwave: 45, earthquake: 20, drought: 30, heavyRain: 35, coldWave: 40 },
    advantages: ['홍수 위험 62% 감소', '지진 위험도 낮은 지역', '전력 공급 안정성 우수', '재난 대응 인프라 구축'],
    disadvantages: ['초기 구축 비용 증가', '인력 이동 필요'],
  },
  {
    name: '당진 산업단지',
    region: '충남 당진시',
    rating: 'medium',
    ratingLabel: '중간',
    coordinates: { lat: 36.8934, lng: 126.6475 },
    riskScore: 52,
    aal: 6800,
    cvar: 95,
    risks: { flood: 40, typhoon: 35, heatwave: 50, earthquake: 25, drought: 45, heavyRain: 55, coldWave: 50 },
    advantages: ['항만 접근성 우수', '산업단지 조성', '전력 공급 안정'],
    disadvantages: ['해안가로 태풍 리스크', '홍수 취약 지역'],
  },
  {
    name: '구미 국가산단',
    region: '경북 구미시',
    rating: 'medium',
    ratingLabel: '중간',
    coordinates: { lat: 36.1136, lng: 128.3446 },
    riskScore: 58,
    aal: 7500,
    cvar: 110,
    risks: { flood: 30, typhoon: 20, heatwave: 55, earthquake: 35, drought: 40, heavyRain: 35, coldWave: 45 },
    advantages: ['국가산단 인프라', '기술인력 풍부', '중부권 물류 거점'],
    disadvantages: ['하천 범람 위험', '여름 폭염 심화'],
  },
];

const selectedCandidateData = computed(() => candidateLocations[selectedCandidate.value]);

// 후보지 선택 시 LocationSimulation에 전달할 데이터 생성
const onCandidateSelect = (index: number) => {
  selectedCandidate.value = index;
};

const climateRiskData = {
  labels: ['홍수', '태풍', '폭염', '한파', '지진'],
  datasets: [
    {
      label: '현재',
      backgroundColor: '#EA002C',
      data: [85, 62, 73, 45, 28],
    },
    {
      label: '후보지',
      backgroundColor: '#B3CF0A',
      data: [32, 45, 68, 38, 15],
    },
  ],
};

const radarData = {
  labels: ['홍수', '태풍', '폭염', '한파', '지진', '산사태'],
  datasets: [
    {
      label: '현재',
      backgroundColor: 'rgba(234, 0, 44, 0.3)',
      borderColor: '#EA002C',
      pointBackgroundColor: '#EA002C',
      data: [85, 62, 73, 45, 28, 35],
    },
    {
      label: '후보지',
      backgroundColor: 'rgba(179, 207, 10, 0.3)',
      borderColor: '#B3CF0A',
      pointBackgroundColor: '#B3CF0A',
      data: [32, 45, 68, 38, 15, 22],
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'low': return 'bg-[#B3CF0A] text-white';
    case 'medium': return 'bg-[#F47725] text-white';
    case 'high': return 'bg-[#EA002C] text-white';
    default: return 'bg-[#8A8D8F] text-white';
  }
};

const advantages = [
  '홍수 위험 62% 감소',
  '지진 위험도 낮은 지역',
  '전력 공급 안정성 우수',
  '재난 대응 인프라 구축',
];

const disadvantages = ['초기 구축 비용 증가', '인력 이동 필요'];
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- 상단 헤더 -->
    <div class="border-b border-gray-200 px-8 py-6 bg-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-gray-900 text-xl">시뮬레이션</h2>
          <p class="text-sm text-gray-600 mt-1">
            사업장 이전 시뮬레이션과 기후 시나리오별 리스크 변화를 분석할 수
            있습니다.
          </p>
        </div>
        <div class="relative">
          <select
            v-model="simulationType"
            class="appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer"
          >
            <option value="location">위치 시뮬레이션</option>
            <option value="climate">기후 시뮬레이션</option>
          </select>
          <ChevronDown
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            :size="18"
          />
        </div>
      </div>
    </div>

    <div class="px-8 py-6">
      <ClimateSimulation v-if="simulationType === 'climate'" />
      <div v-else>
        <!-- Search Section -->
        <div class="bg-white border border-gray-200 mb-6 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">사업장 검색</h3>
          </div>
          <div class="p-6">
            <div class="flex items-center gap-3">
              <div class="flex-1 relative">
                <Search
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  :size="18"
                />
                <input
                  type="text"
                  v-model="searchTerm"
                  placeholder="사업장명 또는 위치를 입력하세요"
                  class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
                />
              </div>
              <button
                class="px-6 py-2.5 text-sm bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
              >
                검색
              </button>
            </div>
          </div>
        </div>
        <!-- Candidate Locations -->
        <div class="bg-white border border-gray-200 mb-6 shadow-sm">
          <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
            <h3 class="text-sm text-gray-900">추천 후보지</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-3 gap-4">
              <button
                v-for="(candidate, index) in candidateLocations"
                :key="index"
                @click="onCandidateSelect(index)"
                :class="[
                  'text-left border p-4 transition-all hover:shadow-md',
                  selectedCandidate === index
                    ? 'border-[#EA002C] bg-red-50'
                    : 'border-gray-200 bg-white',
                ]"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h4 class="text-gray-900 mb-1">{{ candidate.name }}</h4>
                    <p class="text-sm text-gray-600">
                      {{ candidate.region }}
                    </p>
                  </div>
                  <div
                    :class="`flex items-center gap-1 px-2 py-1 text-xs ${getRatingColor(
                      candidate.rating
                    )}`"
                  >
                    <CheckCircle2 v-if="candidate.rating === 'low'" :size="16" />
                    <AlertTriangle v-if="candidate.rating === 'medium'" :size="16" />
                    <XCircle v-if="candidate.rating === 'high'" :size="16" />
                    <span>{{ candidate.ratingLabel }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">리스크 점수</span>
                    <span class="text-gray-900"
                      >{{ candidate.riskScore }}점</span
                    >
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">AAL</span>
                    <span class="text-gray-900"
                      >{{ candidate.aal.toLocaleString() }}만원</span
                    >
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Location Simulation Results -->
        <LocationSimulation :site="selectedSite" :selectedCandidateData="selectedCandidateData" />
      </div>
    </div>
  </div>
</template>
