-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- Main Core & Event Handler - Optimized for WoW Forever / Classic+
-- Ultra-lightweight event filtering, memory-conscious data retention
-- ============================================================================

local addonName, CBB = ...
_G["ClassicBountyBoard"] = CBB

CBB.version = "1.2.0"
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
    activityLog = {},
}

-- Fast lookup table for O(1) target bounty detection in combat log & targeting
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

-- Slash Commands: quick, non-intrusive toggles
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
        CBB.Print("  /bb sync - Refresh SavedVariables export for web companion")
    end
end

frame:SetScript("OnEvent", function(self, event, ...)
    if event == "ADDON_LOADED" then
        local loadedAddon = ...
        if loadedAddon == addonName then
            InitDB()
            CBB.Print("Loaded v" .. CBB.version .. ". Type |cffffd700/bb|r to open.")
        end
    elseif event == "PLAYER_LOGIN" then
        if CBB.InitUI then
            CBB.InitUI()
        end
        if CBB.InitEscrow then
            CBB.InitEscrow()
        end
        -- Auto-add a demo/starter contract if DB is fresh so the UI isn't bare
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
