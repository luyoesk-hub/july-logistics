# Vercel 배포 가이드

> 두두택배 접수 시스템 - 배포 방법

---

## 빠른 배포 (1분)

### 사전 요구사항
- GitHub 계정 (이미 있음)
- Vercel 계정 (https://vercel.com 에서 무료 가입)

### 배포 방법

#### **방법 1: Vercel Dashboard (권장)**

1. **Vercel 로그인**
   ```
   https://vercel.com/login
   GitHub 계정으로 로그인
   ```

2. **새 프로젝트 생성**
   ```
   Dashboard → "Add New..." → "Project"
   → GitHub 저장소 선택: july-logistics
   ```

3. **프로젝트 설정**
   ```
   Framework: Other (정적 사이트)
   Root Directory: dudu-F-single-page
   Build Command: (비워두기)
   Output Directory: (비워두기)
   ```

4. **배포**
   ```
   "Deploy" 버튼 클릭
   → 약 30초 후 배포 완료
   ```

5. **접속**
   ```
   https://july-logistics.vercel.app/single-page.html
   또는 설정한 커스텀 도메인
   ```

---

#### **방법 2: Vercel CLI**

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포 폴더로 이동
cd dudu-F-single-page

# 배포
vercel

# 프롬프트 따라하기:
# Set up and deploy? → Y
# Which scope? → Personal
# Link to existing project? → N
# Project name? → dudu-f-reception
# Directory? → .
```

---

## 배포 후 설정

### 커스텀 도메인 설정 (선택)

```
Vercel Dashboard 
→ 프로젝트 선택 
→ Settings 
→ Domains 
→ Add Domain
```

예시:
```
- dudu-reception.vercel.app (기본)
- reception.dudu.dev (커스텀)
```

### 환경 변수 (향후)

```
Settings → Environment Variables

예시 (Phase 7에서 필요):
VITE_API_URL=https://api.dudu.dev
VITE_SUPABASE_KEY=your_key
```

---

## 배포 후 확인

### 1️⃣ 기본 접근성 테스트

```
URL: https://july-logistics.vercel.app/single-page.html

✅ 페이지 로드 확인
✅ Tab 1 (접수) 렌더링
✅ Tab 2 (목록) 렌더링
✅ Tab 3 (통계) 렌더링
```

### 2️⃣ 기본 기능 테스트

```
접수:
✅ 지점 선택: 서울지점
✅ 보내는 분: 김민준
✅ 받는 분: 이서연
✅ 도착지역: 서울
✅ 물품명: 이불
✅ 무게: 3.0
✅ 크기: 60 × 40 × 50

결과:
✅ 우측 계산 과정 표시
✅ 대형 등급 판정
✅ 9,000원 계산
✅ 접수 완료 버튼 활성화

배송옵션:
✅ 익스프레스 선택 → 10,800원(+20%)
✅ 나이트 선택 → 13,500원(+50%)
```

### 3️⃣ 주소록 테스트 (Phase 2)

```
✅ 보내는 분 입력
✅ 도착지역 입력
✅ "저장" 클릭
✅ 페이지 새로고침
✅ 드롭다운에서 저장된 주소 보이는가?
✅ 선택하면 자동 채우기?
```

### 4️⃣ 목록/통계 테스트

```
✅ 5건 이상 접수
✅ Tab 2: 목록 렌더링 확인
✅ Tab 3: 통계 KPI 갱신 확인
✅ 검색/필터 작동 확인
```

---

## 배포 상태 모니터링

### Vercel Analytics

```
Dashboard 
→ Analytics
→ Web Vitals 확인

모니터링 항목:
- First Contentful Paint (FCP): < 1초
- Largest Contentful Paint (LCP): < 2.5초
- Cumulative Layout Shift (CLS): < 0.1
```

### 배포 히스토리

```
Dashboard 
→ Deployments

커밋별 배포 상태 확인:
- ✅ Success: 배포 성공
- ⏳ Building: 배포 중
- ❌ Failed: 배포 실패 (로그 확인)
```

---

## 트러블슈팅

### 문제 1: 404 에러

**증상:** `https://july-logistics.vercel.app/` 접근 시 404

**해결:**
```
1. vercel.json의 redirects 확인
2. Root Directory가 dudu-F-single-page인지 확인
3. single-page.html 파일 존재 확인
```

### 문제 2: 캐시 문제

**증상:** 최신 버전이 안 보임

**해결:**
```
1. 브라우저 캐시 삭제 (Ctrl+Shift+Del)
2. Hard Reload (Ctrl+Shift+R)
3. Vercel에서 재배포 (Redeploy)
```

### 문제 3: 주소록/통계 데이터 안 보임

**증상:** localStorage 데이터 소실

**원인:** 정적 사이트이므로 페이지 새로고침 시 메모리 초기화

**예상:** Phase 7(Supabase 연동)에서 해결

---

## CI/CD 설정 (자동 배포)

### GitHub 연동 (이미 설정됨)

```
Vercel Dashboard
→ Git Integration: Connected
→ Branch: main
→ Auto-deploy: Enabled

flow:
1. GitHub에 push
2. Vercel이 자동 감지
3. 약 1분 내 배포 완료
```

### 배포 전 검사 (향후 추가 가능)

```
vercel.json:
{
  "buildCommand": "npm run build",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

---

## 성능 최적화

### 이미 적용된 최적화
```
✅ 정적 파일 캐싱 (1시간)
✅ gzip 압축
✅ 보안 헤더 설정
✅ CDN 배포 (전 세계)
```

### Phase 3 이후 권장 최적화
```
[ ] 이미지 최적화 (webp)
[ ] 번들 크기 감소 (minify)
[ ] 느린 네트워크 대비
```

---

## 비용

### Vercel 무료 플랜
```
✅ 정적 사이트: 무제한 무료
✅ 트래픽: 월 100GB 무료
✅ 빌드 시간: 월 6,000분 무료
✅ 도메인: 1개 무료 (.vercel.app)

예상 비용: $0/월
```

### 커스텀 도메인 (선택)
```
도메인 비용: 약 $10-15/년 (별도)
Vercel 호스팅: 무료
```

---

## 다음 단계

### Phase 3 이후 필요한 설정
```
[ ] 환경 변수 추가 (API 키, DB 연결)
[ ] 백엔드 API 배포 (별도 서버)
[ ] 데이터베이스 연동 (Supabase)
[ ] 인증 설정 (GitHub/Google OAuth)
```

### 상태 확인 대시보드
```
실시간 모니터링:
- Vercel Status: https://www.vercel-status.com
- GitHub Status: https://www.githubstatus.com
```

---

## 배포 후 공유

### 팀과 공유
```
배포 URL:
https://july-logistics.vercel.app/single-page.html

QR 코드:
[Vercel Dashboard에서 생성 가능]

공유 링크:
[같은 조직의 팀원 추가 가능]
```

### 공개 범위 설정
```
기본: Public (누구나 접근)

Private로 변경:
Settings → Visibility → Private
(유료 플랜 필요)
```

---

## 버전 관리

### 배포 버전 추적

```
각 커밋별 배포:
Vercel Dashboard → Deployments

예시:
✅ bcbf0b3 - config: add vercel deployment
✅ 1b9059a - docs: add comprehensive wireframe
✅ b957ba0 - docs: add Phase 2 features
```

### 이전 버전 롤백

```
Dashboard 
→ Deployments 
→ 이전 배포 선택
→ "Promote to Production"
```

---

## 주의사항

```
⚠️  데이터 보존
- localStorage는 브라우저에만 저장
- Vercel에는 저장 안 됨
- Phase 7에서 Supabase 연동 필수

⚠️  보안
- API 키를 코드에 넣지 말 것
- 환경 변수로 관리
- HTTPS는 Vercel에서 자동 제공

⚠️  성능
- 100건 이상 접수 시 느려질 수 있음
- 데이터베이스 연동 후 최적화 필요
```

---

**배포 완료 확인 후 다음 단계로 진행하세요!**
