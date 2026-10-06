-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- Main Core & Event Handler
-- ============================================================================

local addonName, CBB = ...
_G["ClassicBountyBoard"] = CBB

CBB.version = "1.0.0"
CBB.defaults = {
    escrowBanker = "BountyEscrow",
    autoTargetCapture = true,
    soundAlerts = true,
    bounties = {},
    pendingEscrow = {},
    verifiedEscrow = {},
    activityLog = {},
}

local frame = CreateFrame("Frame", "ClassicBountyBoardEventFrame")
frame:RegisterEvent("ADDON_LOADED")
frame:RegisterEvent("PLAYER_LOGIN")
frame:RegisterEvent("PLAYER_TARGET_CHANGED")
frame:RegisterEvent("COMBAT_LOG_EVENT_UNFILTERED")

local function InitDB()
    if not ClassicBountyBoardDB then
        ClassicBountyBoardDB = CBB.defaults
    else
        for k, v in pairs(CBB.defaults) do
            if ClassicBountyBoardDB[k] == nil then
                ClassicBountyBoardDB[k] = v
            end
        end
    end
    CBB.db = ClassicBountyBoardDB
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
        if CBB.UI and CBB.UI.frame then
            CBB.UI.frame:Show()
            CBB.UI.CaptureTarget()
        end
    elseif cmd == "list" then
        if CBB.UI and CBB.UI.frame then
            CBB.UI.frame:Show()
        end
    elseif cmd == "target" then
        CBB.UI.CaptureTarget()
        CBB.Print("Captured target: " .. (CBB.currentTarget and CBB.currentTarget.name or "None"))
    elseif cmd == "sync" then
        CBB.SyncData()
    else
        CBB.Print("Commands:")
        CBB.Print("  /bounty - Open Bounty Board UI")
        CBB.Print("  /bounty post - Post a bounty on current target")
        CBB.Print("  /bounty sync - Trigger manual sync string generation")
    end
end

frame:SetScript("OnEvent", function(self, event, ...)
    if event == "ADDON_LOADED" then
        local loadedAddon = ...
        if loadedAddon == addonName then
            InitDB()
            CBB.Print("Loaded v" .. CBB.version .. ". Type /bounty to open.")
        end
    elseif event == "PLAYER_LOGIN" then
        if CBB.InitUI then
            CBB.InitUI()
        end
        if CBB.InitEscrow then
            CBB.InitEscrow()
        end
    elseif event == "PLAYER_TARGET_CHANGED" then
        if CBB.UI and CBB.UI.frame and CBB.UI.frame:IsShown() then
            CBB.UI.CaptureTarget()
        end
    elseif event == "COMBAT_LOG_EVENT_UNFILTERED" then
        if CBB.OnCombatLogEvent then
            CBB.OnCombatLogEvent(CombatLogGetCurrentEventInfo())
        end
    end
end)
