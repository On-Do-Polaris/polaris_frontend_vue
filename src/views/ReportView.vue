<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Download } from 'lucide-vue-next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const activeSection = ref('이사회의 감독 체계');
const showPdfDialog = ref(false);

const menuItems = [
  {
    title: 'Governance',
    items: ['이사회의 감독 체계', '최고경영진의 역할', '임원 보상 및 성과 연계'],
  },
  {
    title: 'Strategy',
    items: [
      '영향 분석 대상 및 프로세스',
      '기후 리스크/기회 식별',
      '사업장 Level 분석',
      '포트폴리오 Level 분석',
    ],
  },
  {
    title: 'Risk Management',
    items: ['환경 리스크 통합관리', 'Value Chain 기후 리스크 관리'],
  },
  {
    title: 'Metrics and Targets',
    items: ['온실가스 배출량 및 감축 목표'],
  },
];

const contentRef = ref<HTMLDivElement | null>(null);

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

const handleScroll = () => {
  if (!contentRef.value) return;
  const scrollPosition = contentRef.value.scrollTop + 100;
  const sections = menuItems.flatMap((menu) => menu.items);

  for (let i = sections.length - 1; i >= 0; i--) {
    const sectionId = sections[i];
    if (!sectionId) continue;
    const section = document.getElementById(sectionId);
    if (section) {
      if (scrollPosition >= section.offsetTop) {
        activeSection.value = sectionId;
        break;
      }
    }
  }
};

