'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Mercenary, PriceInfo, formatPrice, formatNumber, getAttributeColor, calculateTotalCost, getBottleRecipe, getOrbRecipe } from '@/lib/items';

// 호리병 관련 아이템 이미지 매핑
const BOTTLE_ITEM_IMAGES: Record<string, string> = {
  '영혼이 봉인된 호리병': 'https://ik.imagekit.io/sga2sohyz/tr:cm-pad_resize,w-56,h-56:h-56,w-56/item/mixture/dudghsdlqhddlsehlsghflqud.webp',
  '선조의 영혼석(조선)': 'https://ik.imagekit.io/sga2sohyz/tr:cm-pad_resize,w-56,h-56:h-56,w-56/item/drop/tjswhdmldudghstjr-whtjs.webp?c=1',
  '선조의 영혼석(일본)': 'https://ik.imagekit.io/sga2sohyz/tr:cm-pad_resize,w-56,h-56:h-56,w-56/item/drop/tjswhdmldudghstjr-dlfqhs.webp?c=1',
  '선조의 영혼석(대만)': 'https://ik.imagekit.io/sga2sohyz/tr:cm-pad_resize,w-56,h-56:h-56,w-56/item/drop/tjswhdmldudghstjr-eoaks.webp?c=1',
  '선조의 영혼석(중국)': 'https://ik.imagekit.io/sga2sohyz/tr:cm-pad_resize,w-56,h-56:h-56,w-56/item/drop/tjswhdmldudghstjr-wndrnr.webp?c=1',
};

