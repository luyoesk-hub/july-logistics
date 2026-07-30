# 매뉴얼 2 — Windows·macOS·Linux Vercel CLI 배포

## 목표

전역 설치 없이 동일한 Vercel CLI 버전으로 Preview와 Production 배포를 완료하고 GitHub 자동 배포를 연결한다.

## 서버가 없는 현재 구조

```text
사용자 브라우저 → Vercel 정적 앱
```

이 구조만으로 화면 공개는 가능하다. 그러나 정적 앱은 설문 응답을 영구 저장하지 못한다.

```text
화면 공개                              가능
새로고침 후 응답 영구 보존             불가능
외부 form endpoint로 응답 전달          가능
Vercel Function + 외부 저장소           가능하지만 별도 backend 작업 필요
```

오늘 자체 서버 없이 응답을 기록해야 한다면 `NO_SERVER_RESPONSE_COLLECTION.md`의 외부 form endpoint 경로를 사용한다. endpoint를 연결하지 않았다면 화면에 `저장 완료` 또는 `접수 완료`를 표시하면 안 된다.

검증한 Vercel CLI:

```text
vercel 58.1.0
Node.js requirement: >=18
```

---

## 1. Node와 npm 확인

### Windows PowerShell

```powershell
node --version
npm.cmd --version
```

### Windows Git Bash·macOS·Linux

```bash
node --version
npm --version
```

Node가 `v18` 이상이어야 한다.

### Windows에 Node가 없을 때

```powershell
winget install --id OpenJS.NodeJS.LTS
```

### macOS에 Node가 없을 때

Homebrew가 있으면:

```bash
brew install node
```

없으면 `https://nodejs.org/`에서 Node.js LTS installer를 사용한다.

### Linux에 Node가 없거나 v18 미만일 때

`https://nodejs.org/`의 Linux 설치 안내 또는 이미 사용하는 nvm/fnm/asdf에서 Node LTS를 선택한다.

설치 후 Terminal을 다시 연다.

---

## 2. 프로젝트 루트 확인

`package.json`이 있는 폴더로 이동한다.

### Windows PowerShell

```powershell
cd "C:\Users\<USER>\<PROJECT_PATH>"
Test-Path .\package.json
```

### Windows Git Bash

```bash
cd /c/Users/<USER>/<PROJECT_PATH>
[ -f package.json ] && echo PROJECT_ROOT_OK
```

### macOS

```bash
cd "/Users/<USER>/<PROJECT_PATH>"
[ -f package.json ] && echo PROJECT_ROOT_OK
```

### Linux

```bash
cd "/home/<USER>/<PROJECT_PATH>"
[ -f package.json ] && echo PROJECT_ROOT_OK
```

---

## 3. 로컬 build

### Windows PowerShell

```powershell
npm.cmd install
npm.cmd run build
```

### Windows Git Bash·macOS·Linux

```bash
npm install
npm run build
```

build가 실패하면 배포하지 않는다. 첫 번째 실제 오류부터 수정하고 다시 build한다.

`Missing script: build`가 나오면:

### PowerShell

```powershell
npm.cmd run
```

### Bash/macOS/Linux

```bash
npm run
```

실제 script 이름과 `package.json`을 확인한다.

---

## 4. Vercel 로그인

### Windows PowerShell

```powershell
npx.cmd --yes vercel@58.1.0 login
npx.cmd --yes vercel@58.1.0 whoami
```

### Windows Git Bash·macOS·Linux

```bash
npx --yes vercel@58.1.0 login
npx --yes vercel@58.1.0 whoami
```

브라우저 인증 화면 또는 Terminal에 표시된 인증 URL에서 본인 계정으로 승인한다.

Vercel token을 코드·문서·채팅에 붙여 넣지 않는다.

---

## 5. 첫 Preview 배포

### Windows PowerShell

```powershell
npx.cmd --yes vercel@58.1.0 deploy
```

### Windows Git Bash·macOS·Linux

```bash
npx --yes vercel@58.1.0 deploy
```

첫 연결 질문:

| 질문 | 새 프로젝트 선택 기준 |
|---|---|
| Set up and deploy? | `Y` |
| Scope | 본인 계정 또는 지정 team |
| Link to existing project? | 새 프로젝트면 `N`, 기존 Vercel project면 `Y` |
| Project name | 영문 소문자 이름 |
| Code directory | 현재 폴더면 `./` |
| Modify settings | framework 자동 감지가 실제 프로젝트와 맞으면 `N` |

Preview URL을 브라우저에서 연다.

---

## 6. GitHub repository를 Vercel project에 연결

먼저 GitHub push가 완료돼 있어야 한다.

### Windows PowerShell

```powershell
npx.cmd --yes vercel@58.1.0 git connect https://github.com/<ACCOUNT>/<REPOSITORY>
```

### Windows Git Bash·macOS·Linux

```bash
npx --yes vercel@58.1.0 git connect https://github.com/<ACCOUNT>/<REPOSITORY>
```

연결 이후 `git push`가 Vercel 자동 배포를 시작한다.

---

## 7. Production 배포

### Windows PowerShell

```powershell
npx.cmd --yes vercel@58.1.0 deploy --prod
```

### Windows Git Bash·macOS·Linux

```bash
npx --yes vercel@58.1.0 deploy --prod
```

배포 상세 확인:

### PowerShell

```powershell
npx.cmd --yes vercel@58.1.0 inspect <VERCEL_URL>
```

### Bash/macOS/Linux

```bash
npx --yes vercel@58.1.0 inspect <VERCEL_URL>
```

URL을 시크릿 창 또는 다른 기기에서 열고 새로고침한다.

---

## 8. SPA 새로고침 404만 해결

React Router 경로에서 새로고침할 때만 404가 발생한다면 프로젝트 루트에 `vercel.json`을 만든다.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

commit·push 후 다시 확인한다. 문제가 없으면 이 파일을 만들지 않는다.

---

## 오류별 복구

### PowerShell `npm.ps1 cannot be loaded`

ExecutionPolicy를 바꾸지 말고 다음을 사용한다.

```powershell
npm.cmd run build
npx.cmd --yes vercel@58.1.0 deploy
```

### `node` 또는 `npm` command not found

Node LTS 설치 후 Terminal을 완전히 닫고 다시 연다.

### Vercel이 엉뚱한 framework를 감지

`package.json`이 있는 폴더인지 확인한다. Build Command와 Output Directory를 추측하지 말고 실제 framework config와 대조한다.

### Vite build 성공, 배포 화면이 비어 있음

브라우저 console과 asset 경로를 확인한다. Vercel 성공 문구만으로 앱 성공을 선언하지 않는다.

### 잘못된 account/team에 배포

```bash
npx --yes vercel@58.1.0 whoami
npx --yes vercel@58.1.0 switch
```

PowerShell에서는 `npx.cmd`를 사용한다.

---

## 완료 증거

```text
OS=
TERMINAL=
NODE_VERSION=
PROJECT_ROOT=
BUILD_RESULT=PASS|FAIL
VERCEL_ACCOUNT=
VERCEL_PROJECT=
GIT_CONNECTION=CONNECTED|NOT_CONNECTED
PREVIEW_URL=
PRODUCTION_URL=
EXTERNAL_OPEN=PASS|FAIL
```
