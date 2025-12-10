'use client';

import { PriceInfo, formatPrice, formatNumber } from '@/lib/items';

interface ItemCardProps {
  itemName: string;
  requiredQuantity: number;
  priceInfo?: PriceInfo;
  isLoading?: boolean;
}

export default function ItemCard({
  itemName,
  requiredQuantity,
  priceInfo,
  isLoading,
}: ItemCardProps) {
  const totalCost = priceInfo ? priceInfo.minPrice * requiredQuantity : 0;

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333] animate-pulse">
        <div className="h-5 bg-[#333] rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-[#333] rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-[#333] rounded w-2/3"></div>
      </div>
    );
  }

  const hasPrice = priceInfo && priceInfo.minPrice > 0;

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333] hover:border-[#f59e0b] transition-colors duration-200 animate-fadeIn">
      {/* 아이템명 */}
      <h3 className="font-semibold text-[#ededed] mb-3 truncate" title={itemName}>
        {itemName}
      </h3>

      {/* 가격 정보 */}
      {hasPrice ? (
        <div className="space-y-2">
          {/* 최저가 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#737373]">최저가</span>
            <span className="text-[#22c55e] font-medium tabular-nums">
              {formatPrice(priceInfo.minPrice)}
            </span>
          </div>

          {/* 평균가 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#737373]">평균가</span>
            <span className="text-[#ededed] tabular-nums">
              {formatPrice(priceInfo.avgPrice)}
            </span>
          </div>

          {/* 매물 수량 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#737373]">매물</span>
            <span className="text-[#737373] tabular-nums">
              {formatNumber(priceInfo.quantity)}개
            </span>
          </div>

          {/* 구분선 */}
          <div className="border-t border-[#333] my-2"></div>

          {/* 필요 수량 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#737373]">필요</span>
            <span className="text-[#f59e0b] font-medium tabular-nums">
              {formatNumber(requiredQuantity)}개
            </span>
          </div>

          {/* 총 비용 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#737373]">총 비용</span>
            <span className="text-white font-bold tabular-nums">
              {formatPrice(totalCost)}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#737373]">필요</span>
            <span className="text-[#f59e0b] font-medium tabular-nums">
              {formatNumber(requiredQuantity)}개
            </span>
          </div>
          <p className="text-[#ef4444] text-sm mt-2">매물 없음</p>
        </div>
      )}
    </div>
  );
}
