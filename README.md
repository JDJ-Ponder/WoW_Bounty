# ⚔️ WoW Bounty Board (`WoW_Bounty`)

[![Continuous Integration](https://github.com/JDJ-Ponder/WoW_Bounty/actions/workflows/ci.yml/badge.svg)](https://github.com/JDJ-Ponder/WoW_Bounty/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/JDJ-Ponder/WoW_Bounty/actions/workflows/deploy.yml/badge.svg)](https://github.com/JDJ-Ponder/WoW_Bounty/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC.svg)](https://tailwindcss.com/)

An interactive, immersive **World of Warcraft Classic+ Cross-Faction PvP Bounty Board** web application built for competitive players, mercenary guilds, and realm rivalries.

Settle scores across Azeroth by posting gold contracts on high-priority enemy targets, reviewing kill proof submissions, and claiming bounty payouts in gold.

---

## ✨ Features

- 📜 **Active Bounty Board**: Browse high-reward contracts filtered by Faction (Alliance / Horde), Realm, Target Class, and Gold Value.
- 🎯 **Target Lookup & Intel**: Highlighting Most Wanted criminals, gold in escrow, and real-time kill feed activity.
- ⚔️ **Contract Posting Modal**: Post new bounties with target details, location, crime description, and escrow gold requirements.
- 🩸 **Proof Submission & Verification**: Submit screenshot / combat log evidence to claim contract rewards.
- 🐙 **GitHub Open-Source Suite**: 
  - Integrated 1-click **GitHub Issue Generator** to post bounties as GitHub Issues.
  - Export active contracts to JSON backups.
  - Automated **GitHub Actions CI/CD** & GitHub Pages deployment.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, JavaScript (ES Next), Vite
- **Styling**: TailwindCSS v4, Custom Parchment & Glassmorphism design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
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

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Lint and Build:**
   ```bash
   npm run lint
   npm run build
   ```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Check out the [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

*Disclaimer: WoW_Bounty is a fan-made open-source web project. Not affiliated with or endorsed by Blizzard Entertainment.*
