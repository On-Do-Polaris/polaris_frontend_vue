import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SiteInfo } from '@/store/sites';

export type Page = 'dashboard' | 'analysis' | 'report' | 'settings' | 'simulation' | 'disaster' | 'my-account' | 'site-management';

export const useUiStore = defineStore('ui', () => {
  const currentPage = ref<Page>('dashboard');
  const selectedSite = ref<SiteInfo | null>(null);
  const selectedSiteId = ref<string | null>(null);
  const showOnboarding = ref(false);

  function setCurrentPage(page: Page) {
    currentPage.value = page;
  }

  function setSelectedSite(site: SiteInfo | null) {
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
