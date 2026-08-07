// Vercel 서버리스 함수 - 커피 주문 1건을 sales 표에 저장한다.
// 키는 코드에 쓰지 않는다. Vercel 환경변수(SUPABASE_URL, SUPABASE_ANON_KEY)에서 읽는다.
const { createClient } = require("@supabase/supabase-js");

const PRICES = { "아메리카노": 3000, "카페라떼": 4000, "율무차": 3500, "코코아": 4000, "우유": 2500 };

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  const t0 = Date.now();

  if (req.method !== "POST") return res.status(405).json({ error: "POST만 받습니다" });

  const body = typeof req.body === "object" && req.body !== null ? req.body : await parseJsonBody(req);
  const { buyer_name, product, quantity } = body || {};
  if (!buyer_name || !product) {
    return res.status(400).json({ error: "buyer_name, product가 필요합니다" });
  }
  const qty = Number(quantity) > 0 ? Number(quantity) : 1;
  const unit = PRICES[product] || 3000;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    const message = "Supabase 환경변수가 설정되지 않았습니다";
    console.log(JSON.stringify({ route: "submit", error: message, duration_ms: Date.now() - t0 }));
    return res.status(500).json({ error: message });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  try {
    const { error } = await supabase.from("sales").insert({
      buyer_name,
      product,
      quantity: qty,
      price_per_unit: unit,
      total_price: unit * qty,
    });
    if (error) throw error;
    console.log(JSON.stringify({ route: "submit", product, qty, duration_ms: Date.now() - t0 }));
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.log(JSON.stringify({ route: "submit", error: e.message, duration_ms: Date.now() - t0 }));
    return res.status(500).json({ error: "저장에 실패했습니다: " + e.message });
  }
};
