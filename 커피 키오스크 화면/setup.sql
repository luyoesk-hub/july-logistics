-- Supabase SQL Editor에 통째로 붙여넣고 Run 한 번.
-- 무인 키오스크 주문 접수용 표(table). 주문 1건 = 여러 메뉴를 담은 장바구니 1개.
create table if not exists orders (
  id bigint generated always as identity primary key,
  items jsonb not null,        -- 예: [{"name":"블랙커피","price":500,"qty":2}, ...]
  total_qty int not null,      -- 담긴 메뉴의 총 개수
  total_price int not null,    -- 결제해야 할 총 금액(원)
  created_at timestamptz not null default now()
);
alter table orders enable row level security;
-- 익명 키(anon key)로는 "넣기(insert)"만 허용한다. 주문 목록 읽기는 대시보드(Table Editor)에서만.
create policy "anon insert only" on orders
  for insert to anon with check (true);
