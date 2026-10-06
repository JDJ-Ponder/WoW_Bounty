import { useState } from 'react';
import HeroSection from './components/HeroSection';
import LiveStatsTicker from './components/LiveStatsTicker';
import FilterBar from './components/FilterBar';
import BountyGrid from './components/BountyGrid';
import ActivityFeed from './components/ActivityFeed';
import PostBountyModal from './components/PostBountyModal';
import ClaimProofModal from './components/ClaimProofModal';
import GithubModal from './components/GithubModal';
import AddonModal from './components/AddonModal';
import { useBounties } from './hooks/useBounties';
import { Skull, GitBranch, Shield } from 'lucide-react';

export default function App() {
  const {
    bounties,
    activity,
    stats,
    filters,
    updateFilter,
    addBounty,
    claimBounty,
    submitProof,
  } = useBounties();

  const [showPostModal, setShowPostModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState(null);

  const handleAcceptBounty = (bounty) => {
    const hunterName = prompt('Enter your character name to accept this contract:');
    if (hunterName) {
      claimBounty(bounty.id, {
        name: hunterName,
        faction: bounty.target.faction === 'Alliance' ? 'Horde' : 'Alliance',
        realm: bounty.target.realm,
      });
    }
  };

  const handleViewProof = (bounty) => {
    setSelectedBounty(bounty);
    setShowProofModal(true);
  };

  const handleSubmitProof = (bountyId, proofData) => {
    submitProof(bountyId, proofData);
  };

  return (
    <div className="min-h-screen parchment-bg">
      {/* Hero Section */}
      <HeroSection 
        stats={stats} 
        onPostBounty={() => setShowPostModal(true)} 
        onOpenGithub={() => setShowGithubModal(true)}
        onOpenAddon={() => setShowAddonModal(true)}
      />

      {/* Live Stats Ticker */}
      <LiveStatsTicker activity={activity} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="divider-gold flex-1" />
          <h2 className="text-lg font-cinzel font-bold text-gold/80 tracking-wider uppercase whitespace-nowrap flex items-center gap-2">
            <Skull size={18} className="text-gold/50" />
            Active Contracts
            <Skull size={18} className="text-gold/50" />
          </h2>
          <div className="divider-gold flex-1" />
        </div>

        {/* Content layout */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            <FilterBar
              filters={filters}
              onFilterChange={updateFilter}
              totalResults={bounties.length}
            />
            <BountyGrid
              bounties={bounties}
              onAccept={handleAcceptBounty}
              onViewProof={handleViewProof}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <ActivityFeed activity={activity} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Skull size={16} className="text-gold/30" />
                <span className="text-sm font-cinzel text-parchment-dark/30">
                  Classic+ Bounty Board
                </span>
              </div>
              <button
                onClick={() => setShowAddonModal(true)}
                className="text-xs text-gold/60 hover:text-gold flex items-center gap-1.5 transition-colors bg-gold/5 hover:bg-gold/10 px-2.5 py-1 rounded-lg border border-gold/20"
              >
                <Shield size={12} />
                <span>In-Game WoW Addon</span>
              </button>
              <button
                onClick={() => setShowGithubModal(true)}
                className="text-xs text-gold/60 hover:text-gold flex items-center gap-1.5 transition-colors bg-gold/5 hover:bg-gold/10 px-2.5 py-1 rounded-lg border border-gold/20"
              >
                <GitBranch size={12} />
                <span>GitHub Suite</span>
              </button>
            </div>
            <p className="text-[11px] text-parchment-dark/20 text-center sm:text-right max-w-md">
              Fan project. Not affiliated with Blizzard Entertainment. 
              World of Warcraft® and related marks are trademarks of Blizzard Entertainment, Inc.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PostBountyModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={addBounty}
      />
      <ClaimProofModal
        isOpen={showProofModal}
        onClose={() => { setShowProofModal(false); setSelectedBounty(null); }}
        bounty={selectedBounty}
        onSubmitProof={handleSubmitProof}
      />
      <GithubModal
        isOpen={showGithubModal}
        onClose={() => setShowGithubModal(false)}
        bounties={bounties}
      />
      <AddonModal
        isOpen={showAddonModal}
        onClose={() => setShowAddonModal(false)}
      />
    </div>
  );
}

