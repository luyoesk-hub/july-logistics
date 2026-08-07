const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

module.exports = async function handler(req, res) {
  console.log(JSON.stringify({ event: 'env-check', hasUrl: !!SUPABASE_URL, hasKey: !!SUPABASE_ANON_KEY }));
  const t0 = Date.now();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST만 받습니다" });
  }

  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    console.log(JSON.stringify({ event: "submit", ok: false, duration_ms: Date.now() - t0 }));
    return res.status(400).json({ error: "담긴 메뉴(items)가 없습니다" });
  }

  const isValid = items.every(
    (it) =>
      typeof it?.name === "string" &&
      Number.isInteger(it?.price) &&
      Number.isInteger(it?.qty) &&
      it.qty > 0
  );
  if (!isValid) {
    console.log(JSON.stringify({ event: "submit", ok: false, duration_ms: Date.now() - t0 }));
    return res.status(400).json({ error: "items 형식이 올바르지 않습니다 (name, price, qty 필요)" });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log(JSON.stringify({ event: "submit", ok: false, duration_ms: Date.now() - t0 }));
    return res.status(500).json({ error: "서버 환경변수가 설정되지 않았습니다" });
  }

  const total_qty = items.reduce((sum, it) => sum + it.qty, 0);
  const total_price = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ items, total_qty, total_price }),
  });

  const result = await response.json();
  if (!response.ok) {
    console.log(JSON.stringify({ event: "submit", ok: false, duration_ms: Date.now() - t0, error: result }));
    return res.status(500).json({ error: result?.message || "Supabase 저장 중 오류가 발생했습니다", details: result });
  }

  console.log(JSON.stringify({ event: "submit", ok: true, duration_ms: Date.now() - t0 }));
  return res.status(200).json({ ok: true, order_id: result?.[0]?.id ?? null, total_qty, total_price });
};
