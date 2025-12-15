'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { PriceInfo, getAllUniqueItems, formatPrice, formatNumber } from '@/lib/items';

interface MaterialsTabProps {
  prices: Record<string, PriceInfo>;
  isLoading: boolean;
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

type PeriodType = '24h' | '7d' | '30d';

export default function MaterialsTab({ prices, isLoading }: MaterialsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [materialHistory, setMaterialHistory] = useState<Record<string, PriceHistoryData[]>>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('7d');

  // 모든 재료 아이템 가져오기
  const allMaterials = useMemo(() => getAllUniqueItems(), []);

  // 검색 필터링
  const filteredMaterials = useMemo(() => {
    if (!searchQuery) return allMaterials;
    return allMaterials.filter(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMaterials, searchQuery]);

  // 아이템 히스토리 조회
  const fetchItemHistory = useCallback(async (itemName: string) => {
    if (materialHistory[itemName]) return; // 이미 로드된 경우 스킵

    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/history?itemName=${encodeURIComponent(itemName)}`);
      const data = await response.json();
      if (data.success && data.data) {
        setMaterialHistory(prev => ({
          ...prev,
          [itemName]: data.data,
        }));
      }
    } catch (err) {
      console.error('히스토리 조회 오류:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [materialHistory]);

  // 재료 펼침 시 히스토리 조회
  useEffect(() => {
    if (expandedMaterial) {
      fetchItemHistory(expandedMaterial);
    }
  }, [expandedMaterial, fetchItemHistory]);

  // 기간별 히스토리 필터링
  const getFilteredHistory = useCallback((history: PriceHistoryData[], period: PeriodType) => {
    const now = new Date();
    let cutoffTime: Date;

    switch (period) {
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return history.filter(h => new Date(h.timestamp) >= cutoffTime);
  }, []);

  // 역대 최고가/최저가 계산 (전체 히스토리 기준)
  const getHistoricalStats = useCallback((itemName: string) => {
    const history = materialHistory[itemName] || [];
    const validHistory = history.filter(h => h.minPrice > 0);

    if (validHistory.length === 0) {
      return {
        historicalHigh: 0,
        historicalHighQty: 0,
        historicalLow: 0,
        historicalLowQty: 0,
      };
    }

    let highEntry = validHistory[0];
    let lowEntry = validHistory[0];

    validHistory.forEach(entry => {
      if (entry.minPrice > highEntry.minPrice) {
        highEntry = entry;
      }
      if (entry.minPrice < lowEntry.minPrice) {
        lowEntry = entry;
      }
    });

    return {
      historicalHigh: highEntry.minPrice,
      historicalHighQty: highEntry.quantity,
      historicalLow: lowEntry.minPrice,
      historicalLowQty: lowEntry.quantity,
    };
  }, [materialHistory]);

  // 토글 핸들러
  const toggleMaterial = (materialName: string) => {
    if (expandedMaterial === materialName) {
      setExpandedMaterial(null);
    } else {
      setExpandedMaterial(materialName);
      setSelectedPeriod('7d'); // 기본 기간 리셋
    }
  };

  return (
    <div className="space-y-6">
      {/* 검색 영역 */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
        <div className="relative">
          <input
            type="text"
            placeholder="재료명을 검색하세요..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setExpandedMaterial(null);
            }}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 pl-10 text-white placeholder-[#737373] focus:outline-none focus:border-[#f59e0b] transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737373]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* 검색 결과 수 */}
        {searchQuery && (
          <p className="mt-2 text-sm text-[#737373]">
            {filteredMaterials.length}개의 재료를 찾았습니다
          </p>
        )}
      </div>

      {/* 재료 목록 */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          재료 목록 ({filteredMaterials.length})
        </h2>
        <div className="grid gap-3">
          {filteredMaterials.map(materialName => {
            const priceInfo = prices[materialName];
            const hasPrice = priceInfo && priceInfo.minPrice > 0;
            const isExpanded = expandedMaterial === materialName;
            const history = materialHistory[materialName] || [];
            const stats = history.length > 0 ? getHistoricalStats(materialName) : null;
            const filteredHistory = isExpanded && history.length > 0
              ? getFilteredHistory(history, selectedPeriod)
              : [];

            return (
              <div
                key={materialName}
                className={`bg-[#1a1a1a] rounded-xl border overflow-hidden transition-all ${
                  isExpanded ? 'border-[#f59e0b]' : 'border-[#333]'
                }`}
              >
                {/* 헤더 - 클릭 가능 */}
                <button
                  onClick={() => toggleMaterial(materialName)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-[#252525] transition-colors text-left"
                >
                  {/* 재료명 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white">{materialName}</h3>
                    {stats && stats.historicalHigh > 0 && (
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-[#737373]">
                          최고 <span className="text-[#ef4444]">{formatPrice(stats.historicalHigh)}</span>
                          <span className="text-[#525252]"> ({formatNumber(stats.historicalHighQty)}개)</span>
                        </span>
                        <span className="text-xs text-[#737373]">
                          최저 <span className="text-[#22c55e]">{formatPrice(stats.historicalLow)}</span>
                          <span className="text-[#525252]"> ({formatNumber(stats.historicalLowQty)}개)</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 현재 가격 */}
                  <div className="text-right flex-shrink-0">
                    {isLoading ? (
                      <div className="h-6 bg-[#333] rounded w-24 animate-pulse"></div>
                    ) : hasPrice ? (
                      <>
                        <div className="text-lg font-bold text-[#f59e0b] tabular-nums">
                          {formatPrice(priceInfo.minPrice)}
                        </div>
                        <div className="text-xs text-[#737373]">
                          {formatNumber(priceInfo.quantity)}개 판매중
                        </div>
                      </>
                    ) : (
                      <span className="text-[#737373]">매물 없음</span>
                    )}
                  </div>

                  {/* 토글 아이콘 */}
                  <svg
                    className={`w-5 h-5 text-[#737373] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 펼쳐진 상세 정보 */}
                {isExpanded && (
                  <div className="border-t border-[#333] p-4 animate-fadeIn">
                    {/* 역대 최고/최저가 */}
                    {history.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-[#0a0a0a] rounded-lg p-3">
                          <div className="text-xs text-[#737373] mb-1">역대 최고가</div>
                          <div className="text-lg font-bold text-[#ef4444]">
                            {formatPrice(stats?.historicalHigh || 0)}
                          </div>
                          <div className="text-xs text-[#737373]">
                            ({formatNumber(stats?.historicalHighQty || 0)}개 거래)
                          </div>
                        </div>
                        <div className="bg-[#0a0a0a] rounded-lg p-3">
                          <div className="text-xs text-[#737373] mb-1">역대 최저가</div>
                          <div className="text-lg font-bold text-[#22c55e]">
                            {formatPrice(stats?.historicalLow || 0)}
                          </div>
                          <div className="text-xs text-[#737373]">
                            ({formatNumber(stats?.historicalLowQty || 0)}개 거래)
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 기간 선택 */}
                    <div className="flex gap-2 mb-3">
                      {(['24h', '7d', '30d'] as PeriodType[]).map(period => (
                        <button
                          key={period}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPeriod(period);
                          }}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            selectedPeriod === period
                              ? 'bg-[#f59e0b] text-black font-medium'
                              : 'bg-[#252525] text-[#737373] hover:text-white'
                          }`}
                        >
                          {period === '24h' ? '24시간' : period === '7d' ? '7일' : '30일'}
                        </button>
                      ))}
                    </div>

                    {/* 가격 추이 차트 */}
                    <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-[#737373] mb-3">
                        가격 추이 ({selectedPeriod === '24h' ? '24시간' : selectedPeriod === '7d' ? '7일' : '30일'})
                      </h4>
                      {isLoadingHistory ? (
                        <div className="h-32 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-[#737373]">
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>로딩 중...</span>
                          </div>
                        </div>
                      ) : filteredHistory.length > 0 ? (
                        <div className="h-32 flex items-end gap-0.5">
                          {filteredHistory.map((item, index) => {
                            const maxPrice = Math.max(...filteredHistory.map(h => h.minPrice));
                            const minPrice = Math.min(...filteredHistory.map(h => h.minPrice));
                            const range = maxPrice - minPrice || 1;
                            const height = ((item.minPrice - minPrice) / range) * 80 + 20;
                            return (
                              <div
                                key={index}
                                className="flex-1 bg-[#f59e0b] rounded-t opacity-70 hover:opacity-100 transition-opacity cursor-pointer relative group"
                                style={{ height: `${height}%`, minHeight: '4px', maxWidth: '12px' }}
                              >
                                {/* 툴팁 */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                                  <div className="bg-[#333] rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                                    <div className="text-[#a3a3a3]">{item.date} {item.hour}:{String(item.minuteSlot || 0).padStart(2, '0')}</div>
                                    <div className="text-[#f59e0b] font-medium">{formatPrice(item.minPrice)}</div>
                                    <div className="text-[#737373]">{formatNumber(item.quantity)}개</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[#737373] text-sm text-center py-6">
                          해당 기간의 가격 데이터가 없습니다
                        </p>
                      )}

                      {/* 가격 범위 표시 */}
                      {filteredHistory.length > 0 && (
                        <div className="flex justify-between mt-2 text-xs text-[#737373]">
                          <span>최저 {formatPrice(Math.min(...filteredHistory.map(h => h.minPrice)))}</span>
                          <span>최고 {formatPrice(Math.max(...filteredHistory.map(h => h.minPrice)))}</span>
                        </div>
                      )}
                    </div>

                    {/* 현재 매물 목록 */}
                    {hasPrice && priceInfo.listings && priceInfo.listings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-[#737373] mb-3">현재 매물</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {priceInfo.listings.slice(0, 15).map((listing, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-[#0a0a0a] rounded-lg px-3 py-2"
                            >
                              <span className="text-sm text-[#a3a3a3]">{listing.sellerName}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-[#737373]">{formatNumber(listing.quantity)}개</span>
                                <span className="text-sm font-medium text-[#22c55e]">{formatPrice(listing.price)}</span>
                              </div>
                            </div>
                          ))}
                          {priceInfo.listings.length > 15 && (
                            <p className="text-xs text-[#737373] text-center py-1">
                              +{priceInfo.listings.length - 15}개 더 있음
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
