import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './i18n/context';
import LanguageSelect from './components/LanguageSelect';
import TarotCardComponent from './components/TarotCard';
import CardFan from './components/CardFan';
import CardGallery from './components/CardGallery';
import Guide from './components/Guide';
import type { TarotCard as TarotCardType, SpreadType } from './data/tarot';
import { spreads } from './data/tarot';

interface DrawnCard {
  card: TarotCardType;
  reversed: boolean;
}

interface ReadingHistory {
  id: string;
  question: string;
  spread: SpreadType;
  cards: DrawnCard[];
  timestamp: number;
}

// Main app content (inside language provider)
const AppContent: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'oracle' | 'gallery' | 'guide'>('oracle');
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>('single');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [readingText, setReadingText] = useState('');
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tarot-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const currentSpread = spreads.find(s => s.id === selectedSpread);

  const handleDraw = useCallback((card: TarotCardType) => {
    if (!currentSpread) return;
    
    if (drawnCards.length < currentSpread.count) {
      const reversed = Math.random() > 0.65; // ~35% chance of reversed
      setDrawnCards(prev => [...prev, { card, reversed }]);
    }
  }, [currentSpread, drawnCards.length]);

  const handleAskOracle = useCallback(async () => {
    if (drawnCards.length === 0) return;

    setIsReading(true);
    setReadingText(t('loading'));

    try {
      // Build card data for the AI API
      const cardsPayload = drawnCards.map((dc, i) => {
        const pos = currentSpread?.positions[i];
        const posLabel = language === 'cn' ? pos?.labelCn : pos?.labelEn;
        const name = language === 'cn' ? dc.card.nameCn : dc.card.nameEn;
        const meaning = dc.reversed
          ? (language === 'cn' ? dc.card.meaningReversedCn : dc.card.meaningReversedEn)
          : (language === 'cn' ? dc.card.meaningUprightCn : dc.card.meaningUprightEn);

        return {
          positionLabel: posLabel || '',
          cardName: name,
          isReversed: dc.reversed,
          meaning: meaning,
          keyword: language === 'cn' ? dc.card.keywordCn : dc.card.keywordEn,
        };
      });

      const spreadName = currentSpread
        ? (language === 'cn' ? currentSpread.nameCn : currentSpread.nameEn)
        : '';

      // Call the AI oracle backend
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          spreadName,
          language,
          cards: cardsPayload,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${response.status})`);
      }

      const result = await response.json();

      if (!result.success || !result.reading) {
        throw new Error(result.error || 'No reading returned');
      }

      setReadingText(result.reading);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[Oracle] Error:', errMsg);

      // Fallback: show error message + template text
      const fallbackText = language === 'cn'
        ? `⚠ 神谕暂时无法连接，请稍后重试。\n\n---\n${errMsg}\n\n> ☽ 牌所揭示的，本就存在于你内心。在反思这些讯息时，请相信你的直觉。 ☾`
        : `⚠ The Oracle is temporarily unavailable. Please try again.\n\n---\n${errMsg}\n\n> ☽ The cards speak to what is already within you. Trust your intuition as you reflect on these messages. ☾`;

      setReadingText(fallbackText);
    } finally {
      setIsReading(false);

      // Save to history regardless of success
      const newEntry: ReadingHistory = {
        id: Date.now().toString(),
        question,
        spread: selectedSpread,
        cards: drawnCards,
        timestamp: Date.now(),
      };
      const newHistory = [newEntry, ...history].slice(0, 50);
      setHistory(newHistory);
      localStorage.setItem('tarot-history', JSON.stringify(newHistory));
    }
  }, [drawnCards, currentSpread, t, language, history, question, selectedSpread]);

  const handleClearAll = () => {
    setDrawnCards([]);
    setReadingText('');
    setRevealedIndices(new Set());
  };

  const handleNewReading = () => {
    handleClearAll();
    window.location.hash = '#oracle';
  };

  // Reveal phase: flip a single card
  const handleRevealCard = useCallback((index: number) => {
    setRevealedIndices(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Reveal phase: flip all cards at once
  const handleRevealAll = useCallback(() => {
    const all = new Set<number>();
    drawnCards.forEach((_, i) => all.add(i));
    setRevealedIndices(all);
  }, [drawnCards]);

  // Whether we're in the reveal phase (all cards drawn, not yet fully revealed)
  const isRevealPhase = drawnCards.length > 0 && drawnCards.length >= (currentSpread?.count || 1)
    && revealedIndices.size < drawnCards.length && !isReading && !readingText;

  // Whether all cards have been revealed (ready to ask oracle)
  const isAllRevealed = drawnCards.length > 0
    && revealedIndices.size >= drawnCards.length;

  return (
    <div className="app-wrapper" style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #110d24 30%, #0a0812 70%, #080610 100%)',
      color: '#e8e4d9',
      fontFamily: "'Georgia', 'Noto Serif SC', serif",
    }}>
      {/* Stars background */}
      <StarsBackground />

      {/* Header */}
      <header style={{
        padding: '28px 20px 16px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ fontSize: '1.4rem', letterSpacing: '8px', opacity: 0.7 }}>☽ ✦ ☾</div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          fontWeight: 300,
          letterSpacing: '6px',
          margin: '12px 0 4px',
          color: '#d4af37',
        }}>
          {t('siteTitle')}
        </h1>
        <p style={{
          fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
          opacity: 0.55,
          letterSpacing: '3px',
          margin: 0,
          fontWeight: 300,
        }}>
          {t('siteSubtitle')}
        </p>

        {/* Language switcher */}
        <div style={{ marginTop: '14px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => setLanguage('en')}
            style={{
              padding: '4px 16px',
              fontSize: '0.78rem',
              border: `1px solid ${language === 'en' ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '20px',
              background: language === 'en' ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: language === 'en' ? '#d4af37' : '#666',
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
            }}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('cn')}
            style={{
              padding: '4px 16px',
              fontSize: '0.78rem',
              border: `1px solid ${language === 'cn' ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '20px',
              background: language === 'cn' ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: language === 'cn' ? '#d4af37' : '#666',
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
            }}
          >
            中文
          </button>
        </div>

        {/* Tab Navigation */}
        <nav style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'oracle', label: '☽ Oracle · 神谕' },
            { key: 'gallery', label: '🎴 Gallery · 牌库' },
            { key: 'guide', label: '📖 Guide · 指南' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                padding: '8px 22px',
                fontSize: '0.82rem',
                border: `1px solid ${activeTab === tab.key ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '25px',
                background: activeTab === tab.key ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: activeTab === tab.key ? '#d4af37' : '#777',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                padding: '8px 22px',
                fontSize: '0.82rem',
                border: `1px solid ${showHistory ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '25px',
                background: showHistory ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: showHistory ? '#d4af37' : '#777',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
              }}
            >
              📜 {t('history')} ({history.length})
            </button>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px', position: 'relative', zIndex: 10 }}>

        {/* History Panel */}
        {showHistory && (
          <div style={{
            background: 'rgba(0,0,0,0.35)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid rgba(212,175,55,0.08)',
            maxHeight: '400px',
            overflowY: 'auto',
          }}>
            <h3 style={{ color: '#d4af37', marginBottom: '16px', fontSize: '1rem', letterSpacing: '2px' }}>
              📜 {t('history')}
            </h3>
            {history.length === 0 ? (
              <p style={{ color: '#555', fontSize: '0.88rem' }}>{t('noHistory')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map(entry => (
                  <div key={entry.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '10px',
                    padding: '14px',
                    borderLeft: '2px solid rgba(212,175,55,0.2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>
                        {new Date(entry.timestamp).toLocaleDateString(language === 'cn' ? 'zh-CN' : 'en-US')}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#d4af37', opacity: 0.6 }}>
                        {spreads.find(s => s.id === entry.spread)?.[language === 'en' ? 'nameEn' : 'nameCn']}
                      </span>
                    </div>
                    {entry.question && (
                      <p style={{ fontSize: '0.82rem', color: '#aaa', fontStyle: 'italic', marginBottom: '6px' }}>
                        "{entry.question}"
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {entry.cards.map((dc) => (
                        <span key={dc.card.id} style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          background: 'rgba(212,175,55,0.08)',
                          color: '#c9b86c',
                        }}>
                          {language === 'en' ? dc.card.nameCn : dc.card.nameEn}
                          {dc.reversed ? ' ↻' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORACLE TAB */}
        {activeTab === 'oracle' && (
          <section id="oracle" className="oracle-section">
            {/* Question Input */}
            <div style={{
              maxWidth: '600px',
              margin: '0 auto 28px',
              padding: '0 20px',
            }}>
              <label style={{
                display: 'block',
                color: '#d4af37',
                fontSize: '0.95rem',
                marginBottom: '10px',
                letterSpacing: '2px',
                fontWeight: 300,
              }}>
                ✦ {t('yourQuestion')}
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder={t('questionPlaceholder')}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  color: '#e8e4d9',
                  fontSize: '0.92rem',
                  fontFamily: "'Noto Serif SC', Georgia, serif",
                  resize: 'vertical',
                  outline: 'none',
                  lineHeight: 1.7,
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'}
              />
            </div>

            {/* Spread Selection — 8 spreads in 2×4 grid */}
            <div style={{
              maxWidth: '600px',
              margin: '0 auto 28px',
              padding: '0 20px',
            }}>
              <label style={{
                display: 'block',
                color: '#d4af37',
                fontSize: '1.05rem',
                marginBottom: '16px',
                letterSpacing: '3px',
                fontWeight: 300,
              }}>
                {t('chooseSpread')}
              </label>

              {/* 2×4 Grid of spread cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {spreads.map(spread => {
                  const isSelected = selectedSpread === spread.id;
                  return (
                    <button
                      key={spread.id}
                      onClick={() => {
                        setSelectedSpread(spread.id);
                        handleClearAll();
                      }}
                      style={{
                        padding: '20px 16px',
                        border: `2px solid ${isSelected ? '#d4af37' : 'rgba(212,175,55,0.15)'}`,
                        borderRadius: '6px',
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(180,150,50,0.04))'
                          : 'rgba(30,25,50,0.7)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minHeight: '100px',
                        position: 'relative',
                        boxShadow: isSelected
                          ? '0 0 20px rgba(212,175,55,0.08), inset 0 0 20px rgba(212,175,55,0.03)'
                          : 'none',
                      }}
                    >
                      {/* Icon */}
                      <span style={{
                        fontSize: '1.8rem',
                        lineHeight: 1,
                        filter: isSelected ? 'none' : 'grayscale(0.5)',
                        opacity: isSelected ? 1 : 0.5,
                        color: isSelected ? '#d4af37' : '#999',
                        transition: 'all 0.3s ease',
                      }}>{spread.icon}</span>
                      
                      {/* Name */}
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 400,
                        letterSpacing: '2px',
                        color: isSelected ? '#d4af37' : '#a0a0b0',
                        transition: 'color 0.3s ease',
                      }}>
                        {language === 'en' ? spread.nameEn : spread.nameCn}
                      </span>

                      {/* Card count */}
                      <span style={{
                        fontSize: '0.78rem',
                        opacity: isSelected ? 0.7 : 0.35,
                        color: '#888',
                        letterSpacing: '1px',
                      }}>
                        {spread.count}{language === 'cn' ? '张' : ' cards'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Spread description — shown when selected */}
              {currentSpread && (
                <div style={{
                  marginTop: '18px',
                  textAlign: 'center',
                  padding: '14px 24px',
                  borderRadius: '8px',
                  background: 'rgba(212,175,55,0.04)',
                  border: '1px solid rgba(212,175,55,0.08)',
                  animation: 'fadeInUp 0.5s ease-out',
                }}>
                  <p style={{
                    fontSize: '0.92rem',
                    color: '#c9b86c',
                    fontStyle: 'italic',
                    margin: 0,
                    lineHeight: 1.7,
                  }}>
                    {language === 'en' ? currentSpread.descriptionEn : currentSpread.descriptionCn}
                  </p>
                </div>
              )}
            </div>

            {/* Card Fan / Drawing area — requires question */}
            {drawnCards.length < (currentSpread?.count || 1) && (
              question.trim().length > 0 ? (
                <CardFan onDraw={handleDraw} drawnIds={drawnCards.map(dc => dc.card.id)} requiredCount={currentSpread?.count || 1} />
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  animation: 'pulseOpacity 2s ease-in-out infinite',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✦</div>
                  <p style={{
                    color: '#c9a855',
                    fontSize: '0.95rem',
                    letterSpacing: '2px',
                    fontStyle: 'italic',
                    opacity: 0.85,
                  }}>
                    {t('needQuestion')}
                  </p>
                </div>
              )
            )}

            {/* Drawn Cards Display — Reveal Phase */}
            {drawnCards.length > 0 && (
              <div style={{
                maxWidth: '700px',
                margin: '36px auto 0',
                padding: '0 20px',
              }}>
                {/* Reveal phase header */}
                {(isRevealPhase || isAllRevealed) && !readingText && (
                  <p style={{
                    textAlign: 'center',
                    fontSize: '1rem',
                    color: isAllRevealed ? '#d4af37' : '#888a9c',
                    marginBottom: '20px',
                    letterSpacing: '2px',
                    opacity: 0.8,
                    animation: 'fadeInUp 0.6s ease-out',
                  }}>
                    {isAllRevealed ? t('allRevealed') : t('clickToReveal')}
                  </p>
                )}

                {/* Position labels row — shown above cards */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  justifyContent: 'center',
                  marginBottom: '4px',
                }}>
                  {drawnCards.map((_, i) => {
                    const pos = currentSpread?.positions[i];
                    return pos ? (
                      <div key={`pos-${i}`} style={{
                        width: '160px',
                        textAlign: 'center',
                      }}>
                        <span style={{
                          fontSize: '0.85rem',
                          color: '#888a9c',
                          letterSpacing: '2px',
                        }}>
                          {language === 'en' ? pos.labelEn : pos.labelCn}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Cards in spread positions */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}>
                  {drawnCards.map((dc, i) => {
                    const isRevealed = revealedIndices.has(i);
                    return (
                      <div key={`${dc.card.id}-${i}`} style={{ textAlign: 'center' }}>
                        {/* Card: face-down until revealed */}
                        <TarotCardComponent
                          card={dc.card}
                          isReversed={dc.reversed}
                          index={i}
                          faceDown={!isRevealed && drawnCards.length >= (currentSpread?.count || 1)}
                          onClick={
                            (!isRevealed && drawnCards.length >= (currentSpread?.count || 1))
                              ? () => handleRevealCard(i) : undefined
                          }
                        />
                      </div>
                    );
                  })}
                </div>

                {/* ──── Action buttons ──── */}

                {/* Reveal phase: show "Reveal All" button + Clear */}
                {isRevealPhase && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleRevealAll}
                      style={{
                        padding: '16px 48px',
                        fontSize: '1.05rem',
                        border: `2px solid rgba(212,175,55,0.35)`,
                        borderRadius: '6px',
                        background: 'rgba(30,25,50,0.7)',
                        color: '#d4af37',
                        cursor: 'pointer',
                        letterSpacing: '3px',
                        transition: 'all 0.3s ease',
                        minWidth: '260px',
                      }}
                    >
                      ✦ {t('revealAll')} ✦
                    </button>
                    <button
                      onClick={handleClearAll}
                      style={{
                        padding: '16px 28px',
                        fontSize: '0.85rem',
                        border: '1px solid rgba(255,100,100,0.2)',
                        borderRadius: '50px',
                        background: 'transparent',
                        color: '#996',
                        cursor: 'pointer',
                        letterSpacing: '1px',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {t('clearAll')}
                    </button>
                  </div>
                )}

                {/* All revealed: show "Ask Oracle" button + Clear */}
                {isAllRevealed && !readingText && !isReading && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleAskOracle}
                      style={{
                        padding: '14px 40px',
                        fontSize: '0.95rem',
                        border: '1px solid rgba(212,175,55,0.45)',
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(180,150,50,0.08))',
                        color: '#d4af37',
                        cursor: 'pointer',
                        letterSpacing: '2px',
                        transition: 'all 0.3s ease',
                        animation: 'fadeInUp 0.5s ease-out',
                      }}
                    >
                      {t('askOracle')}
                    </button>
                    <button
                      onClick={handleClearAll}
                      style={{
                        padding: '14px 28px',
                        fontSize: '0.85rem',
                        border: '1px solid rgba(255,100,100,0.2)',
                        borderRadius: '50px',
                        background: 'transparent',
                        color: '#996',
                        cursor: 'pointer',
                        letterSpacing: '1px',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {t('clearAll')}
                    </button>
                  </div>
                )}

                {/* Loading state */}
                {isReading && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    animation: 'pulseOpacity 2s ease-in-out infinite',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔮</div>
                    <p style={{ color: '#888', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      {t('loading')}
                    </p>
                  </div>
                )}

                {/* Reading Result */}
                {readingText && !isReading && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.04), rgba(80,60,120,0.03))',
                    borderRadius: '16px',
                    padding: '28px',
                    marginTop: '24px',
                    border: '1px solid rgba(212,175,55,0.12)',
                    animation: 'fadeInUp 0.8s ease-out',
                  }}>
                    <h3 style={{
                      color: '#d4af37',
                      fontSize: '1.1rem',
                      marginBottom: '18px',
                      textAlign: 'center',
                      letterSpacing: '2px',
                    }}>
                      {t('readingResult')}
                    </h3>
                    <div style={{
                      color: '#bbb',
                      fontSize: '0.88rem',
                      lineHeight: 1.9,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {readingText}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                      <button
                        onClick={handleNewReading}
                        style={{
                          padding: '12px 32px',
                          fontSize: '0.85rem',
                          border: '1px solid rgba(212,175,55,0.3)',
                          borderRadius: '40px',
                          background: 'transparent',
                          color: '#d4af37',
                          cursor: 'pointer',
                          letterSpacing: '2px',
                        }}
                      >
                        {t('newReading')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!drawnCards.length && !readingText && (
              <p style={{
                textAlign: 'center',
                color: '#444',
                fontSize: '0.85rem',
                fontStyle: 'italic',
                marginTop: '20px',
              }}>
                {t('noCardsDrawn')}
              </p>
            )}
          </section>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && <CardGallery />}

        {/* GUIDE TAB */}
        {activeTab === 'guide' && <Guide />}

      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '40px 20px',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        color: '#333',
        fontSize: '0.75rem',
        letterSpacing: '2px',
        position: 'relative',
        zIndex: 10,
      }}>
        ☽ ✦ ☾<br/>
        Tarot Oracle · 塔罗神谕<br/>
        <span style={{ opacity: 0.4 }}>Ancient Wisdom Revealed</span>
      </footer>

      {/* Global styles for animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseOpacity {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: rgba(212,175,55,0.15); 
          border-radius: 3px; 
        }
        ::-webkit-scrollbar-thumb:hover { 
          background: rgba(212,175,55,0.3); 
        }

        * { scrollbar-width: thin; scrollbar-color: rgba(212,175,55,0.15) transparent; }

        textarea::placeholder { color: #444; font-style: italic; }
        
        .app-wrapper {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

// Star background component
const StarsBackground: React.FC = () => (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
    {Array.from({ length: 120 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: Math.random() * 2 + 0.5 + 'px',
        height: Math.random() * 2 + 0.5 + 'px',
        background: '#fff',
        borderRadius: '50%',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        opacity: Math.random() * 0.5 + 0.1,
        animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 5}s`,
      }} />
    ))}
    <style>{`
      @keyframes twinkle {
        0%, 100% { opacity: 0.1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.4); }
      }
    `}</style>
  </div>
);

// Root App with language handling
const App: React.FC = () => {
  const [langSelected, setLangSelected] = useState<string | null>(
    () => localStorage.getItem('tarot-language')
  );

  if (!langSelected) {
    return <LanguageSelect onSelect={(lang) => {
      setLangSelected(lang);
      localStorage.setItem('tarot-language', lang);
    }} />;
  }

  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
