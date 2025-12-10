import { NextRequest, NextResponse } from 'next/server';
import { getAllUniqueItems, PriceInfo, PriceListing } from '@/lib/items';
import { savePriceHistory } from '@/lib/priceHistory';

const SERVER_ID = 5; // 봉황서버
const BASE_URL = 'https://geota.co.kr/gersang/yukeuijeon';

interface GeotaItem {
  itemName: string;
  price: number;
  totalQuantity: number;
  sellerName: string;
}

// RSC 응답에서 데이터 추출
function extractDataFromRSC(html: string): GeotaItem[] {
  const items: GeotaItem[] = [];

  try {
    // 이스케이프된 형태의 아이템 정보 추출
    // 형식: \"itemName\":\"영웅의 영혼석\",\"requiredLevel\":0,\"totalQuantity\":15,\"sellerName\":\"[비룡]\",\"price\":2500000
    const escapedPattern = /\\?"itemName\\?":\\?"([^"\\]+)\\?"[^}]*?\\?"totalQuantity\\?":\s*(\d+)[^}]*?\\?"sellerName\\?":\\?"([^"\\]*)\\?"[^}]*?\\?"price\\?":\s*(\d+)/g;
    let match;
    while ((match = escapedPattern.exec(html)) !== null) {
      items.push({
        itemName: match[1],
        price: Number(match[4]),
        totalQuantity: Number(match[2]),
        sellerName: match[3] || '알 수 없음',
      });
    }

    // 대체 패턴: 다른 순서의 JSON 필드
    if (items.length === 0) {
      const altPattern = /\\?"itemName\\?":\\?"([^"\\]+)\\?"[^}]*?\\?"price\\?":\s*(\d+)[^}]*?\\?"totalQuantity\\?":\s*(\d+)/g;
      while ((match = altPattern.exec(html)) !== null) {
        items.push({
          itemName: match[1],
          price: Number(match[2]),
          totalQuantity: Number(match[3]),
          sellerName: '알 수 없음',
        });
      }
    }
  } catch (error) {
    console.error('데이터 추출 오류:', error);
  }

  return items;
}

// 단일 아이템 가격 조회
async function fetchItemPrice(itemName: string): Promise<PriceInfo | null> {
  try {
    const url = `${BASE_URL}?serverId=${SERVER_ID}&itemName=${encodeURIComponent(itemName)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`HTTP 오류: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const items = extractDataFromRSC(html);

    // 검색어와 정확히 일치하는 아이템만 필터링
    const matchedItems = items.filter(
      item => item.itemName === itemName || item.itemName.includes(itemName)
    );

    if (matchedItems.length === 0) {
      return {
        itemName,
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        quantity: 0,
        listings: [],
        lastUpdated: new Date().toISOString(),
      };
    }

    // 가격 통계 계산
    const prices = matchedItems.map(item => item.price).sort((a, b) => a - b);
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const totalQuantity = matchedItems.reduce((sum, item) => sum + item.totalQuantity, 0);

    const listings: PriceListing[] = matchedItems
      .slice(0, 10)
      .map(item => ({
        price: item.price,
        quantity: item.totalQuantity,
        sellerName: item.sellerName,
      }));

    return {
      itemName,
      minPrice,
      maxPrice,
      avgPrice,
      quantity: totalQuantity,
      listings,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`아이템 조회 오류 (${itemName}):`, error);
    return null;
  }
}

// GET: 모든 아이템 가격 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skipSave = searchParams.get('skipSave') === 'true';

    const allItems = getAllUniqueItems();
    const pricePromises = allItems.map(item => fetchItemPrice(item));
    const results = await Promise.all(pricePromises);

    const prices: Record<string, PriceInfo> = {};
    results.forEach((result, index) => {
      if (result) {
        prices[allItems[index]] = result;
      }
    });

    // 가격 히스토리 저장 (skipSave가 아닐 때만)
    let savedEntry = null;
    if (!skipSave) {
      try {
        savedEntry = savePriceHistory(prices);
        console.log(`가격 히스토리 저장 완료: ${savedEntry.date} ${savedEntry.hour}시`);
      } catch (saveError) {
        console.error('히스토리 저장 오류:', saveError);
      }
    }

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString(),
      serverId: SERVER_ID,
      serverName: '봉황',
      historySaved: savedEntry ? {
        date: savedEntry.date,
        hour: savedEntry.hour,
      } : null,
    });
  } catch (error) {
    console.error('가격 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '가격 조회 실패' },
      { status: 500 }
    );
  }
}

// POST: 특정 아이템만 조회
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items?: string[] };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: '아이템 목록이 필요합니다' },
        { status: 400 }
      );
    }

    const pricePromises = items.map(item => fetchItemPrice(item));
    const results = await Promise.all(pricePromises);

    const prices: Record<string, PriceInfo> = {};
    results.forEach((result, index) => {
      if (result) {
        prices[items[index]] = result;
      }
    });

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString(),
      serverId: SERVER_ID,
      serverName: '봉황',
    });
  } catch (error) {
    console.error('가격 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '가격 조회 실패' },
      { status: 500 }
    );
  }
}
