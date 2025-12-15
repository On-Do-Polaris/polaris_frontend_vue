/**
 * VWorld API 활용 Composable
 * 지도 타일 레이어 및 Geocoding 제공
 */

/**
 * VWorld Geocoding API 응답 타입
 */
interface VWorldGeocodeResponse {
  response: {
    status: string
    result?: {
      point: {
        x: string // 경도
        y: string // 위도
      }
    }
  }
}

export function useVWorld() {
  const API_KEY = import.meta.env.VITE_VWORLD_API || ''

  if (!API_KEY) {
    console.error(
      '[VWorld] API Key가 설정되지 않았습니다. .env 파일에 VITE_VWORLD_API를 추가해주세요.',
    )
  } else {
    console.log('[VWorld] API Key 로드 완료:', API_KEY.substring(0, 10) + '...')
  }

  /**
   * WMTS 타일 레이어 URL 생성
   * @param layerName - 레이어 이름 (Base: 기본지도, Satellite: 위성영상, Hybrid: 하이브리드)
   * @returns WMTS URL 템플릿
   */
  const getWMTSUrl = (layerName: 'Base' | 'Satellite' | 'Hybrid' = 'Base') => {
    // 개발/프로덕션 모두 프록시를 통해 요청 (nginx에서 CORS 처리)
    const baseUrl = '/vworld-api'
    // VWorld WMTS 형식: {z}/{x}/{y} 순서 (TileMatrixSet 생략 시 기본값 사용)
    const url = `${baseUrl}/req/wmts/1.0.0/${API_KEY}/${layerName}/{z}/{x}/{y}.png`
    console.log('[VWorld] WMTS URL 생성:', url.replace(API_KEY, 'API_KEY'))
    return url
  }

  /**
   * 주소 -> 좌표 변환 (Geocoding)
   * VWorld Geocoding API를 사용하여 주소를 위경도 좌표로 변환
   * @param address - 변환할 주소
   * @returns 좌표 정보 { latitude, longitude }
   */
  const geocodeAddress = async (
    address: string,
  ): Promise<{ latitude: number; longitude: number } | null> => {
    if (!API_KEY) {
      console.error('[VWorld] API Key가 없어 Geocoding을 수행할 수 없습니다')
      return null
    }

    try {
      console.log('[VWorld] Geocoding 시작:', address)

      // 개발/프로덕션 모두 프록시를 통해 요청 (nginx에서 CORS 처리)
      const baseUrl = '/vworld-api'

      // 주소 정제 (특별시/광역시 축약형 처리)
      const refinedAddress = address.replace('특별시 ', ' ').replace('광역시 ', ' ').trim()

      console.log('[VWorld] 정제된 주소:', refinedAddress)

      // VWorld Geocoding API 호출
      const params = new URLSearchParams({
        service: 'address',
        request: 'getcoord',
        crs: 'epsg:4326', // WGS84 좌표계
        address: refinedAddress,
        format: 'json',
        type: 'road', // 도로명주소 우선
        key: API_KEY,
      })

      const url = `${baseUrl}/req/address?${params.toString()}`
      console.log('[VWorld] API 요청 (도로명):', url.replace(API_KEY, 'API_KEY'))

      const response = await fetch(url)
      if (!response.ok) {
        console.error('[VWorld] API 요청 실패:', response.status, response.statusText)
        return null
      }

      const data: VWorldGeocodeResponse = await response.json()
      console.log('[VWorld] API 응답 (도로명):', data)

      if (data.response.status === 'OK' && data.response.result) {
        const coords = {
          latitude: parseFloat(data.response.result.point.y),
          longitude: parseFloat(data.response.result.point.x),
        }
        console.log('[VWorld] 도로명주소로 좌표 변환 성공:', refinedAddress, '->', coords)
        return coords
      }

      // 도로명주소 실패 시 지번주소로 재시도
      console.log('[VWorld] 도로명주소 검색 실패, 지번주소로 재시도')
      params.set('type', 'parcel')
      const retryUrl = `${baseUrl}/req/address?${params.toString()}`
      console.log('[VWorld] API 요청 (지번):', retryUrl.replace(API_KEY, 'API_KEY'))

      const retryResponse = await fetch(retryUrl)
      if (!retryResponse.ok) {
        console.error('[VWorld] 재시도 API 요청 실패:', retryResponse.status)
        return null
      }

      const retryData: VWorldGeocodeResponse = await retryResponse.json()
      console.log('[VWorld] API 응답 (지번):', retryData)

      if (retryData.response.status === 'OK' && retryData.response.result) {
        const coords = {
          latitude: parseFloat(retryData.response.result.point.y),
          longitude: parseFloat(retryData.response.result.point.x),
        }
        console.log('[VWorld] 지번주소로 좌표 변환 성공:', refinedAddress, '->', coords)
        return coords
      }

      // 모든 시도 실패
      console.warn('[VWorld] 모든 주소 변환 시도 실패')
      console.warn('  - 도로명 응답:', data.response.status)
      console.warn('  - 지번 응답:', retryData.response.status)
      console.warn('  - 원본 주소:', address)
      console.warn('  - 정제 주소:', refinedAddress)
      return null
    } catch (error) {
      console.error('[VWorld] Geocoding 오류:', error)
      return null
    }
  }

  return {
    getWMTSUrl,
    geocodeAddress,
  }
}
