<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const chartData = {
  labels: ['태풍', '홍수', '폭염', '한파', '가뭄', '폭설', '해수면상승'],
  datasets: [
    {
      label: '예상 손실률 (%)',
      backgroundColor: '#dc042b',
      data: [3.2, 2.8, 2.1, 1.5, 1.2, 0.9, 0.5],
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: '손실률 (%)',
      },
    },
  },
};
</script>

<template>
  <div class="h-[300px]">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>