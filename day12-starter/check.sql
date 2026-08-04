-- 무인 커피 자판기 매출 시스템 - 데이터 검증 및 분석 쿼리
-- start.sql 실행 후 이 쿼리들을 실행하여 데이터를 확인합니다

-- [1] 전체 매출 현황
select
  count(*) as total_sales,
  sum(total_price) as total_revenue,
  avg(total_price) as avg_sale,
  min(total_price) as min_sale,
  max(total_price) as max_sale
from sales;

-- [2] 제품별 판매 통계
select
  product,
  count(*) as sales_count,
  sum(quantity) as total_quantity,
  sum(total_price) as total_revenue,
  avg(total_price) as avg_price,
  count(distinct buyer_name) as unique_buyers
from sales
group by product
order by total_revenue desc;

-- [3] 고객별 구매 현황 (구매 횟수 상위)
select
  buyer_name,
  count(*) as purchase_count,
  sum(quantity) as total_quantity,
  sum(total_price) as total_spent,
  avg(total_price) as avg_spent_per_purchase
from sales
group by buyer_name
having count(*) >= 1
order by purchase_count desc, total_spent desc;

-- [4] 재구매 고객 (2회 이상 구매)
select
  buyer_name,
  count(*) as purchase_count,
  sum(total_price) as total_spent,
  string_agg(distinct product, ', ' order by product) as products_bought
from sales
group by buyer_name
having count(*) >= 2
order by purchase_count desc;

-- [5] 최근 7일 매출
select
  date(purchased_at) as sale_date,
  count(*) as sales_count,
  sum(total_price) as daily_revenue
from sales
where purchased_at >= now() - interval '7 days'
group by date(purchased_at)
order by sale_date desc;

-- [6] 최근 30일 시간대별 판매 (가장 인기 있는 시간)
select
  extract(hour from purchased_at)::int as hour_of_day,
  count(*) as sales_count,
  sum(total_price) as hourly_revenue
from sales
where purchased_at >= now() - interval '30 days'
group by extract(hour from purchased_at)
order by hourly_revenue desc;

-- [7] 가격대별 판매 현황
select
  case
    when price_per_unit < 4000 then '3,500원 (아메리카노)'
    when price_per_unit < 4500 then '4,000원 (아이스 음료)'
    when price_per_unit = 4500 then '4,500원 (라떼/카푸치노)'
    else '5,000원 (프리미엄)'
  end as price_tier,
  count(*) as sales_count,
  sum(total_price) as total_revenue
from sales
group by price_tier
order by total_revenue desc;

-- [8] 고객 세분화 분석
select
  case
    when cnt >= 3 then 'VIP (3회 이상)'
    when cnt = 2 then '단골 (2회)'
    else '신규 (1회)'
  end as customer_segment,
  count(*) as customer_count,
  sum(spent) as segment_revenue,
  round(avg(spent)::numeric, 0) as avg_spent_per_person
from (
  select
    buyer_name,
    count(*) as cnt,
    sum(total_price) as spent
  from sales
  group by buyer_name
) sub
group by customer_segment
order by segment_revenue desc;

-- [9] 테이블 데이터 행 개수 확인
select
  'sales' as table_name,
  count(*) as row_count
from sales;

-- [10] 최근 10건 거래 조회
select
  id,
  buyer_name,
  product,
  quantity,
  price_per_unit,
  total_price,
  purchased_at
from sales
order by purchased_at desc
limit 10;
