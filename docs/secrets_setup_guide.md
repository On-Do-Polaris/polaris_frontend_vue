# GitHub Secrets 설정 가이드

이 문서는 CI/CD 파이프라인을 위한 GitHub Secrets 설정 방법을 설명합니다.

## 필요한 Secrets

CI/CD를 위해 다음 8개의 Secrets가 필요합니다:

### OCIR (Oracle Cloud Infrastructure Registry) - 4개
- `OCIR_REGISTRY`
- `OCIR_NAMESPACE`
- `OCIR_USERNAME`
- `OCIR_TOKEN`

### SSH (서버 배포용) - 4개
- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_SSH_KEY`
- `SERVER_PORT` (선택사항)

---

## OCIR Secrets 설정

### 1단계: OCIR 정보 확인

#### Oracle Cloud Console 로그인
https://cloud.oracle.com 접속 후 로그인

#### Region 확인
- 우측 상단에서 현재 리전 확인
- 예: `South Korea Central (Seoul)`

#### Tenancy Namespace 확인
1. 우측 상단 프로필 아이콘 클릭
2. **Tenancy: {tenancy-name}** 클릭
3. **Object Storage Namespace** 확인 및 복사
   - 예: `axabcdefghij`

#### Username 확인
1. 우측 상단 프로필 아이콘 클릭
2. **User Settings** 클릭
3. User name 확인
   - IDCS 사용자: `oracleidentitycloudservice/user@example.com`
   - OCI IAM 사용자: `user@example.com`

#### Auth Token 생성
1. User Settings 페이지에서 좌측 메뉴 **Auth Tokens** 클릭
2. **Generate Token** 버튼 클릭
3. Description 입력: `github-actions-frontend`
4. **Generate Token** 클릭
5. **생성된 토큰 복사 및 안전한 곳에 저장** (다시 볼 수 없음!)

---

### 2단계: GitHub Secrets 등록

#### GitHub 저장소에서 설정
1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 좌측 메뉴에서 **Secrets and variables** → **Actions** 클릭
4. **New repository secret** 버튼 클릭

---

### OCIR Secret 4개 등록

#### Secret 1: OCIR_REGISTRY

**Name:**
```
OCIR_REGISTRY
```

**Value (리전에 따라 선택):**
```
ap-seoul-1.ocir.io
```

**리전별 Registry 주소:**
| 리전 | Registry 주소 |
|-----|--------------|
| 서울 (Seoul) | `ap-seoul-1.ocir.io` |
| 춘천 (Chuncheon) | `ap-chuncheon-1.ocir.io` |
| 도쿄 (Tokyo) | `ap-tokyo-1.ocir.io` |
| 오사카 (Osaka) | `ap-osaka-1.ocir.io` |
| 싱가포르 (Singapore) | `ap-singapore-1.ocir.io` |
| 애슈번 (Ashburn) | `us-ashburn-1.ocir.io` |
| 피닉스 (Phoenix) | `us-phoenix-1.ocir.io` |

---

#### Secret 2: OCIR_NAMESPACE

**Name:**
```
OCIR_NAMESPACE
```

**Value:**
```
axabcdefghij
```
*위 1단계에서 확인한 Object Storage Namespace 입력*

---

#### Secret 3: OCIR_USERNAME

**Name:**
```
OCIR_USERNAME
```

**Value 형식:**
```
{NAMESPACE}/{사용자타입}/{USERNAME}
```

**예시:**

**IDCS 사용자:**
```
axabcdefghij/oracleidentitycloudservice/user@example.com
```

**OCI IAM 사용자:**
```
axabcdefghij/user@example.com
```

**페더레이션 사용자:**
```
axabcdefghij/oracleidentitycloudservice/{identity-provider}/username
```

---

#### Secret 4: OCIR_TOKEN

**Name:**
```
OCIR_TOKEN
```

**Value:**
```
abcd1234EFGH5678ijkl9012mnop3456
```
*위 1단계에서 생성한 Auth Token 입력*

---

## SSH Secrets 설정 (배포용)

CD (자동 배포)를 사용하려면 추가로 SSH Secrets가 필요합니다.

### 1단계: SSH 키 생성

로컬 터미널에서:

```bash
# ED25519 알고리즘으로 SSH 키 생성 (권장)
ssh-keygen -t ed25519 -C "github-actions-cd" -f ~/.ssh/github_actions_cd

# 또는 RSA (더 넓은 호환성)
ssh-keygen -t rsa -b 4096 -C "github-actions-cd" -f ~/.ssh/github_actions_cd

# 패스프레이즈는 비워두기 (Enter 2번)
```

### 2단계: 공개키를 서버에 등록

```bash
# 방법 1: ssh-copy-id 사용 (권장)
ssh-copy-id -i ~/.ssh/github_actions_cd.pub user@server-ip

