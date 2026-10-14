-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- P2P Mesh Synchronization & In-Game Network Protocol
-- Transmits active bounties, escrow updates, and sightings across players
-- ============================================================================

local addonName, CBB = ...
CBB.Network = {}

local MSG_PREFIX = "CBB_P2P"
local CHANNEL_NAME = "BountyNet"

-- Register Addon Message Prefix
function CBB.Network.Init()
    C_ChatInfo.RegisterAddonMessagePrefix(MSG_PREFIX)

    local netFrame = CreateFrame("Frame", "CBBNetworkFrame")
    netFrame:RegisterEvent("CHAT_MSG_ADDON")
    netFrame:RegisterEvent("ZONE_CHANGED_NEW_AREA")
    netFrame:RegisterEvent("PLAYER_ENTERING_WORLD")

    netFrame:SetScript("OnEvent", function(self, event, ...)
        if event == "CHAT_MSG_ADDON" then
            local prefix, message, channel, sender = ...
            if prefix == MSG_PREFIX then
                CBB.Network.OnReceive(message, channel, sender)
            end
        elseif event == "PLAYER_ENTERING_WORLD" then
            -- Join global BountyNet channel silently for cross-zone mesh
            JoinChannelByName(CHANNEL_NAME)
        end
    end)
end

-- Serialization helper: simple delimiter format to avoid heavy JSON libraries
-- Format: TYPE|payload1|payload2|...
function CBB.Network.Broadcast(msgType, ...)
    local args = {...}
    local payload = msgType .. "|" .. table.concat(args, "|")

    -- Broadcast to Guild, Raid/Party, and General if available
    if IsInRaid() then
        C_ChatInfo.SendAddonMessage(MSG_PREFIX, payload, "RAID")
    elseif IsInGroup() then
        C_ChatInfo.SendAddonMessage(MSG_PREFIX, payload, "PARTY")
    end

    if IsInGuild() then
        C_ChatInfo.SendAddonMessage(MSG_PREFIX, payload, "GUILD")
    end

    -- Broadcast to BountyNet custom channel
    local chanId = GetChannelName(CHANNEL_NAME)
    if chanId and chanId > 0 then
        C_ChatInfo.SendAddonMessage(MSG_PREFIX, payload, "CHANNEL", chanId)
    end
end

-- Broadcast when a player sights a wanted bounty target in the world
function CBB.Network.BroadcastSighting(targetName, zoneName, x, y, reward)
    CBB.Network.Broadcast("SIGHTING", targetName, zoneName or "", string.format("%.1f", x or 0), string.format("%.1f", y or 0), tostring(reward or 0), tostring(time()))
end

-- Broadcast when an escrow bounty is locked or created
function CBB.Network.BroadcastBounty(bounty)
    CBB.Network.Broadcast("NEW_BOUNTY", bounty.id, bounty.target, bounty.reward, bounty.reason or "", bounty.poster or "", bounty.status or "VERIFIED_IN_ESCROW")
end

-- Broadcast when a kill is confirmed
function CBB.Network.BroadcastKill(targetName, killerName, reward, bountyId)
    CBB.Network.Broadcast("KILL_CONFIRMED", targetName, killerName, tostring(reward), bountyId or "")
end

-- Parse and handle incoming P2P mesh messages
function CBB.Network.OnReceive(message, channel, sender)
    local myName = UnitName("player")
    if sender == myName or string.find(sender, "^" .. myName .. "-") then
        return -- Ignore own broadcast echo
    end

    local parts = { strsplit("|", message) }
    local msgType = parts[1]

    if msgType == "SIGHTING" then
        local targetName = parts[2]
        local zone = parts[3]
        local x = tonumber(parts[4]) or 0
        local y = tonumber(parts[5]) or 0
        local reward = tonumber(parts[6]) or 0
        local timestamp = tonumber(parts[7]) or time()

        if targetName and zone then
            -- Save sighting in DB
            CBB.db.sightings = CBB.db.sightings or {}
            CBB.db.sightings[string.lower(targetName)] = {
                target = targetName,
                zone = zone,
                x = x,
                y = y,
                reward = reward,
                spottedBy = sender,
                timestamp = timestamp
            }

            CBB.Print("📡 |cffffd700[Sighting Ping]|r " .. sender .. " spotted wanted target |cffff4444" .. targetName .. "|r in |cff60a5fa" .. zone .. "|r (" .. x .. ", " .. y .. ")!")
            if CBB.UI and CBB.UI.UpdateMapPin then
                CBB.UI.UpdateMapPin()
            end
        end

    elseif msgType == "NEW_BOUNTY" then
        local bId = parts[2]
        local target = parts[3]
        local reward = tonumber(parts[4]) or 0
        local reason = parts[5]
        local poster = parts[6]
        local status = parts[7]

        -- Check if already have this bounty
        local found = false
        for _, b in ipairs(CBB.db.bounties) do
            if b.id == bId then found = true; break end
        end

        if not found and target and reward > 0 then
            local newB = {
                id = bId,
                target = target,
                reward = reward,
                reason = reason,
                poster = poster,
                status = status,
                verified = true,
                createdAt = time(),
                syncedFromPeer = sender
            }
            table.insert(CBB.db.bounties, newB)
            CBB.RebuildBountyCache()
            CBB.Print("📡 |cff22c55e[P2P Sync]|r Received new contract on |cffff4444" .. target .. "|r (" .. reward .. "g) from " .. sender)
        end

    elseif msgType == "KILL_CONFIRMED" then
        local targetName = parts[2]
        local killerName = parts[3]
        local reward = parts[4]
        local bId = parts[5]

        for _, b in ipairs(CBB.db.bounties) do
            if string.lower(b.target) == string.lower(targetName) then
                b.status = "CLAIM_PENDING_VERIFICATION"
                b.claimedBy = killerName
                b.killedAt = time()
                break
            end
        end
        CBB.bountyCache[string.lower(targetName)] = nil
        CBB.Print("💀 |cffffd700[Mesh Kill Alert]|r " .. targetName .. " was slain by " .. killerName .. " (" .. reward .. "g)! Claim recorded.")
    end
end
