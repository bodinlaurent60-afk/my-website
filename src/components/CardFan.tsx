import React, { useState } from 'react';
import type { TarotCard as TarotCardType } from '../data/tarot';
import { fullDeck } from '../data/tarot';
import TarotCardComponent from './TarotCard';
import { useLanguage } from '../i18n/context';

interface Props {
  onDraw: (card: TarotCardType) => void;
  drawnIds: number[];
  requiredCount: number;
}

const CardFan: React.FC<Props> = ({ onDraw, drawnIds, requiredCount }) => {
  const [shuffledCards, setShuffledCards] = useState<TarotCardType[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const { t } = useLanguage();

  const handleShuffle = () => {
    const shuffled = [...fullDeck]
      .sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setIsShuffled(true);
  };

  // Show shuffle button before shuffling
  if (!isShuffled) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <button
          onClick={handleShuffle}
          style={{
            padding: '18px 48px',
            fontSize: '1rem',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '60px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(180,150,50,0.08))',
            color: '#d4af37',
            cursor: 'pointer',
            letterSpacing: '3px',
            transition: 'all 0.4s ease',
            fontFamily: "'Georgia', serif",
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}
        >
          {t('shuffleBtn')}
        </button>
      </div>
    );
  }

  // Grid layout — small cards in rows like reference image
  const availableCards = shuffledCards.filter(c => !drawnIds.includes(c.id));

  return (
    <div className="card-fan-container" style={{ padding: '16px 20px' }}>
      <p style={{
        textAlign: 'center',
        color: '#888',
        fontSize: '0.88rem',
        marginBottom: '14px',
        fontStyle: 'italic',
        opacity: 0.7,
      }}>
        {t('clickToDraw').replace('{count}', String(requiredCount))}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '5px',
        justifyContent: 'center',
        maxWidth: '680px',
        margin: '0 auto',
      }}>
        {availableCards.map((card, i) => (
          <div
            key={card.id}
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => onDraw(card)}
          >
            <div style={{ transform: 'scale(0.46)', transformOrigin: 'center center' }}>
              <TarotCardComponent card={card} compact index={i} faceDown />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(212,175,55,0.2); }
          50% { box-shadow: 0 0 30px rgba(212,175,55,0.4); }
        }
      `}</style>
    </div>
  );
};

export default CardFan;
