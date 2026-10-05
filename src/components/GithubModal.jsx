import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitBranch, GitPullRequest, Copy, Check, Download, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export default function GithubModal({ isOpen, onClose, bounties }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [gistStatus, setGistStatus] = useState('');
  const [selectedBountyId, setSelectedBountyId] = useState(bounties?.[0]?.id || null);

  if (!isOpen) return null;

  const currentBounty = bounties.find((b) => b.id === selectedBountyId) || bounties[0];

  const generateMarkdownIssue = (bounty) => {
    if (!bounty) return '';
    return `### ⚔️ WoW Bounty Contract: ${bounty.target.name} (${bounty.target.faction})

**Target Details:**
- **Character:** \`${bounty.target.name}\`
- **Faction:** ${bounty.target.faction === 'Alliance' ? '🟦 Alliance' : '🟥 Horde'}
- **Class:** ${bounty.target.className} (Level ${bounty.target.level})
- **Realm:** ${bounty.target.realm}
- **Location:** ${bounty.target.location}

**Reward & Escrow:**
- **Bounty Value:** 💰 **${bounty.reward.gold} Gold**
- **Contract Poster:** \`${bounty.poster.name}\`
- **Status:** \`${bounty.status.toUpperCase()}\`

---
*Generated automatically via [WoW_Bounty App](https://github.com/JDJ-Ponder/WoW_Bounty)*`;
  };

  const handleCopyMarkdown = (bounty, index) => {
    const md = generateMarkdownIssue(bounty);
    navigator.clipboard.writeText(md);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bounties, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wow_bounties_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setGistStatus('Bounties exported successfully!');
    setTimeout(() => setGistStatus(''), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="glass-dark rounded-2xl border border-gold/30 w-full max-w-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gold/20 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/30 text-gold">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-cinzel font-bold text-parchment flex items-center gap-2">
                  GitHub Open-Source Suite
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">v1.0</span>
                </h3>
                <p className="text-xs text-parchment-dark/60">
                  Export bounties, sync GitHub Issues, and access community repository features.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-parchment-dark/60 hover:text-parchment rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass p-4 rounded-xl border border-gold/20 space-y-2">
                <div className="flex items-center gap-2 text-gold font-cinzel font-bold">
                  <Download size={18} />
                  <span>Backup & Export JSON</span>
                </div>
                <p className="text-xs text-parchment-dark/70">
                  Export all active bounty contracts as a structured JSON file for local backup or custom API import.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="btn-secondary text-xs w-full py-2 flex items-center justify-center gap-2 mt-2"
                >
                  <Download size={14} />
                  Export Bounties JSON
                </button>
              </div>

              <div className="glass p-4 rounded-xl border border-gold/20 space-y-2">
                <div className="flex items-center gap-2 text-alliance-light font-cinzel font-bold">
                  <GitBranch size={18} />
                  <span>GitHub Repository</span>
                </div>
                <p className="text-xs text-parchment-dark/70">
                  View full source code, open issues, and submit pull requests to <code className="text-gold font-mono">WoW_Bounty</code>.
                </p>
                <a
                  href="https://github.com/JDJ-Ponder/WoW_Bounty"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-2 mt-2 text-center"
                >
                  <ExternalLink size={14} />
                  Visit GitHub Repository
                </a>
              </div>
            </div>

            {/* Markdown Issue Format Generator */}
            <div className="glass-dark p-5 rounded-xl border border-gold/20 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-cinzel font-bold text-parchment flex items-center gap-2">
                  <GitPullRequest size={16} className="text-gold" />
                  GitHub Issue Contract Generator
                </h4>
                <span className="text-xs text-parchment-dark/50">Convert contract to GFM Issue</span>
              </div>

              {/* Bounty selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {bounties.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBountyId(b.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-cinzel whitespace-nowrap transition-all border ${
                      (selectedBountyId || bounties[0]?.id) === b.id
                        ? 'bg-gold/20 border-gold text-gold font-bold'
                        : 'bg-black/30 border-white/10 text-parchment-dark/60 hover:border-gold/40'
                    }`}
                  >
                    {b.target.name} ({b.reward.gold}g)
                  </button>
                ))}
              </div>

              {/* Code Preview */}
              {currentBounty && (
                <div className="relative">
                  <pre className="bg-black/70 p-4 rounded-xl text-xs font-mono text-parchment-dark/90 overflow-x-auto border border-white/10 max-h-48 leading-relaxed">
                    {generateMarkdownIssue(currentBounty)}
                  </pre>
                  <button
                    onClick={() => handleCopyMarkdown(currentBounty, 999)}
                    className="absolute top-3 right-3 btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-lg"
                  >
                    {copiedIndex === 999 ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* GitHub CI/CD Info */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-parchment-dark/70">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-400" />
                <span>Automated CI/CD Workflows configured for <strong>GitHub Actions</strong></span>
              </div>
              <div className="flex items-center gap-1 text-gold font-mono text-[11px]">
                <Sparkles size={12} />
                <span>main branch</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
