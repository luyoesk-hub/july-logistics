# Seoyul Kim님 Claude Code 설정

이 ZIP은 본인 전용입니다.

폴더 안의 `.env.local`에는 개인 API 키가 들어 있습니다.

파일 내용을 열거나 고치지 않고 아래 순서대로 진행합니다.

## 1. ZIP 압축 풀기

다운로드한 ZIP을 더블클릭합니다.

같은 이름의 폴더가 생깁니다.

## 2. VS Code에서 폴더 열기

1. VS Code를 실행합니다.
2. 상단 메뉴에서 `파일`을 누릅니다.
3. `폴더 열기`를 누릅니다.
4. 방금 압축을 푼 폴더를 선택합니다.
5. 신뢰 여부를 물으면 `예, 작성자를 신뢰합니다`를 누릅니다.

## 3. VS Code 터미널 열기

상단 메뉴에서 `터미널`을 누릅니다.

`새 터미널`을 누릅니다.

## 4. Claude Code 설치

내 컴퓨터에 맞는 명령어 하나만 사용합니다.

### Mac

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Windows

터미널 줄 앞에 `PS`가 보이는지 확인한 뒤 실행합니다.

```powershell
irm https://claude.ai/install.ps1 | iex
```

설치가 끝나면 VS Code를 완전히 종료한 뒤 다시 엽니다.

같은 폴더를 다시 열고 `터미널`과 `새 터미널`을 누릅니다.

## 5. 설치 확인

```text
claude --version
```

숫자가 나오면 다음 단계로 갑니다.

## 6. 개인 API 키 연결

내 컴퓨터에 맞는 명령어 블록 하나를 전부 복사해 붙여넣습니다.

### Mac

```bash
set -a
source .env.local
set +a
mkdir -p ~/.claude
printf '%s\n' "{\"env\":{\"ANTHROPIC_API_KEY\":\"$ANTHROPIC_API_KEY\"}}" > ~/.claude/settings.json
unset ANTHROPIC_API_KEY
rm .env.local
```

### Windows

```powershell
$key = ((Get-Content ".env.local" | Where-Object { $_ -like "ANTHROPIC_API_KEY=*" }) -split "=", 2)[1]
New-Item -ItemType Directory -Force "$HOME\.claude" | Out-Null
@{ env = @{ ANTHROPIC_API_KEY = $key } } | ConvertTo-Json -Depth 3 | Set-Content -Encoding utf8 "$HOME\.claude\settings.json"
Remove-Variable key
Remove-Item ".env.local"
```

오류 없이 다음 입력 줄이 나오면 연결 완료입니다.

개인 키 파일 `.env.local`은 이 단계에서 자동 삭제됩니다.

## 7. 실습 폴더 열기

1. 상단 메뉴에서 `파일`을 누릅니다.
2. `폴더 열기`를 누릅니다.
3. 실습 폴더 `teacher`를 선택합니다.

## 8. Claude Code 실행

VS Code에서 `터미널`과 `새 터미널`을 누릅니다.

```text
claude
```

API 키를 사용할지 물으면 승인합니다.

아래 문장을 입력합니다.

```text
안녕. 지금 열려 있는 폴더 이름만 알려줘.
```

Claude가 `teacher`라고 답하면 완료입니다.

## 막혔을 때

| 화면에 나온 글자 | 할 일 |
|---|---|
| `command not found: claude` | VS Code를 완전히 종료하고 다시 실행합니다. |
| `'claude'은(는) 인식되지 않습니다` | VS Code를 완전히 종료하고 다시 실행합니다. |
| `'irm'은(는) 인식되지 않습니다` | VS Code 터미널 오른쪽 화살표에서 `PowerShell`을 선택합니다. |
| `.env.local: no such file` | 압축을 푼 폴더를 VS Code에서 다시 엽니다. |
| `authentication_error` | 강사에게 오류 문구만 전달합니다. |
| `credit balance` | 강사에게 오류 문구만 전달합니다. |

3분 동안 같은 화면이면 멈춥니다.

API 키나 `.env.local` 화면은 캡처하지 않습니다.
