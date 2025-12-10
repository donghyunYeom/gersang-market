'use client';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading: boolean;
  lastUpdated?: string;
}

export default function RefreshButton({
  onClick,
  isLoading,
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

  return (
    <div className="flex items-center gap-4">
      {/* 마지막 업데이트 시간 */}
      <div className="text-sm text-[#737373]">
        <span className="hidden sm:inline">마지막 업데이트: </span>
        <span className="tabular-nums">{formatTime(lastUpdated)}</span>
      </div>

      {/* 새로고침 버튼 */}
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${
            isLoading
              ? 'bg-[#333] text-[#737373] cursor-not-allowed'
              : 'bg-[#f59e0b] text-black hover:bg-[#d97706] active:scale-95'
          }
        `}
      >
        {/* 새로고침 아이콘 */}
        <svg
          className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
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
        <span>{isLoading ? '조회 중...' : '새로고침'}</span>
      </button>
    </div>
  );
}
