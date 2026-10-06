import { motion } from 'framer-motion';
import { Skull, Target, Crown, Coins, Users, TrendingUp, Shield } from 'lucide-react';
import FactionCrest from './FactionCrest';
import { formatGold } from '../utils/api';

export default function HeroSection({ stats, onPostBounty, onOpenGithub, onOpenAddon }) {
  return (
    <header className="relative overflow-hidden">
      {/* Deep background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-deep via-charcoal to-charcoal-deep" />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Faction gradient overlays */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-alliance/10 to-transparent" />
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-horde/10 to-transparent" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Main title area */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <FactionCrest faction="Alliance" size="lg" />
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Skull className="text-gold" size={20} />
                <span className="text-gold/70 text-xs font-semibold tracking-[0.3em] uppercase font-cinzel">
                  Classic+ Contract System
                </span>
                <Skull className="text-gold" size={20} />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cinzel-decorative font-bold tracking-wide">
                <span className="bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent drop-shadow-lg">
                  Bounty Board
                </span>
              </h1>
            </div>
            <FactionCrest faction="Horde" size="lg" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-parchment-dark/80 text-lg sm:text-xl font-cinzel italic mb-8"
          >
            Settle Scores. Collect the Gold.
          </motion.p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPostBounty}
              className="btn-primary text-base px-8 py-3 flex items-center gap-2"
            >
              <Target size={18} />
              Post a Bounty Contract
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAddon}
              className="btn-secondary text-base px-6 py-3 flex items-center gap-2"
            >
              <Shield size={18} className="text-gold" />
              In-Game WoW Addon
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenGithub}
              className="btn-secondary text-base px-6 py-3 flex items-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub Suite
            </motion.button>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          <StatCard
            icon={<Coins className="text-gold" size={22} />}
            label="Gold in Escrow"
            value={`${formatGold(stats.totalGoldEscrow)}g`}
            accent="gold"
          />
          <StatCard
            icon={<Target className="text-active" size={22} />}
            label="Active Bounties"
            value={stats.activeBounties}
            accent="green"
          />
          <StatCard
            icon={<TrendingUp className="text-alliance-light" size={22} />}
            label="Completed Today"
            value={stats.completedToday}
            accent="blue"
          />
          <StatCard
            icon={<Users className="text-horde-light" size={22} />}
            label="Active Hunters"
            value={stats.totalHunters}
            accent="red"
          />
        </motion.div>

        {/* Most Wanted Banner */}
        {stats.mostWanted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 max-w-2xl mx-auto"
          >
            <div className="glass rounded-xl p-4 flex items-center gap-4 border border-orange-500/30"
                 style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.15)' }}>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center animate-pulse-glow">
                  <Crown className="text-yellow-300" size={24} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-orange-400 text-xs font-bold tracking-[0.2em] uppercase font-cinzel">
                    Most Wanted
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FactionCrest faction={stats.mostWanted.faction} size="sm" />
                  <span className="text-parchment font-bold text-lg font-cinzel truncate">
                    {stats.mostWanted.name}
                  </span>
                  <span className="text-parchment-dark/60 text-sm">
                    {stats.mostWanted.realm}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-gold font-bold text-xl font-cinzel">
                  {formatGold(stats.mostWanted.totalGold)}g
                </div>
                <div className="text-orange-400/70 text-xs">
                  {stats.mostWanted.bountyCount} contracts
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom divider */}
      <div className="divider-gold" />
    </header>
  );
}

function StatCard({ icon, label, value, accent }) {
  const accentBorders = {
    gold: 'border-gold/20 hover:border-gold/40',
    green: 'border-active/20 hover:border-active/40',
    blue: 'border-alliance-light/20 hover:border-alliance-light/40',
    red: 'border-horde-light/20 hover:border-horde-light/40',
  };

  return (
    <div className={`glass-dark rounded-xl p-4 border ${accentBorders[accent]} transition-all duration-300 hover:translate-y-[-2px]`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-parchment-dark/50 text-xs uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold font-cinzel text-parchment">
        {value}
      </div>
    </div>
  );
}
