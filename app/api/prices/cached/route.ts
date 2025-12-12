import { NextResponse } from 'next/server';
import { getLatestPrices } from '@/lib/priceHistory';
import { PriceInfo } from '@/lib/items';

// GET: 서버에 저장된 최신 가격 데이터 조회 (빠름)
export async function GET() {
  try {
    const latestEntry = await getLatestPrices();

    if (!latestEntry) {
      return NextResponse.json({
        success: false,
        error: '저장된 가격 데이터가 없습니다',
      });
    }

    // PriceHistoryEntry를 PriceInfo 형식으로 변환
    const prices: Record<string, PriceInfo> = {};
    Object.entries(latestEntry.prices).forEach(([itemName, data]) => {
      prices[itemName] = {
        itemName,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        avgPrice: data.avgPrice,
        quantity: data.quantity,
        listings: data.listings || [],
        lastUpdated: latestEntry.timestamp,
      };
    });

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: latestEntry.timestamp,
      serverName: '봉황',
      cached: true,
    });
  } catch (error) {
    console.error('캐시된 가격 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '캐시된 가격 조회 실패' },
      { status: 500 }
    );
  }
}
