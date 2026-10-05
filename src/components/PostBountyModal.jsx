import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Lock, AlertTriangle, CheckCircle, Scroll } from 'lucide-react';
import TargetLookup from './TargetLookup';
import { REALMS, WOW_CLASSES, WOW_RACES } from '../data/mockData';

export default function PostBountyModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1); // 1: target, 2: details, 3: confirm
  const [manualMode, setManualMode] = useState(false);
  const [lookedUpChar, setLookedUpChar] = useState(null);
  const [form, setForm] = useState({
    targetName: '',
    targetRealm: '',
    targetFaction: '',
    targetClass: '',
    targetRace: '',
    targetLevel: 60,
    posterName: '',
    posterFaction: '',
    reward: 100,
    reason: '',
    lastSeen: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleCharacterFound = (charData) => {
    setLookedUpChar(charData);
    setForm((prev) => ({
      ...prev,
      targetName: charData.name,
      targetRealm: charData.realm,
      targetFaction: charData.faction,
      targetClass: charData.class,
      targetRace: charData.race,
      targetLevel: charData.level,
    }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.targetName.trim()) errs.targetName = 'Target name is required';
    if (!form.targetRealm) errs.targetRealm = 'Select a realm';
    if (!form.targetFaction) errs.targetFaction = 'Select faction';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.posterName.trim()) errs.posterName = 'Your character name is required';
    if (!form.posterFaction) errs.posterFaction = 'Select your faction';
    if (form.reward < 10) errs.reward = 'Minimum reward is 10g';
    if (form.reward > 99999) errs.reward = 'Maximum reward is 99,999g';
    if (!form.reason.trim()) errs.reason = 'Describe why this bounty exists';
    if (form.reason.trim().length < 10) errs.reason = 'Reason must be at least 10 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate escrow deposit
    await new Promise((r) => setTimeout(r, 1500));

    onSubmit({
      target: {
        name: form.targetName,
        realm: form.targetRealm,
        faction: form.targetFaction,
        class: form.targetClass || 'Unknown',
        race: form.targetRace || 'Unknown',
        level: form.targetLevel,
        guild: lookedUpChar?.guild || null,
      },
      poster: {
        name: form.posterName,
        faction: form.posterFaction,
        realm: form.targetRealm,
      },
      reward: form.reward,
      currency: 'gold',
      reason: form.reason,
      lastSeen: form.lastSeen || null,
    });

    setSubmitted(true);
    setSubmitting(false);

    setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      setForm({
        targetName: '', targetRealm: '', targetFaction: '', targetClass: '', targetRace: '',
        targetLevel: 60, posterName: '', posterFaction: '', reward: 100, reason: '', lastSeen: '',
      });
      setLookedUpChar(null);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setStep(1);
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  const races = form.targetFaction ? WOW_RACES[form.targetFaction] || [] : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="modal-content w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center">
                  <Scroll size={20} className="text-charcoal-deep" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-cinzel text-parchment">
                    Post Bounty Contract
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          s <= step
                            ? 'w-8 bg-gold'
                            : 'w-4 bg-white/10'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-parchment-dark/40 ml-1">
                      Step {step}/3
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X size={18} className="text-parchment-dark/50" />
              </button>
            </div>

            <div className="p-5">
              {/* Step 1: Target */}
              {step === 1 && (
                <div className="space-y-4">
                  <TargetLookup
                    onCharacterFound={handleCharacterFound}
                    onManualMode={setManualMode}
                  />

                  {(manualMode || !lookedUpChar) && (
                    <>
                      <div className="divider-gold my-4" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-xs text-parchment-dark/50 mb-1 block">Target Name *</label>
                          <input
                            type="text"
                            value={form.targetName}
                            onChange={(e) => updateForm('targetName', e.target.value)}
                            placeholder="Character name"
                            className={`w-full ${errors.targetName ? 'border-red-500/50' : ''}`}
                          />
                          {errors.targetName && <span className="text-red-400 text-[10px] mt-0.5 block">{errors.targetName}</span>}
                        </div>

                        <div>
                          <label className="text-xs text-parchment-dark/50 mb-1 block">Realm *</label>
                          <select
                            value={form.targetRealm}
                            onChange={(e) => updateForm('targetRealm', e.target.value)}
                            className={`w-full ${errors.targetRealm ? 'border-red-500/50' : ''}`}
                          >
                            <option value="">Select</option>
                            {REALMS.map((r) => (
                              <option key={r.name} value={r.name}>{r.name}</option>
                            ))}
                          </select>
                          {errors.targetRealm && <span className="text-red-400 text-[10px] mt-0.5 block">{errors.targetRealm}</span>}
                        </div>

                        <div>
                          <label className="text-xs text-parchment-dark/50 mb-1 block">Faction *</label>
                          <select
                            value={form.targetFaction}
                            onChange={(e) => updateForm('targetFaction', e.target.value)}
                            className={`w-full ${errors.targetFaction ? 'border-red-500/50' : ''}`}
                            disabled={!!lookedUpChar}
                          >
                            <option value="">Select</option>
                            <option value="Alliance">Alliance</option>
                            <option value="Horde">Horde</option>
                          </select>
                          {errors.targetFaction && <span className="text-red-400 text-[10px] mt-0.5 block">{errors.targetFaction}</span>}
                        </div>

                        <div>
                          <label className="text-xs text-parchment-dark/50 mb-1 block">Class</label>
                          <select
                            value={form.targetClass}
                            onChange={(e) => updateForm('targetClass', e.target.value)}
                            className="w-full"
                          >
                            <option value="">Unknown</option>
                            {WOW_CLASSES.map((c) => (
                              <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-parchment-dark/50 mb-1 block">Race</label>
                          <select
                            value={form.targetRace}
                            onChange={(e) => updateForm('targetRace', e.target.value)}
                            className="w-full"
                            disabled={!form.targetFaction}
                          >
                            <option value="">Unknown</option>
                            {races.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-parchment-dark/50 mb-1 block">Your Character *</label>
                      <input
                        type="text"
                        value={form.posterName}
                        onChange={(e) => updateForm('posterName', e.target.value)}
                        placeholder="Your name"
                        className={`w-full ${errors.posterName ? 'border-red-500/50' : ''}`}
                      />
                      {errors.posterName && <span className="text-red-400 text-[10px] mt-0.5 block">{errors.posterName}</span>}
                    </div>
                    <div>
                      <label className="text-xs text-parchment-dark/50 mb-1 block">Your Faction *</label>
                      <select
                        value={form.posterFaction}
                        onChange={(e) => updateForm('posterFaction', e.target.value)}
                        className={`w-full ${errors.posterFaction ? 'border-red-500/50' : ''}`}
                      >
                        <option value="">Select</option>
                        <option value="Alliance">Alliance</option>
                        <option value="Horde">Horde</option>
                      </select>
                      {errors.posterFaction && <span className="text-red-400 text-[10px] mt-0.5 block">{errors.posterFaction}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-parchment-dark/50 mb-1 block">
                      Bounty Reward (gold) *
                    </label>
                    <div className="relative">
                      <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
                      <input
                        type="number"
                        min={10}
                        max={99999}
                        value={form.reward}
                        onChange={(e) => updateForm('reward', parseInt(e.target.value) || 0)}
                        className={`w-full pl-8 ${errors.reward ? 'border-red-500/50' : ''}`}
                      />
                    </div>
                    {errors.reward && <span className="text-red-400 text-[10px] mt-0.5 block">{errors.reward}</span>}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-parchment-dark/30">
                      <Lock size={9} />
                      Gold will be held in escrow until contract is fulfilled
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-parchment-dark/50 mb-1 block">Reason *</label>
                    <textarea
                      value={form.reason}
                      onChange={(e) => updateForm('reason', e.target.value)}
                      placeholder="Describe what this player did to deserve a bounty..."
                      rows={3}
                      className={`w-full resize-none ${errors.reason ? 'border-red-500/50' : ''}`}
                    />
                    {errors.reason && <span className="text-red-400 text-[10px] mt-0.5 block">{errors.reason}</span>}
                  </div>

                  <div>
                    <label className="text-xs text-parchment-dark/50 mb-1 block">Last Seen Location</label>
                    <input
                      type="text"
                      value={form.lastSeen}
                      onChange={(e) => updateForm('lastSeen', e.target.value)}
                      placeholder="e.g., Blackrock Mountain — Entrance"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && !submitted && (
                <div className="space-y-4">
                  <div className="escrow-badge rounded-lg p-4 text-center">
                    <div className="text-[10px] text-gold/60 uppercase tracking-wider mb-1">Escrow Deposit</div>
                    <div className="text-3xl font-bold font-cinzel text-gold">
                      {form.reward.toLocaleString()}g
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-gold/50">
                      <Lock size={10} />
                      Locked until contract completion or expiry (7 days)
                    </div>
                  </div>

                  <div className="glass-dark rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-parchment-dark/50">Target:</span>
                      <span className="text-parchment font-semibold">{form.targetName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-parchment-dark/50">Realm:</span>
                      <span className="text-parchment">{form.targetRealm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-parchment-dark/50">Faction:</span>
                      <span className={form.targetFaction === 'Alliance' ? 'text-alliance-glow' : 'text-horde-glow'}>
                        {form.targetFaction}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-parchment-dark/50">Posted by:</span>
                      <span className={form.posterFaction === 'Alliance' ? 'text-alliance-glow' : 'text-horde-glow'}>
                        {form.posterName} ({form.posterFaction})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-yellow-200/70 leading-relaxed">
                      By confirming, {form.reward.toLocaleString()}g will be deposited into escrow.
                      Funds are released upon verified kill proof or returned on contract expiry.
                      False bounties may result in account penalties.
                    </p>
                  </div>
                </div>
              )}

              {/* Success state */}
              {submitted && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <CheckCircle size={48} className="text-active mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold font-cinzel text-parchment mb-2">
                    Contract Posted!
                  </h3>
                  <p className="text-sm text-parchment-dark/50">
                    {form.reward.toLocaleString()}g deposited to escrow. Hunters have been notified.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!submitted && (
              <div className="flex items-center justify-between p-5 border-t border-white/5">
                <button
                  onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                  className="btn-secondary text-xs"
                >
                  {step > 1 ? 'Back' : 'Cancel'}
                </button>

                {step < 3 ? (
                  <button onClick={handleNext} className="btn-primary text-xs">
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary text-xs flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-charcoal-deep/30 border-t-charcoal-deep rounded-full animate-spin" />
                        Depositing...
                      </>
                    ) : (
                      <>
                        <Lock size={12} />
                        Confirm & Deposit {form.reward.toLocaleString()}g
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
