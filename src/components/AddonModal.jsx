import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Download, RefreshCw, CheckCircle, Copy, Terminal, Coins, AlertCircle } from 'lucide-react';

export default function AddonModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('install');
  const [syncStatus, setSyncStatus] = useState(null);
  const [loadingSync, setLoadingSync] = useState(false);

  const checkSync = async () => {
    setLoadingSync(true);
    try {
      const res = await fetch('http://localhost:3001/api/sync/status');
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
      } else {
        setSyncStatus({ status: 'offline' });
      }
    } catch {
      setSyncStatus({ status: 'offline' });
    } finally {
      setLoadingSync(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkSync();
    }
  }, [isOpen]);

  const addonLuaSnippet = `-- ClassicBountyBoard.toc
## Title: Classic+ Bounty Board
## SavedVariables: ClassicBountyBoardDB

-- In-Game Slash Commands:
-- /bounty post - Open in-game target bounty dialog
-- /bounty sync - Export trade escrow logs`;

  const copySnippet = () => {
    navigator.clipboard.writeText(addonLuaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="modal-content w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center">
                  <Shield size={20} className="text-charcoal-deep" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-cinzel text-parchment">
                    In-Game WoW Companion Addon & Escrow
                  </h2>
                  <p className="text-[11px] text-parchment-dark/40">
                    World of Warcraft Forever Mod & Live In-Game Escrow Verification
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X size={18} className="text-parchment-dark/50" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 px-5 bg-charcoal-deep/40">
              <button
                onClick={() => setActiveTab('install')}
                className={`py-3 px-4 text-xs font-semibold font-cinzel border-b-2 transition-all ${
                  activeTab === 'install'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-parchment-dark/50 hover:text-parchment-dark'
                }`}
              >
                1. Addon Installation
              </button>
              <button
                onClick={() => setActiveTab('escrow')}
                className={`py-3 px-4 text-xs font-semibold font-cinzel border-b-2 transition-all ${
                  activeTab === 'escrow'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-parchment-dark/50 hover:text-parchment-dark'
                }`}
              >
                2. In-Game Gold Escrow System
              </button>
              <button
                onClick={() => setActiveTab('bridge')}
                className={`py-3 px-4 text-xs font-semibold font-cinzel border-b-2 transition-all ${
                  activeTab === 'bridge'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-parchment-dark/50 hover:text-parchment-dark'
                }`}
              >
                3. Live Companion Sync
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'install' && (
                <div className="space-y-4">
                  <div className="glass-dark p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider font-cinzel flex items-center gap-2">
                      <Download size={14} /> Addon Location
                    </h4>
                    <p className="text-xs text-parchment-dark/70 leading-relaxed">
                      Copy the <code className="text-gold font-mono bg-black/40 px-1.5 py-0.5 rounded">addon/ClassicBountyBoard</code> directory into your World of Warcraft client installation folder:
                    </p>
                    <div className="p-2.5 rounded bg-black/60 font-mono text-[11px] text-green-400 select-all border border-white/5">
                      World of Warcraft/_classic_/Interface/AddOns/ClassicBountyBoard/
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-parchment-dark/60 font-cinzel font-bold">
                        Addon Commands:
                      </span>
                      <button
                        onClick={copySnippet}
                        className="text-[11px] text-gold flex items-center gap-1 hover:underline"
                      >
                        {copied ? <CheckCircle size={12} className="text-active" /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy Overview'}
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-black/70 font-mono text-[11px] text-parchment-dark/80 border border-white/5 whitespace-pre-wrap">
                      {addonLuaSnippet}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'escrow' && (
                <div className="space-y-4">
                  <div className="glass-dark p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-gold">
                      <Coins size={18} />
                      <h4 className="text-xs font-bold font-cinzel uppercase tracking-wider">
                        In-Game Gold Escrow Protocol
                      </h4>
                    </div>
                    <p className="text-xs text-parchment-dark/70 leading-relaxed">
                      To ensure bounties are backed by real gold in-game, the Addon includes an automated Escrow Verification Engine:
                    </p>
                    <ul className="text-xs text-parchment-dark/60 space-y-2 list-disc pl-4">
                      <li>
                        <strong className="text-parchment">Target Capture:</strong> Target any hostile player in-game, type <code className="text-gold">/bounty post</code>, and set your gold reward.
                      </li>
                      <li>
                        <strong className="text-parchment">Trade / Mail Escrow:</strong> Trade or mail gold to the designated Escrow Banker <code className="text-gold">"BountyEscrow"</code>. The Addon auto-generates a cryptographic hash <code className="text-blue-400">ESCROW-[ID]-[HASH]</code>.
                      </li>
                      <li>
                        <strong className="text-parchment">Combat Log Kill Verification:</strong> The addon listens to <code className="text-green-400">COMBAT_LOG_EVENT_UNFILTERED</code> for <code className="text-green-400">UNIT_DIED</code> events in PvP combat to automatically confirm kills!
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'bridge' && (
                <div className="space-y-4">
                  <div className="glass-dark p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Terminal size={20} className="text-gold" />
                      <div>
                        <div className="text-xs font-bold font-cinzel text-parchment">
                          Companion Bridge Daemon Status
                        </div>
                        <div className="text-[11px] text-parchment-dark/50">
                          {syncStatus?.status === 'online' ? (
                            <span className="text-active flex items-center gap-1">
                              <CheckCircle size={11} /> Companion Bridge Online (Port 3001)
                            </span>
                          ) : (
                            <span className="text-yellow-400 flex items-center gap-1">
                              <AlertCircle size={11} /> Companion Bridge Offline (Local Node daemon)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={checkSync}
                      disabled={loadingSync}
                      className="btn-secondary text-xs flex items-center gap-1.5"
                    >
                      <RefreshCw size={12} className={loadingSync ? 'animate-spin' : ''} />
                      {loadingSync ? 'Checking...' : 'Check Status'}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-white/5 text-xs text-parchment-dark/60 space-y-2">
                    <div className="font-bold text-parchment">Start local companion bridge:</div>
                    <div className="p-2 rounded bg-black font-mono text-[11px] text-gold">
                      node companion-bridge/sync.js
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-5 border-t border-white/5">
              <button onClick={onClose} className="btn-primary text-xs">
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
