import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Site } from '@/store/sites';

export type Page = 'dashboard' | 'analysis' | 'report' | 'settings' | 'simulation' | 'my-account' | 'site-management';

export const useUiStore = defineStore('ui', () => {
  const currentPage = ref<Page>('dashboard');
  const selectedSite = ref<Site | null>(null);
  const selectedSiteId = ref<string | null>(null);
  const showOnboarding = ref(false);

  function setCurrentPage(page: Page) {
    currentPage.value = page;
  }

  function setSelectedSite(site: Site | null) {
    selectedSite.value = site;
  }

  function setSelectedSiteId(id: string | null) {
    selectedSiteId.value = id;
  }

  function setShowOnboarding(value: boolean) {
    showOnboarding.value = value;
  }

  return {
    currentPage,
    selectedSite,
    selectedSiteId,
    showOnboarding,
    setCurrentPage,
    setSelectedSite,
    setSelectedSiteId,
    setShowOnboarding,
  };
});
