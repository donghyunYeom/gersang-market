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

export default function Home() {
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>();
  const [error, setError] = useState<string>();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'mercenaries' | 'materials'>('mercenaries');
  const [priceHistory, setPriceHistory] = useState<Record<string, PriceHistoryData[]>>({});

  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/prices');
      const data: ApiResponse = await response.json();

      if (data.success) {
        setPrices(data.data);
        setLastUpdated(data.timestamp);
      } else {
        setError('가격 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('가격 조회 오류:', err);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
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

  // 초기 로드
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // 자동 새로고침 (5분)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPrices();
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
                onClick={fetchPrices}
                isLoading={isLoading}
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
            <TotalSummary prices={prices} isLoading={isLoading} />

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
                  isLoading={isLoading}
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
            isLoading={isLoading}
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
