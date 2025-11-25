# CD (Continuous Deployment) 가이드

## 개요

이 프로젝트는 GitHub Actions를 사용하여 프로덕션 서버에 **무중단 배포(Zero-Downtime Deployment)**를 자동으로 수행합니다.

## CD 파이프라인 구조

```
CI 완료 (이미지 푸시)
    ↓
┌─────────────────────┐
│  1. OCIR 로그인     │
└─────────────────────┘
    ↓
┌─────────────────────┐
│  2. 이미지 Pull     │
└─────────────────────┘
    ↓
┌─────────────────────┐
│  3. 새 컨테이너 실행│ (임시 이름)
└─────────────────────┘
    ↓
┌─────────────────────┐
│  4. Health Check    │ (최대 30초)
└─────────────────────┘
    ↓
┌─────────────────────┐
│  5. 기존 컨테이너   │
│     중지 및 삭제    │
└─────────────────────┘
    ↓
┌─────────────────────┐
│  6. 컨테이너 전환   │
└─────────────────────┘
    ↓
   배포 완료
```

## 무중단 배포 전략

### Blue-Green 배포 방식

이 프로젝트는 **Blue-Green 배포** 전략을 사용합니다:

1. **새 컨테이너 실행** (`ondo-frontend-new`)
   - 기존 서비스와 독립적으로 새 버전 실행

2. **Health Check**
   - 새 컨테이너가 정상 동작하는지 확인 (최대 30초)
   - 실패 시 자동 롤백

3. **기존 컨테이너 중지**
   - 새 컨테이너가 정상이면 기존 컨테이너 중지

4. **컨테이너 전환**
   - 새 컨테이너를 `ondo-frontend`로 이름 변경
   - Nginx Proxy Manager가 자동으로 새 컨테이너로 트래픽 전달

### 무중단 보장

- **서비스 중단 없음**: 새 컨테이너가 준비된 후에만 전환
- **자동 롤백**: Health Check 실패 시 자동으로 새 컨테이너 제거
- **기존 서비스 유지**: 배포 실패 시 기존 컨테이너 계속 실행

## 주요 기능

### 1. 자동 트리거

| 이벤트             | 동작      | 설명                                   |
| ------------------ | --------- | -------------------------------------- |
| CI 워크플로우 성공 | 자동 배포 | main 브랜치 이미지 푸시 완료 시        |
| 수동 트리거        | 수동 배포 | GitHub Actions에서 `workflow_dispatch` |

### 2. SSH 원격 배포

- SSH 키 인증을 통한 안전한 접속
- 서버에서 Docker 명령 실행
- 배포 로그 실시간 확인 가능

### 3. Health Check

- 새 컨테이너의 정상 동작 확인
- nginx의 health check 엔드포인트 사용
- 최대 30초 대기 (1초 간격)

## 서버 설정

### 필수 GitHub Secrets

배포를 위해 다음 Secrets를 등록해야 합니다:

| Secret 이름      | 설명                        | 예시                                                       |
| ---------------- | --------------------------- | ---------------------------------------------------------- |
| `OCIR_REGISTRY`  | OCIR 레지스트리 주소        | `ap-seoul-1.ocir.io`                                       |
| `OCIR_NAMESPACE` | Object Storage 네임스페이스 | `axabcdefghij`                                             |
| `OCIR_USERNAME`  | `{namespace}/{username}`    | `axabcdefghij/oracleidentitycloudservice/user@example.com` |
| `OCIR_TOKEN`     | Auth Token                  | `abcd1234EFGH5678ijkl`                                     |
| `SERVER_HOST`    | 배포 서버 IP 또는 도메인    | `kk21.iptime.org`                                          |
| `SERVER_USER`    | SSH 사용자명                | `kk21`                                                     |
| `SERVER_SSH_KEY` | SSH 개인키 (전체 내용)      | `-----BEGIN OPENSSH...`                                    |
| `SERVER_PORT`    | SSH 포트 (선택, 기본 22)    | `22`                                                       |

### OCIR 설정

OCIR 설정 방법은 [ci_readme.md](./ci_readme.md)의 "OCIR 설정" 섹션을 참고하세요.

### SSH 키 생성 및 등록

#### 1. SSH 키 생성

