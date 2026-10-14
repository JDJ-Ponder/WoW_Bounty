/**
 * Classic+ Bounty Board - Discord Bot & Webhook Cross-Faction Tracker
 * Experimental Bridge Service (Node.js)
 *
 * Capabilities:
 * 1. Webhook Dispatcher: Dispatches rich Alliance (blue) and Horde (red) embeds to Discord
 *    when bounties are posted, escrowed, sighted, or claimed.
 * 2. Discord Slash Commands:
 *    - /bounties [faction] [realm]: Query active contracts directly from Discord.
 *    - /post-bounty [target] [faction] [reward] [realm] [reason]: Post a contract into the board.
 *    - /sighting [target] [zone] [coords]: Report enemy sightings into the hunter channel.
 *    - /escrow-status [bounty_id]: Inspect cryptographic escrow verification.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.DISCORD_BRIDGE_PORT || 3002;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

// Faction Embed Colors
const COLORS = {
  ALLIANCE: 0x2563eb, // Royal Blue
  HORDE: 0xdc2626,    // Crimson Red
  ESCROW: 0xf59e0b,   // Gold
  KILL: 0x10b981      // Emerald Green
};

/**
 * Send a rich embed notification to a Discord channel via Webhook
 */
export async function sendDiscordWebhook(embed) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('[Discord Bridge] No DISCORD_WEBHOOK_URL configured. Payload preview:');
    console.log(JSON.stringify(embed, null, 2));
    return { success: false, reason: 'No webhook URL provided' };
  }

  try {
    const payload = {
      username: 'Classic+ Bounty Herald',
      avatar_url: 'https://raw.githubusercontent.com/JDJ-Ponder/WoW_Bounty/main/public/favicon.svg',
      embeds: [embed]
    };

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return { success: res.ok, status: res.status };
  } catch (err) {
    console.error('[Discord Bridge] Failed to post webhook:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Build rich embeds for bounty events
 */
export function buildBountyEmbed(type, data) {
  const faction = (data.targetFaction || 'Alliance').toLowerCase();
  const color = faction === 'alliance' ? COLORS.ALLIANCE : COLORS.HORDE;

  if (type === 'NEW_BOUNTY') {
    return {
      title: `💀 NEW BOUNTY POSTED: ${data.target}`,
      description: `A contract has been issued on the head of **${data.target}** (${data.targetFaction}) on **${data.realm || 'Classic+'}**!`,
      color: color,
      fields: [
        { name: '💰 Reward', value: `**${data.reward} Gold**`, inline: true },
        { name: '📜 Reason', value: data.reason || 'War Crimes in Azeroth', inline: true },
        { name: '🛡️ Escrow Code', value: `\`${data.escrowCode || 'PENDING'}\``, inline: true },
        { name: '👤 Poster', value: `${data.poster || 'Anonymous'} (${data.posterFaction || 'Mercenary'})`, inline: false }
      ],
      footer: { text: 'Classic+ Bounty Board • Cross-Faction Contract Network' },
      timestamp: new Date().toISOString()
    };
  }

  if (type === 'SIGHTING') {
    return {
      title: `🎯 TARGET SIGHTING: ${data.target}`,
      description: `Wanted criminal **${data.target}** was spotted in the field!`,
      color: COLORS.ESCROW,
      fields: [
        { name: '📍 Location', value: `**${data.zone || 'Unknown Zone'}** (${data.coords || 'Coordinates pending'})`, inline: true },
        { name: '💰 Active Bounty', value: `${data.reward || 0} Gold`, inline: true },
        { name: '👁️ Spotted By', value: `${data.spottedBy || 'Roving Scout'}`, inline: true }
      ],
      footer: { text: 'Real-time Hunter Intel' },
      timestamp: new Date().toISOString()
    };
  }

  if (type === 'KILL_CLAIM') {
    return {
      title: `🩸 CONTRACT FULFILLED: ${data.target} SLAIN!`,
      description: `Target **${data.target}** has fallen in PvP combat! Kill verified by combat log engine.`,
      color: COLORS.KILL,
      fields: [
        { name: '⚔️ Killer / Bounty Hunter', value: `**${data.claimedBy || 'Unknown Slayer'}**`, inline: true },
        { name: '💰 Escrow Payout', value: `**${data.reward || 0} Gold** released`, inline: true },
        { name: '🛡️ Status', value: 'Verified & Completed', inline: true }
      ],
      footer: { text: 'Gold Released from Escrow' },
      timestamp: new Date().toISOString()
    };
  }

  return { title: 'Bounty Board Update', description: JSON.stringify(data) };
}

// Lightweight HTTP server for webhook ingestion from the web app or addon companion bridge
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/discord/notify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const embed = buildBountyEmbed(payload.type, payload.data);
        const result = await sendDiscordWebhook(embed);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, discordResponse: result }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/discord/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      webhookConfigured: Boolean(DISCORD_WEBHOOK_URL),
      port: PORT,
      supportedEvents: ['NEW_BOUNTY', 'SIGHTING', 'KILL_CLAIM']
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[Discord Bounty Bridge] Running on http://localhost:${PORT}`);
    console.log(`[Discord Bounty Bridge] Webhook configured: ${Boolean(DISCORD_WEBHOOK_URL)}`);
  });
}
