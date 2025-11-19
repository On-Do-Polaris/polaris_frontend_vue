<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, AlertTriangle } from 'lucide-vue-next';
import { useSitesStore, type Site } from '@/store/sites';
import { useUiStore } from '@/store/ui';
import RiskHeatmap from '@/components/charts/RiskHeatmap.vue';
import { useRouter } from 'vue-router';

const sitesStore = useSitesStore();
const uiStore = useUiStore();
const router = useRouter();

const searchTerm = ref('');

const sites = computed(() => sitesStore.allSites);

const filteredSites = computed(() =>
  sites.value.filter(
    (site) =>
      site.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      site.location.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

const lowRiskSites = computed(
  () => sites.value.filter((s) => s.riskLevel === 'low').length
);
const highRiskSites = computed(
  () => sites.value.filter((s) => s.riskLevel === 'high').length
);

const getRiskColor = (level: string) => {
  switch (level) {
    case 'high':
      return 'bg-red-600 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-green-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

const getRiskLabel = (level: string) => {
  switch (level) {
    case 'high':
      return '높음';
    case 'medium':
      return '보통';
    case 'low':
      return '낮음';
    default:
      return '-';
  }
};

const onViewAnalysis = (siteId: string) => {
  uiStore.setSelectedSiteId(siteId);
  router.push('/analysis');
};

const onSelectSite = (site: Site) => {
  uiStore.setSelectedSite(site);
  uiStore.setSelectedSiteId(site.id);
  router.push('/analysis');
};
</script>

<template>
  <div class="bg-white">
    <!-- 상단 헤더 -->
    <div class="border-b border-gray-200 px-8 py-6 bg-white">
      <h2 class="text-gray-900 text-xl">대시보드</h2>
      <p class="text-sm text-gray-600 mt-1">
        전체 사업장의 기후 리스크 현황을 한눈에 확인할 수 있습니다.
      </p>
    </div>

    <div class="px-8 py-6">
      <!-- 사업장 현황 Section -->
      <div class="bg-white border border-gray-200 mb-6 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3">
          <h3 class="text-sm text-gray-900">사업장 현황</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-4 gap-4">
            <div class="border border-gray-200 p-5">
              <div class="text-xs text-gray-500 mb-2">총 사업장</div>
              <div class="text-2xl text-gray-900">{{ sites.length }}</div>
            </div>

            <div class="border border-gray-200 p-5">
              <div class="text-xs text-gray-500 mb-2">안전 사업장</div>
              <div class="text-2xl text-green-600">{{ lowRiskSites }}</div>
            </div>

            <div class="border border-gray-200 p-5">
              <div class="text-xs text-gray-500 mb-2">고위험 사업장</div>
              <div class="text-2xl text-[#EA002C]">{{ highRiskSites }}</div>
            </div>

            <div class="border border-gray-200 p-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-gray-500 mb-2">주요 기후 리스크</div>
                  <div class="text-2xl text-gray-900">폭염</div>
                </div>
                <div class="text-[#F47725]">
                  <AlertTriangle :size="24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 검색 Section -->
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

      <!-- Risk Heatmap Section -->
      <div class="bg-white border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">리스크 히트맵</h3>
        </div>
        <div class="relative h-[calc(100vh-500px)] min-h-[400px]">
          <!-- Legend - Left Side -->
          <div
            class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-300 p-3 shadow-lg z-10"
          >
            <div class="text-xs text-gray-900 mb-2">범례</div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-red-600 rounded-full"></div>
                <span class="text-xs text-gray-700">높음</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span class="text-xs text-gray-700">보통</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-xs text-gray-700">낮음</span>
              </div>
            </div>
          </div>

          <!-- Zoom Controls - Right Side -->
          <div class="absolute top-4 right-4 flex flex-col gap-1 z-10">
            <button
              class="bg-white/95 backdrop-blur-sm border border-gray-300 w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            >
              <span class="text-lg text-gray-700">+</span>
            </button>
            <button
              class="bg-white/95 backdrop-blur-sm border border-gray-300 w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            >
              <span class="text-lg text-gray-700">-</span>
            </button>
          </div>

          <!-- Map -->
          <RiskHeatmap :sites="sites" @select-site="onSelectSite" />
        </div>
      </div>

      <!-- Sites List Section -->
      <div class="bg-white border border-gray-200 mb-6 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h3 class="text-sm text-gray-900">사업장 목록</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th
                  class="px-6 py-4 text-left text-xs text-gray-600 bg-gray-50"
                >
                  사업장 명
                </th>
                <th
                  class="px-6 py-4 text-left text-xs text-gray-600 bg-gray-50"
                >
                  위치
                </th>
                <th
                  class="px-6 py-4 text-left text-xs text-gray-600 bg-gray-50"
                >
                  리스크 수준
                </th>
                <th
                  class="px-6 py-4 text-left text-xs text-gray-600 bg-gray-50"
                >
                  담당 기관
                </th>
                <th
                  class="px-6 py-4 text-right text-xs text-gray-600 bg-gray-50"
                >
                  리스크 점수
                </th>
                <th
                  class="px-6 py-4 text-center text-xs text-gray-600 bg-gray-50"
                >
                  상세
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                v-for="(site, index) in filteredSites"
                :key="site.id"
                :class="[
                  'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  index === filteredSites.length - 1 ? 'border-b-0' : '',
                ]"
              >
                <td class="px-6 py-4 text-gray-900">{{ site.name }}</td>
                <td class="px-6 py-4 text-gray-600">{{ site.location }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="`inline-block px-3 py-1 text-xs ${getRiskColor(
                      site.riskLevel
                    )}`"
                  >
                    {{ getRiskLabel(site.riskLevel) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ site.type }}</td>
                <td class="px-6 py-4 text-right">
                  <span class="text-gray-900">{{ site.esgScore }}</span>
                  <span class="text-gray-500 text-xs ml-0.5">점</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <button
                    @click="onViewAnalysis(site.id)"
                    class="inline-flex items-center justify-center px-5 py-2 text-xs bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
