import fs from 'fs';
import path from 'path';
import { PriceInfo } from './items';

// Vercel 서버리스 환경 체크
const isVercel = process.env.VERCEL === '1';

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
  }>;
}

export interface PriceHistoryFile {
  lastUpdated: string;
  entries: PriceHistoryEntry[];
}

// 데이터 저장 경로
const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'price-history.json');

// 데이터 디렉토리 생성
function ensureDataDir(): boolean {
  if (isVercel) return false; // Vercel에서는 파일 저장 불가

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

// 히스토리 파일 읽기
export function readPriceHistory(): PriceHistoryFile {
  if (!ensureDataDir()) {
    return {
      lastUpdated: new Date().toISOString(),
      entries: [],
    };
  }

  if (!fs.existsSync(HISTORY_FILE)) {
    return {
      lastUpdated: new Date().toISOString(),
      entries: [],
    };
  }

  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('히스토리 파일 읽기 오류:', error);
    return {
      lastUpdated: new Date().toISOString(),
      entries: [],
    };
  }
}

// 히스토리 파일 저장
function writePriceHistory(history: PriceHistoryFile): boolean {
  if (!ensureDataDir()) return false;

  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

// 가격 데이터 저장 (중복 체크: 같은 시간대에는 한 번만 저장)
export function savePriceHistory(prices: Record<string, PriceInfo>): PriceHistoryEntry {
  const now = new Date();
  const timestamp = now.toISOString();
  const date = timestamp.split('T')[0];
  const hour = now.getHours();

  const history = readPriceHistory();

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

  // 가격 정보 추출 (필요한 필드만)
  Object.entries(prices).forEach(([itemName, info]) => {
    if (info.minPrice > 0) {
      entry.prices[itemName] = {
        minPrice: info.minPrice,
        maxPrice: info.maxPrice,
        avgPrice: info.avgPrice,
        quantity: info.quantity,
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

  // 최근 7일 데이터만 유지 (168시간)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  history.entries = history.entries.filter(
    e => new Date(e.timestamp) >= sevenDaysAgo
  );

  // 시간순 정렬
  history.entries.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  history.lastUpdated = timestamp;
  writePriceHistory(history);

  return entry;
}

// 특정 아이템의 가격 히스토리 조회
export function getItemPriceHistory(itemName: string): {
  timestamp: string;
  date: string;
  hour: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  quantity: number;
}[] {
  const history = readPriceHistory();

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
export function getPricesByDate(date: string): PriceHistoryEntry[] {
  const history = readPriceHistory();
  return history.entries.filter(entry => entry.date === date);
}

// 최신 저장된 가격 데이터 조회
export function getLatestPrices(): PriceHistoryEntry | null {
  const history = readPriceHistory();
  if (history.entries.length === 0) return null;
  return history.entries[history.entries.length - 1];
}

// 가격 변동 계산 (현재 vs 이전)
export function calculatePriceChange(
  itemName: string,
  currentPrice: number
): { change: number; changePercent: number; previousPrice: number } | null {
  const history = getItemPriceHistory(itemName);

  if (history.length < 2) return null;

  // 가장 최근 이전 데이터
  const previousEntry = history[history.length - 2];
  const previousPrice = previousEntry.minPrice;

  const change = currentPrice - previousPrice;
  const changePercent = previousPrice > 0
    ? Math.round((change / previousPrice) * 10000) / 100
    : 0;

  return { change, changePercent, previousPrice };
}

// 통계 정보 생성
export function getPriceStats(): {
  totalEntries: number;
  dateRange: { from: string; to: string } | null;
  itemCount: number;
  lastUpdated: string;
} {
  const history = readPriceHistory();

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
