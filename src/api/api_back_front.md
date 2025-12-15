# Frontend-Backend API 연동 가이드

**버전**: v1.1
**작성일**: 2025-12-08
**대상**: Vue.js 프론트엔드 팀

이 문서는 Vue.js 프론트엔드와 Spring Boot 백엔드 간의 API 연동을 위한 상세 명세서입니다.
기존 가이드 문서를 바탕으로 실제 구현에 필요한 상세 요청/응답 예시와 타입 정보를 포함하고 있습니다.

---

## 📋 목차

1. [설정 및 공통 사항](#1-설정-및-공통-사항)
2. [인증 (Auth)](#2-인증-auth)
3. [사용자 및 사업장 관리](#3-사용자-및-사업장-관리)
4. [분석 (Analysis) - 핵심 기능](#4-분석-analysis---핵심-기능)
5. [시뮬레이션 (Simulation)](#5-시뮬레이션-simulation)
6. [리포트 및 메타데이터](#6-리포트-및-메타데이터)

---

## 1. 설정 및 공통 사항

### 기본 설정

*   **Base URL**:
    *   Development: `http://localhost:8080`
    *   Production: `https://api.skax-polaris.com` (예시)
*   **Timeouts**: 30초 (분석 요청 등 오래 걸리는 작업은 비동기 처리됨)

### 헤더 (Headers)

모든 API 요청에는 다음 헤더가 포함되어야 합니다. (로그인/회원가입 제외)

```http
Content-Type: application/json
Authorization: Bearer {Access_Token}
```

### 에러 처리 및 토큰 갱신 로직

`src/api/client.ts`에 이미 구현된 인터셉터를 활용합니다.
*   **401 Unauthorized**: Access Token 만료 시 자동으로 `POST /api/auth/refresh`를 호출하여 토큰을 갱신하고 원래 요청을 재시도합니다.
*   **재시도 실패**: Refresh Token도 만료된 경우 로그아웃 처리하고 로그인 페이지로 리다이렉트합니다.

---

## 2. 인증 (Auth)

**파일 위치**: `src/api/auth.ts`

### 2.1 로그인

*   **Endpoint**: `POST /api/auth/login`
*   **Request**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123!"
    }
    ```
*   **Response**:
    ```json
    {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "dGhpcyBpcy...",
      "tokenType": "Bearer",
      "expiresIn": 3600,
      "user": {
        "id": "uuid-string",
        "email": "user@example.com",
        "name": "김SK",
        "role": "USER"
      }
    }
    ```

### 2.2 회원가입

*   **Endpoint**: `POST /api/auth/register`
*   **Request**:
    ```json
    {
      "email": "newuser@example.com",
      "password": "password123!",
      "name": "박SK",
      "organizationName": "SK C&C",
      "phone": "010-1234-5678"
    }
    ```
*   **Response**: `201 Created`
    ```json
    {
      "userId": "newuser@example.com"
    }
    ```

---

## 3. 사용자 및 사업장 관리

**파일 위치**: `src/api/users.ts`, `src/api/sites.ts`

### 3.1 내 정보 조회

*   **Endpoint**: `GET /api/users/me`
*   **Response**:
    ```json
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "김SK",
      "organizationName": "SK C&C",
      "phone": "010-1234-5678",
      "role": "USER",
      "createdAt": "2025-01-01T10:00:00"
    }
    ```

### 3.2 사업장 목록 조회

*   **Endpoint**: `GET /api/sites`
*   **Response**:
    ```json
    {
      "sites": [
        {
          "id": "site-uuid-1",
          "name": "SK 하이닉스 이천공장",
          "address": "경기도 이천시 부발읍",
          "latitude": 37.24,
          "longitude": 127.48,
          "industryType": "SEMICONDUCTOR",
          "riskScore": 75.5,
          "updatedAt": "2025-12-01T09:00:00"
        }
      ]
    }
    ```

### 3.3 사업장 생성 (온보딩)

`LocationPicker.vue`에서 선택한 좌표를 사용합니다.

*   **Endpoint**: `POST /api/sites`
*   **Request**:
    ```json
    {
      "name": "부산 데이터센터",
      "roadAddress": "부산광역시 강서구...",
      "jibunAddress": "부산광역시 강서구...",
      "latitude": 35.1,
      "longitude": 128.9,
      "industryType": "IT",
      "buildingType": "OFFICE",
      "buildingAge": 5,
      "floorArea": 12000.0,
      "assetValue": 50000000000
    }
    ```

---

## 4. 분석 (Analysis) - 핵심 기능

`AnalysisView.vue`는 5개의 탭으로 구성되어 있으며, 각 탭은 특정 API 데이터를 필요로 합니다.
**공통**: 모든 분석 API는 URL 경로에 `{siteId}`를 포함합니다.

**파일 위치**: `src/api/analysis.ts`

### Step 0: 분석 시작 및 상태 확인 (선행 작업)

사업장을 등록한 직후나 '재분석' 버튼 클릭 시 수행합니다.

1.  **시작**: `POST /api/sites/{siteId}/analysis/start`
    *   Body: `{ "latitude": ..., "longitude": ..., "industryType": ... }`
    *   Response: `{ "jobId": "job-uuid", "status": "running", ... }`
2.  **폴링 (Polling)**: `GET /api/sites/{siteId}/analysis/status/{jobId}`
    *   3~5초 간격으로 호출.
    *   Response의 `status`가 `"completed"`가 되면 폴링 종료하고 아래 탭별 데이터 조회 시작.

---

### Tab 1: 개요 (Overview)
**컴포넌트**: `AnalysisOverviewTab.vue`

통합 분석 결과를 보여주는 탭입니다.

*   **API**: `GET /api/sites/{siteId}/analysis/total`
*   **Query Param**: `?hazardType={type}` (기본값: 전체 또는 대표 리스크)
*   **Response**:
    ```json
    {
      "siteId": "...",
      "totalRiskScore": 82,
      "riskGrade": "HIGH", // HIGH, MEDIUM, LOW
      "mainRiskFactors": [
        { "type": "TYPHOON", "score": 85 },
        { "type": "FLOOD", "score": 70 }
      ],
      "financialImpact": 1250000000 // 예상 손실액 (원)
    }
    ```

---

### Tab 2: SSP 시나리오 (Climate Scenario)
**컴포넌트**: `AnalysisSSPTab.vue`

기후 변화 시나리오(SSP)에 따른 미래 리스크 변화를 보여줍니다.

*   **API**: `GET /api/sites/{siteId}/analysis/physical-risk-scores`
*   **Query Param**: `?hazardType=HEATWAVE` (선택 사항)
*   **Response**:
    ```json
    {
      "scenarios": [
        {
          "scenario": "SSP2-4.5", // 중간 배출 시나리오
          "riskType": "HEATWAVE",
          "shortTerm": { "q1": 60, "q2": 70, "q3": 85, "q4": 50 }, // 계절별 점수
          "midTerm": { "year2026": 65, "year2030": 75, ... },
          "longTerm": { "year2030s": 75, "year2050s": 85 }
        },
        {
          "scenario": "SSP5-8.5", // 고탄소 배출 시나리오
          ...
        }
      ]
    }
    ```

---

### Tab 4: 재무 영향 (Financial Impact)
**컴포넌트**: `AnalysisFinancialTab.vue`

리스크로 인한 예상 재무 손실(VaR, AAL)을 보여줍니다.

*   **API**: `GET /api/sites/{siteId}/analysis/financial-impacts`
*   **Response**:
    ```json
    {
      "currency": "KRW",
      "assetValue": 50000000000,
      "scenarios": [
        {
          "scenario": "SSP2-4.5",
          "riskType": "TYPHOON",
          "aal": 0.015, // 연평균 예상 손실율 (1.5%)
          "expectedLossAmount": 750000000
        }
      ]
    }
    ```

---

### Tab 5: 취약성 (Vulnerability)
**컴포넌트**: `AnalysisVulnerabilityTab.vue`

건물/설비의 내구성과 취약 요소를 상세 분석합니다.

*   **API**: `GET /api/sites/{siteId}/analysis/vulnerability`
*   **Response**:
    ```json
    {
      "buildingVulnerability": {
        "score": 60,
        "details": [
          { "category": "Roof", "status": "WEAK", "comment": "노후화된 지붕재" },
          { "category": "Drainage", "status": "GOOD", "comment": "배수 시설 양호" }
        ]
      },
      "equipmentVulnerability": { ... }
    }
    ```

---

## 5. 시뮬레이션 (Simulation)

**파일 위치**: `src/api/simulation.ts`

### 5.1 사업장 이전 비교

`LocationSimulation.vue`에서 사용합니다.

*   **Endpoint**: `POST /api/simulation/relocation/compare`
*   **Request**:
    ```json
    {
      "currentSiteId": "site-uuid-1",
      "targetLocations": [
        { "latitude": 36.5, "longitude": 127.5, "name": "세종 후보지" }
      ]
    }
    ```
*   **Response**: 현재 위치와 후보지의 리스크 점수 비교 데이터 반환.

### 5.2 기후 시뮬레이션

`ClimateSimulation.vue`에서 지도 위에 레이어를 띄울 때 사용합니다.

*   **Endpoint**: `POST /api/simulation/climate`
*   **Request**:
    ```json
    {
      "siteId": "site-uuid-1",
      "sspScenario": "SSP5-8.5",
      "targetYear": 2050
    }
    ```

---

## 6. 리포트 및 메타데이터

**파일 위치**: `src/api/reports.ts`, `src/api/meta.ts`

*   **리포트 생성**: `POST /api/reports` (Body: `{ "siteId": "..." }`)
*   **PDF 다운로드**: `GET /api/reports/pdf` (Blob Response 처리 필요)
*   **메타데이터**:
    *   `GET /api/meta/hazards` -> `["FLOOD", "TYPHOON", "HEATWAVE", ...]`
    *   `GET /api/meta/industries` -> `["MANUFACTURING", "SERVICE", ...]`