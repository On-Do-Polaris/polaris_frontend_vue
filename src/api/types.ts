// ============================================================================
// 공통 타입
// ============================================================================

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

// ============================================================================
// 인증 관련 타입
// ============================================================================

export interface RegisterRequest {
  email: string
  name: string
  password: string
  verificationCode?: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userId: string
  name: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// ============================================================================
// 사용자 관련 타입
// ============================================================================

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface UserResponse {
  id: string
  email: string
  name: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// ============================================================================
// 사업장 관련 타입
// ============================================================================

export interface Site {
  siteId: string
  siteName: string
  location: string
  siteType: string
}

export interface SiteListResponse {
  sites: Site[]
}

export interface CreateSiteRequest {
  name: string
  location: string
  address: string
  type: string
}

export interface UpdateSiteRequest {
  name?: string
  location?: string
  address?: string
  type?: string
}

// ============================================================================
// 대시보드 관련 타입
// ============================================================================

export interface DashboardSummary {
  totalSites: number
  analyzedSites: number
  highRiskSites: number
  recentAnalysisCount: number
}

// ============================================================================
// 분석 관련 타입
// ============================================================================

export interface StartAnalysisRequest {
  latitude: number
  longitude: number
  industryType: string
}

export interface AnalysisJobStatusResponse {
  jobId: string
  siteId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number
  message: string
  startedAt: string
  completedAt?: string
}

export interface PhysicalRiskScore {
  hazardType: string
  hazardName: string
  score: number
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  description: string
}

export interface PhysicalRiskScoreResponse {
  siteId: string
  siteName: string
  totalScore: number
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  scores: PhysicalRiskScore[]
  analyzedAt: string
}

export interface PastEvent {
  eventId: string
  eventType: string
  eventName: string
  date: string
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  damage: number
  casualties: number
  description: string
}

export interface PastEventsResponse {
  siteId: string
  siteName: string
  events: PastEvent[]
  totalEvents: number
}

export interface FinancialImpact {
  hazardType: string
  expectedLoss: number
  probability: number
  annualizedLoss: number
  description: string
}

export interface FinancialImpactResponse {
  siteId: string
  siteName: string
  totalExpectedLoss: number
  totalAnnualizedLoss: number
  impacts: FinancialImpact[]
}

export interface VulnerabilityFactor {
  factor: string
  score: number
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  description: string
  recommendations: string[]
}

export interface VulnerabilityResponse {
  siteId: string
  siteName: string
  overallVulnerability: number
  vulnerabilityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  factors: VulnerabilityFactor[]
}

export interface AnalysisTotalResponse {
  siteId: string
  siteName: string
  hazardType: string
  riskScore: PhysicalRiskScore
  pastEvents: PastEvent[]
  financialImpact: FinancialImpact
  vulnerability: VulnerabilityFactor[]
  recommendations: string[]
}

// ============================================================================
// 시뮬레이션 관련 타입
// ============================================================================

export interface RelocationCandidate {
  location: string
  address: string
  latitude: number
  longitude: number
}

export interface RelocationSimulationRequest {
  currentSiteId: string
  candidates: RelocationCandidate[]
}

export interface RelocationSiteComparison {
  location: string
  address: string
  latitude: number
  longitude: number
  overallRiskScore: number
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  hazardScores: PhysicalRiskScore[]
  estimatedCost: number
  recommendation: string
}

export interface RelocationSimulationResponse {
  currentSite: RelocationSiteComparison
  candidates: RelocationSiteComparison[]
  bestCandidate: RelocationSiteComparison
  analysis: string
}

export interface ClimateSimulationRequest {
  siteId: string
  scenario: 'SSP1-2.6' | 'SSP2-4.5' | 'SSP5-8.5'
  targetYear: number
  hazardTypes?: string[]
}

export interface ClimateProjection {
  year: number
  scenario: string
  hazardType: string
  currentScore: number
  projectedScore: number
  change: number
  changePercent: number
}

export interface ClimateSimulationResponse {
  siteId: string
  siteName: string
  scenario: string
  targetYear: number
  projections: ClimateProjection[]
  summary: string
  recommendations: string[]
}

// ============================================================================
// 리포트 관련 타입
// ============================================================================

export interface CreateReportRequest {
  siteId: string
  reportType: 'FULL' | 'SUMMARY' | 'EXECUTIVE'
  includeCharts: boolean
  includeRecommendations: boolean
}

export interface ReportWebViewResponse {
  reportId: string
  siteId: string
  siteName: string
  generatedAt: string
  content: {
    summary: string
    riskScores: PhysicalRiskScore[]
    pastEvents: PastEvent[]
    financialImpacts: FinancialImpact[]
    vulnerability: VulnerabilityFactor[]
    recommendations: string[]
  }
}

export interface ReportPdfResponse {
  reportId: string
  siteId: string
  siteName: string
  downloadUrl: string
  expiresAt: string
  fileSize: number
  generatedAt: string
}

// ============================================================================
// 메타데이터 타입
// ============================================================================

export interface HazardType {
  id: string
  code: string
  name: string
  description: string
  severity: string
}

export interface Industry {
  id: string
  code: string
  name: string
  category: string
  description: string
}

export interface SspScenario {
  code: string
  name: string
  description: string
}
