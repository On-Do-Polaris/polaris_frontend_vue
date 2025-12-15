<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useSitesStore } from '@/store/sites'
import { useMeta } from '@/composables/useMeta'
import { useDaumPostcode } from '@/composables/useDaumPostcode'
import { analysisAPI } from '@/api/analysis'
import { toast } from 'vue-sonner'
import OnboardingLayout from '@/components/onboarding/OnboardingLayout.vue'
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1.vue'
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2.vue'
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3.vue'
import OnboardingStep5 from '@/components/onboarding/OnboardingStep5.vue'

const router = useRouter()
const authStore = useAuthStore()
const sitesStore = useSitesStore()
const { industries, fetchIndustries } = useMeta()
const { openAddressPopup } = useDaumPostcode()

const currentStep = ref<1 | 2 | 3 | 5>(1)
const step3Ref = ref<InstanceType<typeof OnboardingStep3> | null>(null)

// 추가된 사업장 정보
const addedSites = ref<
  { name: string; location: string; type: string; roadAddress?: string; siteId?: string }[]
>([])
const isSubmitting = ref(false)

// 좌표 및 주소 정보 저장
const coordinates = ref<{ latitude: number; longitude: number } | null>(null)
const addressData = ref<{ roadAddress: string; jibunAddress?: string } | null>(null)

// 진행률 계산
const progress = computed(() => {
  switch (currentStep.value) {
    case 1:
      return 25
    case 2:
      return 50
    case 3:
      return 75
    case 5:
      return 100
    default:
      return 0
  }
})

// 타이틀
const title = computed(() => {
  switch (currentStep.value) {
    case 1:
      return '사업장 추가 방법'
    case 2:
    case 5:
      return '사업장 등록'
    case 3:
      return '사업장 추가'
    default:
      return ''
  }
})

// 다음 버튼 텍스트
const nextButtonText = computed(() => {
  return currentStep.value === 2 || currentStep.value === 5 ? '시작하기' : '다음'
})

// 이전 버튼 표시 여부
const showPrevButton = computed(() => {
  // Step 3 (사업장 추가 폼)과 Step 5 (사업장 목록)에서는 이전 버튼 숨김
  return currentStep.value !== 3 && currentStep.value !== 5
})

// 다음 버튼 표시 여부
const showNextButton = computed(() => {
  // Step 2와 Step 5에서는 사업장을 1개 이상 추가했을 때만 "시작하기" 버튼 표시
  if (currentStep.value === 2 || currentStep.value === 5) {
    return addedSites.value.length > 0
  }
  return currentStep.value !== 3
})

// 컴포넌트 마운트 시 산업 분류 및 사업장 목록 로드
onMounted(async () => {
  await fetchIndustries()

  // 서버에서 기존 사업장 목록 가져오기
  await sitesStore.fetchSites()

  // 서버 데이터를 addedSites 형식으로 매핑
  addedSites.value = sitesStore.allSites.map((site) => {
    const industryName =
      industries.value.find((i) => i.code === site.siteType)?.name || site.siteType
    return {
      name: site.siteName,
      location: `${site.jibunAddress || site.roadAddress}`,
      type: industryName,
      roadAddress: site.roadAddress,
      siteId: site.siteId,
    }
  })

  // 사업장이 있으면 Step 5 표시, 없으면 Step 1 표시
  if (addedSites.value.length > 0) {
    currentStep.value = 5
  }
})

// 닫기
const handleClose = () => {
  // 온보딩을 건너뛰는 경우
  authStore.completeFirstLogin()
  router.push('/')
}

// 이전
const handlePrev = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1
  } else if (currentStep.value === 5) {
    currentStep.value = 2
  }
}

// 다음
const handleNext = async () => {
  if (currentStep.value === 1) {
    currentStep.value = 2
  } else if (currentStep.value === 2 || currentStep.value === 5) {
    // 시작하기 버튼 클릭 시 분석 시작
    try {
      // 모든 사업장의 siteId 수집
      const siteIds = sitesStore.allSites.map((site) => site.siteId)

      if (siteIds.length === 0) {
        toast.error('등록된 사업장이 없습니다.')
        return
      }

      // 분석 시작 API 호출
      await analysisAPI.startAllSitesAnalysis(siteIds)

      // 온보딩 완료 처리
      authStore.completeFirstLogin()

      // 분석 대기 페이지로 이동
      router.push('/analysis-waiting')
    } catch (error) {
      console.error('분석 시작 실패:', error)
      toast.error('분석 시작에 실패했습니다.')
    }
  }
}

// Step 2에서 사업장 추가 클릭
const handleAddSite = () => {
  currentStep.value = 3
}

// Step 3에서 취소
const handleCancelAdd = () => {
  if (addedSites.value.length > 0) {
    currentStep.value = 5
  } else {
    currentStep.value = 2
  }
}

