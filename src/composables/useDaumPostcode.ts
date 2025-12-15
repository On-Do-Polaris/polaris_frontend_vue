/**
 * Daum Postcode API + VWorld Geocoding
 */

import { useVWorld } from './useVWorld'

// Daum Postcode API 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void
        width?: string | number
        height?: string | number
      }) => {
        open: () => void
        embed: (element: HTMLElement) => void
      }
    }
  }
}

/**
 * Daum Postcode 결과 타입
 */
export interface DaumPostcodeData {
  /** 도로명 주소 */
  roadAddress: string
  /** 지번 주소 */
  jibunAddress: string
  /** 우편번호 */
  zonecode: string
  /** 사용자가 선택한 주소 타입 (R: 도로명, J: 지번) */
  userSelectedType: 'R' | 'J'
  /** 시도 */
  sido: string
  /** 시군구 */
  sigungu: string
  /** 읍면동 */
  bname: string
  /** 건물명 */
  buildingName: string
  /** 도로명 */
  roadname: string
  /** 법정동/법정리 이름 */
  bname1: string
  /** 건물코드 */
  buildingCode: string
  /** 아파트 여부 (Y/N) */
  apartment: string
}

/**
 * 주소 검색 결과 (통합 타입)
 */
export interface AddressResult {
  /** 전체 주소 (화면 표시용) */
  fullAddress: string
  /** 도로명 주소 */
  roadAddress: string
  /** 지번 주소 */
  jibunAddress: string
  /** 우편번호 */
  zipCode: string
  /** 시도 */
  sido: string
  /** 시군구 */
  sigungu: string
  /** 읍면동 */
  bname: string
  /** 건물명 */
  buildingName: string
  /** 위치 (시도 + 시군구) */
  location: string
  /** 위도 */
  latitude?: number
  /** 경도 */
  longitude?: number
}

export function useDaumPostcode() {
  const { geocodeAddress: vworldGeocode } = useVWorld()

  /**
   * 주소 검색 팝업 열기
   *
   * @param callback - 주소 선택 후 호출될 콜백 함수
   */
  const openAddressPopup = (callback: (result: AddressResult) => void) => {
    if (!window.daum || !window.daum.Postcode) {
      console.error('[useDaumPostcode] Daum Postcode API가 로드되지 않았습니다')
      alert(
        '주소 검색 API를 불러올 수 없습니다.\nindex.html에 Daum Postcode 스크립트가 포함되어 있는지 확인해주세요.',
      )
      return
    }

    new window.daum.Postcode({
      oncomplete: async function (data: DaumPostcodeData) {
        // 사용자가 선택한 주소 타입에 따라 주소 설정
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
        const roadAddr = data.roadAddress
        const jibunAddr = data.jibunAddress

        console.log('[useDaumPostcode] 주소 선택 완료, VWorld Geocoding 시작:', roadAddr)

        // VWorld API로 도로명 주소를 좌표로 변환
        const coords = await vworldGeocode(roadAddr)

        const result: AddressResult = {
          fullAddress: addr,
          roadAddress: roadAddr,
          jibunAddress: jibunAddr,
          zipCode: data.zonecode,
          sido: data.sido,
          sigungu: data.sigungu,
          bname: data.bname,
          buildingName: data.buildingName,
          location: `${data.sido} ${data.sigungu}`,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }

        console.log('[useDaumPostcode] 최종 결과:', result)
        callback(result)
      },
    }).open()
  }

  return {
    openAddressPopup,
  }
}
