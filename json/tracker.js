(() => {
  const endpoint = "/api/events";
  const sessionId = crypto.randomUUID();
  const openedAt = Date.now();
  const fieldStarts = new Map();
  const completedFields = new Set();
  let submitted = false;

  const base = () => ({
    session_id: sessionId,
    page: location.pathname,
    page_title: document.title,
    client_at: new Date().toISOString()
  });

  function send(event, detail = {}, beacon = false) {
    const payload = JSON.stringify({ event, ...base(), ...detail });
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
      return;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    }).catch(() => {});
  }

  send("page_view", {
    referrer: document.referrer || null,
    viewport_width: innerWidth,
    viewport_height: innerHeight,
    language: navigator.language
  });

  document.addEventListener("focusin", event => {
    const field = event.target;
    if (!field.matches("input[name], select[name], textarea[name]")) return;
    if (field.type === "password") return;
    fieldStarts.set(field, Date.now());
    send("field_started", {
      field_name: field.name,
      field_type: field.type || field.tagName.toLowerCase()
    });
  });

  document.addEventListener("focusout", event => {
    const field = event.target;
    if (!field.matches("input[name], select[name], textarea[name]")) return;
    if (field.type === "password") return;
    const started = fieldStarts.get(field);
    if (!started) return;
    const answered = field.type === "checkbox" || field.type === "radio"
      ? field.checked
      : String(field.value || "").trim().length > 0;
    completedFields.add(field.name);
    send("field_completed", {
      field_name: field.name,
      field_type: field.type || field.tagName.toLowerCase(),
      duration_ms: Date.now() - started,
      answered
    });
    fieldStarts.delete(field);
  });

  document.addEventListener("submit", event => {
    if (!(event.target instanceof HTMLFormElement)) return;
    submitted = true;
    const totalFields = new Set(
      [...event.target.elements]
        .filter(el => el.name && el.type !== "password")
        .map(el => el.name)
    ).size;
    send("form_submitted", {
      elapsed_ms: Date.now() - openedAt,
      completed_field_count: completedFields.size,
      total_field_count: totalFields
    });
  }, true);

  addEventListener("pagehide", () => {
    send("page_exit", {
      elapsed_ms: Date.now() - openedAt,
      submitted,
      completed_field_count: completedFields.size
    }, true);
  });
})();
