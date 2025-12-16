import apiClient from './client'
import type {
  AdditionalDataInput,
  AdditionalDataItem,
  AdditionalDataListResponse,
  StructuredDataResponse,
} from './types'

export const additionalDataAPI = {
  /**
   * 추가 데이터 목록 조회
   */
  getList: async (siteId: string): Promise<AdditionalDataListResponse> => {
    const response = await apiClient.get<AdditionalDataListResponse>(
      `/sites/${siteId}/additional-data`,
    )
    return response.data
  },

  /**
   * 추가 데이터 업로드
   */
  upload: async (siteId: string, data: AdditionalDataInput): Promise<AdditionalDataItem> => {
    const response = await apiClient.post<AdditionalDataItem>(
      `/sites/${siteId}/additional-data`,
      data,
    )
    return response.data
  },

  /**
   * 정형화된 데이터 조회
   */
  getStructured: async (siteId: string, dataId: string): Promise<StructuredDataResponse> => {
    const response = await apiClient.get<StructuredDataResponse>(
      `/sites/${siteId}/additional-data/${dataId}/structured`,
    )
    return response.data
  },

  /**
   * 추가 데이터 삭제
   */
  delete: async (siteId: string, dataId: string): Promise<void> => {
    await apiClient.delete(`/sites/${siteId}/additional-data/${dataId}`)
  },
}
