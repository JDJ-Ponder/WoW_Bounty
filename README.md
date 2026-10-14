# ⚔️ WoW Bounty Board (`WoW_Bounty`)

[![Continuous Integration](https://github.com/JDJ-Ponder/WoW_Bounty/actions/workflows/ci.yml/badge.svg)](https://github.com/JDJ-Ponder/WoW_Bounty/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/JDJ-Ponder/WoW_Bounty/actions/workflows/deploy.yml/badge.svg)](https://github.com/JDJ-Ponder/WoW_Bounty/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC.svg)](https://tailwindcss.com/)

An interactive, immersive **World of Warcraft Classic+ & WoW Forever Cross-Faction PvP Bounty Board** web application and native in-game addon suite built for competitive players, mercenary guilds, and realm rivalries.

Settle scores across Azeroth by posting gold contracts on high-priority enemy targets, reviewing kill proof submissions, and claiming bounty payouts verified via cryptographic in-game escrow.

---

## ✨ Features

- 📜 **Active Bounty Board**: Browse high-reward contracts filtered by Faction (Alliance / Horde), Realm, Target Class, and Gold Value.
- 🎯 **Target Lookup & Intel**: Highlighting Most Wanted criminals, gold in escrow, and real-time kill feed activity.
- 🗡 **In-Game WoW Addon (`addon/ClassicBountyBoard`)**:
  - **Lightweight Floating HUD**: Minimalist wanted widget that activates only when targeting a marked enemy.
  - **Native GameTooltip Integration**: Adds wanted badges and verified reward values to Blizzard's unit tooltips.
  - **Audio Target Alerts**: Ominous acoustic stings upon acquiring high-priority targets.
  - **P2P Mesh Network**: Zero-external-server bounty synchronization across parties, raids, and guilds over `CBB_P2P`.
  - **World Map Hunter Pins**: Real-time sighting pins with coordinates and timestamps.
- 💰 **Cryptographic Gold Escrow Engine**: Trade window and mailbox monitoring with unique hash codes (`ESCROW-[ID]-[HASH]`) guaranteeing safe deposits.
- ⚡ **Companion Sync Bridge**: Local daemon service (`companion-bridge/sync.js`) syncing WoW `SavedVariables` with the web application.
- 🐙 **GitHub Open-Source Suite**: 1-click GitHub Issue generation, automated CI/CD workflows, and GitHub Pages hosting.

---

## 🎮 In-Game Slash Commands

| Command | Action |
| :--- | :--- |
| `/bb` or `/bounty` | Toggle the main Bounty Board frame |
| `/bb post` | Open contract posting window pre-filled with your current target |
| `/bb hud` | Toggle the floating wanted target HUD widget |
| `/bb list` | Browse active contracts and escrow statuses |
| `/bb map` | Refresh World Map pins for sighted bounties |
| `/bb sync` | Refresh SavedVariables export for web companion |

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, JavaScript (ES Next), Vite
- **Styling**: TailwindCSS v4, Custom Parchment & Glassmorphism design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Addon Engine**: World of Warcraft Lua API, Blizzard FrameXML
- **Linting & Quality**: Oxlint

---

## 🚀 Quick Start (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JDJ-Ponder/WoW_Bounty.git
   cd WoW_Bounty
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the web development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Run the Companion Sync Daemon (Optional for In-Game Sync):**
   ```bash
   node companion-bridge/sync.js
   ```

5. **Lint and Build:**
   ```bash
   npm run lint
   npm run build
   ```

---

## 📁 Repository Structure

```
WoW_Bounty/
├── addon/
│   └── ClassicBountyBoard/       # Native WoW Classic+ / WoW Forever Addon
│       ├── ClassicBountyBoard.lua # Core event handler & slash commands
│       ├── EscrowEngine.lua      # Trade & combat log kill verification
│       ├── Sync.lua              # P2P mesh network & serialized sync
│       ├── UI.lua                # Clean UI, Tooltip hooks, and HUD
│       └── ClassicBountyBoard.toc # Addon manifest
├── companion-bridge/
│   └── sync.js                   # Local Node.js SavedVariables bridge
├── src/                          # Web Application (React 19 + Tailwind v4)
├── public/                       # Static assets & 404 router
├── .github/                      # Workflows (CI & GitHub Pages deployment)
├── CHANGELOG.md                  # Semantic Version Changelog
└── README.md                     # Documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Check out the [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

*Disclaimer: WoW_Bounty is a fan-made open-source project. Not affiliated with or endorsed by Blizzard Entertainment.*
