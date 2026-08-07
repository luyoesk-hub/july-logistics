# 🧪 로컬 테스트 가이드 - Must Have 기능

> **목표**: Express 백엔드 + 프론트엔드 로컬 동작 검증  
> **상태**: ✅ 완성 (2026-08-07)

---

## 🚀 **빠른 시작 (3단계)**

### 1️⃣ 백엔드 서버 시작
```bash
cd /Users/luyoes/dev/JULY-LOGISTICS-JULY
npm start
# 출력:
# 🚀 Express 서버 시작
# 📍 http://localhost:3001
# ✅ 준비됨
```

### 2️⃣ 프론트엔드 서버 시작 (다른 터미널)
```bash
cd /Users/luyoes/dev/JULY-LOGISTICS-JULY/dudu-F-single-page
python3 -m http.server 8000
# 출력: Serving HTTP on 0.0.0.0 port 8000
```

### 3️⃣ 브라우저에서 열기
```
http://localhost:8000/index.html
```

---

## 📊 **API 엔드포인트 테스트**

### ✅ 헬스 체크
```bash
curl http://localhost:3001/api/health
# 응답: { "status": "ok", "timestamp": "...", "mode": "development" }
```

### ✅ 접수 생성 (POST)
```bash
curl -X POST http://localhost:3001/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "trackingNo": "0100000001",
    "branchName": "서울지점",
    "senderName": "김철수",
    "receiverName": "이순신",
    "receiverArea": "서울",
    "regionType": "general",
    "itemName": "책",
    "weightKg": 2,
    "billedWeightKg": 2,
    "sizeGrade": "small",
    "basePrice": 4000,
    "shippingOption": "standard",
    "finalPrice": 4000,
    "etaDate": "2026-08-10"
  }'
# 응답: { "id": 1, "trackingNo": "0100000001", ... }
```

### ✅ 접수 목록 조회 (GET)
```bash
curl http://localhost:3001/api/shipments
# 응답: { "items": [...], "total": 1, "limit": 100, "offset": 0 }
```

### ✅ 통계 조회
```bash
curl http://localhost:3001/api/statistics
# 응답: { "totalShipments": 1, "totalAmount": 4000, "byBranch": {...}, ... }
```

### ✅ 데이터 초기화 (테스트용)
```bash
curl -X POST http://localhost:3001/api/reset
# 응답: { "message": "데이터 초기화 완료" }
```

---

## 🧪 **프론트엔드 동작 테스트**

### 테스트 1: 단일 접수 (Manual Entry)
1. 브라우저에서 `http://localhost:8000/index.html` 열기
2. **탭 1: 접수** 선택
3. 폼 작성:
   - 지점: "서울지점"
   - 보내는 분: "김철수"
   - 받는 분: "이순신"
   - 물품명: "책"
   - 무게: "2" kg
   - 크기: 20 x 15 x 10 cm
   - 배송옵션: "Standard"
4. "접수 완료" 클릭
5. **기대값**:
   - ✅ 운송장 번호 자동 생성 (01XXXXXXXX)
   - ✅ 요금 자동 계산 (4000원)
   - ✅ 영수증 표시
   - ✅ 백엔드 로그: `✅ 접수 생성: #1 (김철수 → 이순신)`

### 테스트 2: 목록 조회 (List Tab)
1. **탭 2: 목록** 클릭
2. **기대값**:
   - ✅ 접수한 항목이 테이블에 나타남
   - ✅ 운송장 번호, 요금 등 정보 표시
   - ✅ 검색 기능 작동 (운송장번호 입력)
   - ✅ 지점 필터 작동

### 테스트 3: CSV 업로드 (Phase 4)
1. **탭 4: CSV 업로드** 클릭
2. 샘플 CSV 다운로드
3. 파일 수정 (2-3행 추가)
4. 파일 업로드
5. 필드 매핑 확인
6. 미리보기 확인
7. "일괄 접수" 클릭
8. **기대값**:
   - ✅ 진행률 바 표시
   - ✅ 모든 행 접수됨
   - ✅ 목록에 일괄 추가됨

### 테스트 4: 통계 (Stats Tab)
1. **탭 3: 통계** 클릭
2. **기대값**:
   - ✅ 총 접수 건수: 1 (또는 CSV 업로드 건수)
   - ✅ 총 요금: 합계 표시
   - ✅ 지점별/권역별/등급별 분석

---

## 🔄 **브라우저 콘솔 확인**

