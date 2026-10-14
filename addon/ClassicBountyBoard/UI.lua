-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- UI Renderer & Lightweight Non-Intrusive HUD
-- ============================================================================

local addonName, CBB = ...
CBB.UI = {}

function CBB.InitUI()
    if CBB.UI.initialized then return end
    CBB.UI.initialized = true

    -- ──────────────────────────────────────────────────────────────────────────
    -- 1. Mini Non-Intrusive Target HUD (Floating Widget)
    -- Displays only when targeting a player who has an active bounty
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
    hud:SetBackdropBorderColor(1.0, 0.2, 0.2, 0.9) -- Red warning border
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

    -- Check if current target has a bounty; update HUD
    CBB.UI.CheckTargetBounty = function()
        if not CBB.db.hudEnabled then
            hud:Hide()
            return
        end

        if UnitExists("target") and UnitIsPlayer("target") then
            local targetName = UnitName("target")
            if targetName then
                local b = CBB.bountyCache[string.lower(targetName)]
                if b then
                    hudReward:SetText("|cffffd700" .. tostring(b.reward) .. "g Escrow|r (" .. (b.reason or "Kill Target") .. ")")
                    hud:Show()
                    return
                end
            end
        end
        hud:Hide()
    end

    -- ──────────────────────────────────────────────────────────────────────────
    -- 2. Clean, Compact Main Frame
    -- ──────────────────────────────────────────────────────────────────────────
    local f = CreateFrame("Frame", "ClassicBountyBoardMainFrame", UIParent, "BackdropTemplate")
    f:SetSize(400, 420)
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

    -- Aesthetic dark frame with subtle border
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
    subtitle:SetText("WoW Forever Lightweight PvP Contract & Escrow Addon")

    -- Close Button
    local closeBtn = CreateFrame("Button", nil, f, "UIPanelCloseButton")
    closeBtn:SetPoint("TOPRIGHT", f, "TOPRIGHT", -4, -4)

    -- Tabs: [Post Bounty] [Bounty List]
    local postTab = CreateFrame("Button", nil, f, "UIPanelButtonTemplate")
    postTab:SetSize(110, 22)
    postTab:SetPoint("TOPLEFT", f, "TOPLEFT", 14, -48)
    postTab:SetText("Post Bounty")

    local listTab = CreateFrame("Button", nil, f, "UIPanelButtonTemplate")
    listTab:SetSize(110, 22)
    listTab:SetPoint("LEFT", postTab, "RIGHT", 6, 0)
    listTab:SetText("Bounty List")

    -- ──────────────────────────────────────────────────────────────────────────
    -- Tab 1: Post Contract Content
    -- ──────────────────────────────────────────────────────────────────────────
    local postPanel = CreateFrame("Frame", nil, f)
    postPanel:SetSize(372, 330)
    postPanel:SetPoint("TOPLEFT", f, "TOPLEFT", 14, -76)

    -- Target summary box
    local targetCard = CreateFrame("Frame", nil, postPanel, "BackdropTemplate")
    targetCard:SetSize(372, 60)
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

    -- Name input
    local nameLabel = postPanel:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    nameLabel:SetPoint("TOPLEFT", targetCard, "BOTTOMLEFT", 0, -12)
    nameLabel:SetText("Player Name:")

    local nameEdit = CreateFrame("EditBox", nil, postPanel, "InputBoxTemplate")
    nameEdit:SetSize(160, 20)
    nameEdit:SetPoint("LEFT", nameLabel, "RIGHT", 10, 0)
    nameEdit:SetAutoFocus(false)

    -- Reward input
    local rewardLabel = postPanel:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    rewardLabel:SetPoint("TOPLEFT", nameLabel, "BOTTOMLEFT", 0, -12)
    rewardLabel:SetText("Escrow Gold:")

    local rewardEdit = CreateFrame("EditBox", nil, postPanel, "InputBoxTemplate")
    rewardEdit:SetSize(80, 20)
    rewardEdit:SetPoint("LEFT", rewardLabel, "RIGHT", 10, 0)
    rewardEdit:SetNumeric(true)
    rewardEdit:SetNumber(50)
    rewardEdit:SetAutoFocus(false)

    -- Reason input
    local reasonLabel = postPanel:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    reasonLabel:SetPoint("TOPLEFT", rewardLabel, "BOTTOMLEFT", 0, -12)
    reasonLabel:SetText("Reason / Intel:")

    local reasonEdit = CreateFrame("EditBox", nil, postPanel, "InputBoxTemplate")
    reasonEdit:SetSize(370, 20)
    reasonEdit:SetPoint("TOPLEFT", reasonLabel, "BOTTOMLEFT", 0, -4)
    reasonEdit:SetAutoFocus(false)

    -- Escrow Explanation
    local infoBanner = postPanel:CreateFontString(nil, "OVERLAY", "GameFontDisableSmall")
    infoBanner:SetPoint("TOPLEFT", reasonEdit, "BOTTOMLEFT", 0, -14)
    infoBanner:SetWidth(370)
    infoBanner:SetJustifyH("LEFT")
    infoBanner:SetText("|cff22c55eEscrow Guarantee:|r Once posted, an escrow code is generated. Trade/mail the gold to banker to lock it. Kill confirmation is automatic via combat log.")

    -- Post Submit Button
    local submitBtn = CreateFrame("Button", nil, postPanel, "UIPanelButtonTemplate")
    submitBtn:SetSize(160, 26)
    submitBtn:SetPoint("BOTTOM", postPanel, "BOTTOM", 0, 10)
    submitBtn:SetText("Place Bounty")

    -- ──────────────────────────────────────────────────────────────────────────
    -- Tab 2: Bounty List Content (Compact Scrollable or Item List)
    -- ──────────────────────────────────────────────────────────────────────────
    local listPanel = CreateFrame("Frame", nil, f)
    listPanel:SetSize(372, 330)
    listPanel:SetPoint("TOPLEFT", f, "TOPLEFT", 14, -76)
    listPanel:Hide()

    local listRows = {}
    for i = 1, 5 do
        local row = CreateFrame("Frame", nil, listPanel, "BackdropTemplate")
        row:SetSize(372, 48)
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

    local function RefreshList()
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
    end

    -- Tab Switcher
    CBB.UI.SetTab = function(tabName)
        if tabName == "post" then
            postPanel:Show()
            listPanel:Hide()
            postTab:LockHighlight()
            listTab:UnlockHighlight()
        else
            postPanel:Hide()
            listPanel:Show()
            postTab:UnlockHighlight()
            listTab:LockHighlight()
            RefreshList()
        end
    end

    postTab:SetScript("OnClick", function() CBB.UI.SetTab("post") end)
    listTab:SetScript("OnClick", function() CBB.UI.SetTab("list") end)
    CBB.UI.SetTab("post")

    -- Target Capture Action
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
