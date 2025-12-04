import { defineStore } from 'pinia'
import { ref } from 'vue'
import { siteAPI } from '@/api'
import type { Site, CreateSiteRequest, UpdateSiteRequest } from '@/api/types'
import { toast } from 'vue-sonner'

export type { Site }

export const useSitesStore = defineStore('sites', () => {
  // State
  const allSites = ref<Site[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 사업장 목록 조회
   */
  const fetchSites = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await siteAPI.getSites()
      allSites.value = response.sites
    } catch (err) {
      error.value = err as Error
      console.error('사업장 목록 조회 실패:', err)
      toast.error('사업장 목록을 불러오는데 실패했습니다.')
    } finally {
      loading.value = false
    }
  }

  /**
   * 사업장 생성
   */
  const createSite = async (data: CreateSiteRequest): Promise<Site> => {
    loading.value = true
    error.value = null

    try {
      const newSite = await siteAPI.createSite(data)
      allSites.value.push(newSite)
      toast.success('사업장이 생성되었습니다.')
      return newSite
    } catch (err) {
      error.value = err as Error
      console.error('사업장 생성 실패:', err)
      toast.error('사업장 생성에 실패했습니다.')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 사업장 수정
   */
  const updateSite = async (siteId: string, data: UpdateSiteRequest): Promise<Site> => {
    loading.value = true
    error.value = null

    try {
      const updatedSite = await siteAPI.updateSite(siteId, data)
      const index = allSites.value.findIndex((s) => s.siteId === siteId)
      if (index !== -1) {
        allSites.value[index] = updatedSite
      }
      toast.success('사업장 정보가 수정되었습니다.')
      return updatedSite
    } catch (err) {
      error.value = err as Error
      console.error('사업장 수정 실패:', err)
      toast.error('사업장 수정에 실패했습니다.')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 사업장 삭제
   */
  const deleteSite = async (siteId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await siteAPI.deleteSite(siteId)
      allSites.value = allSites.value.filter((s) => s.siteId !== siteId)
      toast.success('사업장이 삭제되었습니다.')
    } catch (err) {
      error.value = err as Error
      console.error('사업장 삭제 실패:', err)
      toast.error('사업장 삭제에 실패했습니다.')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    allSites,
    loading,
    error,
    // Actions
    fetchSites,
    createSite,
    updateSite,
    deleteSite
  }
})
