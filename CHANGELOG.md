# Changelog

All notable changes to the **Classic+ Bounty Board** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-10-14

### ⚔️ Optimized for WoW Forever: P2P Mesh Network, Tooltip Hooks & World Map Intel

#### 🗡 In-Game World of Warcraft Addon (`addon/ClassicBountyBoard`)
- **P2P Mesh Network Synchronization (`Sync.lua`)**:
  - Communicates over hidden in-game chat prefix (`CBB_P2P`) using party, raid, guild, and custom channel (`BountyNet`).
  - Automatic peer-to-peer distribution of newly verified escrow contracts and kill confirmation events.
- **Native Blizzard GameTooltip Integration (`UI.lua`)**:
  - Automatically appends wanted contract badge, escrow status, and reward amounts directly onto unit tooltips when hovering over enemy players.
- **Audio Cue System (`UI.lua`)**:
  - Plays an ominous target acquisition audio sting (`PlaySound(8457)`) upon targeting an active wanted player (throttled to avoid spam).
- **World Map Hunter Pins & Sightings Overlay (`UI.lua`)**:
  - Transmits player coordinates (`C_Map.GetPlayerMapPosition`) upon spotting bounties in the world.
  - Renders interactive skull pins on the World Map showing target name, bounty gold, spotting player, and timestamp.
- **Performance Optimizations (`EscrowEngine.lua`)**:
  - Sub-event early return short-circuits 99.9% of combat log events.
  - $O(1)$ fast hash cache table for instant target verification.

---

## [1.2.0] - 2026-10-14

### 🚀 Lightweight UI & Target HUD Widget

- **Floating Target HUD (`UI.lua`)**: Minimalist 220x48px wanted indicator that activates only when targeting a wanted player.
- **Compact Main Frame (`UI.lua`)**: Replaced heavy frames with a 400x420px responsive tabbed frame.
- **Enhanced Slash Commands (`ClassicBountyBoard.lua`)**: Added `/bb hud`, `/bb map`, `/bb post`, `/bb list`.

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
