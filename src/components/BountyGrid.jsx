import { Scroll } from 'lucide-react';
import BountyCard from './BountyCard';

export default function BountyGrid({ bounties, onAccept, onViewProof }) {
  if (bounties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Scroll size={48} className="text-gold/20 mb-4" />
        <h3 className="text-xl font-cinzel text-parchment-dark/50 mb-2">
          No Contracts Found
        </h3>
        <p className="text-sm text-parchment-dark/30 max-w-md">
          Adjust your filters or post a new bounty to populate the board. 
          The wilds of Azeroth are quiet... for now.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {bounties.map((bounty, index) => (
        <BountyCard
          key={bounty.id}
          bounty={bounty}
          index={index}
          onAccept={onAccept}
          onViewProof={onViewProof}
        />
      ))}
    </div>
  );
}
