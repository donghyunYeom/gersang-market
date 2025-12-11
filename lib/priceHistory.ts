import { Redis } from '@upstash/redis';
import { PriceInfo, PriceListing } from './items';

// 가격 히스토리 데이터 구조
export interface PriceHistoryEntry {
  timestamp: string;       // ISO 형식: 2025-12-10T16:30:00.000Z
  date: string;           // YYYY-MM-DD
  hour: number;           // 0-23
  prices: Record<string, {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    quantity: number;
    listings?: PriceListing[];  // 개별 매물 정보 (거래 추적용)
  }>;
}

export interface PriceHistoryFile {
  lastUpdated: string;
  entries: PriceHistoryEntry[];
}

// KV 키 상수
const HISTORY_KEY = 'price-history';
const MAX_ENTRIES = 168; // 7일 × 24시간

// Redis 클라이언트 초기화 (lazy initialization)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_KV_REST_API_URL || !process.env.UPSTASH_REDIS_KV_REST_API_TOKEN) {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN,
    });
  }

  return redis;
}

// Redis 사용 가능 여부 확인
function isKVAvailable(): boolean {
  return !!(process.env.UPSTASH_REDIS_KV_REST_API_URL && process.env.UPSTASH_REDIS_KV_REST_API_TOKEN);
}

// 히스토리 읽기
export async function readPriceHistory(): Promise<PriceHistoryFile> {
  const redisClient = getRedis();
  if (!redisClient) {
    return {
      lastUpdated: new Date().toISOString(),
      entries: [],
    };
  }

  try {
    const history = await redisClient.get<PriceHistoryFile>(HISTORY_KEY);
    return history || {
      lastUpdated: new Date().toISOString(),
      entries: [],
    };
  } catch (error) {
    console.error('Redis 읽기 오류:', error);
    return {
      lastUpdated: new Date().toISOString(),
      entries: [],
    };
  }
}

// 히스토리 저장
async function writePriceHistory(history: PriceHistoryFile): Promise<boolean> {
  const redisClient = getRedis();
  if (!redisClient) return false;

  try {
    await redisClient.set(HISTORY_KEY, history);
    return true;
  } catch (error) {
    console.error('Redis 저장 오류:', error);
    return false;
  }
}

// 가격 데이터 저장 (중복 체크: 같은 시간대에는 한 번만 저장)
export async function savePriceHistory(prices: Record<string, PriceInfo>): Promise<PriceHistoryEntry | null> {
  if (!isKVAvailable()) {
    console.log('KV not available, skipping save');
    return null;
  }

  const now = new Date();
  const timestamp = now.toISOString();
  const date = timestamp.split('T')[0];
  const hour = now.getHours();

  const history = await readPriceHistory();

  // 같은 날짜, 같은 시간대에 이미 데이터가 있는지 확인
  const existingIndex = history.entries.findIndex(
    entry => entry.date === date && entry.hour === hour
  );

  const entry: PriceHistoryEntry = {
    timestamp,
    date,
    hour,
    prices: {},
  };

  // 가격 정보 추출 (필요한 필드만 + listings)
  Object.entries(prices).forEach(([itemName, info]) => {
    if (info.minPrice > 0) {
      entry.prices[itemName] = {
        minPrice: info.minPrice,
        maxPrice: info.maxPrice,
        avgPrice: info.avgPrice,
        quantity: info.quantity,
        listings: info.listings || [],  // 개별 매물 정보 포함
      };
    }
  });

  if (existingIndex >= 0) {
    // 기존 데이터 업데이트
    history.entries[existingIndex] = entry;
  } else {
    // 새 데이터 추가
    history.entries.push(entry);
  }

  // 최근 168개 (7일) 데이터만 유지
  if (history.entries.length > MAX_ENTRIES) {
    history.entries = history.entries.slice(-MAX_ENTRIES);
  }

  // 시간순 정렬
  history.entries.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  history.lastUpdated = timestamp;
  const saved = await writePriceHistory(history);

  return saved ? entry : null;
}

// 특정 아이템의 가격 히스토리 조회
export async function getItemPriceHistory(itemName: string): Promise<{
  timestamp: string;
  date: string;
  hour: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  quantity: number;
}[]> {
  const history = await readPriceHistory();

  return history.entries
    .filter(entry => entry.prices[itemName])
    .map(entry => ({
      timestamp: entry.timestamp,
      date: entry.date,
      hour: entry.hour,
      ...entry.prices[itemName],
    }));
}

// 특정 날짜의 전체 가격 데이터 조회
export async function getPricesByDate(date: string): Promise<PriceHistoryEntry[]> {
  const history = await readPriceHistory();
  return history.entries.filter(entry => entry.date === date);
}

// 최신 저장된 가격 데이터 조회
export async function getLatestPrices(): Promise<PriceHistoryEntry | null> {
  const history = await readPriceHistory();
  if (history.entries.length === 0) return null;
  return history.entries[history.entries.length - 1];
}

// 통계 정보 생성
export async function getPriceStats(): Promise<{
  totalEntries: number;
  dateRange: { from: string; to: string } | null;
  itemCount: number;
  lastUpdated: string;
}> {
  const history = await readPriceHistory();

  if (history.entries.length === 0) {
    return {
      totalEntries: 0,
      dateRange: null,
      itemCount: 0,
      lastUpdated: history.lastUpdated,
    };
  }

  const allItems = new Set<string>();
  history.entries.forEach(entry => {
    Object.keys(entry.prices).forEach(item => allItems.add(item));
  });

  return {
    totalEntries: history.entries.length,
    dateRange: {
      from: history.entries[0].date,
      to: history.entries[history.entries.length - 1].date,
    },
    itemCount: allItems.size,
    lastUpdated: history.lastUpdated,
  };
}
