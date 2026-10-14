-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- UI Renderer, Tooltip Hooks, World Map Hunter Pins & Sound Cues
-- ============================================================================

local addonName, CBB = ...
CBB.UI = {}

local lastSoundTime = 0
local lastSightingBroadcastTime = {}

function CBB.InitUI()
    if CBB.UI.initialized then return end
    CBB.UI.initialized = true

    -- ──────────────────────────────────────────────────────────────────────────
    -- 1. Native GameTooltip Hook
    -- Seamlessly appends a bounty contract badge to Blizzard's unit tooltip
    -- ──────────────────────────────────────────────────────────────────────────
    local function OnTooltipSetUnit(tooltip)
        local _, unit = tooltip:GetUnit()
        if unit and UnitIsPlayer(unit) then
            local name = UnitName(unit)
            if name then
                local bounty = CBB.bountyCache[string.lower(name)]
                if bounty then
                    tooltip:AddLine(" ")
                    tooltip:AddLine("💀 |cffff2020[WANTED - ESCROW BOUNTY]|r", 1, 0.2, 0.2)
                    tooltip:AddDoubleLine("|cffffd700Reward:|r " .. tostring(bounty.reward) .. " Gold", "|cff22c55e[Escrow Verified]|r", 1, 0.84, 0, 0.1, 1, 0.1)
                    if bounty.reason and bounty.reason ~= "" then
                        tooltip:AddLine("|cffaaaaaaReason: " .. bounty.reason .. "|r", 0.7, 0.7, 0.7, true)
                    end
                    tooltip:Show()
                end
            end
        end
    end

    if TooltipDataProcessor and TooltipDataProcessor.AddTooltipPostCall then
        TooltipDataProcessor.AddTooltipPostCall(Enum.TooltipDataType.Unit, function(tooltip, data)
            OnTooltipSetUnit(tooltip)
        end)
    else
        GameTooltip:HookScript("OnTooltipSetUnit", OnTooltipSetUnit)
    end

    -- ──────────────────────────────────────────────────────────────────────────
    -- 2. Mini Non-Intrusive Target HUD (Floating Widget)
    -- ──────────────────────────────────────────────────────────────────────────
    local hud = CreateFrame("Frame", "CBBTargetHUD", UIParent, "BackdropTemplate")
    hud:SetSize(220, 48)
    hud:SetPoint(unpack(CBB.db.hudPoint or {"TOP", "UIParent", "TOP", 0, -60}))
    hud:SetMovable(true)
    hud:EnableMouse(true)
    hud:RegisterForDrag("LeftButton")
    hud:SetScript("OnDragStart", hud.StartMoving)
    hud:SetScript("OnDragStop", function(self)
        self:StopMovingOrSizing()
        local point, relativeTo, relativePoint, xOfs, yOfs = self:GetPoint()
        CBB.db.hudPoint = {point, "UIParent", relativePoint, xOfs, yOfs}
    end)
    hud:SetBackdrop({
        bgFile = "Interface\\Buttons\\WHITE8X8",
        edgeFile = "Interface\\Tooltips\\UI-Tooltip-Border",
        tile = false, edgeSize = 12,
        insets = { left = 3, right = 3, top = 3, bottom = 3 }
    })
    hud:SetBackdropColor(0.06, 0.04, 0.1, 0.9)
    hud:SetBackdropBorderColor(1.0, 0.2, 0.2, 0.9)
    hud:Hide()

    local hudSkull = hud:CreateTexture(nil, "ARTWORK")
    hudSkull:SetSize(24, 24)
    hudSkull:SetPoint("LEFT", hud, "LEFT", 10, 0)
    hudSkull:SetTexture("Interface\\TargetingFrame\\UI-TargetingFrame-Skull")

    local hudTitle = hud:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
    hudTitle:SetPoint("TOPLEFT", hudSkull, "TOPRIGHT", 8, 2)
    hudTitle:SetText("|cffff2020WANTED TARGET|r")

    local hudReward = hud:CreateFontString(nil, "OVERLAY", "GameFontNormal")
    hudReward:SetPoint("BOTTOMLEFT", hudSkull, "BOTTOMRIGHT", 8, -2)
    hudReward:SetText("|cffffd70050 Gold Escrow|r")

    hud:SetScript("OnMouseUp", function(self, button)
        if button == "RightButton" then
            self:Hide()
        else
            CBB.UI.ToggleMainFrame(true)
        end
    end)

    CBB.UI.hudFrame = hud

    -- Check if target has bounty; play sound cue and broadcast sighting
    CBB.UI.CheckTargetBounty = function()
        if UnitExists("target") and UnitIsPlayer("target") then
            local targetName = UnitName("target")
            if targetName then
                local b = CBB.bountyCache[string.lower(targetName)]
                if b then
                    hudReward:SetText("|cffffd700" .. tostring(b.reward) .. "g Escrow|r (" .. (b.reason or "Kill Target") .. ")")
                    if CBB.db.hudEnabled then
                        hud:Show()
                    end

                    -- Play target acquired audio sting (throttled to once per 10s)
                    local now = time()
                    if CBB.db.soundAlerts and (now - lastSoundTime > 10) then
                        lastSoundTime = now
                        PlaySound(8457) -- Ominous PvP Bell / Flag captured sound
                    end

                    -- Auto-broadcast sighting coordinates to P2P network (throttled to once per 60s per target)
                    local lastSighting = lastSightingBroadcastTime[string.lower(targetName)] or 0
                    if (now - lastSighting > 60) and CBB.Network and CBB.Network.BroadcastSighting then
                        lastSightingBroadcastTime[string.lower(targetName)] = now
                        local mapID = C_Map.GetBestMapForUnit("player")
                        local x, y = 0, 0
                        local zone = GetZoneText() or ""
                        if mapID then
                            local pos = C_Map.GetPlayerMapPosition(mapID, "player")
                            if pos then
                                x, y = pos:GetXY()
                                x = x * 100
                                y = y * 100
                            end
                        end
                        CBB.Network.BroadcastSighting(targetName, zone, x, y, b.reward)
                    end
                    return
                end
            end
        end
        hud:Hide()
    end

    -- ──────────────────────────────────────────────────────────────────────────
    -- 3. World Map Hunter Pin Overlay
    -- Shows pins for recent peer-reported bounty sightings
    -- ──────────────────────────────────────────────────────────────────────────
    local mapPinFrame = CreateFrame("Frame", "CBBMWorldMapPinFrame", WorldMapFrame:GetCanvas())
    mapPinFrame:SetAllPoints()
    mapPinFrame:Hide()

    local mapPins = {}

    CBB.UI.UpdateMapPin = function(forceShow)
        if not WorldMapFrame:IsShown() and not forceShow then return end
        local mapID = WorldMapFrame:GetMapID()
        if not mapID then return end

        -- Hide old pins
        for _, pin in pairs(mapPins) do
            pin:Hide()
        end

        local sightings = CBB.db.sightings or {}
        local pinIndex = 0

        for key, s in pairs(sightings) do
            -- Keep sightings under 30 minutes old
            if (time() - (s.timestamp or 0)) < 1800 and s.x > 0 and s.y > 0 then
                pinIndex = pinIndex + 1
                local pin = mapPins[pinIndex]
                if not pin then
                    pin = CreateFrame("Button", nil, WorldMapFrame:GetCanvas())
                    pin:SetSize(22, 22)
                    local tex = pin:CreateTexture(nil, "OVERLAY")
                    tex:SetAllPoints()
                    tex:SetTexture("Interface\\TargetingFrame\\UI-TargetingFrame-Skull")
                    pin.texture = tex

                    pin:SetScript("OnEnter", function(self)
                        GameTooltip:SetOwner(self, "ANCHOR_RIGHT")
                        GameTooltip:AddLine("💀 |cffff2020Bounty Sighting: " .. (self.targetName or "") .. "|r")
                        GameTooltip:AddLine("|cffffd700Reward: " .. (self.reward or 0) .. " Gold|r")
                        GameTooltip:AddLine("|cffaaaaaaSpotted by: " .. (self.spottedBy or "Peer") .. "|r")
                        local minutesAgo = math.floor((time() - (self.timestamp or time())) / 60)
                        GameTooltip:AddLine("|cff60a5fa" .. tostring(minutesAgo) .. " min ago in " .. (self.zone or "") .. "|r")
                        GameTooltip:Show()
                    end)
                    pin:SetScript("OnLeave", function() GameTooltip:Hide() end)
                    mapPins[pinIndex] = pin
                end

                pin.targetName = s.target
                pin.reward = s.reward
                pin.spottedBy = s.spottedBy
                pin.timestamp = s.timestamp
                pin.zone = s.zone

                -- Normalize to WorldMapCanvas dimensions
                local canvas = WorldMapFrame:GetCanvas()
                local w, h = canvas:GetWidth(), canvas:GetHeight()
                if w and h and w > 0 and h > 0 then
                    pin:ClearAllPoints()
                    pin:SetPoint("CENTER", canvas, "TOPLEFT", (s.x / 100) * w, -((s.y / 100) * h))
                    pin:Show()
                end
            end
        end
    end

    WorldMapFrame:HookScript("OnShow", function() CBB.UI.UpdateMapPin() end)

    -- ──────────────────────────────────────────────────────────────────────────
    -- 4. Clean, Compact Main Frame (Tabs: Post / Active Bounties / Hunter Intel)
    -- ──────────────────────────────────────────────────────────────────────────
    local f = CreateFrame("Frame", "ClassicBountyBoardMainFrame", UIParent, "BackdropTemplate")
    f:SetSize(410, 430)
    f:SetPoint(unpack(CBB.db.mainFramePoint or {"CENTER", "UIParent", "CENTER", 0, 0}))
    f:SetMovable(true)
    f:EnableMouse(true)
    f:RegisterForDrag("LeftButton")
    f:SetScript("OnDragStart", f.StartMoving)
    f:SetScript("OnDragStop", function(self)
        self:StopMovingOrSizing()
        local point, relativeTo, relativePoint, xOfs, yOfs = self:GetPoint()
        CBB.db.mainFramePoint = {point, "UIParent", relativePoint, xOfs, yOfs}
    end)
    f:Hide()

    f:SetBackdrop({
        bgFile = "Interface\\DialogFrame\\UI-DialogBox-Background-Dark",
        edgeFile = "Interface\\DialogFrame\\UI-DialogBox-Gold-Border",
        tile = true, tileSize = 32, edgeSize = 24,
        insets = { left = 6, right = 6, top = 6, bottom = 6 }
    })
    f:SetBackdropColor(0.04, 0.05, 0.08, 0.95)

    -- Header
    local title = f:CreateFontString(nil, "OVERLAY", "GameFontHighlightLarge")
    title:SetPoint("TOP", f, "TOP", 0, -14)
    title:SetText("|cffffd700Classic+ Bounty Board|r")

    local subtitle = f:CreateFontString(nil, "OVERLAY", "GameFontDisableSmall")
    subtitle:SetPoint("TOP", title, "BOTTOM", 0, -2)
    subtitle:SetText("P2P Mesh Network & Hunter Tracking")

    local closeBtn = CreateFrame("Button", nil, f, "UIPanelCloseButton")
    closeBtn:SetPoint("TOPRIGHT", f, "TOPRIGHT", -4, -4)

    -- Tabs: [Post] [Contracts] [Sightings]
    local postTab = CreateFrame("Button", nil, f, "UIPanelButtonTemplate")
    postTab:SetSize(90, 22)
    postTab:SetPoint("TOPLEFT", f, "TOPLEFT", 14, -48)
    postTab:SetText("Post")

    local listTab = CreateFrame("Button", nil, f, "UIPanelButtonTemplate")
    listTab:SetSize(90, 22)
    listTab:SetPoint("LEFT", postTab, "RIGHT", 6, 0)
    listTab:SetText("Contracts")

    local intelTab = CreateFrame("Button", nil, f, "UIPanelButtonTemplate")
    intelTab:SetSize(90, 22)
    intelTab:SetPoint("LEFT", listTab, "RIGHT", 6, 0)
    intelTab:SetText("Sightings")

    -- Content Panels
    local postPanel = CreateFrame("Frame", nil, f)
    postPanel:SetSize(382, 340)
    postPanel:SetPoint("TOPLEFT", f, "TOPLEFT", 14, -76)

    local targetCard = CreateFrame("Frame", nil, postPanel, "BackdropTemplate")
    targetCard:SetSize(382, 60)
    targetCard:SetPoint("TOP", postPanel, "TOP", 0, 0)
    targetCard:SetBackdrop({
        bgFile = "Interface\\Buttons\\WHITE8X8",
        edgeFile = "Interface\\Tooltips\\UI-Tooltip-Border",
        tile = false, edgeSize = 10,
        insets = { left = 2, right = 2, top = 2, bottom = 2 }
    })
    targetCard:SetBackdropColor(0.1, 0.12, 0.18, 0.9)
    targetCard:SetBackdropBorderColor(0.6, 0.5, 0.2, 0.7)

    local targetLabel = targetCard:CreateFontString(nil, "OVERLAY", "GameFontNormal")
    targetLabel:SetPoint("TOPLEFT", targetCard, "TOPLEFT", 10, -8)
    targetLabel:SetText("|cffffffffTarget:|r |cffaaaaaa(Select a player or enter below)|r")

    local targetDetail = targetCard:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
    targetDetail:SetPoint("TOPLEFT", targetLabel, "BOTTOMLEFT", 0, -4)
    targetDetail:SetText("Hostile player info will auto-populate on target.")

    local captureBtn = CreateFrame("Button", nil, targetCard, "UIPanelButtonTemplate")
    captureBtn:SetSize(90, 20)
    captureBtn:SetPoint("RIGHT", targetCard, "RIGHT", -10, 0)
    captureBtn:SetText("Fill Target")

    local nameLabel = postPanel:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    nameLabel:SetPoint("TOPLEFT", targetCard, "BOTTOMLEFT", 0, -12)
    nameLabel:SetText("Player Name:")

    local nameEdit = CreateFrame("EditBox", nil, postPanel, "InputBoxTemplate")
    nameEdit:SetSize(160, 20)
    nameEdit:SetPoint("LEFT", nameLabel, "RIGHT", 10, 0)
    nameEdit:SetAutoFocus(false)

    local rewardLabel = postPanel:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    rewardLabel:SetPoint("TOPLEFT", nameLabel, "BOTTOMLEFT", 0, -12)
    rewardLabel:SetText("Escrow Gold:")

    local rewardEdit = CreateFrame("EditBox", nil, postPanel, "InputBoxTemplate")
    rewardEdit:SetSize(80, 20)
    rewardEdit:SetPoint("LEFT", rewardLabel, "RIGHT", 10, 0)
    rewardEdit:SetNumeric(true)
    rewardEdit:SetNumber(50)
    rewardEdit:SetAutoFocus(false)

    local reasonLabel = postPanel:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    reasonLabel:SetPoint("TOPLEFT", rewardLabel, "BOTTOMLEFT", 0, -12)
    reasonLabel:SetText("Reason / Intel:")

    local reasonEdit = CreateFrame("EditBox", nil, postPanel, "InputBoxTemplate")
    reasonEdit:SetSize(380, 20)
    reasonEdit:SetPoint("TOPLEFT", reasonLabel, "BOTTOMLEFT", 0, -4)
    reasonEdit:SetAutoFocus(false)

    local infoBanner = postPanel:CreateFontString(nil, "OVERLAY", "GameFontDisableSmall")
    infoBanner:SetPoint("TOPLEFT", reasonEdit, "BOTTOMLEFT", 0, -14)
    infoBanner:SetWidth(380)
    infoBanner:SetJustifyH("LEFT")
    infoBanner:SetText("|cff22c55eP2P Network Active:|r Bounties automatically sync across all online hunters in your guild, party, and BountyNet channel.")

    local submitBtn = CreateFrame("Button", nil, postPanel, "UIPanelButtonTemplate")
    submitBtn:SetSize(160, 26)
    submitBtn:SetPoint("BOTTOM", postPanel, "BOTTOM", 0, 10)
    submitBtn:SetText("Place Bounty")

    -- Contracts List Panel
    local listPanel = CreateFrame("Frame", nil, f)
    listPanel:SetSize(382, 340)
    listPanel:SetPoint("TOPLEFT", f, "TOPLEFT", 14, -76)
    listPanel:Hide()

    local listRows = {}
    for i = 1, 5 do
        local row = CreateFrame("Frame", nil, listPanel, "BackdropTemplate")
        row:SetSize(382, 48)
        row:SetPoint("TOPLEFT", listPanel, "TOPLEFT", 0, -((i - 1) * 52))
        row:SetBackdrop({
            bgFile = "Interface\\Buttons\\WHITE8X8",
            edgeFile = "Interface\\Tooltips\\UI-Tooltip-Border",
            tile = false, edgeSize = 8,
            insets = { left = 2, right = 2, top = 2, bottom = 2 }
        })
        row:SetBackdropColor(0.08, 0.08, 0.12, 0.8)
        row:SetBackdropBorderColor(0.4, 0.4, 0.5, 0.5)

        row.targetText = row:CreateFontString(nil, "OVERLAY", "GameFontHighlight")
        row.targetText:SetPoint("TOPLEFT", row, "TOPLEFT", 8, -6)

        row.subText = row:CreateFontString(nil, "OVERLAY", "GameFontDisableSmall")
        row.subText:SetPoint("BOTTOMLEFT", row, "BOTTOMLEFT", 8, 6)

        row.rewardText = row:CreateFontString(nil, "OVERLAY", "GameFontNormal")
        row.rewardText:SetPoint("TOPRIGHT", row, "TOPRIGHT", -8, -6)

        row.statusText = row:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
        row.statusText:SetPoint("BOTTOMRIGHT", row, "BOTTOMRIGHT", -8, 6)

        listRows[i] = row
    end

    -- Sightings Panel
    local intelPanel = CreateFrame("Frame", nil, f)
    intelPanel:SetSize(382, 340)
    intelPanel:SetPoint("TOPLEFT", f, "TOPLEFT", 14, -76)
    intelPanel:Hide()

    local intelRows = {}
    for i = 1, 5 do
        local row = CreateFrame("Frame", nil, intelPanel, "BackdropTemplate")
        row:SetSize(382, 48)
        row:SetPoint("TOPLEFT", intelPanel, "TOPLEFT", 0, -((i - 1) * 52))
        row:SetBackdrop({
            bgFile = "Interface\\Buttons\\WHITE8X8",
            edgeFile = "Interface\\Tooltips\\UI-Tooltip-Border",
            tile = false, edgeSize = 8,
            insets = { left = 2, right = 2, top = 2, bottom = 2 }
        })
        row:SetBackdropColor(0.08, 0.1, 0.14, 0.8)
        row:SetBackdropBorderColor(0.2, 0.5, 0.8, 0.5)

        row.nameText = row:CreateFontString(nil, "OVERLAY", "GameFontHighlight")
        row.nameText:SetPoint("TOPLEFT", row, "TOPLEFT", 8, -6)

        row.locText = row:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
        row.locText:SetPoint("BOTTOMLEFT", row, "BOTTOMLEFT", 8, 6)

        row.timeText = row:CreateFontString(nil, "OVERLAY", "GameFontDisableSmall")
        row.timeText:SetPoint("BOTTOMRIGHT", row, "BOTTOMRIGHT", -8, 6)

        intelRows[i] = row
    end

    local function RefreshLists()
        -- Refresh Contracts
        local bounties = CBB.db.bounties or {}
        for i = 1, 5 do
            local row = listRows[i]
            local b = bounties[i]
            if b then
                row.targetText:SetText("|cffff4444" .. (b.target or "Unknown") .. "|r")
                row.subText:SetText(b.reason or "PvP Contract")
                row.rewardText:SetText("|cffffd700" .. tostring(b.reward or 0) .. "g|r")
                if b.status == "VERIFIED_IN_ESCROW" then
                    row.statusText:SetText("|cff22c55e[Locked in Escrow]|r")
                elseif b.status == "CLAIM_PENDING_VERIFICATION" then
                    row.statusText:SetText("|cff60a5fa[Claim Pending]|r")
                else
                    row.statusText:SetText("|cffaaaaaa[Pending Gold]|r")
                end
                row:Show()
            else
                row:Hide()
            end
        end

        -- Refresh Sightings
        local sightingsList = {}
        for _, s in pairs(CBB.db.sightings or {}) do
            table.insert(sightingsList, s)
        end
        table.sort(sightingsList, function(a, b) return (a.timestamp or 0) > (b.timestamp or 0) end)

        for i = 1, 5 do
            local row = intelRows[i]
            local s = sightingsList[i]
            if s then
                local mins = math.floor((time() - (s.timestamp or time())) / 60)
                row.nameText:SetText("🎯 |cffff4444" .. s.target .. "|r (|cffffd700" .. tostring(s.reward) .. "g|r)")
                row.locText:SetText("|cff60a5fa" .. s.zone .. "|r (" .. s.x .. ", " .. s.y .. ")")
                row.timeText:SetText(tostring(mins) .. "m ago by " .. (s.spottedBy or "Peer"))
                row:Show()
            else
                row:Hide()
            end
        end
    end

    CBB.UI.SetTab = function(tabName)
        postPanel:Hide()
        listPanel:Hide()
        intelPanel:Hide()
        postTab:UnlockHighlight()
        listTab:UnlockHighlight()
        intelTab:UnlockHighlight()

        if tabName == "post" then
            postPanel:Show()
            postTab:LockHighlight()
        elseif tabName == "list" then
            listPanel:Show()
            listTab:LockHighlight()
            RefreshLists()
        elseif tabName == "intel" then
            intelPanel:Show()
            intelTab:LockHighlight()
            RefreshLists()
        end
    end

    postTab:SetScript("OnClick", function() CBB.UI.SetTab("post") end)
    listTab:SetScript("OnClick", function() CBB.UI.SetTab("list") end)
    intelTab:SetScript("OnClick", function() CBB.UI.SetTab("intel") end)
    CBB.UI.SetTab("post")

    CBB.UI.CaptureTarget = function()
        if UnitExists("target") and UnitIsPlayer("target") then
            local name = UnitName("target")
            local race = UnitRace("target") or "Unknown"
            local class = UnitClass("target") or "Unknown"
            local faction = UnitFactionGroup("target") or "Unknown"
            local level = UnitLevel("target")

            targetLabel:SetText("|cffffffffTarget:|r |cffffd700" .. name .. "|r (" .. faction .. ")")
            targetDetail:SetText("Level " .. level .. " " .. race .. " " .. class)
            nameEdit:SetText(name)
        else
            targetLabel:SetText("|cffffffffTarget:|r |cff888888No player target selected|r")
            targetDetail:SetText("Select an enemy player in world to capture.")
        end
    end

    captureBtn:SetScript("OnClick", CBB.UI.CaptureTarget)

    submitBtn:SetScript("OnClick", function()
        local name = nameEdit:GetText()
        local reward = tonumber(rewardEdit:GetText()) or 0
        local reason = reasonEdit:GetText()

        if name == "" or reward <= 0 then
            CBB.Print("Invalid submission. Enter a target name and reward gold.")
            return
        end

        CBB.Escrow.CreatePendingEscrow(name, GetRealmName(), reward, reason)
        CBB.UI.SetTab("list")
    end)

    CBB.UI.ToggleMainFrame = function(show)
        if show == nil then
            if f:IsShown() then f:Hide() else f:Show() end
        elseif show then
            f:Show()
        else
            f:Hide()
        end
    end

    CBB.UI.frame = f
end
