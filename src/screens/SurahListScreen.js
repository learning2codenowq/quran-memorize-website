import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuranService from '../services/QuranService';
import StorageService from '../services/StorageService';
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../contexts/AuthContext';

const SurahListScreen = () => {
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    loadSurahs();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSurahs(surahs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = surahs.filter(surah => {
      const matchesNumber = surah.id.toString().includes(query);
      const matchesEnglish = surah.name_simple.toLowerCase().includes(query);
      const matchesArabic = surah.name_arabic.includes(query);
      return matchesNumber || matchesEnglish || matchesArabic;
    });

    setFilteredSurahs(filtered);
  }, [searchQuery, surahs]);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      const data = await QuranService.getAllSurahs();
      setSurahs(data);
      setFilteredSurahs(data);
      setError(null);
    } catch (err) {
      console.error('Error loading surahs:', err);
      setError('Failed to load surahs. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getSurahProgress = (surahId) => {
    const state = StorageService.getState();
    if (!state || !state.ayahProgress[surahId]) {
      return 0;
    }

    const surahProgress = state.ayahProgress[surahId];
    const memorizedCount = Object.values(surahProgress).filter(ayah => ayah.memorized).length;
    const surah = surahs.find(s => s.id === surahId);
    const totalAyahs = surah?.verses_count || 1;

    return Math.round((memorizedCount / totalAyahs) * 100);
  };

  const handleSurahClick = (surahId) => {
    navigate(`/quran-reader/${surahId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
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
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      transition: 'background-color 0.3s',
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
      transition: 'background-color 0.3s',
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px',
    },
    topSection: {
      marginBottom: '32px',
    },
    pageTitle: {
      fontSize: '32px',
      fontWeight: '700',
      color: theme.colors.textPrimary,
      margin: '0 0 8px 0',
    },
    pageSubtitle: {
      fontSize: '16px',
      color: theme.colors.textSecondary,
      margin: 0,
    },
    searchContainer: {
      marginBottom: '32px',
    },
    searchInput: {
      width: '100%',
      maxWidth: '600px',
      padding: '14px 20px',
      fontSize: '16px',
      border: `2px solid ${theme.colors.gray200}`,
      borderRadius: theme.borderRadius.full,
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s',
      backgroundColor: theme.colors.background,
      color: theme.colors.textPrimary,
    },
    surahList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px',
    },
    surahCard: {
      backgroundColor: theme.colors.cardBackground,
      padding: '20px',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.sm,
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    surahNumber: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: theme.gradients.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    numberText: {
      color: theme.colors.white,
      fontSize: '18px',
      fontWeight: '700',
    },
    surahInfo: {
      flex: 1,
    },
    surahNameEnglish: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.colors.textPrimary,
      margin: '0 0 4px 0',
    },
    surahDetails: {
      fontSize: '13px',
      color: theme.colors.textSecondary,
      margin: '0 0 8px 0',
    },
    progressContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    progressBar: {
      flex: 1,
      height: '6px',
      backgroundColor: theme.colors.gray200,
      borderRadius: '3px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: theme.gradients.success,
      transition: 'width 0.3s',
    },
    progressText: {
      fontSize: '12px',
      fontWeight: '600',
      color: theme.colors.success,
      minWidth: '35px',
    },
    surahArabic: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    arabicText: {
      fontSize: '22px',
      fontWeight: '700',
      color: theme.colors.primary,
      margin: 0,
      fontFamily: 'Uthmani, serif',
    },
    completedBadge: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: theme.colors.success,
      color: theme.colors.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '700',
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
    },
    errorText: {
      fontSize: '16px',
      color: theme.colors.error,
      marginBottom: '20px',
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
    noResults: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '60px 20px',
    },
    noResultsText: {
      fontSize: '18px',
      color: theme.colors.textMuted,
    },
  };

  React.useEffect(() => {
    const styleSheet = document.styleSheets[0];
    if (styleSheet) {
      // Check if animation already exists
      let animationExists = false;
      for (let i = 0; i < styleSheet.cssRules.length; i++) {
        if (styleSheet.cssRules[i].name === 'spin') {
          animationExists = true;
          break;
        }
      }
      
      if (!animationExists) {
        styleSheet.insertRule(`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `, styleSheet.cssRules.length);
      }
    }
  }, []);

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
          <p style={styles.loadingText}>Loading Surahs...</p>
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
          <button onClick={loadSurahs} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>Quran Hifdh</h1>
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

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.topSection}>
          <h2 style={styles.pageTitle}>All Surahs</h2>
          <p style={styles.pageSubtitle}>Choose a surah to begin memorizing</p>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by number, name, or Arabic..."
            style={styles.searchInput}
          />
        </div>

        {/* Surah List */}
        <div style={styles.surahList}>
          {filteredSurahs.length === 0 ? (
            <div style={styles.noResults}>
              <p style={styles.noResultsText}>No surahs found</p>
            </div>
          ) : (
            filteredSurahs.map((surah) => {
              const progress = getSurahProgress(surah.id);
              const isCompleted = progress === 100;

              return (
                <div
                  key={surah.id}
                  onClick={() => handleSurahClick(surah.id)}
                  style={styles.surahCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme.shadows.md;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme.shadows.sm;
                  }}
                >
                  {/* Surah Number */}
                  <div style={styles.surahNumber}>
                    <span style={styles.numberText}>{surah.id}</span>
                  </div>

                  {/* Surah Info */}
                  <div style={styles.surahInfo}>
                    <h3 style={styles.surahNameEnglish}>{surah.name_simple}</h3>
                    <p style={styles.surahDetails}>
                      {surah.revelation_place} • {surah.verses_count} Ayahs
                    </p>
                    {progress > 0 && (
                      <div style={styles.progressContainer}>
                        <div style={styles.progressBar}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${progress}%`
                            }}
                          ></div>
                        </div>
                        <span style={styles.progressText}>{progress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Arabic Name */}
                  <div style={styles.surahArabic}>
                    <p style={styles.arabicText}>{surah.name_arabic}</p>
                    {isCompleted && <span style={styles.completedBadge}>✓</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Add spinner animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default SurahListScreen;