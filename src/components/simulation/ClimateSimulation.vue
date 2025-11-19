<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { Play, Pause } from 'lucide-vue-next';
import { useSitesStore } from '@/store/sites';

const sitesStore = useSitesStore();

const sspScenario = ref('SSP5-8.5');
const climateVariable = ref('폭염');
const selectedYear = ref(2050);
const isPlaying = ref(false);

// 연도별 온도 데이터 (2020-2100)
const years = Array.from({ length: 17 }, (_, i) => 2020 + i * 5);

// 사업장별 기후 영향 데이터
const siteClimateData = computed(() =>
  sitesStore.allSites.map((site, index) => ({
    ...site,
    temperature2020: 14.5 + index * 0.3,
    temperature2050: 16.8 + index * 0.4,
    temperature2100: 19.5 + index * 0.5,
    riskIncrease: 15 + index * 3,
  }))
);

// 연도별 온도 계산
const getTemperatureForYear = (baseTemp: number, year: number) => {
  const progress = (year - 2020) / (2100 - 2020);
  return baseTemp + progress * 5;
};

// 자동 재생
let interval: ReturnType<typeof setInterval> | undefined;

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    interval = setInterval(() => {
      if (selectedYear.value >= 2100) {
        isPlaying.value = false;
        if (interval !== undefined) {
          clearInterval(interval);
        }
        return;
      }
      selectedYear.value = selectedYear.value + 5;
    }, 1000);
  } else {
    if (interval !== undefined) {
      clearInterval(interval);
    }
  }
};

onUnmounted(() => {
  if (interval !== undefined) {
    clearInterval(interval);
  }
});

const getTemperatureColor = (temp: number) => {
  if (temp < 15) return '#B3CF0A';
  if (temp < 17) return '#F4C430';
  if (temp < 18.5) return '#F47725';
  return '#EA002C';
};

// 대응방안 데이터
const countermeasures = [
  { category: '완화', action: '재생에너지 전환', priority: '높음', timeline: '즉시', cost: '높음' },
  { category: '완화', action: '에너지 효율 개선', priority: '높음', timeline: '단기', cost: '중간' },
  { category: '적응', action: '냉방 시스템 강화', priority: '중간', timeline: '중기', cost: '중간' },
  { category: '적응', action: '홍수 방어 시설 구축', priority: '높음', timeline: '중기', cost: '높음' },
  { category: '적응', action: '비상 대응 체계 구축', priority: '중간', timeline: '단기', cost: '낮음' },
];

const getPriorityColor = (priority: string) => {
  if (priority === '높음') return 'text-[#EA002C]';
  if (priority === '중간') return 'text-[#F47725]';
  return 'text-[#B3CF0A]';
};

// 사업장 위치 좌표 (SVG 맵 내 위치)
const positions = [
  { x: 210, y: 280 }, // 대덕
  { x: 230, y: 200 }, // 판교
  { x: 220, y: 210 }, // 성남
  { x: 180, y: 150 }, // 서울
  { x: 210, y: 280 }, // 대전
  { x: 225, y: 205 }, // 판교DC
  { x: 185, y: 165 }, // 보라매
  { x: 182, y: 155 }, // 종로
  { x: 228, y: 203 }, // 분당
];
</script>