```bash
# ED25519 알고리즘으로 SSH 키 생성
ssh-keygen -t ed25519 -C "github-actions-cd" -f ~/.ssh/github_actions_cd

# 또는 RSA (더 넓은 호환성)
ssh-keygen -t rsa -b 4096 -C "github-actions-cd" -f ~/.ssh/github_actions_cd

# 패스프레이즈는 비워두기 (자동화를 위해)
```

#### 2. 공개키를 서버에 등록

```bash
# 방법 1: ssh-copy-id 사용 (권장)
ssh-copy-id -i ~/.ssh/github_actions_cd.pub user@server

# 방법 2: 수동 등록
cat ~/.ssh/github_actions_cd.pub
# 출력 내용을 복사하여 서버의 ~/.ssh/authorized_keys에 추가
```

#### 3. SSH 연결 테스트

```bash
# SSH 키로 접속 테스트
ssh -i ~/.ssh/github_actions_cd user@server

# 성공하면 다음 메시지가 나타남
# Welcome to Ubuntu...
```

#### 4. GitHub Secrets에 개인키 등록

```bash
# 개인키 내용 확인
cat ~/.ssh/github_actions_cd

# 출력 내용 전체를 복사
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...
# -----END OPENSSH PRIVATE KEY-----
```

GitHub에서:

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name: `SERVER_SSH_KEY`
4. Value: 위에서 복사한 개인키 전체 붙여넣기

### 서버 사전 준비

배포 서버에 다음이 설치되어 있어야 합니다:

```bash
# Docker 설치 확인
docker --version

# Docker 네트워크 생성 (NPM 사용 시)
docker network create npm_network

# 사용자가 Docker 그룹에 속해 있는지 확인
groups $USER | grep docker

# 속해있지 않다면 추가
sudo usermod -aG docker $USER
# 로그아웃 후 재로그인 필요
```

## 사용 방법

### 1. 자동 배포 (권장)

```bash
# main 브랜치에 push하면 자동 실행
git checkout main
git push origin main

# CI 완료 → CD 자동 트리거 → 서버 배포
```

**흐름:**

1. CI 워크플로우가 이미지를 빌드하고 OCIR에 푸시
2. CI 성공 시 자동으로 CD 워크플로우 트리거
3. SSH로 서버 접속하여 무중단 배포

### 2. 수동 배포

GitHub Actions에서 수동 트리거:

1. GitHub 저장소 → **Actions** 탭
2. **CD - Deploy to Server** 선택
3. **Run workflow** 클릭
4. 브랜치 선택 (main)
5. **Run workflow** 버튼 클릭

### 3. 배포 로그 확인

1. **Actions** 탭에서 실행 중인 워크플로우 클릭
2. **deploy** job 클릭
3. **SSH로 서버 배포 (무중단)** step 확인

**로그 예시:**

```
=========================================
무중단 배포 시작
=========================================
1. OCIR 로그인 중...
2. 최신 이미지 다운로드 중...
3. 새 컨테이너 실행 중... (이름: ondo-frontend-new)
4. Health check 중...
   대기 중... (1/30)
   대기 중... (2/30)
   ✓ 새 컨테이너 정상 동작 확인 (3초 경과)
5. 기존 컨테이너 처리 중...
   기존 컨테이너 중지 중...
   기존 컨테이너 삭제 중...
6. 새 컨테이너 활성화 중...
7. 미사용 이미지 정리 중...
=========================================
✅ 무중단 배포 완료!
=========================================
```

## 배포 롤백

### 자동 롤백

Health Check 실패 시 자동으로 롤백됩니다:

```bash
# Health Check 실패 시 로그
4. Health check 중...
   대기 중... (30/30)
   ✗ Health check 실패 - 롤백 시작
   # 새 컨테이너 자동 삭제
   # 기존 컨테이너는 그대로 유지
```

### 수동 롤백

이전 버전으로 롤백이 필요한 경우:

#### 방법 1: 이전 이미지로 재배포

```bash
# 서버에 SSH 접속
ssh user@server

# 이전 이미지 확인
docker images | grep ondo-frontend

# 이전 이미지로 컨테이너 재시작
docker stop ondo-frontend
docker rm ondo-frontend
docker run -d \
  --name ondo-frontend \
  --network npm_network \
  --restart unless-stopped \
  ap-seoul-1.ocir.io/namespace/polaris-frontend:main-<이전SHA>
```

