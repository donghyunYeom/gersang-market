'use client';

import { MERCENARIES, PriceInfo, formatPrice, getAllUniqueItems } from '@/lib/items';

interface TotalSummaryProps {
  prices: Record<string, PriceInfo>;
  isLoading?: boolean;
}

export default function TotalSummary({ prices, isLoading }: TotalSummaryProps) {
  const allItems = getAllUniqueItems();

  // 가격 정보가 있는 아이템 수
  const itemsWithPrice = allItems.filter(
    item => prices[item]?.minPrice > 0
  ).length;

  const totalItems = allItems.length;
  const priceRate = totalItems > 0 ? Math.round((itemsWithPrice / totalItems) * 100) : 0;

  // 용병별 최저 비용 계산
  const mercenaryStats = MERCENARIES.map(merc => {
    const cost = merc.items.reduce((sum, item) => {
      const priceInfo = prices[item.name];
      if (priceInfo && priceInfo.minPrice > 0) {
        return sum + priceInfo.minPrice * item.quantity;
      }
      return sum;
    }, 0);

    const hasAllPrices = merc.items.every(item => prices[item.name]?.minPrice > 0);

    return {
      name: merc.name,
      cost,
      hasAllPrices,
    };
  });

  // 가장 저렴한 용병
  const cheapestMerc = mercenaryStats
    .filter(m => m.cost > 0)
    .sort((a, b) => a.cost - b.cost)[0];

  return (
    <div className="bg-gradient-to-r from-[#1a1a1a] to-[#252525] rounded-xl p-6 border border-[#f59e0b]/30">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* 제목 */}
        <div>
          <h2 className="text-lg font-bold text-[#f59e0b] mb-1">
            전설장수 제작 시세
          </h2>
          <p className="text-sm text-[#737373]">
            봉황서버 육의전 실시간 최저가 기준
          </p>
        </div>

        {/* 통계 */}
        <div className="flex flex-wrap gap-8">
          {/* 시세 확인률 */}
          <div className="text-center">
            <div className="text-xs text-[#737373] mb-1">시세 확인</div>
            {isLoading ? (
              <div className="h-8 bg-[#333] rounded w-16 mx-auto animate-pulse"></div>
            ) : (
              <div className="text-2xl font-bold text-[#22c55e]">
                {priceRate}%
              </div>
            )}
            <div className="text-xs text-[#737373] mt-1">
              {itemsWithPrice}/{totalItems} 아이템
            </div>
          </div>

          {/* 가장 저렴한 용병 */}
          <div className="text-center min-w-[150px]">
            <div className="text-xs text-[#737373] mb-1">최저 제작비</div>
            {isLoading ? (
              <div className="h-8 bg-[#333] rounded w-32 mx-auto animate-pulse"></div>
            ) : cheapestMerc ? (
              <>
                <div className="text-2xl font-bold text-white tabular-nums">
                  {formatPrice(cheapestMerc.cost)}
                </div>
                <div className="text-xs text-[#737373] mt-1">
                  {cheapestMerc.name}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-[#737373]">-</div>
            )}
          </div>

          {/* 총 용병 수 */}
          <div className="text-center">
            <div className="text-xs text-[#737373] mb-1">전설장수</div>
            <div className="text-2xl font-bold text-[#f59e0b]">
              {MERCENARIES.length}
            </div>
            <div className="text-xs text-[#737373] mt-1">종</div>
          </div>
        </div>
      </div>
    </div>
  );
}
