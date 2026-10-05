// ── Blizzard API Utility Layer ──
// In production, these would hit a server-side proxy (e.g., /api/wow/character)
// with OAuth caching for Blizzard's Classic Game Data API.
// This module simulates that behavior with realistic delays and data.

import { WOW_CLASSES, WOW_RACES, REALMS } from '../data/mockData';

const SIMULATED_LATENCY = { min: 400, max: 1200 };
const RATE_LIMIT_CHANCE = 0.05; // 5% chance to simulate rate limiting

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomLatency() {
  return Math.random() * (SIMULATED_LATENCY.max - SIMULATED_LATENCY.min) + SIMULATED_LATENCY.min;
}

// Simulated character database for lookups
const KNOWN_CHARACTERS = {
  'whitemane-ganksalot': { name: 'Ganksalot', realm: 'Whitemane', faction: 'Horde', race: 'Undead', class: 'Rogue', level: 60, guild: 'Shadow Council' },
  'faerlina-zugzug': { name: 'Zugzug', realm: 'Faerlina', faction: 'Horde', race: 'Orc', class: 'Warrior', level: 60, guild: 'For The Horde' },
  'grobbulus-holypally': { name: 'Holypally', realm: 'Grobbulus', faction: 'Alliance', race: 'Human', class: 'Paladin', level: 60, guild: 'Knights of Lordaeron' },
  'benediction-frostbolt': { name: 'Frostbolt', realm: 'Benediction', faction: 'Alliance', race: 'Gnome', class: 'Mage', level: 60, guild: 'Arcane Intellect' },
  'sulfuras-thunderfury': { name: 'Thunderfury', realm: 'Sulfuras', faction: 'Horde', race: 'Tauren', class: 'Shaman', level: 60, guild: 'Earthen Ring' },
  'crusader strike-dotmaster': { name: 'Dotmaster', realm: 'Crusader Strike', faction: 'Horde', race: 'Undead', class: 'Warlock', level: 60, guild: 'Burning Legion' },
};

/**
 * Simulates fetching character data from Blizzard's Classic Game Data API.
 * In production: GET /api/wow/character?realm={realm}&name={name}
 * The server-side proxy handles OAuth token caching & rate limit retries.
 */
export async function lookupCharacter(realm, name) {
  await delay(randomLatency());

  // Simulate rate limiting
  if (Math.random() < RATE_LIMIT_CHANCE) {
    throw new Error('RATE_LIMITED: Blizzard API rate limit hit. Please try again in a few seconds.');
  }

  const key = `${realm.toLowerCase()}-${name.toLowerCase()}`;
  const char = KNOWN_CHARACTERS[key];

  if (char) {
    return {
      success: true,
      data: { ...char },
      source: 'blizzard_api',
      cached: Math.random() > 0.5,
    };
  }

  // Generate a random character for unknown lookups (simulating the API finding any character)
  const realmInfo = REALMS.find((r) => r.name.toLowerCase() === realm.toLowerCase());
  if (!realmInfo) {
    return {
      success: false,
      error: 'REALM_NOT_FOUND',
      message: `Realm "${realm}" not found in Classic+ database.`,
    };
  }

  // 70% chance the character exists
  if (Math.random() > 0.3) {
    const faction = Math.random() > 0.5 ? 'Alliance' : 'Horde';
    const races = WOW_RACES[faction];
    const race = races[Math.floor(Math.random() * races.length)];
    const wowClass = WOW_CLASSES[Math.floor(Math.random() * WOW_CLASSES.length)];
    const level = Math.floor(Math.random() * 20) + 40;

    return {
      success: true,
      data: {
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        realm: realmInfo.name,
        faction,
        race,
        class: wowClass.name,
        level,
        guild: null,
      },
      source: 'blizzard_api',
      cached: false,
    };
  }

  return {
    success: false,
    error: 'CHARACTER_NOT_FOUND',
    message: `Character "${name}" not found on ${realm}.`,
  };
}

/**
 * Validates realm existence
 */
export function validateRealm(realmName) {
  return REALMS.find((r) => r.name.toLowerCase() === realmName.toLowerCase()) || null;
}

/**
 * Get class metadata (color, icon)
 */
export function getClassInfo(className) {
  return WOW_CLASSES.find((c) => c.name.toLowerCase() === className.toLowerCase()) || { name: className, color: '#FFFFFF', icon: '❓' };
}

/**
 * Format gold amount with icon
 */
export function formatGold(amount) {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toString();
}

/**
 * Get time ago string
 */
export function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Get priority badge config
 */
export function getPriorityConfig(priority) {
  switch (priority) {
    case 'legendary':
      return { label: 'LEGENDARY', bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', glow: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]' };
    case 'high':
      return { label: 'HIGH', bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', glow: '' };
    case 'medium':
      return { label: 'MEDIUM', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', glow: '' };
    default:
      return { label: 'NORMAL', bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', glow: '' };
  }
}
