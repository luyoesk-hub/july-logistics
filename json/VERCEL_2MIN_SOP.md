# Vercel 2분 배포 SOP

> 목표: Antigravity에서 만든 React/Vite 앱을 GitHub에 올리고 Vercel 공개 URL을 만든다.

## 0. 프로젝트 폴더 확인

Antigravity Terminal에서 `package.json`이 있는 폴더로 이동한다.

```bash
npm install
npm run build
```

### 통과 기준

- 명령이 오류 없이 끝난다.
- Vite 프로젝트라면 `dist/`가 생긴다.
- 실패하면 **첫 번째 오류 줄부터** Antigravity에 전달해 수정한 뒤 다시 실행한다.

---

## 1. GitHub에 올리기

GitHub에서 **빈 repository**를 하나 만든다. README·license·gitignore는 추가하지 않는다.

Antigravity Terminal:

```bash
git init
git add .
git commit -m "deploy: first vercel build"
git branch -M main
git remote -v
```

remote가 없을 때:

```bash
git remote add origin https://github.com/<ACCOUNT>/<REPOSITORY>.git
```

기존 remote가 잘못됐을 때:

```bash
git remote set-url origin https://github.com/<ACCOUNT>/<REPOSITORY>.git
```

Push:

```bash
git push -u origin main
```

### 멈춤 조건

- 비밀번호·API key·token·`.env`가 코드에 있으면 push 금지
- `.gitignore`에 최소한 다음이 있어야 한다.

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
```

---

## 2. Vercel에 연결

1. 브라우저에서 `https://vercel.com/new` 열기
2. **Continue with GitHub**
3. 방금 만든 repository의 **Import** 선택
4. 설정 확인
   - Framework Preset: `Vite` 또는 자동 감지
   - Root Directory: `package.json`이 있는 위치
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Deploy**

### 성공 marker

- `Congratulations` 또는 Production Deployment 완료
- `https://<project>.vercel.app` 주소 생성
- 그 주소를 새 시크릿 창 또는 다른 기기에서 열었을 때 첫 화면이 보임

---

## 3. 수정 후 재배포

```bash
git add .
git commit -m "fix: update app"
git push
```

Vercel이 GitHub push를 감지해 자동 재배포한다.

---

## CLI fallback

Vercel 사이트의 GitHub Import가 막힐 때만 프로젝트 루트에서 실행한다.

```bash
npx vercel@latest
```

첫 연결 뒤 production 배포:

```bash
npx vercel@latest --prod
```

CLI 질문 기본값:

- Set up and deploy: `Y`
- Scope: 본인 계정 또는 수업용 team
- Link to existing project: 새 프로젝트면 `N`, 이미 만들었으면 `Y`
- Directory: `./`
- Modify settings: Vite 자동 감지가 맞으면 `N`

---

## React Router를 사용한 SPA만

새로고침 때 404가 발생하면 프로젝트 루트에 `vercel.json`을 만든다.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

다시 commit·push한다.

---

## DB 없이 응답 기록이 가능한가?

- **정적 Vercel 앱만으로는 응답을 영구 저장할 수 없다.**
- DB를 직접 만들지 않으려면 Formspree·Tally·Google Forms 같은 외부 form endpoint를 연결해야 한다.
- Vercel Web Analytics는 방문 통계이며 설문 답변 저장소가 아니다.
- 외부 endpoint가 아직 없으면 “접수 완료”라고 표시하지 말고 `mock / 저장되지 않음`으로 명시한다.
- 실제 개인정보는 받지 않고 가상 ID 또는 승인된 최소 필드만 사용한다.

---

## 4. Vercel Analytics 활성화 및 연동 방법

### 1) Vercel 대시보드 설정
1. Vercel Dashboard (`https://vercel.com/dashboard`) 접속
2. 해당 프로젝트 선택 후 **Analytics** 탭 클릭
3. **Enable Analytics** (또는 Quickstart) 버튼 클릭하여 활성화

### 2) 프로젝트 코드 연동

#### A. 순수 HTML (Static Site) 인 경우
`index.html` 파일의 `</body>` 태그 바로 직전에 아래 스크립트를 추가합니다:
```html
<!-- Vercel Web Analytics -->
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

#### B. React / Next.js / Vite (npm 패키지 사용) 인 경우
1. 패키지 설치:
   ```bash
   npm install @vercel/analytics
   ```
2. 진입점 파일(`main.jsx`, `App.jsx` 또는 `_app.tsx`)에 스크립트 추가:
   ```jsx
   import { inject } from '@vercel/analytics';
   
   // 앱 초기화 시 호출
   inject();
   ```
   *(React 컴포넌트인 경우 `<Analytics />` 컴포넌트 사용 가능)*

---

## 최종 제출 4개

1. GitHub repository URL
2. Vercel production URL
3. `npm run build` 성공 화면
4. 다른 기기 또는 시크릿 창에서 열린 화면
