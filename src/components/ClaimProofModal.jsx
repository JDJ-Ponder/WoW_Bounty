import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link, Camera, FileVideo, CheckCircle, Shield } from 'lucide-react';
import FactionCrest from './FactionCrest';
import { formatGold, getClassInfo } from '../utils/api';

export default function ClaimProofModal({ isOpen, onClose, bounty, onSubmitProof }) {
  const [hunterName, setHunterName] = useState('');
  const [proofType, setProofType] = useState('screenshot');
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!bounty) return null;

  const classInfo = getClassInfo(bounty.target.class);

  const validate = () => {
    const errs = {};
    if (!hunterName.trim()) errs.hunterName = 'Your character name is required';
    if (!proofUrl.trim()) errs.proofUrl = 'Proof link is required';
    if (!proofUrl.startsWith('http')) errs.proofUrl = 'Must be a valid URL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));

    onSubmitProof(bounty.id, {
      hunterName,
      proofType,
      proofUrl,
      notes,
      submittedAt: new Date().toISOString(),
    });

    setSubmitted(true);
    setSubmitting(false);

    setTimeout(() => {
      setSubmitted(false);
      setHunterName('');
      setProofUrl('');
      setNotes('');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="modal-content w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-active to-green-700 flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-cinzel text-parchment">
                    Submit Kill Proof
                  </h2>
                  <p className="text-[11px] text-parchment-dark/40">
                    Verify your bounty claim
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X size={18} className="text-parchment-dark/50" />
              </button>
            </div>

            <div className="p-5">
              {!submitted ? (
                <div className="space-y-4">
                  {/* Target summary */}
                  <div className={`rounded-lg p-3 border ${
                    bounty.target.faction === 'Alliance'
                      ? 'border-alliance-light/20 bg-alliance/5'
                      : 'border-horde-light/20 bg-horde/5'
                  }`}>
                    <div className="flex items-center gap-3">
                      <FactionCrest faction={bounty.target.faction} size="sm" />
                      <div className="flex-1">
                        <span className="font-bold text-parchment font-cinzel text-sm">
                          {bounty.target.name}
                        </span>
                        <div className="text-[11px] text-parchment-dark/50">
                          <span style={{ color: classInfo.color }}>{bounty.target.class}</span>
                          {' • '}{bounty.target.realm}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gold font-bold font-cinzel">
                          {formatGold(bounty.reward)}g
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hunter name */}
                  <div>
                    <label className="text-xs text-parchment-dark/50 mb-1 block">Your Character Name *</label>
                    <input
                      type="text"
                      value={hunterName}
                      onChange={(e) => { setHunterName(e.target.value); if (errors.hunterName) setErrors((p) => ({ ...p, hunterName: null })); }}
                      placeholder="Enter your character name"
                      className={`w-full ${errors.hunterName ? 'border-red-500/50' : ''}`}
                    />
                    {errors.hunterName && <span className="text-red-400 text-[10px] mt-0.5 block">{errors.hunterName}</span>}
                  </div>

                  {/* Proof type */}
                  <div>
                    <label className="text-xs text-parchment-dark/50 mb-2 block">Proof Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'screenshot', icon: Camera, label: 'Screenshot' },
                        { value: 'video', icon: FileVideo, label: 'Video Clip' },
                        { value: 'link', icon: Link, label: 'Web Link' },
                      ].map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => setProofType(value)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-xs ${
                            proofType === value
                              ? 'border-gold/40 bg-gold/10 text-gold'
                              : 'border-white/5 bg-white/[0.02] text-parchment-dark/40 hover:border-white/10'
                          }`}
                        >
                          <Icon size={16} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Proof URL */}
                  <div>
                    <label className="text-xs text-parchment-dark/50 mb-1 block">
                      Proof Link *
                    </label>
                    <div className="relative">
                      <Upload size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-dark/40" />
                      <input
                        type="url"
                        value={proofUrl}
                        onChange={(e) => { setProofUrl(e.target.value); if (errors.proofUrl) setErrors((p) => ({ ...p, proofUrl: null })); }}
                        placeholder="https://imgur.com/... or YouTube/Twitch clip"
                        className={`w-full pl-8 ${errors.proofUrl ? 'border-red-500/50' : ''}`}
                      />
                    </div>
                    {errors.proofUrl && <span className="text-red-400 text-[10px] mt-0.5 block">{errors.proofUrl}</span>}
                    <p className="text-[10px] text-parchment-dark/30 mt-1">
                      Upload to Imgur, YouTube, or Twitch and paste the link
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs text-parchment-dark/50 mb-1 block">Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Location, time, witnesses..."
                      rows={2}
                      className="w-full resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <CheckCircle size={48} className="text-active mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold font-cinzel text-parchment mb-2">
                    Proof Submitted!
                  </h3>
                  <p className="text-sm text-parchment-dark/50">
                    Escrow will release {formatGold(bounty.reward)}g upon verification.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!submitted && (
              <div className="flex items-center justify-between p-5 border-t border-white/5">
                <button onClick={onClose} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-charcoal-deep/30 border-t-charcoal-deep rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      Submit Proof
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
