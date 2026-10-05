import { motion } from 'framer-motion';
import { Scroll, CheckCircle, Clock, AlertTriangle, Coins, XCircle } from 'lucide-react';
import { timeAgo } from '../utils/api';

export default function ActivityFeed({ activity }) {
  const getIcon = (type) => {
    switch (type) {
      case 'completed': return <CheckCircle size={14} className="text-active" />;
      case 'posted': return <Coins size={14} className="text-gold" />;
      case 'claimed': return <Clock size={14} className="text-claimed" />;
      case 'disputed': return <AlertTriangle size={14} className="text-disputed" />;
      case 'expired': return <XCircle size={14} className="text-expired" />;
      default: return <Coins size={14} className="text-gold" />;
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 'completed': return 'Bounty Collected';
      case 'posted': return 'Contract Posted';
      case 'claimed': return 'Contract Accepted';
      case 'disputed': return 'Dispute Filed';
      case 'expired': return 'Contract Expired';
      default: return 'Activity';
    }
  };

  const factionColor = (faction) =>
    faction === 'Alliance' ? 'text-alliance-glow' : 'text-horde-glow';

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <Scroll size={16} className="text-gold" />
        <h3 className="text-sm font-bold text-parchment font-cinzel tracking-wider uppercase">
          Recent Contracts
        </h3>
      </div>

      {/* Feed items */}
      <div className="divide-y divide-white/[0.03] max-h-[500px] overflow-y-auto">
        {activity.slice(0, 10).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-3 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-parchment-dark/70 mb-0.5">
                  {getLabel(item.type)}
                </div>
                <div className="text-xs text-parchment-dark/50 leading-relaxed">
                  {item.type === 'completed' && (
                    <>
                      <span className={factionColor(item.hunterFaction)}>{item.hunter}</span>
                      {' eliminated '}
                      <span className={factionColor(item.targetFaction)}>{item.target}</span>
                      {item.location && (
                        <span className="text-parchment-dark/30"> in {item.location}</span>
                      )}
                    </>
                  )}
                  {item.type === 'posted' && (
                    <>
                      <span className={factionColor(item.posterFaction)}>{item.poster}</span>
                      {' wants '}
                      <span className={factionColor(item.targetFaction)}>{item.target}</span>
                      {' dead'}
                    </>
                  )}
                  {item.type === 'claimed' && (
                    <>
                      <span className={factionColor(item.hunterFaction)}>{item.hunter}</span>
                      {' is hunting '}
                      <span className={factionColor(item.targetFaction)}>{item.target}</span>
                    </>
                  )}
                  {item.type === 'disputed' && (
                    <>
                      <span className={factionColor(item.hunterFaction)}>{item.hunter}</span>
                      {' vs '}
                      <span className={factionColor(item.targetFaction)}>{item.target}</span>
                    </>
                  )}
                  {item.type === 'expired' && (
                    <>
                      {'Contract on '}
                      <span className={factionColor(item.targetFaction)}>{item.target}</span>
                      {' expired'}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-parchment-dark/30">
                  <span className="text-gold/60 font-medium">{item.reward}g</span>
                  <span>•</span>
                  <span>{item.realm}</span>
                  <span>•</span>
                  <span>{timeAgo(item.timestamp)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
