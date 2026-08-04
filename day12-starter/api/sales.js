const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      success: false,
      error: 'Missing Supabase environment variables. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in Vercel settings.'
    });
  }

  try {
    // GET: 판매 데이터 조회
    if (req.method === 'GET') {
      const { limit = 100, offset = 0 } = req.query;

      const { data, error, count } = await supabase
        .from('sales')
        .select('*', { count: 'exact' })
        .order('purchased_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        data,
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    }

    // POST: 판매 데이터 입력
    if (req.method === 'POST') {
      const { buyer_name, product, quantity, price_per_unit } = req.body;

      if (!buyer_name || !product || !quantity || !price_per_unit) {
        return res.status(400).json({
          success: false,
          error: '필수 필드 누락: buyer_name, product, quantity, price_per_unit'
        });
      }

      const total_price = quantity * price_per_unit;

      const { data, error } = await supabase
        .from('sales')
        .insert([{
          buyer_name,
          product,
          quantity: parseInt(quantity),
          price_per_unit: parseInt(price_per_unit),
          total_price
        }])
        .select();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(201).json({
        success: true,
        message: '판매 데이터가 저장되었습니다',
        data: data[0]
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
