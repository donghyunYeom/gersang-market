'use client';

import { useState, useEffect, useCallback } from 'react';
import { MERCENARIES, PriceInfo } from '@/lib/items';
import MercenaryCard from '@/components/MercenaryCard';
import RefreshButton from '@/components/RefreshButton';
import TotalSummary from '@/components/TotalSummary';
import TabNavigation from '@/components/TabNavigation';
import MaterialsTab from '@/components/MaterialsTab';

interface ApiResponse {
  success: boolean;
  data: Record<string, PriceInfo>;
  timestamp: string;
  serverName: string;
}

interface PriceHistoryData {
  timestamp: string;
  date: string;
  hour: number;
  minuteSlot: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  quantity: number;
}

// 캐시 관련 상수 및 유틸리티
const CACHE_KEY = 'gersang-prices-cache';

interface CachedData {
  prices: Record<string, PriceInfo>;
  timestamp: string;
}

function loadCachedPrices(): CachedData | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('캐시 로드 오류:', err);
  }
  return null;
}

function savePricesToCache(prices: Record<string, PriceInfo>, timestamp: string): void {
  if (typeof window === 'undefined') return;
  try {
    const data: CachedData = { prices, timestamp };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('캐시 저장 오류:', err);
  }
}

export default function Home() {
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({});
  const [isLoading, setIsLoading] = useState(false); // 캐시 로드 후 결정
  const [isRefreshing, setIsRefreshing] = useState(false); // 백그라운드 새로고침 중
  const [isInitializing, setIsInitializing] = useState(true); // 초기화 중
  const [lastUpdated, setLastUpdated] = useState<string>();
  const [error, setError] = useState<string>();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'mercenaries' | 'materials'>('mercenaries');
  const [priceHistory, setPriceHistory] = useState<Record<string, PriceHistoryData[]>>({});

  const fetchPrices = useCallback(async (isBackgroundRefresh = false) => {
    if (isBackgroundRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(undefined);

    try {
      const response = await fetch('/api/prices');
      const data: ApiResponse = await response.json();

      if (data.success) {
        setPrices(data.data);
        setLastUpdated(data.timestamp);
        // 캐시에 저장
        savePricesToCache(data.data, data.timestamp);
      } else {
        setError('가격 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('가격 조회 오류:', err);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 가격 히스토리 조회
  const fetchPriceHistory = useCallback(async (itemName: string) => {
    try {
      const response = await fetch(`/api/history?itemName=${encodeURIComponent(itemName)}`);
      const data = await response.json();
      if (data.success && data.data) {
        setPriceHistory(prev => ({
          ...prev,
          [itemName]: data.data,
        }));
      }
    } catch (err) {
      console.error('히스토리 조회 오류:', err);
    }
  }, []);

  // 초기 로드: 서버 캐시 먼저 표시 후 실시간 데이터로 업데이트
  useEffect(() => {
    const initializeData = async () => {
      // 1단계: 서버에 저장된 최신 데이터를 빠르게 불러오기
      try {
        const cachedResponse = await fetch('/api/prices/cached');
        const cachedData: ApiResponse = await cachedResponse.json();

        if (cachedData.success && Object.keys(cachedData.data).length > 0) {
          // 서버 캐시 데이터가 있으면 먼저 표시
          setPrices(cachedData.data);
          setLastUpdated(cachedData.timestamp);
          setIsInitializing(false);

          // 2단계: 백그라운드에서 실시간 데이터 조회
          setIsRefreshing(true);
          try {
            const response = await fetch('/api/prices');
            const data: ApiResponse = await response.json();
            if (data.success) {
              setPrices(data.data);
              setLastUpdated(data.timestamp);
              savePricesToCache(data.data, data.timestamp);
            }
          } catch (err) {
            console.error('실시간 조회 오류:', err);
          } finally {
            setIsRefreshing(false);
          }
        } else {
          // 서버 캐시가 없으면 실시간 조회
          setIsLoading(true);
          setIsInitializing(false);
          const response = await fetch('/api/prices');
          const data: ApiResponse = await response.json();
          if (data.success) {
            setPrices(data.data);
            setLastUpdated(data.timestamp);
            savePricesToCache(data.data, data.timestamp);
          } else {
            setError('가격 정보를 불러오는데 실패했습니다.');
          }
          setIsLoading(false);
        }
      } catch (err) {
        // 서버 캐시 조회 실패 시 실시간 조회
        console.error('캐시 조회 오류:', err);
        setIsLoading(true);
        setIsInitializing(false);
        try {
          const response = await fetch('/api/prices');
          const data: ApiResponse = await response.json();
          if (data.success) {
            setPrices(data.data);
            setLastUpdated(data.timestamp);
            savePricesToCache(data.data, data.timestamp);
          } else {
            setError('가격 정보를 불러오는데 실패했습니다.');
          }
        } catch (fetchErr) {
          console.error('가격 조회 오류:', fetchErr);
          setError('서버 연결에 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeData();
  }, []);

  // 자동 새로고침 (5분) - 백그라운드로 실행
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPrices(true);
    }, 300000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchPrices]);

  const toggleExpanded = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(MERCENARIES.map(m => m.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <main className="min-h-screen pb-12">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#252525]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* 로고 & 제목 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-xl">
                ⚔️
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  거상 전설장수 시세
                </h1>
                <p className="text-xs text-[#737373]">
                  봉황서버 · 육의전 실시간
                </p>
              </div>
            </div>

            {/* 컨트롤 */}
            <div className="flex items-center gap-4">
              {/* 자동 새로고침 토글 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={e => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded border-[#333] bg-[#1a1a1a] text-[#f59e0b] focus:ring-[#f59e0b] focus:ring-offset-0"
                />
                <span className="text-sm text-[#737373]">자동 새로고침</span>
              </label>

              <RefreshButton
                onClick={() => fetchPrices(false)}
                isLoading={isLoading || isInitializing}
                isRefreshing={isRefreshing}
                lastUpdated={lastUpdated}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 콘텐츠 */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 탭 네비게이션 */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-4 text-[#ef4444]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 전설장수 탭 */}
        {activeTab === 'mercenaries' && (
          <>
            {/* 총 비용 요약 */}
            <TotalSummary prices={prices} isLoading={isLoading || isInitializing} />

            {/* 전체 펼치기/접기 */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                전설장수 목록 ({MERCENARIES.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="text-sm text-[#737373] hover:text-white transition-colors px-3 py-1 rounded hover:bg-[#252525]"
                >
                  전체 펼치기
                </button>
                <button
                  onClick={collapseAll}
                  className="text-sm text-[#737373] hover:text-white transition-colors px-3 py-1 rounded hover:bg-[#252525]"
                >
                  전체 접기
                </button>
              </div>
            </div>

            {/* 용병 카드 목록 */}
            <div className="space-y-3">
              {MERCENARIES.map(mercenary => (
                <MercenaryCard
                  key={mercenary.id}
                  mercenary={mercenary}
                  prices={prices}
                  isLoading={isLoading || isInitializing}
                  isExpanded={expandedIds.has(mercenary.id)}
                  onToggle={() => toggleExpanded(mercenary.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* 재료 시세 탭 */}
        {activeTab === 'materials' && (
          <MaterialsTab
            prices={prices}
            isLoading={isLoading || isInitializing}
            priceHistory={[]}
          />
        )}

        {/* 푸터 */}
        <footer className="text-center py-8 text-[#737373] text-sm">
          <p>
            데이터 출처:{' '}
            <a
              href="https://geota.co.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f59e0b] hover:underline"
            >
              geota.co.kr
            </a>
            {' · '}
            <a
              href="https://www.gersanginfo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f59e0b] hover:underline"
            >
              gersanginfo.com
            </a>
          </p>
          <p className="mt-1">가격 정보는 실시간으로 변동될 수 있습니다.</p>
        </footer>
      </div>
    </main>
  );
}
