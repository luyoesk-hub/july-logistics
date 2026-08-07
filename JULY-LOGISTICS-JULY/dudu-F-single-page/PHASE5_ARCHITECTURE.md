# Phase 5 설계: 백엔드 아키텍처 & Supabase 통합

> 데이터 영속성 및 다중 사용자 지원

---

## 🎯 전략적 목표

### 현재 문제 (Phase 1-4)
```
✅ 기능: 완벽함
❌ 데이터: 세션 종료 시 소실
❌ 사용자: 단일 사용자만 지원
❌ 추적: 실시간 동기화 불가
```

### Phase 5 해결책
```
✅ Supabase 데이터베이스
✅ 데이터 영속성 (영구 저장)
✅ 다중 사용자 동시 접근
✅ 지점별 권한 관리
✅ 실시간 알림 (WebSocket)
```

---

## 🏗️ 시스템 아키텍처

### Before (Phase 1-4)
```
┌─────────────────────────┐
│   브라우저 (클라이언트) │
│  ┌──────────────────┐   │
│  │  React/HTML/JS   │   │
│  │  ┌────────────┐  │   │
│  │  │localStorage│  │   │
│  │  └────────────┘  │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

### After (Phase 5)
```
┌─────────────────────────┐
│   브라우저 (클라이언트) │
│  ┌──────────────────┐   │
│  │  React/HTML/JS   │   │
│  │  ┌────────────┐  │   │
│  │  │localStorage│  │   │
│  │  └────────────┘  │   │
│  └──────────────────┘   │
└──────────┬──────────────┘
           │ HTTPS
           ▼
┌──────────────────────────────┐
│   Express.js API 서버        │
│  ┌────────────────────────┐  │
│  │  /api/shipments        │  │
│  │  /api/users            │  │
│  │  /api/statistics       │  │
│  │  /api/auth             │  │
│  └────────────────────────┘  │
└──────────┬───────────────────┘
           │ SQL
           ▼
┌──────────────────────────────┐
│   Supabase 데이터베이스      │
│  ┌────────────────────────┐  │
│  │  shipments 테이블      │  │
│  │  users 테이블          │  │
│  │  branches 테이블       │  │
│  │  statistics (뷰)       │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

---

## 🗄️ 데이터베이스 스키마 (Supabase)

### 1️⃣ users 테이블 (사용자)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  branch_code VARCHAR(2),         -- 지점 코드 (11, 12, 21, ...)
  role VARCHAR(20),               -- 'reception' | 'manager' | 'admin'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_users_branch ON users(branch_code);
CREATE INDEX idx_users_email ON users(email);
```

### 2️⃣ shipments 테이블 (접수 원장)

```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_no VARCHAR(10) UNIQUE NOT NULL,
  
  -- 기본 정보
  created_by UUID REFERENCES users(id),
  branch_code VARCHAR(2) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  
  -- 발송자/수취자
  sender_name VARCHAR(100) NOT NULL,
  sender_phone VARCHAR(20),
  receiver_name VARCHAR(100) NOT NULL,
  receiver_phone VARCHAR(20),
  receiver_area VARCHAR(50) NOT NULL,
  
  -- 물품
  item_name VARCHAR(200) NOT NULL,
  weight_kg DECIMAL(10, 2) NOT NULL,
  width_cm DECIMAL(10, 2),
  height_cm DECIMAL(10, 2),
  depth_cm DECIMAL(10, 2),
  
  -- 계산 결과
  volume_weight_kg DECIMAL(10, 2),
  billed_weight_kg DECIMAL(10, 2),
  size_grade VARCHAR(20),  -- '극소형' | '소형' | '중형' | '대형'
  region_type VARCHAR(20), -- '일반' | '제주' | '도서산간'
  
  -- 배송 옵션 & 요금
  base_price INT,
  shipping_option VARCHAR(20), -- 'standard' | 'express' | 'overnight'
  final_price INT,
  
  -- 배송 상태
  status VARCHAR(20) DEFAULT 'reception',  -- 'reception' | 'processing' | 'in_transit' | 'delivered' | 'returned' | 'cancelled'
  eta_date DATE,
  delivered_at TIMESTAMP,
  
  -- 추가 정보
  is_banned BOOLEAN,
  ban_reason VARCHAR(200),
  notes TEXT,
  
  updated_at TIMESTAMP DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_shipments_tracking ON shipments(tracking_no);
