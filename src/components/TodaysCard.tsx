import React, { useState, useEffect } from 'react';
import { fullDeck } from '../data/tarot';
import type { TarotCard as TarotCardType } from '../data/tarot';
import TarotCardComponent from './TarotCard';
import { useLanguage } from '../i18n/context';

const TodaysCard: React.FC = () => {
  const [todayCard, setTodayCard] = useState<TarotCardType | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    // Use date-based seed for consistency within the day
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('tarot-daily-date');
    
    if (savedDate === today) {
      const savedId = localStorage.getItem('tarot-daily-card');
      const savedRev = localStorage.getItem('tarot-daily-rev') === 'true';
      if (savedId) {
        const card = fullDeck.find(c => c.id === parseInt(savedId));
        if (card) {
          setTodayCard(card);
          setIsReversed(savedRev);
          setRevealed(true);
          return;
        }
      }
    }

    // Generate new daily card
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const idx = seed % fullDeck.length;
    const rev = (seed % 3) === 0; // ~33% chance reversed
    setTodayCard(fullDeck[idx]);
    setIsReversed(rev);
  }, []);

  const handleDraw = () => {
    if (todayCard) {
      localStorage.setItem('tarot-daily-date', new Date().toDateString());
      localStorage.setItem('tarot-daily-card', String(todayCard.id));
      localStorage.setItem('tarot-daily-rev', String(isReversed));
      setRevealed(true);
    }
  };

  return (
    <section className="todays-card-section" style={{
      background: 'linear-gradient(135deg, rgba(212,175,55,0.04), rgba(100,80,150,0.03))',
      borderRadius: '20px',
      padding: '32px 24px',
      margin: '36px auto',
      maxWidth: '480px',
      border: '1px solid rgba(212,175,55,0.12)',
      textAlign: 'center',
    }}>
      <h3 style={{
        color: '#d4af37',
        fontSize: '1.15rem',
        marginBottom: '24px',
        letterSpacing: '3px',
        fontWeight: 300,
      }}>
        ☽ {t('todaysCard')} ☾
      </h3>

      {!revealed ? (
        <div>
          <div onClick={handleDraw} style={{
            width: '160px',
            height: '266px',
            margin: '0 auto 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1a1530, #0d0a1a)',
            border: '1px solid rgba(212,175,55,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.2)';
            e.currentTarget.style.transform = 'translateY(-8px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✦</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.5, letterSpacing: '2px' }}>?</div>
            </div>
          </div>
          <button
            onClick={handleDraw}
            style={{
              padding: '12px 32px',
              fontSize: '0.9rem',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '40px',
              background: 'transparent',
              color: '#d4af37',
              cursor: 'pointer',
              letterSpacing: '2px',
              transition: 'all 0.3s ease',
            }}
          >
            {t('drawDailyCard')}
          </button>
        </div>
      ) : todayCard ? (
        <div className="daily-card-revealed" style={{
          animation: 'revealGlow 1s ease-out',
        }}>
          <TarotCardComponent card={todayCard} isReversed={isReversed} showMeaning />
          
          <p style={{
            marginTop: '18px',
            color: '#888',
            fontSize: '0.82rem',
            fontStyle: 'italic',
          }}>
            {isReversed 
              ? (language === 'en' ? 'This card appears in reverse — consider its shadow meaning.' : '此牌以逆位出现——请思考其隐含含义。')
              : (language === 'en' ? 'This card shines brightly for you today.' : '这张牌在今天为你闪耀。')
            }
          </p>

          <button
            onClick={() => {
              setRevealed(false);
              // Re-generate
              const seed = Math.random() * 1000;
              const idx = Math.floor(seed) % fullDeck.length;
              const rev = Math.floor(seed) % 3 === 0;
              setTodayCard(fullDeck[idx]);
              setIsReversed(rev);
            }}
            style={{
              marginTop: '16px',
              padding: '8px 24px',
              fontSize: '0.78rem',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '30px',
              background: 'transparent',
              color: '#666',
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            {t('newReading')}
          </button>
        </div>
      ) : null}

      <style>{`
        @keyframes revealGlow {
          0% { opacity: 0; transform: scale(0.85); filter: blur(10px); }
          60% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
      `}</style>
    </section>
  );
};

export default TodaysCard;
