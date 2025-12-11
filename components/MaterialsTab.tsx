'use client';

import { useState, useMemo } from 'react';
import { PriceInfo, getAllUniqueItems, formatPrice, formatNumber } from '@/lib/items';

interface MaterialsTabProps {
  prices: Record<string, PriceInfo>;
  isLoading: boolean;
  priceHistory: PriceHistoryData[];
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

export default function MaterialsTab({ prices, isLoading, priceHistory }: MaterialsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  // 모든 재료 아이템 가져오기
  const allMaterials = useMemo(() => getAllUniqueItems(), []);

  // 검색 필터링
  const filteredMaterials = useMemo(() => {
    if (!searchQuery) return allMaterials;
    return allMaterials.filter(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMaterials, searchQuery]);

  // 역대 최고가/최저가 계산
  const getHistoricalPrices = (itemName: string) => {
    const itemHistory = priceHistory.filter(h => h.minPrice > 0);
    if (itemHistory.length === 0) {
      return { historicalHigh: 0, historicalLow: 0 };
    }

    const prices = itemHistory.map(h => h.minPrice);
    return {
      historicalHigh: Math.max(...prices),
      historicalLow: Math.min(...prices),
    };
  };

  // 선택된 재료의 가격 추이
  const selectedMaterialHistory = useMemo(() => {
    if (!selectedMaterial) return [];
    return priceHistory;
  }, [selectedMaterial, priceHistory]);

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
              setSelectedMaterial(null);
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

      {/* 선택된 재료 상세 정보 */}
      {selectedMaterial && (
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#f59e0b]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{selectedMaterial}</h3>
            <button
              onClick={() => setSelectedMaterial(null)}
              className="text-[#737373] hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 가격 추이 차트 영역 */}
          <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-[#737373] mb-3">가격 추이 (7일)</h4>
            {selectedMaterialHistory.length > 0 ? (
              <div className="h-48 flex items-end gap-1">
                {selectedMaterialHistory.slice(-48).map((item, index) => {
                  const maxPrice = Math.max(...selectedMaterialHistory.slice(-48).map(h => h.minPrice));
                  const height = maxPrice > 0 ? (item.minPrice / maxPrice) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-[#f59e0b] rounded-t opacity-70 hover:opacity-100 transition-opacity"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${item.date} ${item.hour}:${String(item.minuteSlot).padStart(2, '0')} - ${formatPrice(item.minPrice)}`}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-[#737373] text-sm text-center py-8">
                가격 히스토리 데이터가 없습니다
              </p>
            )}
          </div>

          {/* 현재 매물 목록 */}
          {prices[selectedMaterial]?.listings && prices[selectedMaterial].listings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#737373] mb-3">현재 매물</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {prices[selectedMaterial].listings.slice(0, 20).map((listing, index) => (
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
              </div>
            </div>
          )}
        </div>
      )}

      {/* 재료 목록 */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          재료 목록 ({filteredMaterials.length})
        </h2>
        <div className="grid gap-3">
          {filteredMaterials.map(materialName => {
            const priceInfo = prices[materialName];
            const { historicalHigh, historicalLow } = getHistoricalPrices(materialName);
            const hasPrice = priceInfo && priceInfo.minPrice > 0;

            return (
              <div
                key={materialName}
                onClick={() => setSelectedMaterial(materialName)}
                className={`bg-[#1a1a1a] rounded-xl p-4 border cursor-pointer transition-all ${
                  selectedMaterial === materialName
                    ? 'border-[#f59e0b]'
                    : 'border-[#333] hover:border-[#444]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* 재료명 */}
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{materialName}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      {historicalHigh > 0 && (
                        <>
                          <span className="text-xs text-[#737373]">
                            최고 <span className="text-[#ef4444]">{formatPrice(historicalHigh)}</span>
                          </span>
                          <span className="text-xs text-[#737373]">
                            최저 <span className="text-[#22c55e]">{formatPrice(historicalLow)}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 현재 가격 */}
                  <div className="text-right">
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
                </div>

                {/* 매물 미리보기 */}
                {hasPrice && priceInfo.listings && priceInfo.listings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#252525]">
                    <div className="flex flex-wrap gap-2">
                      {priceInfo.listings.slice(0, 5).map((listing, index) => (
                        <span
                          key={index}
                          className="text-xs bg-[#0a0a0a] px-2 py-1 rounded text-[#a3a3a3]"
                        >
                          {listing.sellerName} · {formatPrice(listing.price)} · {listing.quantity}개
                        </span>
                      ))}
                      {priceInfo.listings.length > 5 && (
                        <span className="text-xs text-[#737373]">
                          +{priceInfo.listings.length - 5}개 더
                        </span>
                      )}
                    </div>
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