// Step 3에서 주소 검색
const handleSearchAddress = () => {
  openAddressPopup((result) => {
    console.log('[Onboarding] 주소 선택 완료:', result)

    // 화면 표시용: 전체 주소
    const displayAddress = result.fullAddress
    const location = result.location

    // Step3 컴포넌트에 주소 설정 (화면 표시용)
    step3Ref.value?.setAddress(displayAddress, location)

    // 주소 데이터 저장
    addressData.value = {
      roadAddress: result.roadAddress,
      jibunAddress: result.jibunAddress || undefined,
    }

    // useDaumPostcode에서 이미 지오코딩을 완료했으므로 결과에서 바로 가져옴
    if (result.latitude && result.longitude) {
      coordinates.value = {
        latitude: result.latitude,
        longitude: result.longitude,
      }
      console.log('[Onboarding] 좌표 설정 완료:', coordinates.value)
      toast.success('주소와 좌표가 설정되었습니다')
    } else {
      console.warn('[Onboarding] 좌표 정보가 없습니다')
      toast.warning('주소는 설정되었으나 좌표 정보를 가져올 수 없습니다.')
      coordinates.value = null
    }
  })
}

// Step 3에서 사업장 추가 제출
const handleSubmitSite = async (data: {
  name: string
  address: string
  location: string
  type: string
}) => {
  if (isSubmitting.value) return

  // 좌표 확인
  if (!coordinates.value) {
    toast.error('주소를 먼저 검색해주세요.')
    return
  }

  isSubmitting.value = true

  try {
    // 사업장 생성 (저장된 좌표 및 주소 데이터 사용)
    await sitesStore.createSite({
      name: data.name,
      location: data.location,
      address: data.address,
      type: data.type,
      latitude: coordinates.value.latitude,
      longitude: coordinates.value.longitude,
      roadAddress: addressData.value?.roadAddress,
      jibunAddress: addressData.value?.jibunAddress,
    })

    // 서버에서 전체 사업장 목록 다시 가져오기
    await sitesStore.fetchSites()

    // 서버 데이터를 addedSites 형식으로 매핑
    addedSites.value = sitesStore.allSites.map((site) => {
      const industryName =
        industries.value.find((i) => i.code === site.siteType)?.name || site.siteType
      return {
        name: site.siteName,
        location: `${site.jibunAddress || site.roadAddress}`,
        type: industryName,
        roadAddress: site.roadAddress,
        siteId: site.siteId,
      }
    })

    // 좌표 및 주소 데이터 초기화
    coordinates.value = null
    addressData.value = null

    // Step 5로 이동
    currentStep.value = 5
  } catch (error) {
    console.error('사업장 추가 실패:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Step 5에서 사업장 추가 버튼 클릭
const handleAddMoreSite = () => {
  currentStep.value = 3
}

// Step 5에서 사업장 삭제
const handleDeleteSite = async (index: number) => {
  const site = addedSites.value[index]

  if (!site) return

  if (!site.siteId) {
    // siteId가 없으면 배열에서만 제거
    addedSites.value.splice(index, 1)
    return
  }

  try {
    await sitesStore.deleteSite(site.siteId)

    // 서버에서 전체 사업장 목록 다시 가져오기
    await sitesStore.fetchSites()

    // 서버 데이터를 addedSites 형식으로 매핑
    addedSites.value = sitesStore.allSites.map((site) => {
      const industryName =
        industries.value.find((i) => i.code === site.siteType)?.name || site.siteType
      return {
        name: site.siteName,
        location: `${site.jibunAddress || site.roadAddress}`,
        type: industryName,
        roadAddress: site.roadAddress,
        siteId: site.siteId,
      }
    })

    // 모든 사업장이 삭제되면 Step 2로 돌아감
    if (addedSites.value.length === 0) {
      currentStep.value = 2
    }
  } catch (error) {
    console.error('사업장 삭제 실패:', error)
  }
}
</script>

<template>
  <div>
    <OnboardingLayout
      :title="title"
      :progress="progress"
      :show-prev-button="showPrevButton"
      :show-next-button="showNextButton"
      :next-button-text="nextButtonText"
      @close="handleClose"
      @prev="handlePrev"
      @next="handleNext"
    >
      <!-- Step 1: 안내 -->
      <OnboardingStep1 v-if="currentStep === 1" />

      <!-- Step 2: 빈 사업장 목록 -->
      <OnboardingStep2 v-if="currentStep === 2" @add-site="handleAddSite" />

      <!-- Step 3: 사업장 추가 폼 -->
      <OnboardingStep3
        v-if="currentStep === 3"
        ref="step3Ref"
        :industries="industries"
        @cancel="handleCancelAdd"
        @submit="handleSubmitSite"
        @search-address="handleSearchAddress"
      />

      <!-- Step 5: 등록 완료 -->
      <OnboardingStep5
        v-if="currentStep === 5"
        :sites="addedSites"
        @add-site="handleAddMoreSite"
        @delete-site="handleDeleteSite"
      />
    </OnboardingLayout>
  </div>
</template>
