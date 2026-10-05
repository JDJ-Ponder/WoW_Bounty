import { motion } from 'framer-motion';
import { Crosshair, Clock, MapPin, Lock, AlertTriangle, Users, Coins } from 'lucide-react';
import FactionCrest from './FactionCrest';
import { getClassInfo, formatGold, timeAgo, getPriorityConfig } from '../utils/api';

export default function BountyCard({ bounty, onAccept, onViewProof, index }) {
  const classInfo = getClassInfo(bounty.target.class);
  const priority = getPriorityConfig(bounty.priority);
  const isAlliance = bounty.target.faction === 'Alliance';
  const factionClass = isAlliance ? 'alliance' : 'horde';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`bounty-card ${factionClass} p-5 relative overflow-hidden group`}
    >
      {/* Faction ambient glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: isAlliance
            ? 'radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(239, 68, 68, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Priority badge */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${priority.bg} ${priority.text} border ${priority.border} ${priority.glow}`}>
          {bounty.priority === 'legendary' && '👑 '}
          {priority.label}
        </div>
        <StatusBadge status={bounty.status} />
      </div>

      {/* Target info */}
      <div className="flex items-start gap-3 mb-4 relative z-10">
        <FactionCrest faction={bounty.target.faction} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold font-cinzel text-parchment truncate">
            {bounty.target.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-parchment-dark/60">
            <span style={{ color: classInfo.color }} className="font-medium">
              {classInfo.icon} {bounty.target.class}
            </span>
            <span>•</span>
            <span>Lv{bounty.target.level}</span>
            <span>•</span>
            <span>{bounty.target.race}</span>
          </div>
          {bounty.target.guild && (
            <div className="text-xs text-parchment-dark/40 mt-0.5">
              &lt;{bounty.target.guild}&gt;
            </div>
          )}
        </div>
      </div>

      {/* Reward */}
      <div className="escrow-badge rounded-lg p-3 mb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-gold" />
            <span className="text-gold font-bold text-xl font-cinzel">
              {formatGold(bounty.reward)}g
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Lock size={11} className="text-gold/60" />
            <span className="text-gold/60 capitalize">
              {bounty.escrowStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Reason */}
      <p className="text-xs text-parchment-dark/60 leading-relaxed mb-3 line-clamp-2 relative z-10">
        "{bounty.reason}"
      </p>

      {/* Meta row */}
      <div className="flex items-center justify-between text-[11px] text-parchment-dark/40 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {bounty.target.realm}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {timeAgo(bounty.postedAt)}
          </span>
        </div>
        {bounty.claims > 0 && (
          <span className="flex items-center gap-1 text-claimed">
            <Users size={10} />
            {bounty.claims} hunter{bounty.claims > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Last seen */}
      {bounty.lastSeen && (
        <div className="text-[10px] text-parchment-dark/30 mb-3 flex items-center gap-1 relative z-10">
          <Crosshair size={9} />
          Last seen: {bounty.lastSeen}
        </div>
      )}

      {/* Action */}
      <div className="relative z-10">
        {bounty.status === 'active' && (
          <button
            onClick={() => onAccept(bounty)}
            className="btn-primary w-full flex items-center justify-center gap-2 text-xs"
          >
            <Crosshair size={14} />
            Accept Contract
          </button>
        )}
        {bounty.status === 'claimed' && (
          <button
            onClick={() => onViewProof(bounty)}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-xs"
          >
            <AlertTriangle size={14} />
            Submit Proof
          </button>
        )}
        {bounty.status === 'disputed' && (
          <div className="flex items-center justify-center gap-2 text-xs text-disputed py-2.5">
            <AlertTriangle size={14} />
            Under Review
          </div>
        )}
      </div>

      {/* Posted by */}
      <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-parchment-dark/30 flex items-center gap-1.5 relative z-10">
        <span>Contract by</span>
        <span className={isAlliance ? 'text-horde-glow/60' : 'text-alliance-glow/60'}>
          {bounty.poster.name}
        </span>
        <span>({bounty.poster.faction})</span>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const config = {
    active: { class: 'status-active', label: 'Active', icon: <span className="animate-pulse">●</span> },
    claimed: { class: 'status-claimed', label: 'Claimed', icon: null },
    disputed: { class: 'status-disputed', label: 'Disputed', icon: <AlertTriangle size={10} /> },
  };

  const c = config[status] || config.active;

  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.class}`}>
      {c.icon}
      {c.label}
    </div>
  );
}