#### 방법 2: 이전 커밋으로 재배포

```bash
# 로컬에서 이전 커밋으로 이동
git checkout <이전-커밋-SHA>
git push origin main -f  # (주의: force push)

# 또는 revert
git revert <문제-커밋-SHA>
git push origin main

# CI/CD가 자동으로 재배포
```

## 트러블슈팅

### 1. SSH 연결 실패

**증상:** `Permission denied` 또는 `Connection refused`

**해결:**

```bash
# SSH 키 권한 확인
chmod 600 ~/.ssh/github_actions_cd

# 서버의 sshd 설정 확인
sudo nano /etc/ssh/sshd_config
# PubkeyAuthentication yes 확인

# sshd 재시작
sudo systemctl restart sshd

# authorized_keys 권한 확인
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 2. Health Check 실패

**증상:** 새 컨테이너가 Health Check를 통과하지 못함

**해결:**

```bash
# 서버에서 직접 확인
docker ps -a | grep ondo-frontend

# 컨테이너 로그 확인
docker logs ondo-frontend-new

# 수동 Health Check
docker exec ondo-frontend-new wget --quiet --tries=1 --spider http://localhost/

# nginx 설정 확인
docker exec ondo-frontend-new cat /etc/nginx/conf.d/default.conf
```

### 3. 네트워크 연결 실패

**증상:** 컨테이너는 실행되지만 접속 불가

**해결:**

```bash
# NPM 네트워크 존재 확인
docker network ls | grep npm_network

# 네트워크 없으면 생성
docker network create npm_network

# 컨테이너를 네트워크에 연결
docker network connect npm_network ondo-frontend

# NPM에서 Proxy Host 확인
# Forward Hostname/IP: ondo-frontend (컨테이너 이름)
# Forward Port: 80
```

### 4. OCIR 인증 실패

**증상:** `unauthorized: authentication required`

**해결:**

```bash
# 서버에서 수동 로그인 테스트
docker login ap-seoul-1.ocir.io
# Username: {namespace}/{username}
# Password: {auth-token}

# GitHub Secrets 확인
# - OCIR_USERNAME 형식 확인
# - OCIR_TOKEN 만료 여부 확인
```

### 5. 디스크 공간 부족

**증상:** `no space left on device`

**해결:**

```bash
# 미사용 이미지 정리
docker image prune -a

# 미사용 컨테이너 정리
docker container prune

# 미사용 볼륨 정리
docker volume prune

# 전체 정리
docker system prune -a --volumes
```

## 모니터링

### 배포 후 확인 사항

```bash
# 컨테이너 상태 확인
docker ps | grep ondo-frontend

# 컨테이너 로그 확인
docker logs -f ondo-frontend --tail 100

# Health Check
curl http://localhost:80
# 또는 NPM을 통해
curl https://your-domain.com

# 리소스 사용량 확인
docker stats ondo-frontend
```

### 알림 설정 (선택사항)

배포 실패 시 알림을 받고 싶다면 GitHub Actions에 알림 step 추가:

```yaml
# Slack, Discord, Email 등
- name: Slack 알림
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 배포 전략 비교

| 전략           | 장점              | 단점            | 현재 사용  |
| -------------- | ----------------- | --------------- | ---------- |
| **Blue-Green** | 무중단, 빠른 롤백 | 리소스 2배 필요 | ✅ 사용 중 |
| Rolling Update | 리소스 효율적     | 복잡한 설정     | ❌         |
| Canary         | 점진적 배포       | 복잡한 모니터링 | ❌         |
| Recreate       | 단순함            | 다운타임 발생   | ❌         |

## Workflow 파일 위치

- **CD 파일**: [.github/workflows/cd_vue.yaml](../.github/workflows/cd_vue.yaml)
- **CI 파일**: [.github/workflows/ci_vue.yaml](../.github/workflows/ci_vue.yaml)

## 관련 문서

- [CI 가이드](./ci_readme.md) - 빌드 및 이미지 푸시
- [Dockerfile](../Dockerfile) - Docker 이미지 설정
- [nginx.conf](../nginx.conf) - Nginx 설정
- [Branch Convention](./branch_convention.md)
- [Commit Convention](./commit_convention.md)

## 참고 링크

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Blue-Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [Docker Health Check](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [SSH Key Authentication](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
