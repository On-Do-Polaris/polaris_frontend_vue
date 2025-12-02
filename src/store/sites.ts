import { defineStore } from 'pinia';
import { ref } from 'vue';
import { allSites as sitesData, type Site } from '@/assets/data/sites';

export type { Site };

export const useSitesStore = defineStore('sites', () => {
  const allSites = ref<Site[]>(sitesData);

  return {
    allSites,
  };
});