CREATE INDEX idx_shipments_branch ON shipments(branch_code);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_created ON shipments(created_at);
CREATE INDEX idx_shipments_sender ON shipments(sender_name);
CREATE INDEX idx_shipments_receiver ON shipments(receiver_name);
```

### 3️⃣ branches 테이블 (지점)

```sql
CREATE TABLE branches (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  hub_code VARCHAR(10),  -- 'seouldaehub' | 'jungbu' | ...
  phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- 샘플 데이터
INSERT INTO branches VALUES
  ('11', '서울지점', '서울', 'seouldaehub', '02-123-1111', '서울시..'),
  ('12', '용산지점', '서울 용산', 'seouldaehub', '02-123-1112', '서울시 용산구..'),
  ('21', '대전지점', '대전', 'jungbu', '042-123-2111', '대전시..'),
  ('31', '진주지점', '경남 진주', 'youngnam', '055-123-3111', '경남 진주시..'),
  ('32', '거제지점', '경남 거제', 'youngnam', '055-123-3211', '경남 거제시..'),
  ('41', '울산지점', '울산', 'youngnam', '052-123-4111', '울산시..');
```

### 4️⃣ statistics (뷰)

```sql
CREATE VIEW statistics AS
SELECT 
  DATE_TRUNC('day', created_at)::DATE as date,
  branch_code,
  region_type,
  size_grade,
  shipping_option,
  COUNT(*) as count,
  SUM(final_price) as total_price,
  AVG(final_price) as avg_price,
  COUNT(CASE WHEN is_banned THEN 1 END) as rejected_count
FROM shipments
GROUP BY date, branch_code, region_type, size_grade, shipping_option;
```

---

## 🔐 인증 & 권한

### 인증 방식
```
1. 이메일 + 비밀번호 (초기)
2. GitHub OAuth (향후)
3. Google OAuth (향후)
```

### 권한 모델

| 역할 | 접수 | 목록 조회 | 통계 | 수정 | 삭제 | 사용자관리 |
|------|------|---------|------|------|------|----------|
| reception | ✅ | 자신 | ✅ | ❌ | ❌ | ❌ |
| manager | ✅ | 지점 | ✅ | ✅ | ✅ | ❌ |
| admin | ✅ | 전체 | ✅ | ✅ | ✅ | ✅ |

---

## 🔌 API 엔드포인트

### REST API 명세

```
# 인증
POST   /api/auth/register       # 회원가입
POST   /api/auth/login          # 로그인
POST   /api/auth/logout         # 로그아웃
POST   /api/auth/refresh        # 토큰 갱신

# 접수
GET    /api/shipments           # 목록 조회 (필터/검색)
POST   /api/shipments           # 새 접수
GET    /api/shipments/:id       # 상세 조회
PATCH  /api/shipments/:id       # 수정
DELETE /api/shipments/:id       # 삭제

# 통계
GET    /api/statistics          # 대시보드 KPI
GET    /api/statistics/by-branch   # 지점별
GET    /api/statistics/by-region   # 권역별
GET    /api/statistics/by-grade    # 등급별
GET    /api/statistics/by-option   # 배송옵션별
GET    /api/statistics/trend       # 시간대별 트렌드

# 사용자 (admin 권한)
GET    /api/users               # 사용자 목록
POST   /api/users               # 사용자 추가
PATCH  /api/users/:id           # 사용자 수정
DELETE /api/users/:id           # 사용자 삭제
```

### GET /api/shipments (예시)

```
Query Parameters:
  ?branch=11            # 지점 필터
  ?status=delivered     # 상태 필터
  ?start_date=2026-08-01&end_date=2026-08-31  # 날짜 범위
  ?search=김민준        # 검색 (보낸이/받는이)
  ?limit=50&offset=0    # 페이징

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tracking_no": "1100000001",
      "sender_name": "김민준",
      "receiver_name": "이서연",
      "final_price": 10800,
      "status": "delivery_completed",
      "created_at": "2026-08-07T10:30:00Z"
    },
    ...
  ],
  "total": 25,
  "page": 1
}
```

---

## 🔄 마이그레이션 전략

### 단계별 구현

#### Phase 5-A: 기본 구조 (2주)
```
✅ Supabase 프로젝트 생성
✅ 테이블 생성
✅ API 서버 (Express)
✅ 기본 인증
✅ 접수 CRUD
```

#### Phase 5-B: 고급 기능 (2주)
```
✅ 통계 API
✅ 검색/필터링
✅ 다중 사용자
✅ 권한 관리
```

#### Phase 5-C: 최적화 (1주)
```
✅ 캐싱 (Redis)
✅ 실시간 동기화
✅ 성능 튜닝
```

---

## 🚀 배포 전략

### 개발 환경
```
Frontend: localhost:3000 (Vite)
Backend: localhost:3001 (Express)
Database: Supabase (dev)
```

### 프로덕션 환경
```
Frontend: Vercel (기존)
Backend: Heroku / Railway / Render (Express)
Database: Supabase (prod)
```

### 배포 플랫폼 선택

| 플랫폼 | 비용 | 성능 | 배포 속도 | 추천 |
|--------|------|------|---------|------|
| Heroku | $7-50 | 중상 | 빠름 | ✅ (시작) |
| Railway | $5-100 | 중상 | 빠름 | ✅ |
| Render | $7-100 | 좋음 | 매우빠름 | ✅ |
| AWS EC2 | $5-50 | 우수 | 느림 | ❌ (복잡) |

---

## 📊 성능 목표

| 메트릭 | 목표 |
|--------|------|
| 접수 응답시간 | < 200ms |
| 목록 조회 (100건) | < 500ms |
| 통계 계산 | < 1초 |
| 동시 사용자 | 50명 |
| DB 저장소 | 100GB (충분) |

---

## 🔐 보안 체크리스트

- [ ] HTTPS 강제
- [ ] CORS 설정 (origin 화이트리스트)
- [ ] JWT 토큰 (만료 시간 설정)
- [ ] SQL Injection 방지 (파라미터화된 쿼리)
- [ ] XSS 방지 (입력 sanitization)
- [ ] Rate Limiting (로그인 실패 3회 후 1시간 잠금)
- [ ] 비밀번호 암호화 (bcrypt)
- [ ] 로깅 (모든 중요 작업)
- [ ] 백업 (매일 자동)

---

## 📈 단계별 소요 시간

| 단계 | 항목 | 시간 |
|------|------|------|
| 5-A | Supabase 설정 | 2h |
| 5-A | Express API | 4h |
| 5-A | 기본 CRUD | 3h |
| 5-A | 테스트 | 2h |
| 5-B | 통계 API | 3h |
| 5-B | 검색/필터 | 2h |
| 5-B | 다중 사용자 | 3h |
| 5-B | 권한 관리 | 2h |
| 5-C | 캐싱 | 2h |
| 5-C | 성능 튜닝 | 2h |
| **합계** | | **26시간** |

---

## 🎓 학습 자료

```
Supabase:
- https://supabase.com/docs
- https://youtube.com/c/supabase

