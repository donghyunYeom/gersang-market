'use client';

interface TabNavigationProps {
  activeTab: 'mercenaries' | 'materials';
  onTabChange: (tab: 'mercenaries' | 'materials') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-lg mb-6">
      <button
        onClick={() => onTabChange('mercenaries')}
        className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
          activeTab === 'mercenaries'
            ? 'bg-[#f59e0b] text-black'
            : 'text-[#a3a3a3] hover:text-white hover:bg-[#252525]'
        }`}
      >
        전설장수
      </button>
      <button
        onClick={() => onTabChange('materials')}
        className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
          activeTab === 'materials'
            ? 'bg-[#f59e0b] text-black'
            : 'text-[#a3a3a3] hover:text-white hover:bg-[#252525]'
        }`}
      >
        재료 시세
      </button>
    </div>
  );
}
