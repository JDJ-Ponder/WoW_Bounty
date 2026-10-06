import fs from 'fs';
import http from 'http';

/**
 * Classic+ Bounty Board Companion Sync Bridge
 * Parses World of Warcraft SavedVariables/ClassicBountyBoard.lua
 * and synchronizes in-game bounties & gold escrow deposits with the Web Application.
 */

const DEFAULT_WOW_PATH = process.env.WOW_SAVED_VARIABLES_PATH || 
  '/Applications/World of Warcraft/_classic_/WTF/Account/SAVEDVARIABLES/ClassicBountyBoard.lua';

const PORT = 3001;

function parseLuaTable(luaContent) {
  const bounties = [];
  const regex = /\["id"\]\s*=\s*"([^"]+)",[\s\S]*?\["target"\]\s*=\s*"([^"]+)",[\s\S]*?\["reward"\]\s*=\s*(\d+)/g;
  let match;
  while ((match = regex.exec(luaContent)) !== null) {
    bounties.push({
      id: match[1],
      target: match[2],
      reward: parseInt(match[3], 10),
    });
  }
  return bounties;
}

console.log('====================================================');
console.log('  Classic+ Bounty Board Companion Sync Bridge v1.0  ');
console.log('====================================================');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/sync/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      wowAddonDetected: fs.existsSync(DEFAULT_WOW_PATH),
      targetPath: DEFAULT_WOW_PATH,
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/api/sync/in-game-bounties') {
    let rawData = [];
    if (fs.existsSync(DEFAULT_WOW_PATH)) {
      const content = fs.readFileSync(DEFAULT_WOW_PATH, 'utf-8');
      rawData = parseLuaTable(content);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: rawData.length,
      bounties: rawData
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`[Bridge Server] Running on http://localhost:${PORT}`);
  console.log(`[Bridge Server] Monitoring path: ${DEFAULT_WOW_PATH}`);
});