F12 → Console 탭 열기:

### ✅ 예상 로그 (정상)
```
✅ API 연결됨: http://localhost:3001
📥 API 로드됨: 0건        ← 첫 방문
✅ 접수 생성: #1 (김철수 → 이순신)
📊 ${N}건의 접수 로드됨    ← 새로고침 시
```

### ❌ 예상 로그 (API 미연결, 정상)
```
ℹ️ API 미사용 (localStorage만 사용): [에러 메시지]
💾 localStorage에 저장 (API 미연결)
```

---

## 💾 **데이터 저장소**

### 로컬 JSON 파일
```
/Users/luyoes/dev/JULY-LOGISTICS-JULY/data/shipments.json
```

**구조:**
```json
{
  "shipments": [
    { "id": 1, "trackingNo": "0100000001", ... },
    { "id": 2, "trackingNo": "0100000002", ... }
  ],
  "lastId": 2
}
```

### localStorage (Fallback)
- localStorage에도 자동 저장 (API 실패 시)
- 브라우저 캐시 삭제 시에만 손실
- DevTools → Application → Local Storage → `dudu_*` 확인

---

## 🔧 **환경 설정**

### .env.local
```env
NODE_ENV=development
API_PORT=3001
API_URL=http://localhost:3001
```

### CORS 설정 (server.js)
**허용된 도메인:**
- http://localhost:8000 (로컬 테스트)
- http://localhost:3000 (dev)
- https://dudu-reception.vercel.app (프로덕션)

---

## 📋 **Must Have 검증 체크리스트**

### ✅ 1. 데이터 영구 저장소
- [x] Express 백엔드 구축
- [x] JSON 파일 스토리지
- [x] POST /api/shipments 작동
- [x] GET /api/shipments 작동
- [x] GET /api/statistics 작동

### ✅ 2. 프론트엔드 API 연동
- [x] API 헬스 체크
- [x] 접수 시 API로 전송
- [x] CSV 배치 시 API로 전송
- [x] 페이지 로드 시 API에서 데이터 로드
- [x] API 실패 시 localStorage fallback

### ✅ 3. 라이브 서비스 검증
- [x] 단일 접수 테스트 (수동)
- [x] CSV 업로드 테스트
- [x] 통계 계산 검증
- [x] 금지품목 검증 작동
- [x] 운송장 번호 자동 생성

### ✅ 4. 오류 처리
- [x] API 연결 실패 시 graceful fallback
- [x] 콘솔 에러 0개
- [x] 유효성 검사 완벽

---

## 🎯 **다음 단계**

### Phase 5: 완전 백엔드
- [ ] Supabase 또는 로컬 PostgreSQL
- [ ] JWT 사용자 인증
- [ ] 역할 기반 권한 (RBAC)
- [ ] 프로덕션 배포

### 현재 상태
```
✅ Phase 1-4: 100% 완료 (로컬 테스트 가능)
⏳ Phase 5: 대기 (Supabase 문제 해결 필요)
```

---

## 🐛 **문제 해결**

### ❌ API 연결 안 됨
```bash
# 1. 서버 실행 확인
ps aux | grep node

# 2. 포트 확인
lsof -i :3001

# 3. 재시작
npm start
```

### ❌ 브라우저에서 "Cannot reach localhost:8000"
```bash
# 프론트엔드 서버 재시작
cd dudu-F-single-page
python3 -m http.server 8000
```

### ❌ CORS 에러 발생
- 브라우저 콘솔에서 CORS 에러 확인
- server.js의 CORS 설정 확인
- origin 도메인 추가 필요 시 수정

### ❌ 데이터 안 보임
```bash
# 데이터 초기화
curl -X POST http://localhost:3001/api/reset

# localStorage 초기화
# 브라우저: DevTools → Application → Clear Site Data
```

---

## ✨ **성공 시 결과**

```
🎉 로컬 테스트 성공 조건
✅ 백엔드 서버 실행
✅ 프론트엔드 서버 실행
✅ 단일 접수 → API 저장 → 목록 조회 가능
✅ CSV 업로드 → 일괄 API 저장 → 통계 반영
✅ 새로고침 후에도 데이터 유지
✅ 콘솔 에러 0개
✅ 구글 Chrome/Safari 모두 테스트 통과
```

---

**✅ 문서 작성일**: 2026-08-07  
**📌 버전**: Phase 4 + Express Backend v1.0  
**🔗 GitHub**: https://github.com/luyoesk-hub/july-logistics
