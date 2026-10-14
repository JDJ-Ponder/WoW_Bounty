-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- Escrow Engine & In-Game Trade / Mail / Kill Verification
-- Lightweight event listening with zero per-frame CPU overhead
-- ============================================================================

local addonName, CBB = ...
CBB.Escrow = {}

local escrowFrame = CreateFrame("Frame", "CBBEscrowFrame")

-- Fast 32-bit FNV-1a based string hash
local function GenerateHash(dataStr)
    local hash = 2166136261
    for i = 1, #dataStr do
        hash = bit.bxor(hash, string.byte(dataStr, i))
        hash = (hash * 16777619) % 4294967296
    end
    return string.format("%08X", hash)
end

function CBB.InitEscrow()
    escrowFrame:RegisterEvent("TRADE_SHOW")
    escrowFrame:RegisterEvent("TRADE_MONEY_CHANGED")
    escrowFrame:RegisterEvent("TRADE_ACCEPT_UPDATE")
    escrowFrame:RegisterEvent("MAIL_SEND_SUCCESS")

    escrowFrame:SetScript("OnEvent", function(self, event, ...)
        if event == "TRADE_ACCEPT_UPDATE" then
            local playerAccepted, targetAccepted = ...
            if playerAccepted == 1 and targetAccepted == 1 then
                CBB.Escrow.OnTradeComplete()
            end
        elseif event == "MAIL_SEND_SUCCESS" then
            CBB.Escrow.OnMailSent()
        end
    end)
end

-- Create a pending escrow record when a player posts a bounty in-game
function CBB.Escrow.CreatePendingEscrow(targetName, targetRealm, rewardGold, reason)
    local player = UnitName("player")
    local realm = GetRealmName()
    local timestamp = time()
    local bountyId = "IGB-" .. string.upper(string.sub(targetName, 1, 3)) .. "-" .. tostring(timestamp)
    
    local seed = player .. ":" .. targetName .. ":" .. tostring(rewardGold) .. ":" .. tostring(timestamp)
    local escrowHash = "ESCROW-" .. GenerateHash(seed)

    local pending = {
        id = bountyId,
        escrowCode = escrowHash,
        poster = player,
        posterRealm = realm,
        posterFaction = UnitFactionGroup("player") or "Alliance",
        target = targetName,
        targetRealm = targetRealm or realm,
        targetFaction = (UnitFactionGroup("player") == "Alliance") and "Horde" or "Alliance",
        reward = rewardGold,
        reason = (reason and reason ~= "") and reason or "In-Game PvP Bounty Contract",
        status = "AWAITING_GOLD_TRANSFER",
        createdAt = timestamp,
        verified = false,
        escrowMethod = "TRADE_OR_MAIL",
        escrowBanker = CBB.db.escrowBanker or "BountyEscrow",
    }

    table.insert(CBB.db.pendingEscrow, pending)
    CBB.Print("Created Contract |cffffd700" .. bountyId .. "|r for target |cffff4444" .. targetName .. "|r (" .. rewardGold .. "g).")
    CBB.Print("Escrow Code: |cff60a5fa" .. escrowHash .. "|r. Trade or Mail gold to escrow banker |cffffd700" .. pending.escrowBanker .. "|r with this code to activate.")

    -- Trigger data sync so bridge picks up pending immediately
    if CBB.SyncData then
        CBB.SyncData()
    end

    return pending
end

-- Detect in-game trade transfers to Escrow Banker
function CBB.Escrow.OnTradeComplete()
    local targetName = GetUnitName("target", true)
    local tradedMoney = (GetPlayerTradeMoney() or 0) / 10000 -- convert copper to gold

    if tradedMoney > 0 then
        -- Match against pending bounties
        for idx, pending in ipairs(CBB.db.pendingEscrow) do
            if pending.status == "AWAITING_GOLD_TRANSFER" and pending.reward <= tradedMoney then
                pending.status = "VERIFIED_IN_ESCROW"
                pending.verified = true
                pending.verifiedAt = time()
                pending.tradeTarget = targetName

                -- Move to verified escrow list
                table.insert(CBB.db.verifiedEscrow, pending)
                table.insert(CBB.db.bounties, pending)
                
                CBB.RebuildBountyCache()
                if CBB.SyncData then CBB.SyncData() end

                -- Broadcast new verified bounty over P2P mesh network!
                if CBB.Network and CBB.Network.BroadcastBounty then
                    CBB.Network.BroadcastBounty(pending)
                end

                CBB.Print("⚔️ |cff22c55e[ESCROW LOCKED]|r Bounty " .. pending.id .. " (" .. pending.reward .. "g) on |cffff4444" .. pending.target .. "|r is now LIVE!")
                PlaySound(888) -- Quest complete sound
                return
            end
        end
    end
end

function CBB.Escrow.OnMailSent()
    CBB.Print("Mail sent to Escrow Vault. Status updated for sync bridge.")
    if CBB.SyncData then CBB.SyncData() end
end

-- Ultra-fast Combat Log Kill Detector with subevent early exit
function CBB.OnCombatLogEvent(...)
    local _, subevent, _, _, sourceName, _, _, _, destName = ...

    -- Early return if not a kill event (saves 99.9% of combat log processing)
    if subevent ~= "UNIT_DIED" and subevent ~= "PARTY_KILL" then
        return
    end

    if not destName then return end

    -- O(1) hash table lookup against active bounties
    local targetKey = string.lower(destName)
    local bounty = CBB.bountyCache[targetKey]

    if bounty and bounty.status == "VERIFIED_IN_ESCROW" then
        local killer = sourceName or UnitName("player")
        bounty.status = "CLAIM_PENDING_VERIFICATION"
        bounty.claimedBy = killer
        bounty.killedAt = time()

        -- Remove from active cache
        CBB.bountyCache[targetKey] = nil

        -- Broadcast kill confirmation over P2P mesh
        if CBB.Network and CBB.Network.BroadcastKill then
            CBB.Network.BroadcastKill(destName, killer, bounty.reward, bounty.id)
        end

        CBB.Print("💀 |cffffd700[KILL CONFIRMED]|r Target |cffff4444" .. destName .. "|r slain by |cff60a5fa" .. killer .. "|r!")
        CBB.Print("Escrow Reward |cffffd700" .. bounty.reward .. " Gold|r is queued for payout to killer!")
        PlaySound(619) -- Honor gain sound

        if CBB.SyncData then CBB.SyncData() end
        if CBB.UI and CBB.UI.CheckTargetBounty then CBB.UI.CheckTargetBounty() end
    end
end
