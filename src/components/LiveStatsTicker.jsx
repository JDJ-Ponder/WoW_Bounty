import { Coins, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { timeAgo } from '../utils/api';

export default function LiveStatsTicker({ activity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'completed': return <CheckCircle size={12} className="text-active flex-shrink-0" />;
      case 'posted': return <Coins size={12} className="text-gold flex-shrink-0" />;
      case 'claimed': return <Clock size={12} className="text-claimed flex-shrink-0" />;
      case 'disputed': return <AlertTriangle size={12} className="text-disputed flex-shrink-0" />;
      case 'expired': return <Clock size={12} className="text-expired flex-shrink-0" />;
      default: return <Coins size={12} className="text-gold flex-shrink-0" />;
    }
  };

  const getActivityText = (item) => {
    const factionColor = (faction) =>
      faction === 'Alliance' ? 'text-alliance-glow' : 'text-horde-glow';

    switch (item.type) {
      case 'completed':
        return (
          <span>
            <span className={`font-semibold ${factionColor(item.hunterFaction)}`}>{item.hunter}</span>
            {' collected '}
            <span className="text-gold font-semibold">{item.reward}g</span>
            {' for eliminating '}
            <span className={`font-semibold ${factionColor(item.targetFaction)}`}>{item.target}</span>
            {item.location && <span className="text-parchment-dark/40"> — {item.location}</span>}
          </span>
        );
      case 'posted':
        return (
          <span>
            <span className={`font-semibold ${factionColor(item.posterFaction)}`}>{item.poster}</span>
            {' posted '}
            <span className="text-gold font-semibold">{item.reward}g</span>
            {' bounty on '}
            <span className={`font-semibold ${factionColor(item.targetFaction)}`}>{item.target}</span>
          </span>
        );
      case 'claimed':
        return (
          <span>
            <span className={`font-semibold ${factionColor(item.hunterFaction)}`}>{item.hunter}</span>
            {' accepted contract on '}
            <span className={`font-semibold ${factionColor(item.targetFaction)}`}>{item.target}</span>
            {' for '}
            <span className="text-gold font-semibold">{item.reward}g</span>
          </span>
        );
      case 'disputed':
        return (
          <span>
            {'⚠️ Dispute filed: '}
            <span className={`font-semibold ${factionColor(item.hunterFaction)}`}>{item.hunter}</span>
            {' vs '}
            <span className={`font-semibold ${factionColor(item.targetFaction)}`}>{item.target}</span>
            {' — '}
            <span className="text-gold font-semibold">{item.reward}g</span>
            {' in escrow'}
          </span>
        );
      case 'expired':
        return (
          <span>
            {'Contract on '}
            <span className={`font-semibold ${factionColor(item.targetFaction)}`}>{item.target}</span>
            {' expired — '}
            <span className="text-gold font-semibold">{item.reward}g</span>
            {' returned'}
          </span>
        );
      default:
        return null;
    }
  };

  // Duplicate the items for seamless scroll
  const tickerItems = [...activity, ...activity];

  return (
    <div className="ticker-bar py-2.5 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-charcoal-deep to-transparent z-10" />
      <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-charcoal-deep to-transparent z-10" />

      <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
        {tickerItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-xs text-parchment-dark/70">
            {getActivityIcon(item.type)}
            {getActivityText(item)}
            <span className="text-parchment-dark/30 ml-1">
              {timeAgo(item.timestamp)}
            </span>
            <span className="text-gold/20 ml-4">⟡</span>
          </div>
        ))}
      </div>
    </div>
  );
}
