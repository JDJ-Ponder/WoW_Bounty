# 🤖 Discord Cross-Faction Bounty Tracker (Experimental)

The **Discord Cross-Faction Bounty Tracker** bridges in-game PvP rivalries, the web marketplace, and community Discord servers so players never miss a contract, an enemy sighting, or a kill claim across Alliance and Horde communities.

---

## ⚡ Core Capabilities

1. **Rich Cross-Faction Alerts**:
   - **Alliance Contracts**: Rendered in Royal Blue (`#2563eb`) with character stats and gold escrow codes.
   - **Horde Contracts**: Rendered in Crimson Red (`#dc2626`) with bounty crimes and target intel.
   - **Real-Time Sightings**: Golden alerts reporting scout coordinates and timestamps from the in-game addon.
   - **Kill Confirmations**: Emerald Green alerts detailing verified killers and gold payouts released from escrow.

2. **Integration Endpoints**:
   - `POST /api/discord/notify`: Dispatches formatted embeds to your designated Discord server webhook.
   - `GET /api/discord/status`: Diagnostic health check verifying webhook configuration.

---

## 🚀 Quick Setup

### 1. Create a Discord Webhook
1. Open your Discord Server Settings > **Integrations** > **Webhooks**.
2. Click **New Webhook**, name it `Classic+ Bounty Herald`, and choose a bounty tracking channel (e.g. `#bounty-board` or `#hunter-intel`).
3. Click **Copy Webhook URL**.

### 2. Launch the Bridge Service
Set your webhook URL in your environment and start the bridge:

```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
node discord-bridge/discord-bot.js
```

### 3. Test a Sample Alert
Trigger a simulated bounty alert:

```bash
curl -X POST http://localhost:3002/api/discord/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "NEW_BOUNTY",
    "data": {
      "target": "Gankstr",
      "targetFaction": "Horde",
      "realm": "Crusader Strike",
      "reward": 150,
      "reason": "Camped Redridge Flight Master",
      "escrowCode": "ESCROW-98B2A1",
      "poster": "HighOverlord",
      "posterFaction": "Alliance"
    }
  }'
```