onMounted(() => {
  contentRef.value?.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  contentRef.value?.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="bg-gray-50 h-screen flex flex-col overflow-hidden">
    <!-- TCFD Section -->
    <div class="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h2 class="text-xl text-gray-900 mb-3">기후변화 대응(TCFD)</h2>
          <p class="text-sm text-gray-700">
            SK주식회사는 TCFD 프레임워크에 따라 기후변화 대응
            거버넌스/전략/리스크 관리/지표 및 목표를 보고하고 있습니다.
            <br />
            투자부문과 사업부문별 시나리오 분석을 통하여 기후변화 대응 전략을
            수립/대응하고 있습니다.
          </p>
        </div>
        <button
          @click="showPdfDialog = true"
          class="ml-6 px-4 py-2 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <Download :size="16" />
          PDF 다운로드
        </button>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar - Fixed -->
      <div
        class="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto"
      >
        <div class="p-6">
          <div v-for="(menu, index) in menuItems" :key="index" class="mb-6">
            <h3 class="text-sm text-gray-900 mb-3">{{ menu.title }}</h3>
            <ul class="space-y-2">
              <li v-for="(item, itemIndex) in menu.items" :key="itemIndex">
                <button
                  @click="scrollToSection(item)"
                  :class="[
                    'text-sm text-left w-full py-1 transition-colors',
                    activeSection === item
                      ? 'text-[#EA002C] border-l-2 border-[#EA002C] pl-3'
                      : 'text-gray-600 hover:text-gray-900 pl-4',
                  ]"
                >
                  {{ item }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Content Area - Scrollable -->
      <div ref="contentRef" class="flex-1 overflow-y-auto bg-white">
        <div class="px-8 py-6 max-w-6xl">
          <h1
              class="text-2xl text-gray-900 mb-6"
              id="governance-section"
            >
              Governance
            </h1>

            <!-- 이사회의 감독 체계 -->
            <h2
              class="text-xl text-gray-900 mb-4"
              id="이사회의 감독 체계"
            >
              이사회의 감독 체계
            </h2>

            <h3 class="text-[#F47725] mb-3">
              전략·ESG위원회 운영
            </h3>
            <p class="text-sm text-gray-700 mb-6">
              이사회 산하 전략·ESG위원회는 회사의 중장기
              지속가능한 성장을 추진하기 위해 설치되었으며,
              기후변화 관련 주제를 관리·감독하고 기후변화 대응
              전략방향과 이행계획을 검토
            </p>

            <h4 class="text-gray-900 mb-4">기능 및 역할</h4>
            <div class="mb-6">
              <img
                alt="기능 및 역할"
                class="w-full"
              />
            </div>

            <h5 class="text-gray-900 mb-3">위원 구성</h5>
            <div class="border border-gray-200 mb-6">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="px-4 py-3 text-left text-gray-900 w-32">
                      구분
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      위원
                    </th>
                  </tr>
                </thead>
                <tbody class="text-gray-700">
                  <tr class="border-b border-gray-100">
                    <td class="px-4 py-3">사외이사</td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      이관영(위원장), 윤치원, 박현주, 김선희,
                      정종호
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3">사내이사</td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      장용호
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
             <div class="border border-gray-200 p-6 mb-8">
              <div class="flex items-center gap-2 mb-4">
                <span class="bg-[#EA002C] text-white text-xs px-2 py-1">
                  Case
                </span>
                <h5 class="text-gray-900">
                  2024년 기후변화 관련 보고 안건
                </h5>
              </div>

              <ul class="list-disc list-inside text-sm text-gray-700 mb-4 space-y-1">
                <li>
                  기후변화 관련 주제는 전략·ESG위원회에서 연 1회
                  이상 논의
                </li>
                <li>
                  2024년에는 기후변화 대응 현황, 기후 관련
                  국내외 규제/정책 동향 및 기후 공시 의무화 대응
                  방향성 등을 보고
                </li>
              </ul>

              <div class="border border-gray-200 bg-white">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                      <th class="px-4 py-3 text-left text-gray-900">
                        안건명
                      </th>
                      <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                        개최 시기
                      </th>
                      <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                        이사회 참석 현황
                      </th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-700">
                    <tr class="border-b border-gray-100">
                      <td class="px-4 py-3">
                        ESG 대응 현황 및 향후
                        계획(지속가능경영보고서 포함)
                      </td>
                      <td class="px-4 py-3 border-l border-gray-200">
                        2024년 9월 25일
                      </td>
                      <td class="px-4 py-3 border-l border-gray-200">
                        6명/6명
                      </td>
                    </tr>
                    <tr>
                      <td class="px-4 py-3">
                        ESG 공시/규제 동향 및 대응 방향
                      </td>
                      <td class="px-4 py-3 border-l border-gray-200">
                        2024년 9월 25일
                      </td>
                      <td class="px-4 py-3 border-l border-gray-200">
                        6명/6명
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <h2
              class="text-xl text-gray-900 mb-4"
              id="최고경영진의 역할"
            >
              최고경영진의 역할
            </h2>

            <ul class="space-y-4 text-sm text-gray-700 mb-8">
              <li class="flex gap-2">
                <span class="text-[#F47725]">•</span>
                <span>
                  CEO는 SK그룹 최고 협의기구인 SUPEX추구협의회의
                  환경사업위원회 위원장을 겸직하고 있으며,
                  기후변화 대응을 비롯한 ESG 주요 안건을 논의 및
                  결정
                </span>
              </li>
              <li class="flex gap-2">
                <span class="text-[#F47725]">•</span>
                <span>
                  CEO는 기후변화 대응이 투자자, 고객, 정부 등
                  주요 이해관계자에게 미치는 영향을 중요하게
                  인식하고, 친환경 비즈니스 확장 및 비즈니스
                  모델을 발굴하여 전사적 협력을 주도하며,
                  기후변화 대응 성과가 금전적 보상으로
                  연결되도록 성과 모니터링 프로세스를 통한
                  인센티브 제도 관리 및 감독
                </span>
              </li>
              <li class="flex gap-2">
                <span class="text-[#F47725]">•</span>
                <span>
                  또한 환경경영시스템(ISO 14001) 하에서 사업장의
                  환경 리스크 및 영향 평가, 내부 심사 결과를
                  정기적으로 보고받아 조직 성과를 통합 관리
                </span>
              </li>
              <li class="flex gap-2">
                <span class="text-[#F47725]">•</span>
                <span>
                  CSO(Chief Sustainability Officer)는 ESG 및
                  지속가능성 이슈를 총괄하며, 기후변화 대응을
                  포함한 ESG 관련 목표 및 성과, ESG/기후 정보
                  공시 등을 관리·감독
                </span>
              </li>
            </ul>
             <h2
              class="text-xl text-gray-900 mb-4"
              id="임원 보상 및 성과 연계"
            >
              임원 보상 및 성과 연계
            </h2>

            <h5 class="text-gray-900 mb-3">
              기후변화 대응 성과 보상 체계
            </h5>
            <div class="border border-gray-200 mb-6">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="px-4 py-3 text-left text-gray-900">
                      대상
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      내용
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      규모
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      KPI 지표
                    </th>
                  </tr>
                </thead>
                <tbody class="text-gray-700">
                  <tr class="border-b border-gray-100">
                    <td class="px-4 py-3">
                      <strong>CEO</strong>
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      Net Zero, RE100 등의 글로벌 기후변화
                      이니셔티브 참여, TCFD 정보 공개 등 주요
                      전략과제 추진 성과와 대외 이해관계자 평가
                      결과까지 인센티브 결정 반영
                    </td>
                    <td
                      class="px-4 py-3 border-l border-gray-200"
                    >
                      전사/조직/개인별 목표 대비 성과 평가에
                      따라 결정
                    </td>
                    <td
                      class="px-4 py-3 border-l border-gray-200"
                    >
                      온실가스 감축 목표, 온실가스 감축
                      프로젝트, 에너지 효율 향상 목표, 공급망
                      Engagement, 기후변화 관련 지속가능성 Index
                      등
                    </td>
                  </tr>
                  <tr class="border-b border-gray-100">
                    <td class="px-4 py-3">
                      <strong>
                        CFO, ESG 추진 임원 및 전사 임원
                      </strong>
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      CEO의 KPI와 연계하여 전사 ESG 관리 책임에
                      관한 KPI 목표 설정
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3">
                      <strong>구성원</strong>
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      구성원 상여금은 연말 개인 성과 평가와 KPI
                      달성 결과에 따라 차등 지급되며, Net Zero
                      목표 달성 수준과 ESG 지표 달성 정도가
                      가감점 요소로 적용됨
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <hr class="border-t border-gray-300 my-12" />
            <h1
              class="text-2xl text-gray-900 mb-6"
              id="strategy-section"
            >
              Strategy
            </h1>
            <h2
              class="text-xl text-gray-900 mb-4"
              id="영향 분석 대상 및 프로세스"
            >
              영향 분석 대상 및 프로세스
            </h2>

            <div class="mb-12">
              <img
                alt="리스크 및 기회 식별 프로세스"
                class="w-full"
              />
            </div>
            <p class="text-sm text-gray-700 mb-2">
              * 전환 리스크: 기업이 탄소 감축이나 친환경 사업
              전환 과정에서 새로운 법규 도입, 기술 투자, 소비자
              요구 변화 등으로 인해 발생할 수 있는 비용 증가나
              수익 감소의 위험
            </p>
            <p class="text-sm text-gray-700 mb-8">
              ** 물리적 리스크: 기후 변화로 인한 폭우, 가뭄,
              폭염, 해수면 상승 등 자연재해로 발생하는 직접적
              피해 및 경제적 손실 위험
            </p>
            <h2
              class="text-xl text-gray-900 mb-4"
              id="기후 리스크/기회 식별"
            >
              기후 리스크/기회 식별
            </h2>

            <div class="border border-gray-200 border-l-4 border-l-[#F47725] p-4 mb-6">
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex gap-2">
                  <span class="text-[#F47725]">•</span>
                  <span>
                    TCFD 프레임워크 기반하여 기후 리스크·기회를
                    식별하고, 사업 특성에 맞춰 이슈 도출
                  </span>
                </li>
                <li class="flex gap-2">
                  <span class="text-[#F47725]">•</span>
                  <span>
                    기후 전략 이행현황을 점검하고, 정책
                    변화·벤치마킹·이해관계자 요구를 반영해 중대
                    이슈 정의
                  </span>
                </li>
              </ul>
            </div>
            <h3 class="text-[#F47725] mb-3">
              이슈풀 선정 결과
            </h3>

            <ul class="space-y-2 text-sm text-gray-700 mb-4">
              <li>
                <span class="text-gray-900">
                  적용 범위:
                </span>{" "}
                전사 주요 사업과 자산, 고객까지 이어지는
                가치사슬 전반을 포함
              </li>
              <li>
                <span class="text-gray-900">
                  분석 기간:
                </span>{" "}
                단기(~2025년), 중기(~2030년), 장기(~2040년)
              </li>
              <li>
                <span class="text-gray-900">
                  Impact 적용 기준:
                </span>{" "}
                이사회 및 전략·ESG위원회 의결 안건 연계,
                이해관계자 요구, 비즈니스 영향 등을 고려
              </li>
            </ul>
            <div class="border border-gray-200 overflow-x-auto mb-2">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="px-4 py-3 text-left text-gray-900">
                      분류
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      유형*
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      리스크 및 기회
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      Time Frame
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      영향받는 Value Chain**
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      Impact
                    </th>
                  </tr>
                </thead>
                <tbody class="text-gray-700">
                  <tr class="border-b border-gray-100">
                    <td class="px-4 py-3" >
                      전환 리스크 (8)
                    </td>
                    <td
                      class="px-4 py-3 border-l border-gray-200"
                    >
                      정책/법률
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      T1: 대한민국 RE100 이행 정책 변동성
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      단기/중기/장기
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      Operation
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200 text-[#EA002C]">
                      High
                    </td>
                  </tr>
                  </tbody>
                  </table>
                  </div>
                  <p class="text-xs text-gray-600 mb-2">
              *P: Physical Risk, T: Transition Risk, O:
              Opportunity
            </p>
            <p class="text-xs text-gray-600 mb-8">
              **All: 전체 Value Chain, Operation: 사업 운영,
              Upstream: 제품 또는 서비스가 만들어지기 이전
              단계의 활동(투입물의 확보 및 가공 등), Downstream:
              제품 또는 서비스가 만들어진 이후 단계의 활동(판매,
              유통, 소비, 폐기 등)
            </p>
             <h3 class="text-[#F47725] mb-3">
              중대 리스크/기회 선정 기준
            </h3>

            <div class="border border-gray-200 mb-6">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="px-4 py-3 text-left text-gray-900 w-48">
                      구분
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      세부 내용
                    </th>
                  </tr>
                </thead>
                <tbody class="text-gray-700">
                  <tr class="border-b border-gray-100">
                    <td class="px-4 py-3 text-gray-900">
                      발생가능성 (Probability)
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      글로벌 기후 규제 및 정책 변화 속도
                      <br />
                      해당 산업 내 유사 사례 발생 빈도 및 재무적
                      영향
                      <br />
                      기후정보 공개 요구 강화
                    </td>
                  </tr>
                  <tr class="border-b border-gray-100">
                    <td class="px-4 py-3 text-gray-900">
                      심각도 (Severity)
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      사업 매출 및 비용 구조에 미치는 영향
                      <br />
                      공급망 차질 및 운영 리스크로 인한 피해
                      규모
                      <br />
                      부정적 언론 노출로 인한 기업 평판 저하 및
                      고객 신뢰도 변화 가능성
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-gray-900">
                      영향도 (Impact)
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      기후 변화 리스크·기회 요소를 종합적으로
                      분석하여 High 수준의 중대 리스크 및 기회
                      선별
                      <br />
                      산업별 특성을 반영하여 우선 대응 분야 도출
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 class="text-[#F47725] mb-3">
              중대 리스크 및 기회 식별 결과
            </h3>

            <ul class="space-y-2 text-sm text-gray-700 mb-4">
              <li class="flex gap-2">
                <span class="text-[#F47725]">•</span>
                <span>
                  이사회 연계성, 이해관계자 요구, 발생 가능성,
                  심각도, 전사적 영향도를 종합적으로 고려해 중대
                  리스크의 우선순위를 선정
                </span>
              </li>
              <li class="flex gap-2">
                <span class="text-[#F47725]">•</span>
                <span>
                  전체 리스크/기회는 SK주식회사의 사업 구조
                  특성을 고려하여 사업장 Level과 포트폴리오
                  Level로 구분
                </span>
              </li>
            </ul>
            <div class="border border-gray-200 mb-12">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="px-4 py-3 text-left text-gray-900 w-48">
                      구분
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200 w-64">
                      분류
                    </th>
                    <th class="px-4 py-3 text-left text-gray-900 border-l border-gray-200">
                      중대 리스크/기회
                    </th>
                  </tr>
                </thead>
                <tbody class="text-gray-700">
                  <tr class="border-b border-gray-100">
                    <td class="px-4 py-3" >
                      사업장 Level
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      탄소감축 이행 비용
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      T1, T3
                    </td>
                  </tr>
                  <tr class="border-b border-gray-100">
                    <td class="px-4 py-3 border-l border-gray-200">
                      데이터 센터 운영/확장에 미치는 영향
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      P1, P2, O4
                    </td>
                  </tr>
                  <tr class="border-b border-gray-100">
                    <td class="px-4 py-3" >
                      포트폴리오 Level
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      투자 영역별 노출된 기후 리스크 수준
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      T7, P1, P2
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 border-l border-gray-200">
                      저탄소 전환에 따른 시장 전망
                    </td>
                    <td class="px-4 py-3 border-l border-gray-200">
                      O1, O2, O3
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <hr class="border-t border-gray-300 my-12" />
            <h1
              class="text-2xl text-gray-900 mb-6"
              id="risk-management-section"
            >
              Risk Management
            </h1>
            <h2
              class="text-xl text-gray-900 mb-4"
              id="환경 리스크 통합관리"
            >
              환경 리스크 통합관리
            </h2>

            <h3 class="text-[#F47725] mb-3">
              운영 체계 및 프로세스
            </h3>

            <ul class="space-y-2 text-sm text-gray-700 mb-4">
              <li class="flex gap-2">
                <span class="text-[#F47725]">•</span>
                <span>
                  환경경영시스템(ISO 14001) 하에서 전사 통합
                  리스크 관리 체계(ISO 31000)와 연계, 기후
                  리스크를 사전 식별·평가하고 자가발전,
                  재생에너지 전환, 냉방효율 개선 등 선제적 대응
                  수단을 활용한 예방 활동을 병행하는 통합
                  프로세스를 운영
                </span>
              </li>
              <li class="flex gap-2">
                <span class="text-[#F47725]">•</span>
                <span>
                  연 1회 이상 내·외부 심사를 통해 리스크 평가의
                  적합성과 효과성 검증
                </span>
              </li>
              <li class="flex gap-2">
                <span class="text-[#F47725]">•</span>
                <span>
                  전사 리스크 관리 체계의 적격성을 확보하고 ESG
                  및 사업 리스크를 '식별–분석–대응–평가 및 개선'
                  프로세스를 기반으로 통합 관리
                </span>
              </li>
            </ul>
            <div class="mb-4">
              <img
                alt="전사 통합 리스크 관리 체계 프로세스"
                class="w-full border border-gray-200"
              />
            </div>
             <p class="text-xs text-gray-600 mb-8">
              * 신규 사업장(New Operation)을 포함하여 진행
              <br />
              ** 중대한 리스크에 대해서는 CEO 및 이사회에 보고
            </p>
            <h2
              class="text-xl text-gray-900 mb-4"
              id="Value Chain 기후 리스크 관리"
            >
              Value Chain 기후 리스크 관리
            </h2>

            <div class="mb-12">
              <img
                alt="Value Chain 기후 리스크 관리"
                class="w-full"
              />
            </div>
            <hr class="border-t border-gray-300 my-12" />
            <h1
              class="text-2xl text-gray-900 mb-6"
              id="metrics-section"
            >
              Metrics and Targets
            </h1>
            <h2
              class="text-xl text-gray-900 mb-4"
              id="온실가스 배출량 및 감축 목표"
            >
              온실가스 배출량 및 감축 목표
            </h2>

            <div class="mb-8">
              <img
                alt="온실가스 배출량 현황"
                class="w-full"
              />
            </div>

            <p class="text-xs text-gray-600 mb-8">
              (단위: tCO₂eq)
              <br />* 재생에너지 사용량(구매량)을 반영한
              온실가스 배출량
            </p>
        </div>
      </div>
    </div>
     <Dialog :open="showPdfDialog" @update:open="showPdfDialog = $event">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>PDF 다운로드</DialogTitle>
          <DialogDescription>
            TCFD 리포트 PDF 다운로드 기능은 현재 준비 중입니다. 곧 제공될
            예정입니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            class="bg-[#EA002C] px-4 py-2 text-sm font-medium text-white hover:bg-[#C4002A] focus:outline-none focus:ring-2 focus:ring-[#EA002C]"
            @click="showPdfDialog = false"
          >
            확인
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>