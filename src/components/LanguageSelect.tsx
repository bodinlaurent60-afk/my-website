import React from 'react';

const LanguageSelect: React.FC<{ onSelect: (lang: 'en' | 'cn') => void }> = ({ onSelect }) => {
  return (
    <div className="language-landing" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1035 50%, #0d1117 100%)',
      color: '#e8e4d9',
      fontFamily: "'Georgia', 'Noto Serif SC', serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Stars background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            background: '#fff',
            borderRadius: '50%',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.7 + 0.3,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Moon glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,180,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ zIndex: 1, textAlign: 'center', maxWidth: '600px', padding: '40px' }}>
        {/* Decorative symbols */}
        <div style={{
          fontSize: '2rem',
          letterSpacing: '8px',
          marginBottom: '16px',
          opacity: 0.9,
        }}>
          ☽ ✦ ☾
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 300,
          letterSpacing: '6px',
          margin: '0 0 12px 0',
          background: 'linear-gradient(135deg, #d4af37 0%, #f0e6c8 50%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          TAROT ORACLE
        </h1>

        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          fontWeight: 300,
          letterSpacing: '4px',
          margin: '0 0 48px 0',
          opacity: 0.75,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          塔罗神谕 · Ancient Wisdom Revealed
        </p>

        <p style={{
          fontSize: '1rem',
          opacity: 0.55,
          margin: '0 0 56px 0',
          lineHeight: 1.8,
        }}>
          Choose your language / 选择语言
        </p>

        {/* Language buttons */}
        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => onSelect('en')}
            style={{
              padding: '18px 44px',
              fontSize: '1.15rem',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '60px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(240,230,200,0.05))',
              color: '#d4af37',
              cursor: 'pointer',
              letterSpacing: '3px',
              transition: 'all 0.4s ease',
              fontFamily: "'Georgia', serif",
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(212,175,55,0.18)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(212,175,55,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(240,230,200,0.05))';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            English
          </button>

          <button
            onClick={() => onSelect('cn')}
            style={{
              padding: '18px 44px',
              fontSize: '1.15rem',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '60px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(240,230,200,0.05))',
              color: '#d4af37',
              cursor: 'pointer',
              letterSpacing: '3px',
              transition: 'all 0.4s ease',
              fontFamily: "'Noto Serif SC', serif",
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(212,175,55,0.18)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(212,175,55,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(240,230,200,0.05))';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            中文
          </button>
        </div>

        <p style={{
          marginTop: '64px',
          fontSize: '0.82rem',
          opacity: 0.3,
          letterSpacing: '2px',
        }}>
          ✦ The cards are waiting ✦<br/>
          牌在等待你
        </p>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelect;
