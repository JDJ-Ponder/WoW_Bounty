-- ============================================================================
-- Classic+ Bounty Board In-Game Addon
-- UI Renderer & Parchment Frame
-- ============================================================================

local addonName, CBB = ...
CBB.UI = {}

function CBB.InitUI()
    if CBB.UI.frame then return end

    -- Main UI Frame
    local f = CreateFrame("Frame", "ClassicBountyBoardMainFrame", UIParent, "BackdropTemplate")
    f:SetSize(420, 480)
    f:SetPoint("CENTER", UIParent, "CENTER", 0, 0)
    f:SetMovable(true)
    f:EnableMouse(true)
    f:RegisterForDrag("LeftButton")
    f:SetScript("OnDragStart", f.StartMoving)
    f:SetScript("OnDragStop", f.StopMovingOrSizing)
    f:Hide()

    -- Dark Gothic Parchment Backdrop
    f:SetBackdrop({
        bgFile = "Interface\\DialogFrame\\UI-DialogBox-Background-Dark",
        edgeFile = "Interface\\DialogFrame\\UI-DialogBox-Gold-Border",
        tile = true, tileSize = 32, edgeSize = 32,
        insets = { left = 8, right = 8, top = 8, bottom = 8 }
    })
    f:SetBackdropColor(0.05, 0.05, 0.1, 0.95)

    -- Header Title
    local title = f:CreateFontString(nil, "OVERLAY", "GameFontHighlightHuge")
    title:SetPoint("TOP", f, "TOP", 0, -18)
    title:SetText("|cffffd700Classic+ Bounty Board|r")
    title:SetFont("Fonts\\FRIZQT__.TTF", 16, "OUTLINE")

    local subtitle = f:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    subtitle:SetPoint("TOP", title, "BOTTOM", 0, -4)
    subtitle:SetText("|cffaaaaaaIn-Game PvP Contract & Gold Escrow Suite|r")

    -- Close Button
    local closeBtn = CreateFrame("Button", nil, f, "UIPanelCloseButton")
    closeBtn:SetPoint("TOPRIGHT", f, "TOPRIGHT", -8, -8)

    -- Tab Buttons (Post Bounty | View Contracts)
    local postTab = CreateFrame("Button", nil, f, "UIPanelButtonTemplate")
    postTab:SetSize(120, 24)
    postTab:SetPoint("TOPLEFT", f, "TOPLEFT", 16, -55)
    postTab:SetText("Post Bounty")

    local listTab = CreateFrame("Button", nil, f, "UIPanelButtonTemplate")
    listTab:SetSize(120, 24)
    listTab:SetPoint("LEFT", postTab, "RIGHT", 6, 0)
    listTab:SetText("Active Bounties")

    -- Content Container
    local content = CreateFrame("Frame", nil, f)
    content:SetSize(388, 380)
    content:SetPoint("TOPLEFT", f, "TOPLEFT", 16, -85)

    -- ── Target Unit Capture Box ──
    local targetBox = CreateFrame("Frame", nil, content, "BackdropTemplate")
    targetBox:SetSize(388, 85)
    targetBox:SetPoint("TOP", content, "TOP", 0, 0)
    targetBox:SetBackdrop({
        bgFile = "Interface\\ChatFrame\\ChatFrameBackground",
        edgeFile = "Interface\\Tooltips\\UI-Tooltip-Border",
        tile = true, tileSize = 16, edgeSize = 12,
        insets = { left = 3, right = 3, top = 3, bottom = 3 }
    })
    targetBox:SetBackdropColor(0.1, 0.1, 0.2, 0.8)
    targetBox:SetBackdropBorderColor(0.8, 0.7, 0.2, 0.5)

    local targetText = targetBox:CreateFontString(nil, "OVERLAY", "GameFontNormal")
    targetText:SetPoint("TOPLEFT", targetBox, "TOPLEFT", 12, -10)
    targetText:SetText("|cffffffffTarget Unit:|r |cffffd700Select any target player|r")

    local targetInfo = targetBox:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
    targetInfo:SetPoint("TOPLEFT", targetText, "BOTTOMLEFT", 0, -6)
    targetInfo:SetText("No target selected. Click player or type name below.")

    local captureBtn = CreateFrame("Button", nil, targetBox, "UIPanelButtonTemplate")
    captureBtn:SetSize(130, 22)
    captureBtn:SetPoint("BOTTOMRIGHT", targetBox, "BOTTOMRIGHT", -10, 8)
    captureBtn:SetText("Capture Target")

    -- Input Fields
    local nameLabel = content:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    nameLabel:SetPoint("TOPLEFT", targetBox, "BOTTOMLEFT", 0, -12)
    nameLabel:SetText("Target Name:")

    local nameEdit = CreateFrame("EditBox", nil, content, "InputBoxTemplate")
    nameEdit:SetSize(180, 22)
    nameEdit:SetPoint("LEFT", nameLabel, "RIGHT", 10, 0)
    nameEdit:SetAutoFocus(false)

    local rewardLabel = content:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    rewardLabel:SetPoint("TOPLEFT", nameLabel, "BOTTOMLEFT", 0, -16)
    rewardLabel:SetText("Reward (Gold):")

    local rewardEdit = CreateFrame("EditBox", nil, content, "InputBoxTemplate")
    rewardEdit:SetSize(100, 22)
    rewardEdit:SetPoint("LEFT", rewardLabel, "RIGHT", 10, 0)
    rewardEdit:SetNumeric(true)
    rewardEdit:SetNumber(50)
    rewardEdit:SetAutoFocus(false)

    local reasonLabel = content:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    reasonLabel:SetPoint("TOPLEFT", rewardLabel, "BOTTOMLEFT", 0, -16)
    reasonLabel:SetText("Contract Reason:")

    local reasonEdit = CreateFrame("EditBox", nil, content, "InputBoxTemplate")
    reasonEdit:SetSize(388, 22)
    reasonEdit:SetPoint("TOPLEFT", reasonLabel, "BOTTOMLEFT", 0, -4)
    reasonEdit:SetAutoFocus(false)

    -- Escrow Status Text
    local escrowNote = content:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
    escrowNote:SetPoint("TOPLEFT", reasonEdit, "BOTTOMLEFT", 0, -14)
    escrowNote:SetWidth(388)
    escrowNote:SetText("|cffaaaaaaEscrow Note:|r Gold is safely held in escrow until kill is confirmed via combat log or verified by the companion app.")

    -- Post Bounty Submit Button
    local submitBtn = CreateFrame("Button", nil, content, "UIPanelButtonTemplate")
    submitBtn:SetSize(200, 30)
    submitBtn:SetPoint("BOTTOM", content, "BOTTOM", 0, 10)
    submitBtn:SetText("Create Escrow Bounty")

    -- ── Target Capture Logic ──
    CBB.UI.CaptureTarget = function()
        if UnitExists("target") and UnitIsPlayer("target") then
            local name = UnitName("target")
            local realm = GetRealmName()
            local level = UnitLevel("target")
            local race = UnitRace("target") or "Unknown"
            local class = UnitClass("target") or "Unknown"
            local faction = UnitFactionGroup("target") or "Unknown"
            local guild = GetGuildInfo("target") or "No Guild"

            CBB.currentTarget = {
                name = name,
                realm = realm,
                level = level,
                race = race,
                class = class,
                faction = faction,
                guild = guild
            }

            targetText:SetText("|cffffffffTarget Unit:|r |cffffd700" .. name .. "|r (" .. faction .. ")")
            targetInfo:SetText("Level " .. level .. " " .. race .. " " .. class .. " <" .. guild .. ">")
            nameEdit:SetText(name)
        else
            targetText:SetText("|cffffffffTarget Unit:|r |cff888888No target selected|r")
            targetInfo:SetText("Select a hostile player in-game to auto-fill.")
        end
    end

    captureBtn:SetScript("OnClick", CBB.UI.CaptureTarget)

    submitBtn:SetScript("OnClick", function()
        local name = nameEdit:GetText()
        local reward = tonumber(rewardEdit:GetText()) or 0
        local reason = reasonEdit:GetText()

        if name == "" or reward <= 0 then
            CBB.Print("Please enter a valid target name and reward amount.")
            return
        end

        CBB.Escrow.CreatePendingEscrow(name, GetRealmName(), reward, reason)
        CBB.UI.frame:Hide()
    end)

    CBB.UI.frame = f
end
