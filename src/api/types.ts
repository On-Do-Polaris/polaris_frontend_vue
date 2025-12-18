// src/api/types.ts

// 공통 에러 타입
export interface ApiError {
  timestamp?: string
  status?: number
  error?: string
  message: string
  path?: string
}

// ============================================================================
// 1. 인증 (Auth) & 사용자 (User)
// ============================================================================

export interface RegisterRequest {
  email: string
  name: string
  password: string
  verificationCode?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userId: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface PasswordResetEmailRequest {
  email: string
}

export interface PasswordResetVerifyCodeRequest {
  email: string
  code: string
}

export interface PasswordResetCompleteRequest {
  email: string
  newPassword: string
}

export interface RegisterEmailRequest {
  email: string
}

export interface VerifyCodeRequest {
  email: string
  verificationCode: string
}

export interface UserResponse {
  email: string
  name: string
  language: 'ko' | 'en'
}

export interface UpdateUserRequest {
  language?: 'ko' | 'en'
}

// ============================================================================
// 2. 메타데이터 (Meta)
// ============================================================================

export interface Industry {
  id: number
  code: string
  name: string
  description?: string
}

export interface HazardType {
  id: number
  code: string
  name: string
  nameEn?: string
  category: 'TEMPERATURE' | 'WATER' | 'WIND' | 'OTHER'
  description?: string
}

// ============================================================================
// 3. 사업장 (Site)
// ============================================================================

export interface SiteResponse {
  sites: SiteInfo[]
}

export interface SiteInfo {
  siteId: string
  siteName: string
  latitude: number
  longitude: number
  jibunAddress?: string
  roadAddress?: string
  siteType: string
  // 프론트엔드 호환성을 위한 추가 필드
  location?: string
}

export interface CreateSiteRequest {
  name: string
  location: string
  address: string
  type: string
  latitude?: number
  longitude?: number
  roadAddress?: string
  jibunAddress?: string
}

export interface UpdateSiteRequest {
  name?: string
  roadAddress?: string
  jibunAddress?: string
  latitude?: number
  longitude?: number
  type?: string
}

// ============================================================================
// 4. 대시보드 (Dashboard)
// ============================================================================

export interface DashboardSummaryResponse {
  mainClimateRisk: string
  sites: SiteSummary[]
}

export interface SiteSummary {
  siteId: string
  siteName: string
  siteType: string
  jibunAddress: string
  roadAddress: string
  latitude: number
  longitude: number
  totalRiskScore: number
}

// ============================================================================
// 5. 분석 (Analysis)
// ============================================================================

export interface AnalysisSummaryResponse {
  mainClimateRisk: string
  mainClimateRiskScore: number
  mainClimateRiskAAL: number
  'physical-risk-scores': Record<string, number>
  'aal-scores': Record<string, number>
}

export interface StartAnalysisRequest {
  latitude: number
  longitude: number
  industryType: string
}

export interface AnalysisJobStatusResponse {
  jobId: string
  siteId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  currentNode?: string
  error?: {
    code: string
    message: string
  }
}

// 물리적 리스크 점수 (SSP 시나리오별)
export interface PhysicalRiskScoreResponse {
  scenarios: SSPScenarioScore[]
}

export interface SSPScenarioScore {
  scenario: string
  riskType: string
  shortTerm: ShortTermScore
  midTerm: MidTermScore
  longTerm: LongTermScore
}

export interface ShortTermScore {
  q1: number
  q2: number
  q3: number
  q4: number
}
export interface MidTermScore {
  year2026: number
  year2027: number
  year2028: number
  year2029: number
  year2030: number
}
export interface LongTermScore {
  year2020s: number
  year2030s: number
  year2040s: number
  year2050s: number
}

// SSP 물리적 리스크 (신규 API 응답)
export interface PhysicalRiskResponse {
  siteId: string
  term: string
  hazardType: string
  scenarios1?: SSPScenarioData
  scenarios2?: SSPScenarioData
  scenarios3?: SSPScenarioData
  scenarios4?: SSPScenarioData
  Strategy?: string
  reason?: string
}

export interface SSPScenarioData {
  // 단기 (short): 2026
  '2026'?: number

