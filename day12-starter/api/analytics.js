const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 전체 매출 현황
    const { data: summaryData } = await supabase
      .from('sales')
      .select('total_price');

    const summary = {
      total_sales: summaryData?.length || 0,
      total_revenue: summaryData?.reduce((sum, s) => sum + s.total_price, 0) || 0,
      avg_sale: summaryData?.length > 0
        ? Math.round(summaryData.reduce((sum, s) => sum + s.total_price, 0) / summaryData.length)
        : 0,
      min_sale: summaryData?.length > 0
        ? Math.min(...summaryData.map(s => s.total_price))
        : 0,
      max_sale: summaryData?.length > 0
        ? Math.max(...summaryData.map(s => s.total_price))
        : 0
    };

    // 제품별 판매 통계
    const { data: productData } = await supabase
      .from('sales')
      .select('product, quantity, total_price, buyer_name');

    const productStats = {};
    productData?.forEach(sale => {
      if (!productStats[sale.product]) {
        productStats[sale.product] = {
          product: sale.product,
          sales_count: 0,
          total_quantity: 0,
          total_revenue: 0,
          unique_buyers: new Set()
        };
      }
      productStats[sale.product].sales_count++;
      productStats[sale.product].total_quantity += sale.quantity;
      productStats[sale.product].total_revenue += sale.total_price;
      productStats[sale.product].unique_buyers.add(sale.buyer_name);
    });

    const products = Object.values(productStats)
      .map(p => ({
        ...p,
        unique_buyers: p.unique_buyers.size,
        avg_price: Math.round(p.total_revenue / p.sales_count)
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue);

    // 고객별 구매 현황 (상위 10명)
    const { data: customerData } = await supabase
      .from('sales')
      .select('buyer_name, total_price, quantity');

    const customerStats = {};
    customerData?.forEach(sale => {
      if (!customerStats[sale.buyer_name]) {
        customerStats[sale.buyer_name] = {
          buyer_name: sale.buyer_name,
          purchase_count: 0,
          total_quantity: 0,
          total_spent: 0
        };
      }
      customerStats[sale.buyer_name].purchase_count++;
      customerStats[sale.buyer_name].total_quantity += sale.quantity;
      customerStats[sale.buyer_name].total_spent += sale.total_price;
    });

    const customers = Object.values(customerStats)
      .map(c => ({
        ...c,
        avg_spent: Math.round(c.total_spent / c.purchase_count)
      }))
      .sort((a, b) => b.purchase_count - a.purchase_count || b.total_spent - a.total_spent)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      summary,
      products,
      customers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
