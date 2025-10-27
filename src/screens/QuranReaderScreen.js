import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuranService from '../services/QuranService';
import StorageService from '../services/StorageService';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, } from 'firebase/firestore';
import { db } from '../config/firebase';

const QuranReaderScreen = () => {
  const { surahId } = useParams();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [surahData, setSurahData] = useState(null);
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);

  useEffect(() => {
    loadSurah();
    
    // Cleanup function
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahId]);

  const loadSurah = async () => {
    try {
      setLoading(true);
      console.log('Loading surah:', surahId); // Debug log
      
      const data = await QuranService.getSurahWithTranslation(
        parseInt(surahId),
        null, // reciterId - we'll add this later
        'uthmani' // scriptType
      );

      console.log('Surah data received:', data); // Debug log

      if (!data || !data.surah || !data.ayahs) {
        throw new Error('Invalid data structure from API');
      }

      setSurahData(data.surah);
      setAyahs(data.ayahs);
      setError(null);
    } catch (err) {
      console.error('Error loading surah:', err);
      setError('Failed to load surah. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAyahMemorized = async (ayahNumber) => {
    const isMemorized = StorageService.isAyahMemorized(parseInt(surahId), ayahNumber);

    if (isMemorized) {
      StorageService.unmarkAyahMemorized(parseInt(surahId), ayahNumber);
    } else {
      StorageService.markAyahMemorized(parseInt(surahId), ayahNumber);
    }

    // Sync to Firestore
    await syncProgressToFirestore();

    // Force re-render
    setAyahs([...ayahs]);
  };

  const syncProgressToFirestore = async () => {
    if (!currentUser) return;

    try {
      const state = StorageService.getState();
      const userRef = doc(db, 'users', currentUser.uid, 'progress', 'data');
      await setDoc(userRef, {
        ayahProgress: state.ayahProgress || {},
        progress: state.progress || {},
        lastMemorizedPosition: state.lastMemorizedPosition,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing to Firestore:', error);
    }
  };

  const playAyahAudio = async (ayah) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingAyah(null);
    }

    if (!ayah.audioUrl) {
      alert('Audio not available for this ayah');
      return;
    }

    try {
      const audio = new Audio(ayah.audioUrl);
      setCurrentAudio(audio);
      setPlayingAyah(ayah.number);

      audio.onended = () => {
        setPlayingAyah(null);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        alert('Failed to play audio');
        setPlayingAyah(null);
        setCurrentAudio(null);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Failed to play audio');
      setPlayingAyah(null);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingAyah(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getSurahProgress = () => {
    const state = StorageService.getState();
    if (!state || !state.ayahProgress[surahId]) {
      return { memorized: 0, total: ayahs.length, percentage: 0 };
    }

    const surahProgress = state.ayahProgress[surahId];
    const memorizedCount = Object.values(surahProgress).filter(ayah => ayah.memorized).length;
    const percentage = ayahs.length > 0 ? Math.round((memorizedCount / ayahs.length) * 100) : 0;

    return {
      memorized: memorizedCount,
      total: ayahs.length,
      percentage
    };
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.logo}>Quran Hifdh</h1>
          </div>
        </header>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading Surah...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.logo}>Quran Hifdh</h1>
          </div>
        </header>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={loadSurah} style={styles.retryButton}>
            Retry
          </button>
          <button onClick={() => navigate('/surahs')} style={styles.backButton}>
            Back to Surahs
          </button>
        </div>
      </div>
    );
  }

  const progress = getSurahProgress();

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button onClick={() => navigate('/surahs')} style={styles.backBtn}>
              ← Back
            </button>
            <h1 style={styles.logo}>Quran Hifdh</h1>
          </div>
          <div style={styles.headerRight}>
            <button onClick={() => navigate('/dashboard')} style={styles.navButton}>
              Dashboard
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Surah Header */}
      <div style={styles.surahHeader}>
        <div style={styles.surahHeaderContent}>
          <div style={styles.surahTitleSection}>
            <h2 style={styles.surahName}>{surahData?.name_simple}</h2>
            <p style={styles.surahInfo}>
              {surahData?.revelation_place} • {surahData?.verses_count} Ayahs
            </p>
          </div>
          <div style={styles.progressSection}>
            <div style={styles.progressInfo}>
              <span style={styles.progressLabel}>Progress:</span>
              <span style={styles.progressNumbers}>
                {progress.memorized}/{progress.total} ({progress.percentage}%)
              </span>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress.percentage}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={styles.controlsBar}>
        <div style={styles.controlsContent}>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            style={showTranslation ? styles.controlButtonActive : styles.controlButton}
          >
            {showTranslation ? '✓ Translation' : 'Translation'}
          </button>
          {playingAyah && (
            <button onClick={stopAudio} style={styles.stopButton}>
              ⏹ Stop Audio
            </button>
          )}
        </div>
      </div>

      {/* Ayahs List */}
      <div style={styles.mainContent}>
        <div style={styles.ayahsList}>
          {ayahs.map((ayah, index) => {
            const isMemorized = StorageService.isAyahMemorized(parseInt(surahId), ayah.number);
            const isPlaying = playingAyah === ayah.number;

            return (
              <div
                key={ayah.id}
                style={{
                  ...styles.ayahCard,
                  backgroundColor: isMemorized ? '#f0fdf4' : theme.colors.white
                }}
              >
                {/* Ayah Number Badge */}
                <div style={styles.ayahHeader}>
                  <div style={styles.ayahNumber}>
                    <span style={styles.ayahNumberText}>{ayah.number}</span>
                  </div>
                  <div style={styles.ayahActions}>
                    {ayah.audioUrl && (
                      <button
                        onClick={() => isPlaying ? stopAudio() : playAyahAudio(ayah)}
                        style={isPlaying ? styles.audioButtonPlaying : styles.audioButton}
                        title="Play audio"
                      >
                        {isPlaying ? '⏸' : '▶'}
                      </button>
                    )}
                    <button
                      onClick={() => toggleAyahMemorized(ayah.number)}
                      style={isMemorized ? styles.memorizedButton : styles.memorizeButton}
                      title={isMemorized ? 'Mark as not memorized' : 'Mark as memorized'}
                    >
                      {isMemorized ? '✓ Memorized' : 'Memorize'}
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div style={styles.arabicTextContainer}>
                  <p style={styles.arabicText}>{ayah.text}</p>
                </div>

                {/* Translation */}
                {showTranslation && ayah.translation && (
                  <div
                    style={styles.translationContainer}
                    dangerouslySetInnerHTML={{ __html: ayah.translation }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.backgroundLight,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    background: theme.gradients.primary,
    padding: '16px 0',
    boxShadow: theme.shadows.md,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.colors.white,
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navButton: {
    padding: '8px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  logoutButton: {
    padding: '8px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  surahHeader: {
    backgroundColor: theme.colors.white,
    borderBottom: `2px solid ${theme.colors.gray200}`,
    padding: '24px 0',
  },
  surahHeaderContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 24px',
  },
  surahTitleSection: {
    marginBottom: '20px',
  },
  surahName: {
    fontSize: '32px',
    fontWeight: '700',
    color: theme.colors.primary,
    margin: '0 0 8px 0',
  },
  surahInfo: {
    fontSize: '16px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  progressSection: {
    marginTop: '16px',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  progressLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  progressNumbers: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.success,
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: theme.colors.gray200,
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: theme.gradients.success,
    transition: 'width 0.3s',
  },
  controlsBar: {
    backgroundColor: theme.colors.white,
    borderBottom: `1px solid ${theme.colors.gray200}`,
    padding: '16px 0',
    position: 'sticky',
    top: '64px',
    zIndex: 99,
  },
  controlsContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  controlButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.white,
    color: theme.colors.textPrimary,
    border: `2px solid ${theme.colors.gray300}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  controlButtonActive: {
    padding: '8px 16px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  stopButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.error,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  mainContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  ayahsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  ayahCard: {
    backgroundColor: theme.colors.white,
    padding: '24px',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    transition: 'all 0.3s',
  },
  ayahHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.colors.gray200}`,
  },
  ayahNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumberText: {
    color: theme.colors.white,
    fontSize: '16px',
    fontWeight: '700',
  },
  ayahActions: {
    display: 'flex',
    gap: '8px',
  },
  audioButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.info,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  audioButtonPlaying: {
    padding: '8px 16px',
    backgroundColor: theme.colors.warning,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  memorizeButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.white,
    color: theme.colors.success,
    border: `2px solid ${theme.colors.success}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  memorizedButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.success,
    color: theme.colors.white,
    border: `2px solid ${theme.colors.success}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  arabicTextContainer: {
    marginBottom: '16px',
    padding: '16px',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
  },
  arabicText: {
    fontSize: '32px',
    lineHeight: '2.2',
    textAlign: 'right',
    color: theme.colors.textPrimary,
    fontFamily: 'Uthmani, serif',
    margin: 0,
    direction: 'rtl',
  },
  translationContainer: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: theme.colors.textSecondary,
    padding: '16px',
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.md,
    borderLeft: `4px solid ${theme.colors.primary}`,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: `4px solid ${theme.colors.gray200}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '16px',
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
  },
  errorText: {
    fontSize: '16px',
    color: theme.colors.error,
  },
  retryButton: {
    padding: '12px 24px',
    background: theme.gradients.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  backButton: {
    padding: '12px 24px',
    backgroundColor: theme.colors.gray400,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
};

export default QuranReaderScreen;