  // 중기 (mid): 2026-2030
  '2027'?: number
  '2028'?: number
  '2029'?: number
  '2030'?: number

  // 장기 (long): 2020s-2050s
  '2020s'?: number
  '2030s'?: number
  '2040s'?: number
  '2050s'?: number
}

// 통합 분석
export interface AnalysisTotalResponse {
  siteId: string
  siteName: string
  physicalRisks: PhysicalRiskDetail[]
}

export interface PhysicalRiskDetail {
  riskType: string
  riskScore: number
  financialLossRate: number
}

// 재무 영향
export interface FinancialImpactResponse {
  scenarios: SSPScenarioImpact[]
}

export interface SSPScenarioImpact {
  scenario: string
  riskType: string
  shortTerm: ShortTermAAL
  midTerm: MidTermAAL
  longTerm: LongTermAAL
}
// AAL 값 (구조는 Score와 동일하나 의미가 다름)
export interface ShortTermAAL {
  q1: number
  q2: number
  q3: number
  q4: number
}
export interface MidTermAAL {
  year2026: number
  year2027: number
  year2028: number
  year2029: number
  year2030: number
}
export interface LongTermAAL {
  year2020s: number
  year2030s: number
  year2040s: number
  year2050s: number
}

// 취약성
export interface VulnerabilityResponse {
  siteId: string
  vulnerabilities: RiskVulnerability[]
}
export interface RiskVulnerability {
  riskType: string
  vulnerabilityScore: number
}

// 취약성 분석 (새 엔드포인트)
export interface VulnerabilityAnalysisResponse {
  siteId: string
  siteName: string
  latitude: number
  longitude: number
  jibunAddress: string
  roadAddress: string
  siteType: string
  useAprDay?: string
  area: number
  grndflrCnt: number
  ugrnFlrCnt: number
  rserthqkDsgnApplyYn: 'Y' | 'N'
  aisummry: string
}

// 과거 재난
export interface PastEventsResponse {
  siteId: string
  siteName: string
  disasters: DisasterEvent[]
}
export interface DisasterEvent {
  disasterType: string
  year: number
  warningDays: number
  severeDays: number
  overallStatus: '경미' | '주의' | '심각'
}

// ============================================================================
// 6. 리포트 (Report)
// ============================================================================

export interface CreateReportRequest {
  siteId?: string // null이면 전체
}

export interface ReportWebViewResponse {
  siteId?: string
  pages: ReportPage[]
}

export interface ReportPage {
  pageNumber: number
  imageUrl: string
  title: string
}

export interface ReportPdfResponse {
  downloadUrl: string
  fileSize: number
  expiresAt: string
}

// ============================================================================
// 7. 시뮬레이션 (Simulation)
// ============================================================================

export interface RelocationSimulationRequest {
  siteId: string
  candidate: {
    latitude: number
    longitude: number
    jibunAddress: string
    roadAddress: string
  }
}

export interface RelocationSimulationResponse {
  siteId: string
  candidate: {
    candidateId: string
    latitude: number
    longitude: number
    jibunAddress: string
    roadAddress: string
    riskscore: number
    aalscore: number
    'physical-risk-scores': Record<string, number>
    'aal-scores': Record<string, number>
    pros: string
    cons: string
  }
}

// 위치 시뮬레이션 추천 후보지
export interface LocationRecommendationResponse {
  site: {
    siteId: string
    candidate1: CandidateLocation
    candidate2: CandidateLocation
    candidate3: CandidateLocation
  }
}

export interface CandidateLocation {
  candidateId: string
  candidateName: string
  latitude: number
  longitude: number
  jibunAddress?: string
  roadAddress: string
  riskscore: number
  aalscore: number
  'physical-risk-scores': Record<string, number>
  'aal-scores': Record<string, number>
  pros: string
  cons: string
}

export interface ClimateSimulationRequest {
  scenario: 'SSP1-2.6' | 'SSP2-4.5' | 'SSP3-7.0' | 'SSP5-8.5'
  hazardType: string
}

export interface ClimateSimulationResponse {
  scenario: string
  hazardType: string
  regionScores: Record<string, Record<string, number>> // { "11010": { "2025": 45.2, ... } }
  sites: SiteClimateData[]
}

export interface SiteClimateData {
  siteId: string
  siteName: string
  regionCode: string
  aalByYear: Record<string, number> // { "2025": 12.5, "2026": 13.1, ... }
}

// ============================================================================
// 8. 후보지 추천 (Recommendation)
// ============================================================================

export interface CandidateLocation {
  roadAddress: string
  jibunAddress?: string
  latitude: number
  longitude: number
}

export interface RecommendationCriteria {
  hazardWeights?: Record<string, number>
  excludedHazards?: string[]
  minRiskScore?: number
  maxRiskScore?: number
}

export interface SiteRecommendationBatchRequest {
  jobName: string
  siteType: string
  candidates: CandidateLocation[]
  criteria?: RecommendationCriteria
  referenceSiteId?: string
}

export interface SiteRecommendationBatchResponse {
  batchJobId: string
  jobName: string
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

export interface BatchJobProgressResponse {
  batchJobId: string
  jobName: string
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  totalCandidates: number
  processedCandidates: number
  progressPercent: number
  createdAt: string
  updatedAt: string
  errorMessage?: string
}

export interface RecommendationResultItem {
  roadAddress: string
  jibunAddress?: string
  latitude: number
  longitude: number
  totalRiskScore: number
  rankScore: number
  hazardScores: Record<string, number>
}

export interface SiteRecommendationBatchResultResponse {
  batchJobId: string
  jobName: string
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  results: RecommendationResultItem[]
  topRecommendations: RecommendationResultItem[]
  createdAt: string
  completedAt?: string
}

// ============================================================================
// 9. 추가 데이터 관리 (Additional Data)
// ============================================================================

export interface AdditionalDataInput {
  category: 'building' | 'asset' | 'power' | 'insurance' | 'custom'
  rawText?: string
  structuredData?: Record<string, any>
  fileName?: string
  fileS3Key?: string
}

export interface AdditionalDataItem {
  dataId: string
  category: 'building' | 'asset' | 'power' | 'insurance' | 'custom'
  rawText?: string
  structuredData?: Record<string, any>
  fileName?: string
  fileS3Key?: string
  uploadedAt: string
}

export interface AdditionalDataListResponse {
  siteId: string
  dataList: AdditionalDataItem[]
}

export interface StructuredDataResponse {
  dataId: string
  category: string
  structuredData: Record<string, any>
  extractedAt: string
}

// ============================================================================
// 10. 재해 이력 (Disaster History)
// ============================================================================

export type DisasterType =
  | 'TYPHOON'
  | 'HEAVY_RAIN'
  | 'HEAVY_SNOW'
  | 'STRONG_WIND'
  | 'WIND_WAVE'
  | 'EARTHQUAKE'
  | 'OTHER'
export type DamageSeverity = 'MINOR' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC'

export interface DisasterHistoryItem {
  id: string
  disasterType: DisasterType
  year: number
  month?: number
  administrativeCode: string
  administrativeName: string
  damageDescription?: string
  damageSeverity?: DamageSeverity
  humanCasualties?: number
  propertyDamage?: number
}

export interface DisasterHistoryQueryParams {
  administrativeCode?: string
  year?: number
  disasterType?: DisasterType
  page?: number
  size?: number
}

export interface DisasterHistoryResponse {
  content: DisasterHistoryItem[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// 과거 재해 이력 조회 (/api/disasters/history)
export interface PastDisasterQueryParams {
  year?: string
  disasterType?: string
  severity?: string
}

// 백엔드에서 받는 원본 데이터 타입
export interface PastDisasterRawItem {
  id: number
  alertDate: string // ISO 8601 형식 (예: "2025-12-15T00:00:00")
  disasterType: string // 재해 유형
  severity: string // 재해 수준 (주의보/경보)
  region: string // 쉼표로 구분된 지역 문자열
}

// 프론트엔드에서 사용하는 전처리된 데이터 타입
export interface PastDisasterItem {
  id: number
  date: string // 포맷된 날짜 (예: "2025.12.15")
  disasterType: string // 재해 유형
  severity: string // 재해 수준
  region: string[] // 지역 배열
}

// API 응답 타입
export interface PastDisasterResponse {
  data: PastDisasterRawItem[]
}
