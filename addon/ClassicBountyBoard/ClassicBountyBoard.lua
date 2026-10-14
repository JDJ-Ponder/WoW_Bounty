-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- Main Core & Event Handler - Optimized for WoW Forever / Classic+
-- Ultra-lightweight event filtering, memory-conscious data retention
-- ============================================================================

local addonName, CBB = ...
_G["ClassicBountyBoard"] = CBB

CBB.version = "1.3.0"
CBB.defaults = {
    escrowBanker = "BountyEscrow",
    autoTargetCapture = true,
    soundAlerts = true,
    hudEnabled = true,
    hudPoint = {"TOP", "UIParent", "TOP", 0, -50},
    mainFramePoint = {"CENTER", "UIParent", "CENTER", 0, 0},
    bounties = {},
    pendingEscrow = {},
    verifiedEscrow = {},
    sightings = {},
    activityLog = {},
}

-- Fast lookup table for O(1) target bounty detection
CBB.bountyCache = {}

function CBB.RebuildBountyCache()
    table.wipe(CBB.bountyCache)
    if not CBB.db or not CBB.db.bounties then return end
    for _, bounty in ipairs(CBB.db.bounties) do
        if bounty.target and (bounty.status == "VERIFIED_IN_ESCROW" or bounty.status == "ACTIVE") then
            CBB.bountyCache[string.lower(bounty.target)] = bounty
        end
    end
end

local frame = CreateFrame("Frame", "ClassicBountyBoardEventFrame")
frame:RegisterEvent("ADDON_LOADED")
frame:RegisterEvent("PLAYER_LOGIN")
frame:RegisterEvent("PLAYER_TARGET_CHANGED")
frame:RegisterEvent("COMBAT_LOG_EVENT_UNFILTERED")

local function InitDB()
    if not ClassicBountyBoardDB then
        ClassicBountyBoardDB = CopyTable(CBB.defaults)
    else
        for k, v in pairs(CBB.defaults) do
            if ClassicBountyBoardDB[k] == nil then
                ClassicBountyBoardDB[k] = v
            end
        end
    end
    CBB.db = ClassicBountyBoardDB
    CBB.RebuildBountyCache()
end

function CBB.Print(msg)
    DEFAULT_CHAT_FRAME:AddMessage("|cffffd700[BountyBoard]|r " .. tostring(msg))
end

-- Slash Commands
SLASH_CLASSICBOUNTYBOARD1 = "/bounty"
SLASH_CLASSICBOUNTYBOARD2 = "/bb"
SlashCmdList["CLASSICBOUNTYBOARD"] = function(msg)
    local cmd, arg = strsplit(" ", msg or "")
    cmd = string.lower(cmd or "")
    
    if cmd == "post" then
        if CBB.UI and CBB.UI.ToggleMainFrame then
            CBB.UI.ToggleMainFrame(true)
            CBB.UI.SetTab("post")
            CBB.UI.CaptureTarget()
        end
    elseif cmd == "hud" then
        if CBB.UI and CBB.UI.hudFrame then
            CBB.db.hudEnabled = not CBB.db.hudEnabled
            if CBB.db.hudEnabled then
                CBB.UI.CheckTargetBounty()
                CBB.Print("Bounty HUD widget: |cff22c55eEnabled|r")
            else
                CBB.UI.hudFrame:Hide()
                CBB.Print("Bounty HUD widget: |cffff4444Disabled|r")
            end
        end
    elseif cmd == "list" then
        if CBB.UI and CBB.UI.ToggleMainFrame then
            CBB.UI.ToggleMainFrame(true)
            CBB.UI.SetTab("list")
        end
    elseif cmd == "map" then
        if CBB.UI and CBB.UI.UpdateMapPin then
            CBB.UI.UpdateMapPin(true)
            CBB.Print("Refreshed bounty hunter map pins.")
        end
    elseif cmd == "target" then
        CBB.UI.CaptureTarget()
        CBB.Print("Captured target: " .. (CBB.currentTarget and CBB.currentTarget.name or "None"))
    elseif cmd == "sync" then
        CBB.SyncData()
    else
        CBB.Print("Commands:")
        CBB.Print("  /bb - Toggle Bounty Board UI")
        CBB.Print("  /bb post - Open posting form with current target")
        CBB.Print("  /bb hud - Toggle lightweight floating Target HUD")
        CBB.Print("  /bb list - View active contracts & escrow status")
        CBB.Print("  /bb map - Refresh World Map pins for sighted bounties")
        CBB.Print("  /bb sync - Refresh SavedVariables export")
    end
end

frame:SetScript("OnEvent", function(self, event, ...)
    if event == "ADDON_LOADED" then
        local loadedAddon = ...
        if loadedAddon == addonName then
            InitDB()
            CBB.Print("Loaded v" .. CBB.version .. " (P2P Mesh + Map Tracking). Type |cffffd700/bb|r to open.")
        end
    elseif event == "PLAYER_LOGIN" then
        if CBB.InitUI then
            CBB.InitUI()
        end
        if CBB.InitEscrow then
            CBB.InitEscrow()
        end
        if CBB.Network and CBB.Network.Init then
            CBB.Network.Init()
        end

        -- Seed starter sample bounties if DB is completely fresh
        if #CBB.db.bounties == 0 then
            table.insert(CBB.db.bounties, {
                id = "IGB-DEMO-01",
                poster = "HighOverlord",
                target = "Gankstr",
                targetRealm = GetRealmName(),
                targetFaction = (UnitFactionGroup("player") == "Alliance") and "Horde" or "Alliance",
                reward = 120,
                reason = "Camped Redridge Flight Master",
                status = "VERIFIED_IN_ESCROW",
                verified = true,
                createdAt = time()
            })
            table.insert(CBB.db.bounties, {
                id = "IGB-DEMO-02",
                poster = "IronforgeGuard",
                target = "Shadowrogue",
                targetRealm = GetRealmName(),
                targetFaction = (UnitFactionGroup("player") == "Alliance") and "Horde" or "Alliance",
                reward = 250,
                reason = "Ganking lowbies in Southshore",
                status = "VERIFIED_IN_ESCROW",
                verified = true,
                createdAt = time()
            })
            CBB.RebuildBountyCache()
        end
    elseif event == "PLAYER_TARGET_CHANGED" then
        if CBB.UI then
            if CBB.UI.frame and CBB.UI.frame:IsShown() then
                CBB.UI.CaptureTarget()
            end
            if CBB.UI.CheckTargetBounty then
                CBB.UI.CheckTargetBounty()
            end
        end
    elseif event == "COMBAT_LOG_EVENT_UNFILTERED" then
        if CBB.OnCombatLogEvent then
            CBB.OnCombatLogEvent(CombatLogGetCurrentEventInfo())
        end
    end
end)

-- Legacy bridge sync generator
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
        sightings = ClassicBountyBoardDB.sightings or {},
    }
    ClassicBountyBoardDB.lastSyncExport = exportTable
    CBB.Print("Sync data exported to SavedVariables for Web Companion.")
end
