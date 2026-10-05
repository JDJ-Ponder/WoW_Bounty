import { useState, useCallback, useMemo } from 'react';
import { MOCK_BOUNTIES, RECENT_ACTIVITY, BOARD_STATS } from '../data/mockData';

export function useBounties() {
  const [bounties, setBounties] = useState(MOCK_BOUNTIES);
  const [activity, setActivity] = useState(RECENT_ACTIVITY);
  const [stats, setStats] = useState(BOARD_STATS);
  const [filters, setFilters] = useState({
    faction: 'all',
    realm: 'all',
    status: 'all',
    minReward: 0,
    search: '',
  });

  const filteredBounties = useMemo(() => {
    return bounties.filter((b) => {
      if (filters.faction !== 'all' && b.target.faction.toLowerCase() !== filters.faction.toLowerCase()) return false;
      if (filters.realm !== 'all' && b.target.realm !== filters.realm) return false;
      if (filters.status !== 'all' && b.status !== filters.status) return false;
      if (b.reward < filters.minReward) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          b.target.name.toLowerCase().includes(q) ||
          b.target.guild?.toLowerCase().includes(q) ||
          b.reason.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bounties, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addBounty = useCallback((newBounty) => {
    const bounty = {
      ...newBounty,
      id: `b${Date.now()}`,
      status: 'active',
      escrowStatus: 'locked',
      postedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      claims: 0,
      priority: newBounty.reward >= 1000 ? 'legendary' : newBounty.reward >= 500 ? 'high' : 'medium',
    };

    setBounties((prev) => [bounty, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalGoldEscrow: prev.totalGoldEscrow + bounty.reward,
      activeBounties: prev.activeBounties + 1,
    }));
    setActivity((prev) => [
      {
        id: `a${Date.now()}`,
        type: 'posted',
        poster: bounty.poster.name,
        posterFaction: bounty.poster.faction,
        target: bounty.target.name,
        targetFaction: bounty.target.faction,
        reward: bounty.reward,
        realm: bounty.target.realm,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const claimBounty = useCallback((bountyId, claimedBy) => {
    setBounties((prev) =>
      prev.map((b) =>
        b.id === bountyId
          ? { ...b, status: 'claimed', escrowStatus: 'pending_release', claimedBy, claims: b.claims + 1 }
          : b
      )
    );
    const bounty = bounties.find((b) => b.id === bountyId);
    if (bounty) {
      setActivity((prev) => [
        {
          id: `a${Date.now()}`,
          type: 'claimed',
          hunter: claimedBy.name,
          hunterFaction: claimedBy.faction,
          target: bounty.target.name,
          targetFaction: bounty.target.faction,
          reward: bounty.reward,
          realm: bounty.target.realm,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  }, [bounties]);

  const submitProof = useCallback((bountyId, proofData) => {
    setBounties((prev) =>
      prev.map((b) =>
        b.id === bountyId
          ? { ...b, proof: proofData, escrowStatus: 'releasing' }
          : b
      )
    );
  }, []);

  return {
    bounties: filteredBounties,
    allBounties: bounties,
    activity,
    stats,
    filters,
    updateFilter,
    addBounty,
    claimBounty,
    submitProof,
  };
}
