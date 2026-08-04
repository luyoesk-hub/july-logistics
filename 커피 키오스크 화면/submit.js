// Vercel 서버리스 함수(serverless function, 요청 있을 때만 잠깐 켜지는 서버 코드)
// - 키오스크에서 담은 장바구니를 Supabase의 orders 표에 저장한다.
// 키는 코드에 쓰지 않는다. Vercel 환경변수(SUPABASE_URL, SUPABASE_ANON_KEY)에서 읽는다.
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const t0 = Date.now();

  if (req.method !== "POST") return res.status(405).json({ error: "POST만 받습니다" });

  const { items } = req.body || {};

  // items 형태 검증: [{ name, price, qty }, ...] 최소 1개 이상
  if (!Array.isArray(items) || items.length === 0) {
    console.log(JSON.stringify({ event: "submit", ok: false, duration_ms: Date.now() - t0 }));
    return res.status(400).json({ error: "담긴 메뉴(items)가 없습니다" });
  }
  const isValid = items.every(
    (it) => typeof it?.name === "string" && Number.isInteger(it?.price) && Number.isInteger(it?.qty) && it.qty > 0
  );
  if (!isValid) {
    console.log(JSON.stringify({ event: "submit", ok: false, duration_ms: Date.now() - t0 }));
    return res.status(400).json({ error: "items 형식이 올바르지 않습니다 (name, price, qty 필요)" });
  }

  const total_qty = items.reduce((sum, it) => sum + it.qty, 0);
  const total_price = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from("orders")
    .insert({ items, total_qty, total_price })
    .select("id")
    .single();

  if (error) {
    console.log(JSON.stringify({ event: "submit", ok: false, duration_ms: Date.now() - t0 }));
    return res.status(500).json({ error: error.message });
  }

  // 처리 시간을 구조화 로그로 남긴다 - Vercel Logs 탭에서 duration_ms로 응답 시간을 읽을 수 있다.
  console.log(JSON.stringify({ event: "submit", ok: true, duration_ms: Date.now() - t0 }));
  return res.status(200).json({ ok: true, order_id: data.id, total_qty, total_price });
}
