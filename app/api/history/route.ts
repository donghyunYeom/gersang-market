import { NextRequest, NextResponse } from 'next/server';
import {
  readPriceHistory,
  getItemPriceHistory,
  getPricesByDate,
  getPriceStats,
  getItemHistoryWithDaily,
  DailyPriceData,
} from '@/lib/priceHistory';

// GET: 히스토리 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemName = searchParams.get('itemName');
    const date = searchParams.get('date');
    const statsOnly = searchParams.get('stats') === 'true';
    const includeDaily = searchParams.get('includeDaily') === 'true';

    // 통계만 조회
    if (statsOnly) {
      const stats = await getPriceStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // 특정 아이템 히스토리 조회
    if (itemName) {
      // 일별 데이터 포함 요청 시
      if (includeDaily) {
        const { detailed, daily } = await getItemHistoryWithDaily(itemName);

        // 일별 데이터를 상세 데이터 형식으로 변환하여 병합
        const dailyConverted = daily.map((d: DailyPriceData) => ({
          timestamp: `${d.date}T12:00:00.000Z`,
          date: d.date,
          hour: 12,
          minuteSlot: 0,
          minPrice: d.minPrice,
          maxPrice: d.maxPrice,
          avgPrice: d.avgPrice,
          quantity: d.totalQuantity,
          isDaily: true, // 일별 집계 데이터임을 표시
        }));

        // 상세 데이터의 날짜 목록 (중복 제거용)
        const detailedDates = new Set(detailed.map(d => d.date));

        // 일별 데이터 중 상세 데이터에 없는 날짜만 추가
        const filteredDaily = dailyConverted.filter(d => !detailedDates.has(d.date));

        // 병합 및 정렬
        const combined = [...filteredDaily, ...detailed].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        return NextResponse.json({
          success: true,
          itemName,
          data: combined,
          count: combined.length,
          detailedCount: detailed.length,
          dailyCount: daily.length,
        });
      }

      // 기존 동작: 상세 데이터만 반환
      const history = await getItemPriceHistory(itemName);
      return NextResponse.json({
        success: true,
        itemName,
        data: history,
        count: history.length,
      });
    }

    // 특정 날짜 데이터 조회
    if (date) {
      const entries = await getPricesByDate(date);
      return NextResponse.json({
        success: true,
        date,
        data: entries,
        count: entries.length,
      });
    }

    // 전체 히스토리 조회
    const history = await readPriceHistory();
    return NextResponse.json({
      success: true,
      data: history,
      entriesCount: history.entries.length,
    });
  } catch (error) {
    console.error('히스토리 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '히스토리 조회 실패' },
      { status: 500 }
    );
  }
}
