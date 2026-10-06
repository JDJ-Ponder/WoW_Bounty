# Changelog

All notable changes to the **Classic+ Bounty Board** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-06

### 🛡 Added In-Game WoW Companion Addon & Gold Escrow Suite

#### 🗡 In-Game World of Warcraft Addon (`addon/ClassicBountyBoard`)
- **Native WoW UI (`UI.lua`)**: Draggable gothic parchment frame supporting one-click target unit capture (`UnitName`, `UnitFactionGroup`, `UnitLevel`, `UnitRace`, `UnitClass`, `GetGuildInfo`).
- **Slash Commands (`ClassicBountyBoard.lua`)**: `/bounty`, `/bb`, `/bounty post`, `/bounty sync` to trigger in-game posting and export state to `SavedVariables`.
- **In-Game Gold Escrow Engine (`EscrowEngine.lua`)**:
  - Listens to `TRADE_SHOW`, `TRADE_MONEY_CHANGED`, and `TRADE_ACCEPT_UPDATE` to monitor player trade window gold transfers.
  - Automatically generates cryptographic transaction verification codes (`ESCROW-[ID]-[HASH]`) for trade & mail deposits.
  - Listens to `COMBAT_LOG_EVENT_UNFILTERED` (`UNIT_DIED`, `PARTY_KILL`) for in-game PvP kill verification.
- **Sync Serializer (`Sync.lua`)**: Serializes player bounty records to `ClassicBountyBoardDB` in `WTF/Account/SavedVariables/`.

#### ⚡ Node.js Companion Sync Bridge (`companion-bridge/sync.js`)
- Local daemon service running on `http://localhost:3001` that monitors the WoW client `SavedVariables/ClassicBountyBoard.lua`.
- Exposes REST API endpoints (`/api/sync/status`, `/api/sync/in-game-bounties`) for real-time web application synchronization.

#### 🌐 Web Application Integration
- Added **In-Game WoW Addon Modal (`AddonModal.jsx`)** with installation guides, escrow protocol docs, and live companion daemon status checks.
- Added top action button & footer link to launch the Addon Suite Modal.

---

## [1.0.0] - 2026-10-05

### 🎉 Initial Release
- Hero Section with live stats ticker, Most Wanted target card, and Gothic parchment UI theme.
- Smart Target Lookup powered by simulated Blizzard Classic Game Data API with OAuth caching & rate-limiting fallback.
- Interactive Bounty Marketplace Grid with multi-attribute filtering (Faction, Realm, Status, Search, Reward slider).
- 3-step Post Bounty Modal with simulated escrow deposit workflow.
- Claim Proof Modal with clip/screenshot URL submission.
- GitHub Integration Modal with issue templates and workflow triggers.
