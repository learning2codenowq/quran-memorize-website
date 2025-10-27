import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import StorageService from '../services/StorageService';
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Check
} from 'lucide-react';

const DashboardScreen = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMemorized: 0,
    todayProgress: 0,
    currentStreak: 0,
    dailyGoal: 10
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [lastPosition, setLastPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      // Get statistics
      const statistics = StorageService.getStatistics();
      setStats(statistics);

      // Get weekly progress
      const weekly = getWeeklyProgress();
      setWeeklyData(weekly);

      // Get last memorized position
      const state = StorageService.getState();
      if (state?.lastMemorizedPosition) {
        setLastPosition(state.lastMemorizedPosition);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyProgress = () => {
    const state = StorageService.getState();
    if (!state || !state.progress) return [];

    const today = new Date();
    const weekData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      weekData.push({
        day: dayName,
        date: dateStr,
        count: state.progress[dateStr] || 0
      });
    }

    return weekData;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getCompletedSurahs = () => {
    const state = StorageService.getState();
    if (!state || !state.ayahProgress) return 0;

    let completedCount = 0;
    // This is a simplified count - you'd need surah verse counts to be accurate
    Object.keys(state.ayahProgress).forEach(surahId => {
      const surahProgress = state.ayahProgress[surahId];
      const memorizedInSurah = Object.values(surahProgress).filter(a => a.memorized).length;
      // Rough estimate - you'd compare with actual verse count
      if (memorizedInSurah > 0) completedCount++;
    });

    return completedCount;
  };

  const getMaxProgress = () => {
    return Math.max(...weeklyData.map(d => d.count), stats.dailyGoal);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading your progress...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = stats.dailyGoal > 0 
    ? Math.min(Math.round((stats.todayProgress / stats.dailyGoal) * 100), 100)
    : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>Quran Hifdh</h1>
          <div style={styles.headerRight}>
            <button 
              onClick={() => navigate('/surahs')} 
              style={styles.headerButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              <BookOpen size={18} />
              <span>Browse Surahs</span>
            </button>
            <span style={styles.userEmail}>{currentUser?.email}</span>
            <button 
              onClick={handleLogout} 
              style={styles.logoutButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeTitle}>As-salamu alaykum! 👋</h2>
          <p style={styles.welcomeSubtitle}>
            {stats.todayProgress > 0 
              ? `Great progress today! You've memorized ${stats.todayProgress} ayah${stats.todayProgress !== 1 ? 's' : ''}.`
              : "Ready to start your memorization journey today?"
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIconContainer} data-color="primary">
              <BookOpen size={28} color={theme.colors.primary} />
            </div>
            <h4 style={styles.statNumber}>{stats.totalMemorized}</h4>
            <p style={styles.statLabel}>Ayahs Memorized</p>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIconContainer} data-color="warning">
              <Calendar size={28} color={theme.colors.primary} />
            </div>
            <h4 style={styles.statNumber}>{stats.currentStreak}</h4>
            <p style={styles.statLabel}>Day Streak</p>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIconContainer} data-color="success">
              <Target size={28} color={theme.colors.success} />
            </div>
            <h4 style={styles.statNumber}>{stats.todayProgress}/{stats.dailyGoal}</h4>
            <p style={styles.statLabel}>Daily Goal</p>
            <div style={styles.miniProgressBar}>
              <div style={{...styles.miniProgressFill, width: `${progressPercentage}%`}}></div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIconContainer} data-color="secondary">
              <Award size={28} color={theme.colors.secondary} />
            </div>
            <h4 style={styles.statNumber}>{getCompletedSurahs()}</h4>
            <p style={styles.statLabel}>Surahs Started</p>
          </div>
        </div>

        {/* Continue Learning Card */}
        {lastPosition && (
          <div style={styles.continueCard}>
            <div style={styles.continueContent}>
              <div style={styles.continueIcon}>
                <BookOpen size={32} color={theme.colors.white} />
              </div>
              <div style={styles.continueText}>
                <h3 style={styles.continueTitle}>Continue Learning</h3>
                <p style={styles.continueSubtitle}>
                  Surah {lastPosition.surahId}, Ayah {lastPosition.ayahNumber}
                </p>
              </div>
              <button 
                onClick={() => navigate(`/quran-reader/${lastPosition.surahId}`)}
                style={styles.continueButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = theme.shadows.lg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = theme.shadows.md;
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Weekly Progress Chart */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitleRow}>
              <BarChart3 size={24} color={theme.colors.primary} />
              <h3 style={styles.sectionTitle}>Weekly Progress</h3>
            </div>
            <p style={styles.sectionSubtitle}>Last 7 days of memorization</p>
          </div>
          
          <div style={styles.chartCard}>
            <div style={styles.chart}>
              {weeklyData.map((day, index) => {
                const maxHeight = 200;
                const maxValue = getMaxProgress();
                const height = maxValue > 0 ? (day.count / maxValue) * maxHeight : 0;
                const isToday = index === weeklyData.length - 1;
                
                return (
                  <div key={day.date} style={styles.chartBar}>
                    <div style={styles.chartBarContainer}>
                      <div 
                        style={{
                          ...styles.chartBarFill,
                          height: `${height}px`,
                          backgroundColor: isToday ? theme.colors.primary : theme.colors.success
                        }}
                      >
                        {day.count > 0 && (
                          <span style={styles.chartBarValue}>{day.count}</span>
                        )}
                      </div>
                    </div>
                    <span style={{
                      ...styles.chartBarLabel,
                      fontWeight: isToday ? '700' : '500',
                      color: isToday ? theme.colors.primary : theme.colors.textSecondary
                    }}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Quick Actions</h3>
          </div>
          <div style={styles.actionsGrid}>
            <div 
              style={styles.actionCard}
              onClick={() => navigate('/surahs')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = theme.shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadows.sm;
              }}
            >
              <div style={styles.actionIconContainer}>
                <BookOpen size={32} color={theme.colors.primary} />
              </div>
              <h4 style={styles.actionTitle}>Browse Surahs</h4>
              <p style={styles.actionText}>Choose a surah to start memorizing</p>
            </div>
            
            <div 
              style={styles.actionCard}
              onClick={() => alert('Analytics feature coming soon!')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = theme.shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadows.sm;
              }}
            >
              <div style={styles.actionIconContainer}>
                <TrendingUp size={32} color={theme.colors.info} />
              </div>
              <h4 style={styles.actionTitle}>View Analytics</h4>
              <p style={styles.actionText}>Track your progress over time</p>
            </div>
            
            <div 
              style={styles.actionCard}
              onClick={() => navigate('/settings')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = theme.shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadows.sm;
              }}
            >
              <div style={styles.actionIconContainer}>
                <Settings size={32} color={theme.colors.textSecondary} />
              </div>
              <h4 style={styles.actionTitle}>Settings</h4>
              <p style={styles.actionText}>Customize your experience</p>
            </div>
          </div>
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
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.colors.white,
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  userEmail: {
    color: theme.colors.white,
    fontSize: '14px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  welcomeSection: {
    marginBottom: '32px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: theme.colors.textPrimary,
    margin: '0 0 8px 0',
  },
  welcomeSubtitle: {
    fontSize: '18px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: theme.colors.white,
    padding: '24px',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    textAlign: 'center',
    transition: 'transform 0.2s',
  },
  statIconContainer: {
    width: '56px',
    height: '56px',
    margin: '0 auto 16px',
    borderRadius: '50%',
    backgroundColor: theme.colors.backgroundLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: theme.colors.primary,
    margin: '0 0 8px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  miniProgressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: theme.colors.gray200,
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '12px',
  },
  miniProgressFill: {
    height: '100%',
    background: theme.gradients.success,
    transition: 'width 0.3s',
  },
  continueCard: {
    background: theme.gradients.primary,
    borderRadius: theme.borderRadius.xl,
    padding: '32px',
    marginBottom: '40px',
    boxShadow: theme.shadows.lg,
  },
  continueContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  continueIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  continueText: {
    flex: 1,
    color: theme.colors.white,
  },
  continueTitle: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  continueSubtitle: {
    fontSize: '16px',
    opacity: 0.9,
    margin: 0,
  },
  continueButton: {
    padding: '14px 32px',
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: theme.shadows.md,
    transition: 'all 0.2s',
  },
  section: {
    marginBottom: '40px',
  },
  sectionHeader: {
    marginBottom: '24px',
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.colors.textPrimary,
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  chartCard: {
    backgroundColor: theme.colors.white,
    padding: '32px',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
  },
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '12px',
    height: '240px',
  },
  chartBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  chartBarContainer: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chartBarFill: {
    width: '100%',
    minHeight: '4px',
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '8px',
  },
  chartBarValue: {
    fontSize: '12px',
    fontWeight: '700',
    color: theme.colors.white,
  },
  chartBarLabel: {
    fontSize: '12px',
    color: theme.colors.textSecondary,
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  actionCard: {
    backgroundColor: theme.colors.white,
    padding: '32px',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionIconContainer: {
    marginBottom: '16px',
  },
  actionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: '0 0 8px 0',
  },
  actionText: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
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
};

export default DashboardScreen;