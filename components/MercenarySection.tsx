'use client';

import { Mercenary, PriceInfo, formatPrice } from '@/lib/items';
import ItemCard from './ItemCard';

interface MercenarySectionProps {
  mercenary: Mercenary;
  prices: Record<string, PriceInfo>;
  isLoading?: boolean;
}

export default function MercenarySection({
  mercenary,
  prices,
  isLoading,
}: MercenarySectionProps) {
  // 총 비용 계산
  const totalCost = mercenary.items.reduce((sum, item) => {
    const priceInfo = prices[item.name];
    if (priceInfo && priceInfo.minPrice > 0) {
      return sum + priceInfo.minPrice * item.quantity;
    }
    return sum;
  }, 0);

  // 가격 정보가 있는 아이템 수
  const itemsWithPrice = mercenary.items.filter(
    item => prices[item.name]?.minPrice > 0
  ).length;

  return (
    <div className="bg-[#0f0f0f] rounded-xl p-6 border border-[#252525]">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#f59e0b] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            {mercenary.name}
          </h2>
          <p className="text-[#737373] text-sm mt-1">{mercenary.description}</p>
        </div>

        {/* 총 비용 배지 */}
        <div className="bg-[#1a1a1a] rounded-lg px-4 py-3 border border-[#333]">
          <div className="text-xs text-[#737373] mb-1">예상 총 비용</div>
          {isLoading ? (
            <div className="h-6 bg-[#333] rounded w-24 animate-pulse"></div>
          ) : (
            <div className="text-lg font-bold text-white tabular-nums">
              {totalCost > 0 ? formatPrice(totalCost) : '-'}
            </div>
          )}
          <div className="text-xs text-[#737373] mt-1">
            {itemsWithPrice}/{mercenary.items.length} 아이템 시세 확인
          </div>
        </div>
      </div>

      {/* 아이템 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mercenary.items.map(item => (
          <ItemCard
            key={item.name}
            itemName={item.name}
            requiredQuantity={item.quantity}
            priceInfo={prices[item.name]}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
