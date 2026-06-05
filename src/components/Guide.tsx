import React from 'react';
import { useLanguage } from '../i18n/context';

const Guide: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="guide-section" style={{
      maxWidth: '720px',
      margin: '48px auto',
      padding: '0 24px',
    }}>
      <h2 style={{
        fontSize: '1.4rem',
        color: '#d4af37',
        textAlign: 'center',
        marginBottom: '32px',
        letterSpacing: '3px',
        fontWeight: 300,
      }}>
        {t('guideTitle')}
      </h2>

      {/* Introduction */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid rgba(212,175,55,0.1)',
        marginBottom: '28px',
        lineHeight: 1.9,
        color: '#bbb',
        fontSize: '0.92rem',
      }}>
        {t('guideIntro')}
      </div>

      {/* How to ask */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{
          color: '#e8e4d9',
          fontSize: '1.1rem',
          marginBottom: '20px',
          fontWeight: 400,
          letterSpacing: '2px',
        }}>
          ☽ {t('guideHowToAsk')}
        </h3>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {[t('guideTip1'), t('guideTip2'), t('guideTip3'), t('guideTip4')].map((tip, i) => (
            <li key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              color: '#999',
              fontSize: '0.88rem',
              lineHeight: 1.7,
            }}>
              <span style={{ color: '#d4af37', marginTop: '4px', flexShrink: 0 }}>✦</span>
              <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c9b86c">$1</strong>') }} />
            </li>
          ))}
        </ul>
      </div>

      {/* Example questions */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(180,150,50,0.02))',
        borderRadius: '12px',
        padding: '24px',
        borderLeft: '3px solid rgba(212,175,55,0.35)',
        marginBottom: '28px',
      }}>
        <p style={{
          color: '#d4af37',
          fontSize: '0.95rem',
          marginBottom: '14px',
          letterSpacing: '1px',
        }}>{t('guideExampleQuestions')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[t('guideQ1'), t('guideQ2'), t('guideQ3'), t('guideQ4')].map((q, i) => (
            <p key={i} style={{
              color: '#888',
              fontSize: '0.85rem',
              fontStyle: 'italic',
              paddingLeft: '16px',
              borderLeft: '1px solid rgba(212,175,55,0.15)',
            }}>{q}</p>
          ))}
        </div>
      </div>

      {/* Creating the right space */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{
          color: '#e8e4d9',
          fontSize: '1.1rem',
          marginBottom: '20px',
          fontWeight: 400,
          letterSpacing: '2px',
        }}>
          🌙 {t('guideSpace')}
        </h3>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px',
        }}>
          {[t('guideSpace1'), t('guideSpace2'), t('guideSpace3'), t('guideSpace4'), t('guideSpace5')].map((s, i) => (
            <li key={i} style={{
              color: '#888',
              fontSize: '0.84rem',
              lineHeight: 1.7,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ color: '#d4af37', fontSize: '0.7rem' }}>☽</span> {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Begin reading CTA */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <a href="#oracle" style={{
          display: 'inline-block',
          padding: '16px 44px',
          fontSize: '1rem',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '60px',
          color: '#d4af37',
          textDecoration: 'none',
          letterSpacing: '3px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(212,175,55,0.12)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(212,175,55,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          {t('beginReading')}
        </a>
      </div>
    </section>
  );
};

export default Guide;
