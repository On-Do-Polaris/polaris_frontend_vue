<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSitesStore } from '@/store/sites';
import { useUiStore } from '@/store/ui';
import { ChevronDown } from 'lucide-vue-next';
import AnalysisOverviewTab from '@/components/analysis/AnalysisOverviewTab.vue';
import AnalysisDisasterTab from '@/components/analysis/AnalysisDisasterTab.vue';
import AnalysisSSPTab from '@/components/analysis/AnalysisSSPTab.vue';
import AnalysisFinancialTab from '@/components/analysis/AnalysisFinancialTab.vue';
import AnalysisVulnerabilityTab from '@/components/analysis/AnalysisVulnerabilityTab.vue';

const sitesStore = useSitesStore();
const uiStore = useUiStore();

const selectedSiteId = ref(uiStore.selectedSiteId || '5');
const activeTab = ref('overview');

const tabs = [
  { id: 'overview', label: '개요' },
  { id: 'disaster', label: '과거재난' },
  { id: 'ssp', label: 'SSP' },
  { id: 'financial', label: '재무 영향' },
  { id: 'vulnerability', label: '취약성' },
];

const sites = computed(() => sitesStore.allSites);
</script>

<template>
  <div class="bg-white">
    <!-- 상단 헤더 -->
    <div class="border-b border-gray-200 px-8 py-6 bg-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-gray-900 text-xl">분석</h2>
          <p class="text-sm text-gray-600 mt-1">
            선택한 사업장의 물리적 리스크, 전환 리스크, ESG 진단 결과를 확인할
            수 있습니다.
          </p>
        </div>
        <div class="relative">
          <select
            v-model="selectedSiteId"
            class="appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#EA002C] focus:ring-1 focus:ring-[#EA002C] cursor-pointer min-w-[200px]"
          >
            <option v-for="site in sites" :key="site.id" :value="site.id">
              {{ site.name }}
            </option>
          </select>
          <ChevronDown
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            :size="18"
          />
        </div>
      </div>
    </div>

    <div class="px-8 py-6">
      <!-- 탭 메뉴 -->
      <div class="flex items-end justify-between border-b border-gray-200">
        <div class="flex gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-5 pb-2.5 pt-0 text-sm transition-colors relative',
              activeTab === tab.id
                ? 'text-[#EA002C]'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA002C] translate-y-px"
            ></div>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="mt-6">
        <AnalysisOverviewTab v-if="activeTab === 'overview'" />
        <AnalysisDisasterTab v-if="activeTab === 'disaster'" />
        <AnalysisSSPTab v-if="activeTab === 'ssp'" />
        <AnalysisFinancialTab v-if="activeTab === 'financial'" />
        <AnalysisVulnerabilityTab v-if="activeTab === 'vulnerability'" />
      </div>
    </div>
  </div>
</template>