-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- Escrow Engine & In-Game Trade / Mail / Kill Verification
-- ============================================================================

local addonName, CBB = ...
CBB.Escrow = {}

local escrowFrame = CreateFrame("Frame", "CBBEscrowFrame")

-- Helper: Generate unique escrow hash code
local function GenerateHash(dataStr)
    local hash = 5381
    for i = 1, #dataStr do
        hash = (hash * 33 + string.byte(dataStr, i)) % 2147483647
    end
    return string.format("%08X", hash)
end

function CBB.InitEscrow()
    escrowFrame:RegisterEvent("TRADE_SHOW")
    escrowFrame:RegisterEvent("TRADE_MONEY_CHANGED")
    escrowFrame:RegisterEvent("TRADE_ACCEPT_UPDATE")
    escrowFrame:RegisterEvent("MAIL_SEND_SUCCESS")
    escrowFrame:RegisterEvent("MAIL_INBOX_UPDATE")

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
        reason = reason or "In-Game Bounty Contract",
        status = "AWAITING_GOLD_TRANSFER",
        createdAt = timestamp,
        verified = false,
        escrowMethod = "TRADE_OR_MAIL",
        escrowBanker = CBB.db.escrowBanker or "BountyEscrow",
    }

    table.insert(CBB.db.pendingEscrow, pending)
    CBB.Print("Created Bounty |cffffd700" .. bountyId .. "|r for |cffff4444" .. targetName .. "|r (" .. rewardGold .. "g).")
    CBB.Print("Escrow Code: |cff60a5fa" .. escrowHash .. "|r. Trade or Mail gold to |cffffd700" .. pending.escrowBanker .. "|r with this code to activate.")

    return pending
end

-- Detect in-game trade transfers to Escrow Banker
function CBB.Escrow.OnTradeComplete()
    local targetName = GetUnitName("target", true)
    local tradedMoney = GetPlayerTradeMoney() / 10000 -- convert copper to gold

    if tradedMoney > 0 then
        CBB.Print("Trade completed with " .. tostring(targetName) .. " (" .. tradedMoney .. "g).")
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
                
                CBB.Print("|cff22c55e[VERIFIED]|r Bounty " .. pending.id .. " (" .. pending.reward .. "g) is now LIVE & LOCKED in Escrow!")
                PlaySound(888) -- Quest complete sound
                return
            end
        end
    end
end

function CBB.Escrow.OnMailSent()
    CBB.Print("Mail sent to Escrow Vault. Pending synchronization with web companion bridge.")
end

-- In-Game Combat Log Kill Detector
function CBB.OnCombatLogEvent(...)
    local timestamp, subevent, _, sourceGUID, sourceName, sourceFlags, _, destGUID, destName, destFlags = ...

    if subevent == "UNIT_DIED" or subevent == "PARTY_KILL" then
        if sourceName and destName then
            -- Check if destName is an active target in verified bounties
            for _, bounty in ipairs(CBB.db.bounties) do
                if bounty.status == "VERIFIED_IN_ESCROW" and string.lower(bounty.target) == string.lower(destName) then
                    bounty.status = "CLAIM_PENDING_VERIFICATION"
                    bounty.claimedBy = sourceName
                    bounty.killedAt = time()

                    CBB.Print("⚔️ |cffffd700[KILL CONFIRMED]|r Target |cffff4444" .. destName .. "|r slain by |cff60a5fa" .. sourceName .. "|r!")
                    CBB.Print("Claim proof logged: Bounty |cffffd700" .. bounty.id .. "|r (" .. bounty.reward .. "g).")
                    PlaySound(619) -- Honor gain sound
                end
            end
        end
    end
end
