import { Search, Filter, X } from 'lucide-react';
import { REALMS } from '../data/mockData';

export default function FilterBar({ filters, onFilterChange, totalResults }) {
  const hasActiveFilters =
    filters.faction !== 'all' ||
    filters.realm !== 'all' ||
    filters.status !== 'all' ||
    filters.minReward > 0 ||
    filters.search !== '';

  const clearFilters = () => {
    onFilterChange('faction', 'all');
    onFilterChange('realm', 'all');
    onFilterChange('status', 'all');
    onFilterChange('minReward', 0);
    onFilterChange('search', '');
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gold" />
          <h3 className="text-sm font-bold text-parchment font-cinzel tracking-wider uppercase">
            Hunt Filters
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-parchment-dark/50 text-xs">
            {totalResults} contract{totalResults !== 1 ? 's' : ''} found
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gold/70 hover:text-gold transition-colors"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-dark/40" />
          <input
            type="text"
            placeholder="Search targets, guilds, reasons..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-sm"
          />
        </div>

        {/* Faction */}
        <select
          value={filters.faction}
          onChange={(e) => onFilterChange('faction', e.target.value)}
          className="text-sm"
        >
          <option value="all">All Factions</option>
          <option value="alliance">⛨ Alliance</option>
          <option value="horde">⚔ Horde</option>
        </select>

        {/* Realm */}
        <select
          value={filters.realm}
          onChange={(e) => onFilterChange('realm', e.target.value)}
          className="text-sm"
        >
          <option value="all">All Realms</option>
          {REALMS.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name} ({r.region})
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">🟢 Active</option>
          <option value="claimed">🟡 Claimed</option>
          <option value="disputed">🔴 Disputed</option>
        </select>
      </div>

      {/* Reward slider */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-parchment-dark/50 text-xs whitespace-nowrap">Min Reward:</span>
        <input
          type="range"
          min={0}
          max={2000}
          step={50}
          value={filters.minReward}
          onChange={(e) => onFilterChange('minReward', parseInt(e.target.value))}
          className="flex-1 accent-gold h-1 cursor-pointer"
          style={{ accentColor: '#ffd700' }}
        />
        <span className="text-gold text-xs font-semibold min-w-[50px] text-right">
          {filters.minReward > 0 ? `${filters.minReward}g+` : 'Any'}
        </span>
      </div>
    </div>
  );
}
