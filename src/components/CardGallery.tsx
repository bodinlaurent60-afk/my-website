import React, { useState } from 'react';
import { allCards } from '../data/tarot';
import TarotCardComponent from './TarotCard';
import { useLanguage } from '../i18n/context';

const CardGallery: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { t } = useLanguage();

  return (
    <section className="card-gallery" style={{
      maxWidth: '900px',
      margin: '48px auto',
      padding: '0 24px',
    }}>
      <h2 style={{
        fontSize: '1.3rem',
        color: '#d4af37',
        textAlign: 'center',
        marginBottom: '10px',
        letterSpacing: '3px',
        fontWeight: 300,
      }}>
        {t('cardGallery')}
      </h2>
      <p style={{
        textAlign: 'center',
        color: '#666',
        fontSize: '0.85rem',
        marginBottom: '32px',
        opacity: 0.6,
      }}>
        {t('gallerySubtitle')}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '16px',
        justifyContent: 'center',
      }}>
        {allCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setSelectedId(selectedId === card.id ? null : card.id)}
            style={{ cursor: 'pointer' }}
          >
            <TarotCardComponent
              card={card}
              compact
              showMeaning={selectedId === card.id}
              index={card.id}
            />
          </div>
        ))}
      </div>

      <p style={{
        textAlign: 'center',
        marginTop: '24px',
        color: '#555',
        fontSize: '0.8rem',
        fontStyle: 'italic',
        opacity: 0.5,
      }}>
        {t('clickToView')}
      </p>
    </section>
  );
};

export default CardGallery;
