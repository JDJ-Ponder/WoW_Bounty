-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- Sync Data Generator
-- ============================================================================

local addonName, CBB = ...

function CBB.SyncData()
    if not ClassicBountyBoardDB then return end

    local exportTable = {
        addon = "ClassicBountyBoard",
        version = CBB.version,
        realm = GetRealmName(),
        player = UnitName("player"),
        faction = UnitFactionGroup("player"),
        timestamp = time(),
        bounties = ClassicBountyBoardDB.bounties or {},
        pendingEscrow = ClassicBountyBoardDB.pendingEscrow or {},
        verifiedEscrow = ClassicBountyBoardDB.verifiedEscrow or {},
    }

    ClassicBountyBoardDB.lastSyncExport = exportTable
    CBB.Print("Sync data exported to SavedVariables.")
    CBB.Print("Run the web companion app to sync bounties with the web board!")
end
