import { NextRequest, NextResponse } from 'next/server';
import {
  readPriceHistory,
  getItemPriceHistory,
  getPricesByDate,
  getPriceStats,
} from '@/lib/priceHistory';

// GET: 히스토리 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemName = searchParams.get('itemName');
    const date = searchParams.get('date');
    const statsOnly = searchParams.get('stats') === 'true';

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