Express.js:
- https://expressjs.com
- https://github.com/goldbergyoni/nodebestpractices

데이터베이스:
- PostgreSQL 기초
- 쿼리 최적화
- 인덱스 전략

API 설계:
- RESTful API 설계
- OpenAPI/Swagger 명세
- API 버전 관리
```

---

## 📋 완료 체크리스트

### Phase 5-A
- [ ] Supabase 프로젝트 생성
- [ ] 테이블 스키마 작성
- [ ] Express 프로젝트 초기화
- [ ] 기본 라우팅
- [ ] JWT 인증
- [ ] 접수 CRUD 구현
- [ ] 단위 테스트

### Phase 5-B
- [ ] 통계 쿼리 작성
- [ ] 검색/필터 구현
- [ ] 사용자 관리
- [ ] 권한 미들웨어
- [ ] 통합 테스트

### Phase 5-C
- [ ] Redis 캐싱
- [ ] 쿼리 최적화
- [ ] 부하 테스트
- [ ] 성능 개선
- [ ] 보안 감사

---

## 🔗 관련 문서

- `WIREFRAME_MASTER.md` - 전체 기획서
- `PHASE4_DESIGN.md` - CSV 업로드 설계
- `DEPLOYMENT.md` - Vercel 배포

---

**Phase 5 구현 후, 시스템은 프로덕션-ready 상태가 됩니다.**
