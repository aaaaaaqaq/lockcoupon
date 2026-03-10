'use client';

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: { all: number; code: number; cashback: number; bon: number };
}

export default function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs = [
    { key: 'all', label: 'Tous', emoji: '🏷️', count: counts.all },
    { key: 'code', label: 'Codes', emoji: '🔑', count: counts.code },
    { key: 'cashback', label: 'Cashback', emoji: '💰', count: counts.cashback },
    { key: 'bon', label: 'Bon Plans', emoji: '🎁', count: counts.bon },
  ];

  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center gap-3 md:gap-5 py-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`
                flex items-center gap-1.5 whitespace-nowrap text-[14px] font-semibold
                px-4 py-2 rounded-full transition-all shrink-0
                ${
                  activeFilter === tab.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-bg text-muted hover:bg-gray-200'
                }
              `}
            >
              <span>{tab.emoji}</span>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
