<script setup lang="ts">
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const chartData = {
  labels: ['2024', '2026', '2028', '2030', '2032', '2034', '2036', '2038', '2040'],
  datasets: [
    {
      label: '현 상태 유지',
      borderColor: '#dc042b',
      backgroundColor: '#dc042b',
      data: [125, 128, 132, 135, 138, 142, 145, 148, 152],
      fill: false,
      tension: 0.4,
    },
    {
      label: '대응방안 실행',
      borderColor: '#10b981',
      backgroundColor: '#10b981',
      data: [125, 115, 105, 92, 78, 65, 52, 38, 25],
      fill: false,
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: '배출량 (천 tCO2eq)',
      },
    },
  },
};
</script>

<template>
  <div class="h-[350px]">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>