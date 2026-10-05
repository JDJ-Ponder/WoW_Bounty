import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { lookupCharacter, getClassInfo } from '../utils/api';
import { REALMS } from '../data/mockData';
import FactionCrest from './FactionCrest';

export default function TargetLookup({ onCharacterFound, onManualMode }) {
  const [realm, setRealm] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  const handleLookup = async () => {
    if (!realm || !name) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await lookupCharacter(realm, name);
      if (res.success) {
        setResult(res.data);
        onCharacterFound(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      if (err.message.includes('RATE_LIMITED')) {
        setError('API rate limit reached. Try again shortly or use Manual Entry.');
      } else {
        setError('Failed to reach Blizzard API. Try Manual Entry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleManual = () => {
    const next = !manualMode;
    setManualMode(next);
    onManualMode(next);
    if (next) {
      setResult(null);
      setError(null);
    }
  };

  const classInfo = result ? getClassInfo(result.class) : null;

  return (
    <div>
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-gold/80 tracking-wider uppercase font-cinzel">
          Target Lookup
        </label>
        <button
          onClick={toggleManual}
          className="flex items-center gap-1.5 text-[11px] text-parchment-dark/50 hover:text-parchment-dark/70 transition-colors"
        >
          {manualMode ? (
            <ToggleRight size={16} className="text-gold" />
          ) : (
            <ToggleLeft size={16} />
          )}
          {manualMode ? 'Manual Entry' : 'API Lookup'}
        </button>
      </div>

      {!manualMode ? (
        <>
          {/* API lookup mode */}
          <div className="flex gap-2 mb-3">
            <select
              value={realm}
              onChange={(e) => setRealm(e.target.value)}
              className="flex-1 text-sm"
            >
              <option value="">Select Realm</option>
              {REALMS.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} ({r.region} — {r.type})
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Character name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="w-full text-sm pr-10"
              />
              <button
                onClick={handleLookup}
                disabled={!realm || !name || loading}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gold/10 transition-colors disabled:opacity-30"
              >
                {loading ? (
                  <Loader2 size={14} className="text-gold animate-spin" />
                ) : (
                  <Search size={14} className="text-gold" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-3">
              <XCircle size={14} className="text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-300">{error}</span>
              {error.includes('Manual') && (
                <button
                  onClick={toggleManual}
                  className="text-xs text-gold underline ml-auto flex-shrink-0"
                >
                  Switch
                </button>
              )}
            </div>
          )}

          {/* Success preview card */}
          {result && (
            <div className={`rounded-lg p-3 border ${
              result.faction === 'Alliance'
                ? 'border-alliance-light/30 bg-alliance/10'
                : 'border-horde-light/30 bg-horde/10'
            }`}>
              <div className="flex items-center gap-3">
                <FactionCrest faction={result.faction} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-parchment font-cinzel">
                      {result.name}
                    </span>
                    <CheckCircle size={14} className="text-active" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-parchment-dark/60">
                    <span style={{ color: classInfo?.color }} className="font-medium">
                      {classInfo?.icon} {result.class}
                    </span>
                    <span>•</span>
                    <span>Lv{result.level}</span>
                    <span>•</span>
                    <span>{result.race}</span>
                    <span>•</span>
                    <span>{result.realm}</span>
                  </div>
                  {result.guild && (
                    <div className="text-[11px] text-parchment-dark/40 mt-0.5">
                      &lt;{result.guild}&gt;
                    </div>
                  )}
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded ${
                  result.faction === 'Alliance'
                    ? 'bg-alliance/30 text-alliance-glow'
                    : 'bg-horde/30 text-horde-glow'
                }`}>
                  {result.faction}
                </div>
              </div>
            </div>
          )}

          {/* Hint */}
          {!result && !error && (
            <div className="flex items-center gap-2 text-[11px] text-parchment-dark/30">
              <AlertTriangle size={10} />
              <span>Queries Blizzard Classic Game Data API via server-side proxy with OAuth caching</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-[11px] text-parchment-dark/40 bg-charcoal-light/50 rounded-lg p-3">
          Manual entry mode — fill in target details below. API validation will be skipped.
        </div>
      )}
    </div>
  );
}
