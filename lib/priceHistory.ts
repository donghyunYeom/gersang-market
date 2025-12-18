import { Redis } from '@upstash/redis';
import { PriceInfo, PriceListing } from './items';

// 가격 히스토리 데이터 구조
export interface PriceHistoryEntry {
  timestamp: string;       // ISO 형식: 2025-12-10T16:30:00.000Z
  date: string;           // YYYY-MM-DD
  hour: number;           // 0-23
  minuteSlot: number;     // 5분 단위 슬롯 (0, 5, 10, 15, ..., 55)
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

// 일별 집계 데이터 구조
export interface DailyPriceData {
  date: string;           // "2025-12-15"
  minPrice: number;       // 일별 최저가
  maxPrice: number;       // 일별 최고가
  avgPrice: number;       // 일별 평균가
  totalQuantity: number;  // 일별 총 거래량
}

export interface DailyPriceHistory {
  lastUpdated: string;
  items: Record<string, DailyPriceData[]>;  // itemName -> daily data array
}

// KV 키 상수
const HISTORY_KEY = 'price-history';
const DAILY_HISTORY_KEY = 'price-history-daily';
const MAX_ENTRIES = 8640; // 30일 × 24시간 × 12 (5분 단위)
const MAX_DAILY_ENTRIES = 365; // 1년

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
  const minuteSlot = Math.floor(now.getMinutes() / 5) * 5; // 5분 단위 슬롯

  const history = await readPriceHistory();

  // 같은 날짜, 같은 시간, 같은 5분 슬롯에 이미 데이터가 있는지 확인
  const existingIndex = history.entries.findIndex(
    entry => entry.date === date && entry.hour === hour && entry.minuteSlot === minuteSlot
  );

  const entry: PriceHistoryEntry = {
    timestamp,
    date,
    hour,
    minuteSlot,
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

  // 최근 2016개 (7일 × 24시간 × 12슬롯) 데이터만 유지
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
  minuteSlot: number;
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
      minuteSlot: entry.minuteSlot || 0,
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

// ============ 일별 집계 데이터 관련 함수들 ============

// 일별 히스토리 읽기
export async function readDailyPriceHistory(): Promise<DailyPriceHistory> {
  const redisClient = getRedis();
  if (!redisClient) {
    return {
      lastUpdated: new Date().toISOString(),
      items: {},
    };
  }

  try {
    const history = await redisClient.get<DailyPriceHistory>(DAILY_HISTORY_KEY);
    return history || {
      lastUpdated: new Date().toISOString(),
      items: {},
    };
  } catch (error) {
    console.error('일별 히스토리 읽기 오류:', error);
    return {
      lastUpdated: new Date().toISOString(),
      items: {},
    };
  }
}

// 일별 히스토리 저장
async function writeDailyPriceHistory(history: DailyPriceHistory): Promise<boolean> {
  const redisClient = getRedis();
  if (!redisClient) return false;

  try {
    await redisClient.set(DAILY_HISTORY_KEY, history);
    return true;
  } catch (error) {
    console.error('일별 히스토리 저장 오류:', error);
    return false;
  }
}

// 5분 데이터를 일별로 집계
export async function aggregateOldDataToDaily(): Promise<void> {
  const history = await readPriceHistory();
  const dailyHistory = await readDailyPriceHistory();

  if (history.entries.length === 0) return;

  // 30일 전 날짜 계산
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  // 30일 이전 데이터 중 아직 일별 집계 안된 날짜 찾기
  const oldEntries = history.entries.filter(e => e.date < cutoffDateStr);
  if (oldEntries.length === 0) return;

  // 날짜별로 그룹화
  const dateGroups: Record<string, PriceHistoryEntry[]> = {};
  oldEntries.forEach(entry => {
    if (!dateGroups[entry.date]) {
      dateGroups[entry.date] = [];
    }
    dateGroups[entry.date].push(entry);
  });

  // 각 날짜에 대해 일별 집계 수행
  for (const [date, entries] of Object.entries(dateGroups)) {
    // 해당 날짜의 모든 아이템 집계
    const itemStats: Record<string, { prices: number[]; quantities: number[] }> = {};

    entries.forEach(entry => {
      Object.entries(entry.prices).forEach(([itemName, priceData]) => {
        if (!itemStats[itemName]) {
          itemStats[itemName] = { prices: [], quantities: [] };
        }
        itemStats[itemName].prices.push(priceData.minPrice);
        itemStats[itemName].quantities.push(priceData.quantity);
      });
    });

    // 각 아이템의 일별 통계 계산 및 저장
    for (const [itemName, stats] of Object.entries(itemStats)) {
      if (!dailyHistory.items[itemName]) {
        dailyHistory.items[itemName] = [];
      }

      // 이미 해당 날짜 데이터가 있는지 확인
      const existingIndex = dailyHistory.items[itemName].findIndex(d => d.date === date);
      if (existingIndex >= 0) continue; // 이미 집계됨

      const minPrice = Math.min(...stats.prices);
      const maxPrice = Math.max(...stats.prices);
      const avgPrice = Math.round(stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length);
      const totalQuantity = Math.max(...stats.quantities); // 하루 중 최대 수량

      dailyHistory.items[itemName].push({
        date,
        minPrice,
        maxPrice,
        avgPrice,
        totalQuantity,
      });

      // 날짜순 정렬
      dailyHistory.items[itemName].sort((a, b) => a.date.localeCompare(b.date));

      // MAX_DAILY_ENTRIES 유지
      if (dailyHistory.items[itemName].length > MAX_DAILY_ENTRIES) {
        dailyHistory.items[itemName] = dailyHistory.items[itemName].slice(-MAX_DAILY_ENTRIES);
      }
    }
  }

  dailyHistory.lastUpdated = new Date().toISOString();
  await writeDailyPriceHistory(dailyHistory);
}

// 특정 아이템의 일별 가격 히스토리 조회
export async function getItemDailyHistory(itemName: string): Promise<DailyPriceData[]> {
  const dailyHistory = await readDailyPriceHistory();
  return dailyHistory.items[itemName] || [];
}

// 특정 아이템의 통합 히스토리 조회 (5분 상세 + 일별 집계)
export async function getItemHistoryWithDaily(itemName: string): Promise<{
  detailed: {
    timestamp: string;
    date: string;
    hour: number;
    minuteSlot: number;
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    quantity: number;
  }[];
  daily: DailyPriceData[];
}> {
  const [detailed, daily] = await Promise.all([
    getItemPriceHistory(itemName),
    getItemDailyHistory(itemName),
  ]);

  return { detailed, daily };
}