<template>
  <div class="space-y-6">
    <!-- Control Panel -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">시뮬레이션 설정</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-4 gap-4">
          <!-- SSP 시나리오 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">SSP 시나리오</label>
            <select
              v-model="sspScenario"
              class="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            >
              <option value="SSP1-2.6">SSP1-2.6 (저탄소)</option>
              <option value="SSP2-4.5">SSP2-4.5 (중간)</option>
              <option value="SSP4-6.0">SSP4-6.0 (중상)</option>
              <option value="SSP5-8.5">SSP5-8.5 (고탄소)</option>
            </select>
          </div>

          <!-- 기후 변수 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">기후 변수</label>
            <select
              v-model="climateVariable"
              class="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            >
              <option value="홍수">홍수</option>
              <option value="태풍">태풍</option>
              <option value="폭염">폭염</option>
              <option value="한파">한파</option>
              <option value="지진">지진</option>
              <option value="산사태">산사태</option>
              <option value="폭설">폭설</option>
              <option value="가뭄">가뭄</option>
              <option value="해수면상승">해수면상승</option>
            </select>
          </div>

          <!-- 연도 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">연도</label>
            <select
              v-model="selectedYear"
              class="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C]"
            >
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}년
              </option>
            </select>
          </div>

          <!-- 자동 실행 버튼 -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">&nbsp;</label>
            <button
              @click="togglePlay"
              class="w-full px-4 py-2 text-sm bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors flex items-center justify-center gap-2"
            >
              <template v-if="isPlaying">
                <Pause :size="16" />
                <span>일시정지</span>
              </template>
              <template v-else>
                <Play :size="16" />
                <span>자동 실행</span>
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Map and Site List -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Map Section -->
      <div class="col-span-2 bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-sm text-gray-900">사업장 위치 및 기후 영향</h3>
            <div
              class="text-2xl"
              :style="{ color: getTemperatureColor(16 + (selectedYear - 2020) * 0.04) }"
            >
              {{ selectedYear }}년
            </div>
          </div>
        </div>
        <div class="p-6">
          <div
            class="border border-gray-200 h-[calc(100vh-400px)] min-h-[500px] relative bg-gray-50"
          >
            <!-- Temperature Scale -->
            <div class="absolute top-4 left-4 bg-white border border-gray-300 p-3 shadow-lg z-10">
              <div class="text-xs text-gray-900 mb-2">평균기온 (°C)</div>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4" style="background-color: #ea002c"></div>
                  <span class="text-xs">19.0°C 이상</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4" style="background-color: #f47725"></div>
                  <span class="text-xs">17.0-19.0°C</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4" style="background-color: #f4c430"></div>
                  <span class="text-xs">15.0-17.0°C</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4" style="background-color: #b3cf0a"></div>
                  <span class="text-xs">15.0°C 미만</span>
                </div>
              </div>
            </div>

            <!-- Thermometer -->
            <div class="absolute top-4 right-4 bg-white border border-gray-300 p-4 shadow-lg z-10">
              <div class="flex flex-col items-center">
                <div class="text-xs text-gray-900 mb-2">전국 평균</div>
                <div class="relative w-8 h-48 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="absolute bottom-0 w-full rounded-full transition-all duration-500"
                    :style="{
                      height: `${((selectedYear - 2020) / (2100 - 2020)) * 100}%`,
                      backgroundColor: getTemperatureColor(14.5 + (selectedYear - 2020) * 0.06),
                    }"
                  ></div>
                </div>
                <div
                  class="text-lg mt-2"
                  :style="{ color: getTemperatureColor(14.5 + (selectedYear - 2020) * 0.06) }"
                >
                  {{ (14.5 + (selectedYear - 2020) * 0.06).toFixed(1) }}°C
                </div>
              </div>
            </div>

            <!-- Map with Sites -->
            <div class="absolute inset-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 600 800">
                <!-- Korea outline -->
                <path
                  d="M 150 80 Q 200 50 250 80 L 280 120 Q 300 150 310 200 L 320 280 Q 310 350 280 400 L 250 430 Q 220 450 180 440 L 150 420 Q 120 380 110 330 L 100 250 Q 110 150 150 80 Z"
                  fill="#f9fafb"
                  stroke="#d1d5db"
                  stroke-width="2"
                />

                <!-- Sites as markers -->
                <g v-for="(site, index) in siteClimateData" :key="site.id">
                  <circle
                    :cx="positions[index]?.x || 200"
                    :cy="positions[index]?.y || 200"
                    r="8"
                    :fill="
                      getTemperatureColor(getTemperatureForYear(site.temperature2020, selectedYear))
                    "
                    stroke="#fff"
                    stroke-width="2"
                    opacity="0.9"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Site List -->
      <div class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">사업장 목록별 분석</h3>
        </div>
        <div class="p-4">
          <div class="space-y-2">
            <div
              v-for="site in siteClimateData"
              :key="site.id"
              class="border border-gray-200 p-3 bg-white hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm text-gray-900">{{ site.name }}</h4>
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{
                    backgroundColor: getTemperatureColor(
                      getTemperatureForYear(site.temperature2020, selectedYear)
                    ),
                  }"
                ></div>
              </div>
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600">평균기온</span>
                  <span class="text-gray-900"
                    >{{ getTemperatureForYear(site.temperature2020, selectedYear).toFixed(1) }}°C</span
                  >
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600">리스크 증가</span>
                  <span class="text-[#EA002C]">+{{ site.riskIncrease }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline Slider -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">타임라인</h3>
      </div>
      <div class="p-6">
        <div class="relative">
          <input
            type="range"
            min="2020"
            max="2100"
            step="5"
            v-model.number="selectedYear"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style="
              background: linear-gradient(
                to right,
                #b3cf0a 0%,
                #f4c430 25%,
                #f47725 50%,
                #ea002c 100%
              );
            "
          />
          <div class="flex justify-between mt-2 text-xs text-gray-600">
            <span>2020년</span>
            <span>2040년</span>
            <span>2060년</span>
            <span>2080년</span>
            <span>2100년</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Countermeasures -->
    <div class="bg-white border border-gray-200 shadow-sm">
      <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <h3 class="text-sm text-gray-900">대응방안</h3>
      </div>
      <div class="p-6">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left text-xs text-gray-600 pb-3">구분</th>
              <th class="text-left text-xs text-gray-600 pb-3">대응 조치</th>
              <th class="text-left text-xs text-gray-600 pb-3">우선순위</th>
              <th class="text-left text-xs text-gray-600 pb-3">시행 시기</th>
              <th class="text-left text-xs text-gray-600 pb-3">비용 수준</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in countermeasures"
              :key="index"
              class="border-b border-gray-100"
            >
              <td class="py-3 text-sm text-gray-900">{{ item.category }}</td>
              <td class="py-3 text-sm text-gray-900">{{ item.action }}</td>
              <td class="py-3 text-sm" :class="getPriorityColor(item.priority)">
                {{ item.priority }}
              </td>
              <td class="py-3 text-sm text-gray-900">{{ item.timeline }}</td>
              <td class="py-3 text-sm text-gray-900">{{ item.cost }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
