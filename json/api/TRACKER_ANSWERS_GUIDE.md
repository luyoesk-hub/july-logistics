# `tracker.js`에서 응답 결과(`answers`) 수집하기

## 목적

현재 `tracker.js`는 다음 행동을 기록한다.

- 페이지 접속
- 문항 작성 시작
- 문항 작성 완료
- 문항별 작성 시간
- 제출
- 제출하지 않고 이탈

여기에 **사용자가 실제로 제출한 응답 결과**를 추가한다.

제출 시 현재 HTML의 모든 `name:value`를 자동으로 읽어 다음 구조로 전송한다.

```json
{
  "event": "form_submitted",
  "answers": {
    "breakfast_eaten": "yes",
    "breakfast_food": "토스트",
    "reason": "아침에 간단히 먹었다"
  }
}
```

> 수강생마다 HTML과 문항명이 달라도 된다. 각 HTML 입력 요소의 `name`이 `answers` 안의 JSON key가 된다.

---

## 1. HTML 입력 요소에 `name` 확인하기

```html
<input
  type="text"
  id="breakfast_food"
  name="breakfast_food"
>

<textarea
  id="reason"
  name="reason"
></textarea>
```

- `id`: HTML과 JavaScript에서 요소를 찾는 이름
- `name`: 전송되는 JSON의 key

`name`이 없는 입력 요소는 `answers`에 포함되지 않는다.

---

## 2. `tracker.js`의 제출 부분 찾기

```javascript
document.addEventListener("submit", event => {
  if (!(event.target instanceof HTMLFormElement)) return;
  submitted = true;
```

바로 아래에 응답 수집 코드를 추가한다.

```javascript
  const answers = {};

  for (const [name, value] of new FormData(event.target).entries()) {
    const field = event.target.elements.namedItem(name);

    // 비밀번호는 수집하지 않는다.
    if (field && field.type === "password") continue;

    if (answers[name] === undefined) {
      answers[name] = value;
    } else if (Array.isArray(answers[name])) {
      answers[name].push(value);
    } else {
      answers[name] = [answers[name], value];
    }
  }
```

### key:value 코멘터리

| 코드 | 뜻 |
|---|---|
| `new FormData(event.target)` | 제출된 form에서 `name:value`를 읽는다. |
| `name` | 현재 HTML 입력 요소의 `name`이다. JSON key가 된다. |
| `value` | 사용자가 입력하거나 선택한 값이다. JSON value가 된다. |
| `answers[name] = value` | 일반 입력값 하나를 저장한다. |
| `answers[name].push(value)` | 같은 `name`의 체크박스처럼 값이 여러 개면 배열로 보존한다. |
| `field.type === "password"` | 비밀번호 입력은 수집하지 않는다. |

---

## 3. 제출 이벤트에 `answers` 추가하기

기존 전송 코드가 다음과 같다면:

```javascript
send("form_submitted", {
  elapsed_ms: Date.now() - openedAt,
  completed_field_count: completedFields.size,
  total_field_count: totalFields
});
```

마지막에 `answers`를 추가한다.

```javascript
send("form_submitted", {
  elapsed_ms: Date.now() - openedAt,
  completed_field_count: completedFields.size,
  total_field_count: totalFields,
  answers
});
```

---

## 4. 완성된 제출 부분

```javascript
document.addEventListener("submit", event => {
  if (!(event.target instanceof HTMLFormElement)) return;

  submitted = true;

  const answers = {};

  for (const [name, value] of new FormData(event.target).entries()) {
    const field = event.target.elements.namedItem(name);

    if (field && field.type === "password") continue;

    if (answers[name] === undefined) {
      answers[name] = value;
    } else if (Array.isArray(answers[name])) {
      answers[name].push(value);
    } else {
      answers[name] = [answers[name], value];
    }
  }

  const totalFields = new Set(
    [...event.target.elements]
      .filter(element => element.name && element.type !== "password")
      .map(element => element.name)
  ).size;

  send("form_submitted", {
    elapsed_ms: Date.now() - openedAt,
    completed_field_count: completedFields.size,
    total_field_count: totalFields,
    answers
  });
}, true);
```

---

## 5. 다시 배포하기

프로젝트 폴더의 터미널에서 실행한다.

```bash
npx vercel --prod
```

---

## 6. Vercel Logs에서 확인하기

```text
Vercel
→ 자기 프로젝트
→ Logs
→ /api/events
→ event가 form_submitted인 로그
```

예상 로그:

```json
{
  "stream": "SURVEY_BEHAVIOR",
  "event": "form_submitted",
  "session_id": "f19ac5d2-...",
  "elapsed_ms": 48700,
  "completed_field_count": 3,
  "total_field_count": 3,
  "answers": {
    "breakfast_eaten": "yes",
    "breakfast_food": "토스트",
    "reason": "아침에 간단히 먹었다"
  }
}
```

### 로그 읽기

| key | value 예시 | 코멘터리 |
|---|---:|---|
| `event` | `form_submitted` | form 제출 이벤트가 발생했다. |
| `session_id` | `f19ac5d2-...` | 같은 방문에서 발생한 시작·중간·끝 로그를 연결한다. |
| `elapsed_ms` | `48700` | 접속 후 제출까지 48.7초가 걸렸다. |
| `completed_field_count` | `3` | 작성 완료 행동이 관측된 문항은 3개다. |
| `total_field_count` | `3` | 현재 form에서 `name`으로 식별한 문항은 3개다. |
| `answers` | `{...}` | 사용자가 제출한 실제 `name:value` 응답이다. |

---

## 완료 기준

다음 조건이 모두 확인되면 완료다.

1. 자기 HTML의 입력 요소에 `name`이 있다.
2. 제출 후 `/api/events`가 호출된다.
3. Vercel Logs에 `event: "form_submitted"`가 보인다.
4. `answers` 안에 자기 HTML의 실제 `name:value`가 보인다.
5. 체크박스처럼 같은 `name`의 여러 값은 배열로 보존된다.

> `form_submitted` 로그가 보여도 장기 저장이 완료됐다는 뜻은 아니다. 현재 Vercel Logs는 응답이 API에 수신됐는지 확인하는 표면이다.
