# 🚀 배포 가이드 - Phase 5 프로덕션

> Express 백엔드 + Vercel 프론트엔드 연동

---

## 📋 **배포 옵션 비교**

| 서비스 | 비용 | 난이도 | 배포 시간 | 추천 |
|--------|------|--------|---------|------|
| **Railway.app** | 무료 $5/월 | ⭐⭐ | 2분 | ✅ 추천 |
| Render | 무료 | ⭐⭐ | 3분 | ✅ 좋음 |
| Heroku | $7/월+ | ⭐⭐ | 3분 | ✅ 안정적 |
| Vercel (Serverless) | 무료 | ⭐⭐⭐ | 2분 | ✅ 통합 |

---

## 🚀 **방법 1: Railway.app 배포 (추천)**

### Step 1: Railway.app 가입 및 프로젝트 생성

```bash
# 1. https://railway.app 접속
# 2. "GitHub로 로그인" 클릭
# 3. GitHub 인증 완료
# 4. "Create a new project" 클릭
```

### Step 2: 리포지토리 연결

```bash
# 프로젝트 생성 페이지에서:
# 1. "Deploy from GitHub" 클릭
# 2. "july-logistics" 리포지토리 선택
# 3. "Deploy" 클릭
```

### Step 3: 환경 변수 설정

Railway Dashboard:
```
1. Project → Variables 탭
2. 다음 변수 추가:
   - NODE_ENV=production
   - API_PORT=3000 (Railway 자동 할당, 변경 불필요)
   - API_URL=https://july-logistics-backend.railway.app (배포 후)
```

### Step 4: 자동 배포 대기

```
배포 로그:
✅ Building...
✅ Dependencies installed
✅ Server started
✅ Status: Active
```

### Step 5: 배포 URL 확인

```
https://july-logistics-backend.railway.app
또는
https://[RAILWAY-PROJECT-ID].railway.app
```

---

## 🔗 **Step 4: 프론트엔드와 연동**

### vercel.json 수정

```json
{
  "env": {
    "REACT_APP_API_URL": "@api-url"
  }
}
```

### Vercel 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables:
```
REACT_APP_API_URL = https://july-logistics-backend.railway.app
```

### index.html 수정

```javascript
// 현재 코드:
const API_URL = localStorage.getItem('dudu_api_url') || 'http://localhost:3001';

// 수정 후:
const API_URL = process.env.REACT_APP_API_URL || 
                localStorage.getItem('dudu_api_url') || 
                'http://localhost:3001';
```

### CORS 업데이트

server.js 수정:
```javascript
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://dudu-reception.vercel.app';

app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    FRONTEND_URL
  ],
  credentials: true
}));
```

---

## ✅ **배포 검증 체크리스트**

### 백엔드 (Railway)
- [ ] GitHub 저장소 연결
- [ ] 자동 배포 완료
- [ ] 환경 변수 설정
- [ ] Health check 작동
  ```bash
  curl https://july-logistics-backend.railway.app/api/health
  ```
- [ ] POST /api/shipments 작동
- [ ] GET /api/shipments 작동

### 프론트엔드 (Vercel)
- [ ] 환경 변수 설정
- [ ] Redeploy 실행
- [ ] API URL 업데이트
- [ ] 프로덕션 테스트

### 통합 테스트
- [ ] 접수 생성 → API 저장 → 목록 반영
- [ ] CSV 업로드 → 일괄 API 저장
- [ ] 통계 실시간 업데이트
- [ ] 새로고침 후 데이터 유지

---

## 🚀 **방법 2: Vercel Serverless Functions (더 간단)**

### Step 1: API 함수 구조 변경

```javascript
// api/shipments.js
export default async (req, res) => {
  // POST /api/shipments
  // GET /api/shipments
  // etc.
}
```

### 장점
- ✅ 단일 배포 (프론트 + 백 함께)
- ✅ 자동 CORS 처리
- ✅ 무료

### 단점
- ❌ 코드 구조 변경 필요
- ❌ Express 미들웨어 제한

---

## 📊 **최종 아키텍처**

```
┌─────────────────────┐
│   GitHub Actions    │ ← 자동 배포 트리거
└──────────┬──────────┘
           ↓
    ┌──────────────┐
    │ july-logistics│ ← main 브랜치
    └──────┬───────┘
           ↓
      ┌─────────┐
      │ Railway │ ← Express API 백엔드
      └────┬────┘   ✅ https://july-logistics-backend.railway.app
           ↑        ✅ 자동 배포
           │
      ┌─────────┐
      │ Vercel  │ ← Vercel 프론트엔드
      └────┬────┘   ✅ https://dudu-reception.vercel.app
           │        ✅ CORS 허용
           ↓
    ┌──────────────────┐
    │ 사용자 브라우저   │ ← 최종 사용자
    └──────────────────┘
```

---

## 🔄 **배포 후 워크플로우**

1. **로컬 개발**
   ```bash
   npm start          # 백엔드 (localhost:3001)
   npm run dev:fe     # 프론트엔드 (localhost:8000)
   ```

2. **GitHub Push**
   ```bash
   git add .
   git commit -m "feat: ..."
   git push origin main
   ```

3. **자동 배포**
   - Railway: GitHub 브랜치 감시 → 자동 배포
   - Vercel: GitHub 브랜치 감시 → 자동 배포
   - 약 2-3분 후 프로덕션 반영

4. **배포 확인**
   ```bash
   # 백엔드
   curl https://july-logistics-backend.railway.app/api/health
   
   # 프론트엔드
   curl https://dudu-reception.vercel.app
   ```

---

## 🐛 **배포 후 문제 해결**

### CORS 에러
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**해결:**
- server.js에서 Vercel URL 추가
- Railway 환경 변수 재확인

### API 타임아웃
```
Error: Connection timeout
```
**해결:**
- Railway 프로젝트 상태 확인
- 로그 확인: Railway Dashboard → Logs 탭

### 데이터 미표시
```
0건의 접수 표시됨
```
**해결:**
- `/api/shipments` 호출 확인
- 브라우저 DevTools → Network 탭
- API 응답 확인

---

## 📈 **다음 단계 (Phase 5 완성)**

### 1단계: 백엔드 강화 (선택사항)
- [ ] JWT 인증 추가
- [ ] 사용자 테이블 추가
- [ ] 역할 기반 권한

### 2단계: 데이터베이스 마이그레이션
- [ ] Supabase 또는 PostgreSQL 연결
- [ ] JSON → DB 마이그레이션
- [ ] 트랜잭션 처리

### 3단계: 모니터링
- [ ] Sentry 에러 추적
- [ ] LogRocket 사용자 분석
- [ ] Grafana 성능 모니터링

---

## 🎯 **배포 후 예상 상태**

```
✅ Phase 1: 기본 접수         → https://dudu-reception.vercel.app
✅ Phase 2: 목록 & 통계       → 작동 중
✅ Phase 3: UI/UX 개선        → 작동 중
✅ Phase 4: CSV 업로드        → 작동 중
✅ Phase 5: 백엔드 배포       → https://july-logistics-backend.railway.app

🚀 프로덕션 준비 완료
📊 2개 서비스 (프론트/백) 자동 배포
💾 JSON 파일 기반 데이터 저장
🔄 자동 CI/CD (GitHub → Railway/Vercel)
```

---

**✅ 배포 완료 후:** 사용자가 실제 프로덕션 환경에서 접수 가능!
