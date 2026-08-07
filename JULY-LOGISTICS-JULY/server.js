import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'shipments.json');

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3000', 'https://dudu-reception.vercel.app'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: process.env.NODE_ENV || 'production' });
});

// 데이터 파일 초기화
const ensureDataFile = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({ shipments: [], lastId: 0 }, null, 2));
    console.log('✅ 데이터 파일 생성됨:', DATA_FILE);
  }
};

// 데이터 읽기
const readData = async () => {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('❌ 데이터 읽기 실패:', err.message);
    return { shipments: [], lastId: 0 };
  }
};

// 데이터 쓰기
const writeData = async (data) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ 데이터 쓰기 실패:', err.message);
    throw err;
  }
};

// ===== API: 접수 생성 =====
app.post('/api/shipments', async (req, res) => {
  try {
    const shipment = req.body;
    const data = await readData();

    const newShipment = {
      id: ++data.lastId,
      ...shipment,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    data.shipments.push(newShipment);
    await writeData(data);

    console.log(`✅ 접수 생성: #${newShipment.id} (${shipment.senderName} → ${shipment.receiverName})`);
    res.status(201).json(newShipment);
  } catch (err) {
    console.error('❌ POST /api/shipments:', err.message);
    res.status(500).json({ error: '접수 생성 실패', message: err.message });
  }
});

// ===== API: 접수 목록 조회 =====
app.get('/api/shipments', async (req, res) => {
  try {
    const data = await readData();
    const { limit = 100, offset = 0, search = '' } = req.query;

    let filtered = data.shipments;
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.trackingNumber?.includes(search) ||
        s.senderName?.toLowerCase().includes(term) ||
        s.receiverName?.toLowerCase().includes(term)
      );
    }

    const total = filtered.length;
    const items = filtered
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      items,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('❌ GET /api/shipments:', err.message);
    res.status(500).json({ error: '목록 조회 실패', message: err.message });
  }
});

// ===== API: 접수 상세 조회 =====
app.get('/api/shipments/:id', async (req, res) => {
  try {
    const data = await readData();
    const shipment = data.shipments.find(s => s.id === parseInt(req.params.id));

    if (!shipment) {
      return res.status(404).json({ error: '접수 없음' });
    }

    res.json(shipment);
  } catch (err) {
    console.error('❌ GET /api/shipments/:id:', err.message);
    res.status(500).json({ error: '조회 실패', message: err.message });
  }
});

// ===== API: 접수 수정 =====
app.patch('/api/shipments/:id', async (req, res) => {
  try {
    const data = await readData();
    const idx = data.shipments.findIndex(s => s.id === parseInt(req.params.id));

    if (idx === -1) {
      return res.status(404).json({ error: '접수 없음' });
    }

    data.shipments[idx] = { ...data.shipments[idx], ...req.body, updatedAt: new Date().toISOString() };
    await writeData(data);

    console.log(`✅ 접수 수정: #${req.params.id}`);
    res.json(data.shipments[idx]);
  } catch (err) {
    console.error('❌ PATCH /api/shipments/:id:', err.message);
    res.status(500).json({ error: '수정 실패', message: err.message });
  }
});

// ===== API: 접수 삭제 =====
app.delete('/api/shipments/:id', async (req, res) => {
  try {
    const data = await readData();
    const idx = data.shipments.findIndex(s => s.id === parseInt(req.params.id));

    if (idx === -1) {
      return res.status(404).json({ error: '접수 없음' });
    }

    const removed = data.shipments.splice(idx, 1)[0];
    await writeData(data);

    console.log(`✅ 접수 삭제: #${req.params.id}`);
    res.json({ message: '삭제 완료', id: removed.id });
  } catch (err) {
    console.error('❌ DELETE /api/shipments/:id:', err.message);
    res.status(500).json({ error: '삭제 실패', message: err.message });
  }
});

// ===== API: 통계 =====
app.get('/api/statistics', async (req, res) => {
  try {
    const data = await readData();
    const shipments = data.shipments;

    const stats = {
      totalShipments: shipments.length,
      totalAmount: shipments.reduce((sum, s) => sum + (s.totalPrice || 0), 0),
      byBranch: {},
      byRegion: {},
      byGrade: {},
      byShippingOption: {}
    };

    shipments.forEach(s => {
      stats.byBranch[s.branch] = (stats.byBranch[s.branch] || 0) + 1;
      stats.byRegion[s.region] = (stats.byRegion[s.region] || 0) + 1;
      stats.byGrade[s.size] = (stats.byGrade[s.size] || 0) + 1;
      stats.byShippingOption[s.shippingOption || 'Standard'] = (stats.byShippingOption[s.shippingOption || 'Standard'] || 0) + 1;
    });

    res.json(stats);
  } catch (err) {
    console.error('❌ GET /api/statistics:', err.message);
    res.status(500).json({ error: '통계 조회 실패', message: err.message });
  }
});

// ===== API: 데이터 초기화 (테스트용) =====
app.post('/api/reset', async (req, res) => {
  try {
    await writeData({ shipments: [], lastId: 0 });
    console.log('🔄 데이터 초기화됨');
    res.json({ message: '데이터 초기화 완료' });
  } catch (err) {
    res.status(500).json({ error: '초기화 실패', message: err.message });
  }
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('❌ 에러:', err);
  res.status(500).json({ error: '서버 에러', message: err.message });
});

// 서버 시작
const startServer = async () => {
  await ensureDataFile();
  app.listen(PORT, () => {
    console.log(`\n🚀 Express 서버 시작`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`💾 데이터 위치: ${DATA_FILE}`);
    console.log(`🔗 CORS 허용: http://localhost:8000, http://localhost:3000, https://dudu-reception.vercel.app`);
    console.log(`\n✅ 준비됨\n`);
  });
};

startServer().catch(err => {
  console.error('❌ 서버 시작 실패:', err);
  process.exit(1);
});
