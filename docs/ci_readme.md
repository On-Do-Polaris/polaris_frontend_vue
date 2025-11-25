# CI (Continuous Integration) 가이드

## 개요

이 프로젝트는 GitHub Actions를 사용하여 코드 품질 검사, 빌드, 그리고 Docker 이미지 생성을 자동화합니다.

## CI 파이프라인 구조

```
코드 Push/PR
    ↓
┌─────────────────────┐
│  1. 코드 품질 검사   │
│  - ESLint           │
│  - Prettier         │
│  - TypeScript       │
│  - Vitest           │
└─────────────────────┘
    ↓
┌─────────────────────┐
│  2. Docker 빌드     │  (main 브랜치만)
│  - 이미지 빌드      │
│  - OCIR 푸시        │
└─────────────────────┘
    ↓
   CD 자동 트리거
```

## 주요 기능

### 1. 자동 트리거

| 이벤트 | 실행되는 Job | 설명 |
|-------|-------------|------|
| `main` 브랜치 push | 테스트 + 빌드/푸시 | 전체 CI 실행 |
| `develop` 브랜치 push | 테스트만 | 코드 품질 검사 |
| PR (main/develop) | 테스트만 | 코드 품질 검사 |

### 2. 코드 품질 검사 (test job)

모든 브랜치와 PR에서 실행됩니다:

- **ESLint**: 코드 스타일 및 잠재적 오류 검사
- **Prettier**: 코드 포맷팅 일관성 검사
- **TypeScript**: 타입 체크 (컴파일 없이)
- **Vitest**: 단위 테스트 실행

### 3. Docker 빌드 및 푸시 (build-and-push job)

`main` 브랜치에 push될 때만 실행됩니다:

- 테스트가 성공해야만 실행
- Docker 이미지 빌드
- OCIR(Oracle Cloud Infrastructure Registry)에 푸시
- 자동으로 CD 워크플로우 트리거

## OCIR 설정

### 필수 GitHub Secrets

| Secret 이름 | 설명 | 예시 |
|------------|------|------|
| `OCIR_REGISTRY` | OCIR 레지스트리 주소 | `ap-seoul-1.ocir.io` |
| `OCIR_NAMESPACE` | Object Storage 네임스페이스 | `axabcdefghij` |
| `OCIR_USERNAME` | `{namespace}/{username}` | `axabcdefghij/oracleidentitycloudservice/user@example.com` |
| `OCIR_TOKEN` | Auth Token | `abcd1234EFGH5678ijkl` |

### Secrets 등록 방법

1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. 위 4개 항목 추가

자세한 설정 방법은 [cd_readme.md](./cd_readme.md)의 "OCIR 설정" 섹션을 참고하세요.

## 사용 방법

### 1. develop 브랜치에서 작업

```bash
# develop 브랜치에서 개발
git checkout develop
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin develop

# 자동으로 코드 품질 검사 실행
# - ESLint, Prettier, TypeScript, Vitest
# - 이미지 빌드는 하지 않음
```

### 2. Pull Request 생성

```bash
# feature 브랜치에서 PR 생성
git checkout -b feature/new-feature
# ... 작업 ...
git push origin feature/new-feature

# GitHub에서 main 또는 develop으로 PR 생성
# 자동으로 코드 품질 검사 실행
```

### 3. main 브랜치로 병합 (배포)

```bash
# PR 승인 후 main에 병합
git checkout main
git merge develop
git push origin main

# 자동으로:
# 1. 코드 품질 검사
# 2. Docker 이미지 빌드
# 3. OCIR에 푸시
# 4. CD 워크플로우 자동 트리거 (배포)
```

## Docker 이미지 태그 전략

| 브랜치/이벤트 | 생성되는 태그 | 설명 |
|-------------|-------------|------|
| `main` push | `latest`, `main`, `main-{sha}` | 최신 프로덕션 버전 |

**예시:**
```
ap-seoul-1.ocir.io/axabcdefghij/ondo-frontend:latest
ap-seoul-1.ocir.io/axabcdefghij/ondo-frontend:main
ap-seoul-1.ocir.io/axabcdefghij/ondo-frontend:main-abc1234
```

## 로컬에서 CI 체크 실행

CI 실패를 방지하기 위해 push 전에 로컬에서 검사:

```bash
# ESLint 검사
npm run lint

# Prettier 검사
npx prettier --check .

# TypeScript 타입 체크
npx tsc --noEmit

# 테스트 실행
npx vitest run

# 전체 빌드 테스트
npm run build
```

## 로컬에서 Docker 이미지 빌드

CI에서 빌드되는 것과 동일한 이미지를 로컬에서 테스트:

```bash
# 이미지 빌드
docker build -t ondo-frontend:local .

# 컨테이너 실행
docker run -d -p 8080:80 ondo-frontend:local

# 접속 테스트
curl http://localhost:8080
```

## CI 실패 시 대응

### 1. ESLint 실패

```bash
# 자동 수정 시도
npm run lint

# 수동 수정이 필요한 경우 에러 메시지 확인
npx eslint . --ext .ts,.tsx,.js,.jsx,.vue
```

### 2. Prettier 실패

```bash
# 자동 포맷팅
npm run format

# 또는
npx prettier --write .
```

### 3. TypeScript 타입 체크 실패

```bash
# 타입 에러 확인
npx tsc --noEmit

# 에러 메시지를 보고 타입 수정
```

### 4. 테스트 실패

```bash
# 테스트 실행 및 디버깅
npx vitest

# 특정 테스트만 실행
npx vitest run path/to/test.spec.ts
```

### 5. Docker 빌드 실패

```bash
# 로컬에서 빌드 테스트
docker build -t test .

# 상세 로그 확인
docker build --progress=plain -t test .

# 빌드 캐시 없이 재시도
docker build --no-cache -t test .
```

## GitHub Actions 로그 확인

1. GitHub 저장소 → **Actions** 탭
2. 실패한 워크플로우 클릭
3. 실패한 Job 클릭
4. 각 Step의 로그 확인

## Workflow 파일 위치

- **CI 파일**: [.github/workflows/ci_vue.yaml](../.github/workflows/ci_vue.yaml)
- **CD 파일**: [.github/workflows/cd_vue.yaml](../.github/workflows/cd_vue.yaml)

## CI 파이프라인 최적화

### 캐싱 활용

CI는 다음 캐시를 활용하여 빌드 속도를 최적화합니다:

- **npm 의존성 캐시**: `setup-node` 액션의 cache 옵션
- **Docker 레이어 캐시**: GitHub Actions 캐시 사용 (GHA cache)

### 병렬 실행

현재 구조:
1. `test` job 실행
2. 테스트 성공 시 → `build-and-push` job 실행 (main만)

## 관련 문서

- [CD 가이드](./cd_readme.md) - 배포 자동화
- [Dockerfile](../Dockerfile) - Docker 이미지 빌드 설정
- [Branch Convention](./branch_convention.md) - 브랜치 규칙
- [Commit Convention](./commit_convention.md) - 커밋 메시지 규칙

## 참고 링크

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [OCIR 문서](https://docs.oracle.com/en-us/iaas/Content/Registry/home.htm)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Vitest](https://vitest.dev/)
