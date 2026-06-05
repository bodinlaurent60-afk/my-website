import React from 'react';
import type { TarotCard as TarotCardType } from '../data/tarot';
import { useLanguage } from '../i18n/context';

interface Props {
  card: TarotCardType;
  isReversed?: boolean;
  onClick?: () => void;
  showMeaning?: boolean;
  compact?: boolean;
  index?: number;
  faceDown?: boolean;
}

const TarotCardComponent: React.FC<Props> = ({
  card,
  isReversed = false,
  onClick,
  showMeaning = false,
  compact = false,
  index = 0,
  faceDown = false,
}) => {
  const { language } = useLanguage();
  const name = language === 'en' ? card.nameEn : card.nameCn;
  const keyword = language === 'en' ? card.keywordEn : card.keywordCn;

  if (faceDown) {
    // ── Card Back (face-down) ──
    return (
      <div
        className="tarot-card-back"
        style={{
          cursor: onClick ? 'pointer' : 'default',
          perspective: '1000px',
          animation: `cardFloat ${3 + (index % 5) * 0.4}s ease-in-out infinite`,
          animationDelay: `${index * 0.15}s`,
          width: compact ? '120px' : '160px',
        }}
        onClick={onClick}
      >
        <div style={{
          width: compact ? '120px' : '160px',
          height: compact ? '200px' : '266px',
          borderRadius: '12px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'rotateY(180deg)',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.1)',
        }}
        onMouseEnter={e => {
          if (onClick) e.currentTarget.style.transform = 'rotateY(180deg) translateY(-8px) scale(1.03)';
        }}
        onMouseLeave={e => {
          if (onClick) e.currentTarget.style.transform = 'rotateY(180deg)';
        }}
        >
          {/* Outer gold border */}
          <div style={{
            position: 'absolute', inset: '2px',
            borderRadius: '10px',
            border: '2px solid rgba(212,175,55,0.5)',
            pointerEvents: 'none',
          }} />

          {/* Radiating lines background */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: '200%',
                height: '1px',
                background: `linear-gradient(to bottom, transparent, rgba(100,80,140,${0.15 + Math.abs(i-12)*0.02}), transparent)`,
                transformOrigin: 'center center',
                transform: `rotate(${i * 7.5}deg)`,
                top: '50%',
                left: '50%',
              }} />
            ))}
          </div>

          {/* Inner frame */}
          <div style={{
            position: 'absolute',
            inset: '12px',
            borderRadius: '6px',
            border: '1px solid rgba(212,175,55,0.25)',
            pointerEvents: 'none',
            background: 'radial-gradient(circle at 50% 40%, rgba(60,45,90,0.5), rgba(15,12,28,0.9))',
          }} />

          {/* Center diamond symbol */}
          <div style={{
            position: 'absolute',
            top: '0', left: '0', right: '0', bottom: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: compact ? '2rem' : '2.8rem',
              color: '#e8e0f0',
              filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.25))',
              lineHeight: 1,
            }}>✦</span>
          </div>

          {/* Subtle corner decorations */}
          <div style={{ position: 'absolute', top: '18px', left: '18px', fontSize: '0.5rem', opacity: 0.25, color: '#d4af37' }}>✦</div>
          <div style={{ position: 'absolute', top: '18px', right: '18px', fontSize: '0.5rem', opacity: 0.25, color: '#d4af37' }}>✦</div>
          <div style={{ position: 'absolute', bottom: '18px', left: '18px', fontSize: '0.5rem', opacity: 0.25, color: '#d4af37' }}>☽</div>
          <div style={{ position: 'absolute', bottom: '18px', right: '18px', fontSize: '0.5rem', opacity: 0.25, color: '#d4af37' }}>☽</div>

          {/* Hover hint glow */}
          {onClick && (
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '12px',
              transition: 'opacity 0.3s ease',
              opacity: 0,
              boxShadow: 'inset 0 0 30px rgba(212,175,55,0.08)',
              pointerEvents: 'none',
            }} className="card-back-hover-glow" />
          )}
        </div>

        {/* Card back hover glow styles */}
        <style>{`
          .tarot-card-back:hover .card-back-hover-glow {
            opacity: 1 !important;
          }
        `}</style>
      </div>
    );
  }

  // ── Card Front (face-up) ──
  return (
    <div
      className="tarot-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        perspective: '1000px',
        animation: `cardFloat ${3 + (index % 5) * 0.4}s ease-in-out infinite`,
        animationDelay: `${index * 0.15}s`,
      }}
    >
      <div style={{
        width: compact ? '120px' : '160px',
        height: compact ? '200px' : '266px',
        borderRadius: '12px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        transform: isReversed ? 'rotateX(180deg)' : 'rotateY(0deg)',
        background: 'linear-gradient(160deg, #1a1530 0%, #0d0a1a 50%, #151025 100%)',
        border: '1px solid rgba(212,175,55,0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: compact ? '12px 8px' : '16px 12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.08)',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = isReversed ? 'rotateX(180deg) translateY(-12px) scale(1.04)' : 'translateY(-12px) scale(1.04)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.6), 0 0 40px rgba(212,175,55,0.2)';
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.transform = isReversed ? 'rotateX(180deg)' : 'rotateY(0deg)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.08)';
        }
      }}
      >
        {/* Top decoration */}
        <div style={{ fontSize: compact ? '0.9rem' : '1.1rem', opacity: 0.5 }}>✦</div>

        {/* Card number / Roman numeral */}
        <div style={{
          fontSize: compact ? '1.4rem' : '1.8rem',
          fontWeight: 300,
          color: '#d4af37',
          fontFamily: "'Georgia', serif",
          letterSpacing: '2px',
        }}>
          {getCardNumber(card.id)}
        </div>

        {/* Card art area - decorative */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
        }}>
          <div style={{
            fontSize: compact ? '2.2rem' : '3rem',
            lineHeight: 1,
            filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))',
          }}>
            {getCardSymbol(card.id)}
          </div>
          {card.astrological && (
            <div style={{
              fontSize: compact ? '0.65rem' : '0.75rem',
              opacity: 0.35,
              letterSpacing: '1px',
              marginTop: '4px',
            }}>
              {card.astrological}
            </div>
          )}
        </div>

        {/* Name & keyword */}
        <div style={{ textAlign: 'center', transform: isReversed ? 'rotateX(180deg)' : 'none' }}>
          <div style={{
            fontSize: compact ? '0.75rem' : '0.88rem',
            fontWeight: 500,
            color: '#e8e4d9',
            letterSpacing: '1px',
            lineHeight: 1.3,
            marginBottom: '4px',
          }}>
            {name}
          </div>
          {!showMeaning && (
            <div style={{
              fontSize: compact ? '0.58rem' : '0.68rem',
              opacity: 0.45,
              lineHeight: 1.3,
              maxWidth: compact ? '105px' : '140px',
            }}>
              {keyword}
            </div>
          )}
        </div>

        {/* Bottom decoration */}
        <div style={{ fontSize: compact ? '0.9rem' : '1.1rem', opacity: 0.5 }}>☽</div>

        {/* Upright / Reversed indicator badge */}
        <div style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          fontSize: compact ? '0.6rem' : '0.7rem',
          color: isReversed ? '#e57373' : '#81c784',
          background: isReversed ? 'rgba(100,40,40,0.6)' : 'rgba(40,80,50,0.6)',
          padding: '2px 7px',
          borderRadius: '4px',
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          transform: isReversed ? 'rotateX(-180deg)' : 'none', // Counter-rotate to keep text readable
        }}>
          {isReversed
            ? (language === 'en' ? '↻ Reversed' : '↻ 逆位')
            : (language === 'en' ? '↑ Upright' : '↑ 正位')
          }
        </div>

        {/* Meaning overlay */}
        {showMeaning && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,5,20,0.95)',
            borderRadius: '12px',
            padding: '14px',
            overflowY: 'auto',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#d4af37', textAlign: 'center', marginBottom: '8px' }}>
              {name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#aaa', textAlign: 'center', marginBottom: '10px' }}>
              {keyword}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#c8e6c9', lineHeight: 1.7, opacity: 0.9 }}>
              <span style={{ color: '#81c784' }}>({language === 'en' ? 'Upright' : '正位'})</span>
              <br/>{language === 'en' ? card.meaningUprightEn : card.meaningUprightCn}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#ffcdd2', lineHeight: 1.7, marginTop: '8px', opacity: 0.85 }}>
              <span style={{ color: '#e57373' }}>({language === 'en' ? 'Reversed' : '逆位'})</span>
              <br/>{language === 'en' ? card.meaningReversedEn : card.meaningReversedCn}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getCardNumber(id: number): string {
  // Major Arcana (0-21): Roman numerals
  if (id <= 21) {
    if (id === 0) return '0';
    const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
    return romans[id] || String(id);
  }
  // Minor Arcana (22-77)
  const pos = (id - 22) % 14; // 0=Ace, 1-9=numbered, 10=Page, 11=Knight, 12=Queen, 13=King
  const ranks = ['A','2','3','4','5','6','7','8','9','10','P','Kn','Q','K'];
  return ranks[pos] || String(pos);
}

function getCardSymbol(id: number): string {
  // Major Arcana (0-21)
  const major: Record<number, string> = {
    0: '🃏', 1: '🎭', 2: '🌙', 3: '👸', 4: '👑', 5: '⛪', 6: '💕', 7: '⚡',
    8: '🦁', 9: '🏮', 10: '🎡', 11: '⚖️', 12: '🙃', 13: '🦋', 14: '🏺',
    15: '😈', 16: '🗼', 17: '⭐', 18: '🌕', 19: '☀️', 20: '📯', 21: '🌍'
  };
  if (major[id]) return major[id];

  // Wands — 权杖 (22-35) 🔥
  if (id >= 22 && id <= 35) {
    const wandSymbols = ['🜏','II','III','IV','V','VI','VII','VIII','IX','X','👦','🐎','👸','👑'];
    const idx = id - 22;
    return '🔥' + (wandSymbols[idx] || 'W');
  }

  // Cups — 圣杯 (36-49) 💧
  if (id >= 36 && id <= 49) {
    const cupSymbols = ['🜏','II','III','IV','V','VI','VII','VIII','IX','X','👦','🐎','👸','👑'];
    const idx = id - 36;
    return '💧' + (cupSymbols[idx] || 'C');
  }

  // Swords — 宝剑 (50-63) ⚔️
  if (id >= 50 && id <= 63) {
    const swordSymbols = ['🜏','II','III','IV','V','VI','VII','VIII','IX','X','👦','🐎','👸','👑'];
    const idx = id - 50;
    return '⚔️' + (swordSymbols[idx] || 'S');
  }

  // Pentacles — 星币 (64-77) 🪙
  if (id >= 64 && id <= 77) {
    const pentacleSymbols = ['🜏','II','III','IV','V','VI','VII','VIII','IX','X','👦','🐎','👸','👑'];
    const idx = id - 64;
    return '🪙' + (pentacleSymbols[idx] || 'P');
  }

  return '✦';
}

export default TarotCardComponent;
