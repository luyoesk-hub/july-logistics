# 404 에러 빠른 해결 가이드 (CLI 방식)

> Vercel 대시보드 설정 없이 바로 배포하기

---

## 🚀 **가장 확실한 방법: Vercel CLI 사용**

### 단계 1: Vercel CLI 설치

```bash
npm install -g vercel
```

### 단계 2: 로그인

```bash
vercel login
```

브라우저가 열리면 GitHub 계정으로 로그인합니다.

### 단계 3: 배포 폴더로 이동

```bash
cd /Users/luyoes/dev/JULY-LOGISTICS-JULY/dudu-F-single-page
```

### 단계 4: 배포 실행

```bash
vercel --prod
```

프롬프트가 나타나면:

```
? Set up and deploy "~/JULY-LOGISTICS-JULY/dudu-F-single-page"? [Y/n]
→ Y 입력

? Which scope should we deploy to?
→ 본인 계정 선택

? Link to existing project?
→ Y 입력 (기존 프로젝트와 연결)

? What's the name of your existing project?
→ july-logistics 입력

? Linked to [account]/july-logistics (created .vercelignore) [Y/n]
→ Y 입력

✓ Deployed to july-logistics.vercel.app (in 2s)
```

---

## 🎯 **이제 다시 접속해보세요**

### 올바른 URL:
```
https://july-logistics.vercel.app/
```

### 테스트:
1. 페이지 로드되는가?
2. "두두택배 접수" 제목 보이는가?
3. 3개 탭 보이는가?
4. 입력 필드 작동하는가?

---

## ✅ **성공 표시**

배포 완료 후:

```
✓ Deployed to july-logistics.vercel.app [Ready]
```

이 메시지가 보이면 배포 완료입니다!

---

## 🔍 **여전히 404가 뜨면?**

1. 브라우저 캐시 삭제
   ```
   Ctrl+Shift+Del (Windows) 
   또는 
   Cmd+Shift+Del (Mac)
   ```

2. 시크릿 모드에서 다시 접속
   ```
   Ctrl+Shift+N (Windows)
   또는
   Cmd+Shift+N (Mac)
   ```

3. 다른 브라우저에서 시도

4. 배포 대기 (약 2-3분)

---

## 📋 **Vercel CLI 문제 발생 시**

### npm이 없다면?

```bash
# Node.js 설치 확인
node --version

# npm 설치 확인
npm --version

# 없으면 설치: https://nodejs.org/
```

### 권한 문제

```bash
sudo npm install -g vercel
```

### 이전 배포와 충돌

```bash
rm -rf .vercel
vercel --prod
```

---

**이 방법으로 99% 확률로 404 에러가 해결됩니다!**
