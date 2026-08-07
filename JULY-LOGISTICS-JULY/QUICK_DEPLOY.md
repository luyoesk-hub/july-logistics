# ⚡ 빠른 배포 (5분)

> Railway.app + Vercel 자동 배포

---

## 🎯 **배포 URL**

```
백엔드:  https://july-logistics-backend.railway.app
프론트:  https://dudu-reception.vercel.app
```

---

## 1️⃣ **Railway.app 배포 (2분)**

### 자동 배포 버튼 (권장)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fluyoesk-hub%2Fjuly-logistics&envs=NODE_ENV%2CFRONTEND_URL&NODE_ENVDefault=production&FRONTEND_URLDefault=https%3A%2F%2Fdudu-reception.vercel.app)

위 버튼을 클릭하면:
- ✅ GitHub 연결 완료
- ✅ 자동 배포 시작
- ✅ 약 2-3분 후 준비 완료

### 또는 수동 배포

1. https://railway.app 접속
2. GitHub로 로그인
3. "Create a new project" 클릭
4. "Deploy from GitHub" 선택
5. "july-logistics" 선택
6. 배포 시작

배포 후 URL:
```
https://july-logistics-backend.railway.app
```

---

## 2️⃣ **환경 변수 설정 (1분)**

### Railway Dashboard에서

```
변수명              값
─────────────────────────────────────────────
NODE_ENV       = production
FRONTEND_URL   = https://dudu-reception.vercel.app
```

설정 → Variables 탭 → 위 변수 추가 → 저장

---

## 3️⃣ **Vercel 프론트엔드 연결 (2분)**

### Vercel Dashboard

1. https://vercel.com 접속
2. "july-logistics" 프로젝트 선택
3. Settings → Environment Variables
4. 변수 추가:

```
변수명                    값
─────────────────────────────────────────────
REACT_APP_API_URL = https://july-logistics-backend.railway.app
```

5. Redeploy 클릭 (자동으로 재배포됨)

---

## ✅ **배포 검증**

### 1. 백엔드 확인
```bash
curl https://july-logistics-backend.railway.app/api/health
# 응답: { "status": "ok" }
```

### 2. 프론트엔드 테스트
```
브라우저: https://dudu-reception.vercel.app
1. 폼 작성 후 "접수 완료" 클릭
2. "목록" 탭에 데이터 표시 확인
3. 통계 탭 확인
4. 새로고침 후 데이터 유지 확인
```

### 3. 콘솔 확인
```
F12 → Console 탭
✅ API 연결됨: https://july-logistics-backend.railway.app
(에러가 없어야 함)
```

---

## 🚀 **배포 완료!**

```
✅ Phase 1-4: 기본 + CSV 업로드
✅ Phase 5-1: Express 백엔드 배포됨
✅ 프로덕션 준비 완료

이제 사용 가능:
- 접수 시스템
- 목록 조회
- 통계 분석
- CSV 대량 업로드
- 모든 데이터 API에 저장
- 새로고침 후에도 데이터 유지
```

---

## 🎨 **스크린샷 (배포 후)**

### Railway Dashboard
```
Active ✅
Status: Running
Port: Auto-assigned
URL: https://july-logistics-backend.railway.app
```

### Vercel Dashboard
```
Production
Latest Deployment: ✅ Ready
URL: https://dudu-reception.vercel.app
```

---

## 📊 **배포 상태 확인**

### Railway Logs
```
Railway Dashboard → Logs 탭
최신 로그:
🚀 Express 서버 시작
📍 http://localhost:3001
✅ 준비됨
```

### Vercel Logs
```
Vercel Dashboard → Deployments 탭
최신 배포: ✅ Success
```

---

## 🔄 **이후 배포 (자동)**

코드 변경 후:
```bash
git add .
git commit -m "fix: ..."
git push origin main
```

약 2-3분 후:
- ✅ Railway: 자동 배포
- ✅ Vercel: 자동 배포
- ✅ 프로덕션 반영 완료

---

## 🆘 **문제 해결**

### API 연결 안 됨
```
브라우저 콘솔: ❌ API 미사용 (localhost만 사용)
```
→ Vercel 환경 변수 재확인 → Redeploy

### 데이터 안 보임
```
API /shipments 응답: []
```
→ localStorage 초기화
→ DevTools → Application → Clear Site Data

### Railway 배포 실패
```
Build failed
```
→ Railway Logs 확인
→ package.json 문법 확인
→ node_modules 없는지 확인

---

## 📞 **지원**

```
문제 발생 시:
1. Railway Logs 확인
2. Vercel Logs 확인
3. 브라우저 콘솔 확인
4. Network 탭에서 API 호출 확인
```

---

**⚡ 5분 만에 프로덕션 배포 완료!**

---

마지막 업데이트: 2026-08-07
