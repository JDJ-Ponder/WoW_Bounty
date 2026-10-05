import { Shield, Swords } from 'lucide-react';

export default function FactionCrest({ faction, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28,
    xl: 40,
  };

  const isAlliance = faction === 'Alliance';

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative`}
      style={{
        background: isAlliance
          ? 'linear-gradient(135deg, #1e3a8a, #2563eb)'
          : 'linear-gradient(135deg, #7f1d1d, #dc2626)',
        boxShadow: isAlliance
          ? '0 0 16px rgba(37, 99, 235, 0.5), inset 0 1px 2px rgba(255,255,255,0.2)'
          : '0 0 16px rgba(220, 38, 38, 0.5), inset 0 1px 2px rgba(255,255,255,0.2)',
        border: `2px solid ${isAlliance ? 'rgba(96, 165, 250, 0.5)' : 'rgba(248, 113, 113, 0.5)'}`,
      }}
    >
      {isAlliance ? (
        <Shield size={iconSizes[size]} className="text-blue-200" strokeWidth={2.5} />
      ) : (
        <Swords size={iconSizes[size]} className="text-red-200" strokeWidth={2.5} />
      )}
      {/* Inner glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${isAlliance ? 'rgba(147, 197, 253, 0.3)' : 'rgba(252, 165, 165, 0.3)'} 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}
