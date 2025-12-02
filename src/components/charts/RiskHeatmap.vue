<script setup lang="ts">
import { MapPin } from 'lucide-vue-next';
import type { Site } from '@/store/sites';

interface RiskHeatmapProps {
  sites: Site[];
}

const props = defineProps<RiskHeatmapProps>();
const emit = defineEmits(['select-site']);

const getRiskColor = (level: string) => {
  switch (level) {
    case 'high':
      return '#dc2626';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

const getRiskSize = (level: string) => {
  switch (level) {
    case 'high':
      return 24;
    case 'medium':
      return 20;
    case 'low':
      return 16;
    default:
      return 16;
  }
};

const selectSite = (site: Site) => {
  emit('select-site', site);
};
</script>

<template>
  <div class="relative w-full h-full bg-gray-100">
    <!-- Map Placeholder -->
    <div class="absolute inset-0 flex items-center justify-center text-gray-400">
      <div class="text-center">
        <MapPin :size="48" class="mx-auto mb-2 text-gray-300" />
        <p class="text-sm">지도 기반 히트맵 (Geocoding 연동)</p>
      </div>
    </div>

    <!-- Risk Markers Overlay -->
    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 1000 500">
      <!-- Korea outline approximation -->
      <path
        d="M 400 100 L 450 80 L 500 100 L 520 150 L 550 200 L 560 280 L 540 350 L 500 400 L 450 420 L 400 400 L 380 350 L 370 280 L 390 200 L 400 150 Z"
        fill="none"
        stroke="#d1d5db"
        stroke-width="2"
      />

      <!-- Site Markers -->
      <g
        v-for="site in sites"
        :key="site.id"
        @click="selectSite(site)"
        class="cursor-pointer hover:opacity-80"
      >
        <!-- Pulsing circle for high risk -->
        <circle
          v-if="site.riskLevel === 'high'"
          :cx="400 + (site.coordinates.lng - 127) * 50"
          :cy="300 - (site.coordinates.lat - 35) * 50"
          :r="getRiskSize(site.riskLevel) + 8"
          :fill="getRiskColor(site.riskLevel)"
          opacity="0.2"
        >
          <animate
            attributeName="r"
            :from="getRiskSize(site.riskLevel) + 8"
            :to="getRiskSize(site.riskLevel) + 16"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.3"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        <!-- Main marker -->
        <circle
          :cx="400 + (site.coordinates.lng - 127) * 50"
          :cy="300 - (site.coordinates.lat - 35) * 50"
          :r="getRiskSize(site.riskLevel)"
          :fill="getRiskColor(site.riskLevel)"
          opacity="0.8"
        />
        <circle
          :cx="400 + (site.coordinates.lng - 127) * 50"
          :cy="300 - (site.coordinates.lat - 35) * 50"
          :r="getRiskSize(site.riskLevel) / 2"
          fill="white"
          opacity="0.5"
        />

        <!-- Label -->
        <text
          :x="400 + (site.coordinates.lng - 127) * 50"
          :y="300 - (site.coordinates.lat - 35) * 50 - getRiskSize(site.riskLevel) - 5"
          text-anchor="middle"
          font-size="12"
          fill="#111827"
          font-weight="500"
        >
          {{ site.name }}
        </text>
      </g>
    </svg>
  </div>
</template>