# 방법 2: 수동 등록
cat ~/.ssh/github_actions_cd.pub
# 출력된 내용을 복사하여 서버의 ~/.ssh/authorized_keys에 추가
```

### 3단계: SSH 연결 테스트

```bash
# 키로 접속 테스트
ssh -i ~/.ssh/github_actions_cd user@server-ip

# 성공하면 서버에 로그인됨
```

### 4단계: GitHub Secrets 등록

#### Secret 5: SERVER_HOST

**Name:**
```
SERVER_HOST
```

**Value:**
```
kk21.iptime.org
```
*또는 IP 주소: `192.168.1.100`*

---

#### Secret 6: SERVER_USER

**Name:**
```
SERVER_USER
```

**Value:**
```
kk21
```
*서버의 SSH 사용자명*

---

#### Secret 7: SERVER_SSH_KEY

**Name:**
```
SERVER_SSH_KEY
```

**Value:**
```bash
# 개인키 내용 확인
cat ~/.ssh/github_actions_cd

# 출력 예시 (전체 복사):
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDkI9xF8rBvPqF5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
...
(여러 줄)
...
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
-----END OPENSSH PRIVATE KEY-----
```

**중요:**
- `-----BEGIN` 부터 `-----END` 까지 **전체 내용**을 복사
- 줄바꿈 포함 그대로 붙여넣기

---

#### Secret 8: SERVER_PORT (선택사항)

**Name:**
```
SERVER_PORT
```

**Value:**
```
22
```
*기본 SSH 포트는 22이므로 변경하지 않았다면 생략 가능*

---

## 설정 완료 확인

### Secrets 목록 확인

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**

다음 Secrets가 등록되어 있어야 합니다:

**OCIR (필수 - CI용):**
- ✅ OCIR_REGISTRY
- ✅ OCIR_NAMESPACE
- ✅ OCIR_USERNAME
- ✅ OCIR_TOKEN

**SSH (선택 - CD용):**
- ✅ SERVER_HOST
- ✅ SERVER_USER
- ✅ SERVER_SSH_KEY
- ⚪ SERVER_PORT (선택)

### 테스트 방법

1. **CI 테스트 (OCIR Secrets):**
   ```bash
   # main 브랜치에 push
   git push origin main

   # GitHub Actions 확인
   # 저장소 → Actions 탭 → "CI - Build & Push" 워크플로우 확인
   ```

2. **CD 테스트 (SSH Secrets):**
   - CI가 성공하면 자동으로 CD 실행
   - Actions 탭에서 "CD - Deploy to Server" 확인

---

## 트러블슈팅

### OCIR 로그인 실패

**에러:** `unauthorized: authentication required`

**확인사항:**
1. `OCIR_USERNAME` 형식 확인:
   - `{namespace}/{사용자타입}/{username}` 형식인지
   - namespace가 맞는지

2. `OCIR_TOKEN` 확인:
   - 토큰이 만료되지 않았는지
   - 복사할 때 공백이 들어가지 않았는지

3. `OCIR_REGISTRY` 확인:
   - 리전이 맞는지 (예: `ap-seoul-1.ocir.io`)

### SSH 연결 실패

**에러:** `Permission denied (publickey)`

**확인사항:**
1. 공개키가 서버에 제대로 등록되었는지
   ```bash
   # 서버에서 확인
   cat ~/.ssh/authorized_keys
   ```

2. `SERVER_SSH_KEY`에 개인키 전체가 복사되었는지
   - `-----BEGIN` 부터 `-----END` 까지 전부

3. 서버의 SSH 설정 확인
   ```bash
   # /etc/ssh/sshd_config
   PubkeyAuthentication yes
   ```

### 리포지토리 없음

**에러:** `repository does not exist`

**해결:**
- OCIR Console에서 `polaris-frontend` 리포지토리 생성
- 또는 첫 push 시 자동 생성됨 (권한 필요)

---

## 보안 주의사항

1. **Auth Token 보관:**
   - 생성 즉시 안전한 곳에 저장
   - GitHub Secrets에만 저장하고 다른 곳에 노출 금지

2. **SSH 개인키:**
   - 절대 GitHub 코드에 커밋하지 말 것
   - GitHub Secrets에만 저장

3. **정기적인 갱신:**
   - Auth Token은 주기적으로 재생성 권장
   - SSH 키도 주기적으로 갱신

---

## 관련 문서

- [CI 가이드](./ci_readme.md)
- [CD 가이드](./cd_readme.md)
- [OCIR 공식 문서](https://docs.oracle.com/en-us/iaas/Content/Registry/home.htm)
