<script setup lang="ts">
// 개인정보 처리 방침 페이지
</script>

<template>
  <div class="bg-[#F9FAFB]">
    <div class="px-8 py-6">
      <!-- 페이지 헤더 -->
      <div class="mb-6 max-w-6xl mx-auto">
        <h2 class="text-[#000000]">개인정보처리방침</h2>
        <p class="text-sm text-[#8A8D8F] mt-1">
          SKALA On-Do는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한
          바를 준수합니다.
        </p>
        <p class="text-xs text-[#A7A9AB] mt-2">시행일: 2025년 12월 16일</p>
      </div>

      <div class="max-w-6xl mx-auto space-y-6">
        <!-- 목차 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">목차</h3>
          </div>
          <div class="p-6">
            <ol class="space-y-2 text-sm text-[#000000]">
              <li>1. 개인정보의 처리 목적, 수집 항목 및 보유 기간</li>
              <li>2. 개인정보의 제3자 제공</li>
              <li>3. 개인정보 처리업무의 위탁</li>
              <li>4. 개인정보의 파기 절차 및 방법</li>
              <li>5. 개인정보의 안전성 확보조치</li>
              <li>6. 브라우저 저장소 사용에 관한 사항</li>
              <li>7. 정보주체와 법정대리인의 권리 및 의무 및 행사방법</li>
              <li>8. 개인정보 보호책임자 및 고충처리 부서</li>
              <li>9. 개인정보 처리방침의 변경</li>
            </ol>
          </div>
        </div>

        <!-- 1. 개인정보의 처리 목적, 수집 항목 및 보유 기간 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">1. 개인정보의 처리 목적, 수집 항목 및 보유 기간</h3>
          </div>
          <div class="p-6 space-y-6">
            <p class="text-sm text-[#000000]">
              서비스 제공자는 「개인정보 보호법」에 따라 서비스 제공을 위해 필요 최소한의 범위에서
              다음과 같이 개인정보를 수집 및 이용합니다.
            </p>

            <!-- 1-1. 회원 가입 및 로그인 -->
            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-3">1-1. 회원 가입 및 로그인</h4>
              <div class="overflow-x-auto">
                <table class="w-full table-fixed border border-[#E5E7EB] text-sm">
                  <thead class="bg-[#F9FAFB]">
                    <tr>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[35%]">
                        처리 목적
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[40%]">
                        처리 항목
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[25%]">
                        보유 및 이용 기간
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        회원 가입 및 관리, 본인 확인 및 사용자 인증
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        이메일 주소, 비밀번호(암호화), 이름
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        회원 탈퇴 시까지
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 1-2. 사업장 정보 관리 -->
            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-3">1-2. 사업장 정보 관리</h4>
              <div class="overflow-x-auto">
                <table class="w-full table-fixed border border-[#E5E7EB] text-sm">
                  <thead class="bg-[#F9FAFB]">
                    <tr>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[35%]">
                        처리 목적
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[40%]">
                        처리 항목
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[25%]">
                        보유 및 이용 기간
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        사업장 기후 물리적 리스크 AI 평가 서비스 제공, 사업장 위치 기반 재해 분석 및
                        시뮬레이션 제공
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        사업장명, 사업장 주소(도로명주소, 지번주소), 사업장 위치 정보(위도, 경도)
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        회원 탈퇴 시까지
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 1-3. 자동 수집 정보 -->
            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-3">1-3. 자동 수집 정보</h4>
              <div class="overflow-x-auto">
                <table class="w-full table-fixed border border-[#E5E7EB] text-sm">
                  <thead class="bg-[#F9FAFB]">
                    <tr>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[35%]">
                        처리 목적
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[40%]">
                        처리 항목
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[25%]">
                        보유 및 이용 기간
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        서비스 개선 및 부정 이용 방지, 보안 유지
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        서비스 이용 기록, 접속 로그, 접속 IP 정보
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        수집일로부터 3개월
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 1-4. 법령에 따른 개인정보 보존 -->
            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-3">
                1-4. 법령에 따른 개인정보 보존
              </h4>
              <p class="text-sm text-[#8A8D8F] mb-3">
                전자상거래 등에서의 소비자보호에 관한 법률 및 통신비밀보호법에 따라 다음과 같이
                개인정보를 보존합니다.
              </p>
              <div class="overflow-x-auto">
                <table class="w-full table-fixed border border-[#E5E7EB] text-sm">
                  <thead class="bg-[#F9FAFB]">
                    <tr>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[50%]">
                        보존 근거
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[30%]">
                        보존 항목
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[20%]">
                        보존 기간
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        통신비밀보호법 제15조의2
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        접속 로그 기록
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">3개월</td>
                    </tr>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        전자상거래 등에서의 소비자보호에 관한 법률 제6조
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        계약 또는 청약철회 등에 관한 기록
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">5년</td>
                    </tr>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        전자상거래 등에서의 소비자보호에 관한 법률 제6조
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        대금결제 및 재화 등의 공급에 관한 기록
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">5년</td>
                    </tr>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        전자상거래 등에서의 소비자보호에 관한 법률 제6조
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        소비자 불만 또는 분쟁처리에 관한 기록
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">3년</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 개인정보의 제3자 제공 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">2. 개인정보의 제3자 제공</h3>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-[#000000]">
              서비스 제공자는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의
              경우는 예외로 합니다.
            </p>
            <ul class="list-disc list-inside text-sm text-[#000000] space-y-1 ml-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>
                법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의
                요구가 있는 경우
              </li>
            </ul>

            <div class="mt-6">
              <h4 class="text-sm font-medium text-[#000000] mb-3">
                외부 서비스 이용 (제공이 아닌 기능 활용)
              </h4>
              <p class="text-sm text-[#8A8D8F] mb-3">
                서비스 제공자는 다음의 외부 API를 활용하여 서비스를 제공하고 있습니다. 이는 개인정보
                제공이 아닌, 서비스 이용 과정에서 필요에 의해 호출되는 외부 API입니다.
              </p>
              <div class="overflow-x-auto">
                <table class="w-full table-fixed border border-[#E5E7EB] text-sm">
                  <thead class="bg-[#F9FAFB]">
                    <tr>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[25%]">
                        서비스명
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[15%]">
                        제공자
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[30%]">
                        이용 목적
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[30%]">
                        활용 정보
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        VWorld (브이월드)
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">국토교통부</td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        지도 표시, 주소-좌표 변환(지오코딩)
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        사업장 주소, 위경도
                      </td>
                    </tr>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        Daum 우편번호 서비스
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">카카오</td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">주소 검색</td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        없음 (사용자가 직접 입력한 주소만 조회)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 개인정보 처리업무의 위탁 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">3. 개인정보 처리업무의 위탁</h3>
          </div>
          <div class="p-6">
            <p class="text-sm text-[#000000]">
              현재 서비스 제공자는 개인정보 처리업무를 외부에 위탁하고 있지 않습니다.<br></br>향후 위탁이
              필요한 경우 「개인정보 보호법」 제26조에 따라 위탁계약 시 개인정보 보호 관련 사항을
              명시하고, 본 개인정보처리방침을 통해 공개하겠습니다.
            </p>
          </div>
        </div>

        <!-- 4. 개인정보의 파기 절차 및 방법 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">4. 개인정보의 파기 절차 및 방법</h3>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-[#000000]">
              서비스 제공자는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게
              되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
            </p>

            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-2">파기 절차</h4>
              <p class="text-sm text-[#000000]">
                서비스 제공자는 파기 사유가 발생한 개인정보를 선정하고, 개인정보 보호책임자의 승인을
                받아 개인정보를 파기합니다.
              </p>
            </div>

            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-2">파기 방법</h4>
              <ul class="list-disc list-inside text-sm text-[#000000] space-y-1 ml-2">
                <li><strong>전자적 파일:</strong> 기록을 재생할 수 없도록 영구 삭제</li>
                <li><strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 5. 개인정보의 안전성 확보조치 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">5. 개인정보의 안전성 확보조치</h3>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-[#000000]">
              서비스 제공자는 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성 확보에 필요한
              기술적 및 관리적 조치를 하고 있습니다.
            </p>

            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-2">관리적 조치</h4>
              <ul class="list-disc list-inside text-sm text-[#000000] space-y-1 ml-2">
                <li>내부관리계획 수립 및 시행</li>
                <li>정기적 직원 교육</li>
              </ul>
            </div>

            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-2">기술적 조치</h4>
              <ul class="list-disc list-inside text-sm text-[#000000] space-y-1 ml-2">
                <li>개인정보 암호화 (비밀번호 등)</li>
                <li>접근 권한 관리 및 접근통제 시스템 설치</li>
                <li>접속기록의 보관 및 점검</li>
                <li>보안프로그램 설치 및 주기적 갱신</li>
              </ul>
            </div>

            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-2">물리적 조치</h4>
              <ul class="list-disc list-inside text-sm text-[#000000] space-y-1 ml-2">
                <li>개인정보가 보관된 서버실 및 자료보관실 접근통제</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 6. 브라우저 저장소 사용에 관한 사항 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">6. 브라우저 저장소 사용에 관한 사항</h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-2">쿠키(Cookie) 사용</h4>
              <p class="text-sm text-[#000000]">
                본 서비스는 <strong>쿠키(Cookie)를 사용하지 않습니다</strong>.
              </p>
            </div>

            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-3">브라우저 저장소 사용</h4>
              <p class="text-sm text-[#8A8D8F] mb-3">
                본 서비스는 사용자 편의를 위해 다음의 브라우저 저장소를 사용합니다.
              </p>
              <div class="overflow-x-auto">
                <table class="w-full table-fixed border border-[#E5E7EB] text-sm">
                  <thead class="bg-[#F9FAFB]">
                    <tr>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[25%]">
                        저장소 유형
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[30%]">
                        저장 정보
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[25%]">
                        보유 기간
                      </th>
                      <th class="border border-[#E5E7EB] px-4 py-2 text-left text-[#000000] w-[20%]">
                        사용 목적
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        로컬 스토리지 (Local Storage)
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        인증 토큰(JWT), 사용자 ID, 사용자 이름
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        로그아웃 시 또는 회원 탈퇴 시 즉시 삭제
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        로그인 상태 유지
                      </td>
                    </tr>
                    <tr>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        세션 스토리지 (Session Storage)
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        시스템 메시지
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        브라우저 탭 종료 시 자동 삭제
                      </td>
                      <td class="border border-[#E5E7EB] px-4 py-2 text-[#000000]">
                        임시 메시지 전달
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-2">저장소 관리 방법</h4>
              <p class="text-sm text-[#000000] mb-2">
                사용자는 브라우저 설정에서 저장소를 삭제하거나 차단할 수 있습니다. 다만, 저장소 차단
                시 로그인 상태 유지가 불가능합니다.
              </p>
              <ul class="list-disc list-inside text-sm text-[#000000] space-y-1 ml-2">
                <li>
                  <strong>Chrome:</strong> 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트
                  데이터
                </li>
                <li>
                  <strong>Edge:</strong> 설정 &gt; 쿠키 및 사이트 권한 &gt; 쿠키 및 사이트 데이터
                  관리
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 7. 정보주체와 법정대리인의 권리 및 의무 및 행사방법 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">7. 정보주체와 법정대리인의 권리 및 의무 및 행사방법</h3>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-[#000000]">
              정보주체는 언제든지 다음과 같은 권리를 행사할 수 있습니다.
            </p>
            <ul class="list-disc list-inside text-sm text-[#000000] space-y-1 ml-2">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정 및 삭제 요구</li>
              <li>개인정보 처리정지 요구</li>
              <li>동의 철회</li>
            </ul>
            <p class="text-sm text-[#000000]">
              권리 행사는 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 서비스 제공자는 이에 대해
              지체 없이 조치하겠습니다.
              <br></br>
              권리 행사는 정보주체의 법정대리인이나 위임을 받은 자를
              통해서도 가능합니다.
            </p>
          </div>
        </div>

        <!-- 8. 개인정보 보호책임자 및 고충처리 부서 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">8. 개인정보 보호책임자 및 고충처리 부서</h3>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-[#000000]">
              서비스 제공자는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호 담당 부서를
              지정하고 있습니다.
            </p>

            <div class="bg-[#F9FAFB] border border-[#E5E7EB] p-4">
              <h4 class="text-sm font-medium text-[#000000] mb-2">개인정보 보호 담당부서</h4>
              <ul class="text-sm text-[#000000] space-y-1">
                <li><strong>부서명:</strong> SKALA On-Do</li>
                <li><strong>이메일:</strong> ondopolaris@gmail.com</li>
                <li><strong>주소:</strong> SK U타워 SKALA</li>
              </ul>
            </div>

            <p class="text-sm text-[#000000]">
              정보주체는 서비스 이용 중 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에
              관한 사항을 개인정보 보호 담당부서로 문의하실 수 있습니다.
            </p>

            <div>
              <h4 class="text-sm font-medium text-[#000000] mb-2">
                기타 개인정보 침해 신고 및 상담
              </h4>
              <ul class="list-disc text-sm text-[#000000] space-y-1 ml-2">
                <li>개인정보 침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
                <li>대검찰청 사이버범죄수사단 (www.spo.go.kr / 국번없이 1301)</li>
                <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 9. 개인정보 처리방침의 변경 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">9. 개인정보 처리방침의 변경</h3>
          </div>
          <div class="p-6">
            <p class="text-sm text-[#000000]">
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제
              및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지합니다.
              <br></br>
              다만, 개인정보의 수집 및 활용, 제3자 제공 등과 같이 이용자 권리의 중요한 변경이 있을
              경우에는 최소 30일 전에 고지합니다.
            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- 푸터 -->
    <div class="border-t border-[#E5E7EB]">
      <div class="max-w-6xl mx-auto text-center py-6">
        <p class="text-xs text-[#A7A9AB]">본 개인정보처리방침 시행일: 2025년 12월 16일</p>
        <p class="mt-4 text-xs text-[#A7A9AB]">© 2025 SKALA. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>