interface MercenaryCardProps {
  mercenary: Mercenary;
  prices: Record<string, PriceInfo>;
  isLoading?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function MercenaryCard({
  mercenary,
  prices,
  isLoading,
  isExpanded,
  onToggle,
}: MercenaryCardProps) {
  const [showBottleRecipe, setShowBottleRecipe] = useState(false);
  const [showOrbRecipe, setShowOrbRecipe] = useState<string | null>(null);
  const costs = calculateTotalCost(mercenary, prices);
  const attrColor = getAttributeColor(mercenary.attributesName);
  const bottleRecipe = getBottleRecipe();

  // 가격 정보가 있는 아이템 수
  const mainItemsWithPrice = mercenary.items.filter(
    item => prices[item.name]?.minPrice > 0
  ).length;

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden">
      {/* 헤더 - 클릭 가능 */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-[#252525] transition-colors text-left"
      >
        {/* 용병 이미지 */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0a0a0a] flex-shrink-0">
          <Image
            src={mercenary.imgPath}
            alt={mercenary.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* 용병 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-white truncate">{mercenary.name}</h3>
            <span
              className="text-xs px-2 py-0.5 rounded font-medium"
              style={{ backgroundColor: attrColor + '20', color: attrColor }}
            >
              {mercenary.attributesName}
            </span>
            <span className="text-xs text-[#737373]">{mercenary.countryName}</span>
          </div>
          <div className="text-sm text-[#737373]">
            재료 {mercenary.items.length}종 · 하위용병 {mercenary.childMercenaries.length}명
          </div>
        </div>

        {/* 총 비용 */}
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-[#737373] mb-1">총 제작비</div>
          {isLoading ? (
            <div className="h-6 bg-[#333] rounded w-24 animate-pulse"></div>
          ) : (
            <div className="text-lg font-bold text-[#f59e0b] tabular-nums">
              {costs.totalCost > 0 ? formatPrice(costs.totalCost) : '-'}
            </div>
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

      {/* 상세 정보 - 펼쳤을 때만 표시 */}
      {isExpanded && (
        <div className="border-t border-[#333] animate-fadeIn">
          {/* 전설장수 재료 섹션 */}
          <div className="p-4 border-b border-[#333]">
            <h4 className="text-sm font-bold text-[#f59e0b] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
              전설장수 제작 재료
            </h4>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[#737373] border-b border-[#252525]">
                  <th className="text-left pb-2 font-medium">재료</th>
                  <th className="text-right pb-2 font-medium">필요</th>
                  <th className="text-right pb-2 font-medium">최저가</th>
                  <th className="text-right pb-2 font-medium">소계</th>
                </tr>
              </thead>
              <tbody>
                {mercenary.items.map(item => {
                  const priceInfo = prices[item.name];
                  const hasPrice = priceInfo && priceInfo.minPrice > 0;
                  const subtotal = hasPrice ? priceInfo.minPrice * item.quantity : 0;
                  const isBottle = item.name === '영혼이 봉인된 호리병';
                  const isOrb = item.name.startsWith('정기의구슬(');
                  const orbRecipe = isOrb ? getOrbRecipe(item.name) : null;

                  return (
                    <>
                      <tr key={item.name} className="border-b border-[#1f1f1f] last:border-0">
                        <td className="py-2 text-sm text-white">
                          {isBottle && bottleRecipe ? (
                            <button
                              onClick={() => setShowBottleRecipe(!showBottleRecipe)}
                              className="flex items-center gap-1 hover:text-[#f59e0b] transition-colors"
                            >
                              <svg
                                className={`w-3 h-3 transition-transform ${showBottleRecipe ? 'rotate-90' : ''}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              <div className="relative w-6 h-6 rounded overflow-hidden bg-[#0a0a0a] flex-shrink-0">
                                <Image
                                  src={BOTTLE_ITEM_IMAGES['영혼이 봉인된 호리병']}
                                  alt={item.name}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                              {item.name}
                            </button>
                          ) : isOrb && orbRecipe ? (
                            <button
                              onClick={() => setShowOrbRecipe(showOrbRecipe === item.name ? null : item.name)}
                              className="flex items-center gap-1 hover:text-[#f59e0b] transition-colors"
                            >
                              <svg
                                className={`w-3 h-3 transition-transform ${showOrbRecipe === item.name ? 'rotate-90' : ''}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              {item.name}
                            </button>
                          ) : (
                            item.name
                          )}
                        </td>
                        <td className="py-2 text-sm text-right text-[#f59e0b] tabular-nums">
                          {formatNumber(item.quantity)}개
                        </td>
                        <td className="py-2 text-sm text-right tabular-nums">
                          {isLoading ? (
                            <span className="inline-block h-4 bg-[#333] rounded w-14 animate-pulse"></span>
                          ) : hasPrice ? (
                            <span className="text-[#22c55e]">{formatPrice(priceInfo.minPrice)}</span>
                          ) : (
                            <span className="text-[#ef4444]">-</span>
                          )}
                        </td>
                        <td className="py-2 text-sm text-right font-medium tabular-nums">
                          {isLoading ? (
                            <span className="inline-block h-4 bg-[#333] rounded w-16 animate-pulse"></span>
                          ) : hasPrice ? (
                            <span className="text-white">{formatPrice(subtotal)}</span>
                          ) : (
                            <span className="text-[#737373]">-</span>
                          )}
                        </td>
                      </tr>
                      {/* 호리병 제작 하위 재료 */}
                      {isBottle && showBottleRecipe && bottleRecipe && (
                        <tr key={`${item.name}-recipe`}>
                          <td colSpan={4} className="py-0">
                            <div className="bg-[#0f0f0f] rounded-lg p-3 my-2 ml-4 border-l-2 border-[#a855f7]">
                              <div className="text-xs text-[#a855f7] font-medium mb-2 flex items-center gap-2">
                                <div className="relative w-5 h-5 rounded overflow-hidden bg-[#0a0a0a] flex-shrink-0">
                                  <Image
                                    src={BOTTLE_ITEM_IMAGES['영혼이 봉인된 호리병']}
                                    alt="호리병"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                                호리병 {item.quantity}개 제작 재료 (조선/일본/대만/중국 각 20개)
                              </div>
                              <div className="space-y-2">
                                {bottleRecipe.items.map(subItem => {
                                  const subPriceInfo = prices[subItem.name];
                                  const subHasPrice = subPriceInfo && subPriceInfo.minPrice > 0;
                                  const subSubtotal = subHasPrice ? subPriceInfo.minPrice * subItem.quantity : 0;
                                  const itemImage = BOTTLE_ITEM_IMAGES[subItem.name];
                                  return (
                                    <div key={subItem.name} className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        {itemImage && (
                                          <div className="relative w-6 h-6 rounded overflow-hidden bg-[#0a0a0a] flex-shrink-0">
                                            <Image
                                              src={itemImage}
                                              alt={subItem.name}
                                              fill
                                              className="object-contain"
                                              unoptimized
                                            />
                                          </div>
                                        )}
                                        <span className="text-[#a3a3a3]">{subItem.name}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-[#a855f7]">{formatNumber(subItem.quantity)}개</span>
                                        {subHasPrice && (
                                          <span className="text-[#22c55e] tabular-nums">
                                            {formatPrice(subSubtotal)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="mt-2 pt-2 border-t border-[#252525] text-xs text-[#737373]">
                                제작비: 3천만 × {item.quantity}개 = <span className="text-[#f59e0b]">{formatPrice(bottleRecipe.craftingFee)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {/* 정기의구슬 제작 하위 재료 */}
                      {isOrb && showOrbRecipe === item.name && orbRecipe && (
                        <tr key={`${item.name}-recipe`}>
                          <td colSpan={4} className="py-0">
                            <div className="bg-[#0f0f0f] rounded-lg p-3 my-2 ml-4 border-l-2 border-[#eab308]">
                              <div className="text-xs text-[#eab308] font-medium mb-2 flex items-center gap-2">
                                <span>🔮</span>
                                {item.name} {item.quantity}개 제작 재료 (장과로 NPC)
                              </div>
                              <div className="space-y-1">
                                {orbRecipe.items.map(subItem => {
                                  const subPriceInfo = prices[subItem.name];
                                  const subHasPrice = subPriceInfo && subPriceInfo.minPrice > 0;
                                  const totalQty = subItem.quantity * item.quantity;
                                  const subSubtotal = subHasPrice ? subPriceInfo.minPrice * totalQty : 0;
                                  return (
                                    <div key={subItem.name} className="flex items-center justify-between text-xs">
                                      <span className="text-[#a3a3a3]">{subItem.name}</span>
                                      <div className="flex items-center gap-3">
                                        <span className="text-[#737373]">
                                          {subItem.quantity}개 × {item.quantity} = <span className="text-[#eab308]">{formatNumber(totalQty)}개</span>
                                        </span>
                                        {subHasPrice && (
                                          <span className="text-[#22c55e] tabular-nums">
                                            {formatPrice(subSubtotal)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="mt-2 pt-2 border-t border-[#252525] text-xs text-[#737373]">
                                제작비: 2백만 × {item.quantity}개 = <span className="text-[#f59e0b]">{formatPrice(orbRecipe.craftingFee * item.quantity)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#333]">
                  <td colSpan={3} className="py-2 text-sm font-bold text-white">
                    전설장수 재료 소계
                  </td>
                  <td className="py-2 text-right font-bold text-[#f59e0b] tabular-nums">
                    {isLoading ? (
                      <span className="inline-block h-5 bg-[#333] rounded w-20 animate-pulse"></span>
                    ) : costs.mainCost > 0 ? (
                      formatPrice(costs.mainCost)
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 하위 용병 (각성장수) 섹션 */}
          {mercenary.childMercenaries.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-bold text-[#3b82f6] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                필요 각성장수 ({mercenary.childMercenaries.length}명)
              </h4>
              <div className="space-y-3">
                {mercenary.childMercenaries.map(child => {
                  const childAttrColor = getAttributeColor(child.attributesName);
                  const childCost = child.items.reduce((sum, item) => {
                    const priceInfo = prices[item.name];
                    if (priceInfo && priceInfo.minPrice > 0) {
                      return sum + priceInfo.minPrice * item.quantity;
                    }
                    return sum;
                  }, 0);

                  return (
                    <div key={child.id} className="bg-[#0f0f0f] rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                          <Image
                            src={child.imgPath}
                            alt={child.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">{child.name}</span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{ backgroundColor: childAttrColor + '20', color: childAttrColor }}
                            >
                              {child.attributesName}
                            </span>
                          </div>
                          <div className="text-xs text-[#737373]">{child.classTypeName}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-[#737373]">제작비</div>
                          {isLoading ? (
                            <div className="h-4 bg-[#333] rounded w-16 animate-pulse"></div>
                          ) : (
                            <div className="text-sm font-bold text-white tabular-nums">
                              {childCost > 0 ? formatPrice(childCost) : '-'}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* 하위 용병 재료 */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {child.items.map(item => {
                          const priceInfo = prices[item.name];
                          const hasPrice = priceInfo && priceInfo.minPrice > 0;
                          const isModified = child.classTypeName === '개조장수';
                          return (
                            <span
                              key={item.name}
                              className={`px-2 py-1 rounded ${
                                hasPrice
                                  ? 'bg-[#1a1a1a] text-white'
                                  : isModified
                                    ? 'bg-[#1a1a1a] text-[#a3a3a3]'  // 개조장수 재료: 밝은 회색
                                    : 'bg-[#1a1a1a] text-[#737373]'
                              }`}
                            >
                              {item.name} {item.quantity}개
                              {hasPrice && (
                                <span className="text-[#22c55e] ml-1">
                                  ({formatPrice(priceInfo.minPrice * item.quantity)})
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 하위 용병 총합 */}
              <div className="mt-3 pt-3 border-t border-[#333] flex justify-between items-center">
                <span className="text-sm font-bold text-white">각성장수 재료 소계</span>
                {isLoading ? (
                  <span className="inline-block h-5 bg-[#333] rounded w-20 animate-pulse"></span>
                ) : (
                  <span className="font-bold text-[#3b82f6] tabular-nums">
                    {costs.childCost > 0 ? formatPrice(costs.childCost) : '-'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 최종 합계 */}
          <div className="p-4 bg-[#0f0f0f] border-t border-[#333]">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white">
                총 제작비 (전설장수 + 각성장수)
              </span>
              {isLoading ? (
                <span className="inline-block h-7 bg-[#333] rounded w-28 animate-pulse"></span>
              ) : (
                <span className="text-xl font-bold text-[#f59e0b] tabular-nums">
                  {costs.totalCost > 0 ? formatPrice(costs.totalCost) : '-'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
