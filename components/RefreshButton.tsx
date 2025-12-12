'use client';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isRefreshing?: boolean;
  lastUpdated?: string;
}

export default function RefreshButton({
  onClick,
  isLoading,
  isRefreshing = false,
  lastUpdated,
}: RefreshButtonProps) {
  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const isBusy = isLoading || isRefreshing;

  return (
    <div className="flex items-center gap-4">
      {/* 마지막 업데이트 시간 + 업데이트 중 표시 */}
      <div className="text-sm text-[#737373]">
        {isRefreshing ? (
          <span className="flex items-center gap-1.5 text-[#f59e0b]">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>업데이트 중...</span>
          </span>
        ) : (
          <>
            <span className="hidden sm:inline">마지막 업데이트: </span>
            <span className="tabular-nums">{formatTime(lastUpdated)}</span>
          </>
        )}
      </div>

      {/* 새로고침 버튼 */}
      <button
        onClick={onClick}
        disabled={isBusy}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${
            isBusy
              ? 'bg-[#333] text-[#737373] cursor-not-allowed'
              : 'bg-[#f59e0b] text-black hover:bg-[#d97706] active:scale-95'
          }
        `}
      >
        {/* 새로고침 아이콘 */}
        <svg
          className={`w-4 h-4 ${isBusy ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>{isBusy ? '조회 중...' : '새로고침'}</span>
      </button>
    </div>
  );
}
