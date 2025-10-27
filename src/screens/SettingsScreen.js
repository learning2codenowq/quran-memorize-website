import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/theme';
import StorageService from '../services/StorageService';
import QuranService from '../services/QuranService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  User,
  Target,
  Trash2,
  Volume2,
  Palette,
  Eye,
  Type,
  FileText,
  Shield,
  Info,
  ChevronRight,
  X,
  Check,
  Moon,
  Sun,
  BookOpen,
  LogOut
} from 'lucide-react';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [settings, setSettings] = useState({
    userName: 'User',
    dailyGoal: 10,
    darkMode: false,
    showTranslations: true,
    arabicFontSize: 'Medium',
    translationFontSize: 'Medium',
    autoPlayNext: false,
    selectedReciter: null,
    scriptType: 'uthmani'
  });
  
  const [reciters, setReciters] = useState([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showDailyGoalModal, setShowDailyGoalModal] = useState(false);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showArabicFontModal, setShowArabicFontModal] = useState(false);
  const [showTranslationFontModal, setShowTranslationFontModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadReciters();
  }, []);

  const loadSettings = () => {
    try {
      const state = StorageService.getState();
      if (state?.settings) {
        setSettings(state.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReciters = async () => {
    try {
      const recitersList = await QuranService.getReciters();
      setReciters(recitersList);
    } catch (error) {
      console.error('Error loading reciters:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const state = StorageService.getState();
      if (!state) return;

      state.settings[key] = value;
      StorageService.saveState(state);
      setSettings({ ...settings, [key]: value });

      // Sync to Firestore
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          settings: state.settings,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleDeleteData = () => {
    if (window.confirm('⚠️ Delete All Data?\n\nThis will permanently delete all your memorization progress, achievements, and settings. This action cannot be undone.\n\nAre you absolutely sure?')) {
      if (window.confirm('🔴 Final Confirmation\n\nThis is your last chance. All your Quran memorization data will be permanently deleted.\n\nProceed?')) {
        StorageService.clearState();
        alert('✅ Data Deleted\n\nAll your data has been permanently deleted. Redirecting to login...');
        logout();
        navigate('/login');
      }
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

  const getReciterName = () => {
    if (!settings.selectedReciter) return 'Mishary Alafasy (Default)';
    const reciter = reciters.find(r => r.id === settings.selectedReciter);
    return reciter ? reciter.name : 'Mishary Alafasy (Default)';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
              ← Back
            </button>
            <h1 style={styles.logo}>Settings</h1>
          </div>
          <div style={styles.headerRight}>
            <button onClick={() => navigate('/surahs')} style={styles.navButton}>
              <BookOpen size={18} />
              <span>Surahs</span>
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Account Settings */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <User size={20} color={theme.colors.primary} />
            <h3 style={styles.sectionTitle}>Account Settings</h3>
          </div>
          
          <div style={styles.settingsList}>
            <div style={styles.settingItem} onClick={() => setShowNameModal(true)}>
              <div style={styles.settingLeft}>
                <User size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Your Name</h4>
                  <p style={styles.settingSubtitle}>Current: {settings.userName}</p>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>

            <div style={styles.settingItem} onClick={() => setShowDailyGoalModal(true)}>
              <div style={styles.settingLeft}>
                <Target size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Daily Target</h4>
                  <p style={styles.settingSubtitle}>{settings.dailyGoal} ayahs per day</p>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>

            <div style={styles.settingItem} onClick={handleDeleteData}>
              <div style={styles.settingLeft}>
                <Trash2 size={20} color={theme.colors.error} />
                <div style={styles.settingTextContainer}>
                  <h4 style={{...styles.settingTitle, color: theme.colors.error}}>Delete All Data</h4>
                  <p style={styles.settingSubtitle}>Permanently delete all progress</p>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Volume2 size={20} color={theme.colors.primary} />
            <h3 style={styles.sectionTitle}>Audio Settings</h3>
          </div>
          
          <div style={styles.settingsList}>
            <div style={styles.settingItem}>
              <div style={styles.settingLeft}>
                <Volume2 size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Auto-play Next</h4>
                  <p style={styles.settingSubtitle}>Automatically play next ayah</p>
                </div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.autoPlayNext}
                  onChange={(e) => updateSetting('autoPlayNext', e.target.checked)}
                  style={styles.switchInput}
                />
                <span style={styles.switchSlider}></span>
              </label>
            </div>

            <div style={styles.settingItem} onClick={() => setShowReciterModal(true)}>
              <div style={styles.settingLeft}>
                <Volume2 size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Reciter</h4>
                  <p style={styles.settingSubtitle}>{getReciterName()}</p>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Palette size={20} color={theme.colors.primary} />
            <h3 style={styles.sectionTitle}>Display Settings</h3>
          </div>
          
          <div style={styles.settingsList}>
            <div style={styles.settingItem}>
              <div style={styles.settingLeft}>
                {settings.darkMode ? <Moon size={20} color={theme.colors.textSecondary} /> : <Sun size={20} color={theme.colors.textSecondary} />}
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Dark Mode</h4>
                  <p style={styles.settingSubtitle}>Easy on the eyes for night reading</p>
                </div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => updateSetting('darkMode', e.target.checked)}
                  style={styles.switchInput}
                />
                <span style={styles.switchSlider}></span>
              </label>
            </div>

            <div style={styles.settingItem}>
              <div style={styles.settingLeft}>
                <Eye size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Show Translations</h4>
                  <p style={styles.settingSubtitle}>Display English translations</p>
                </div>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.showTranslations}
                  onChange={(e) => updateSetting('showTranslations', e.target.checked)}
                  style={styles.switchInput}
                />
                <span style={styles.switchSlider}></span>
              </label>
            </div>

            <div style={styles.settingItem} onClick={() => setShowScriptModal(true)}>
              <div style={styles.settingLeft}>
                <Type size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Arabic Script Type</h4>
                  <p style={styles.settingSubtitle}>Current: {settings.scriptType.charAt(0).toUpperCase() + settings.scriptType.slice(1)}</p>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>

            <div style={styles.settingItem} onClick={() => setShowArabicFontModal(true)}>
              <div style={styles.settingLeft}>
                <Type size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Arabic Font Size</h4>
                  <p style={styles.settingSubtitle}>Current: {settings.arabicFontSize}</p>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>

            <div style={styles.settingItem} onClick={() => setShowTranslationFontModal(true)}>
              <div style={styles.settingLeft}>
                <Type size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Translation Font Size</h4>
                  <p style={styles.settingSubtitle}>Current: {settings.translationFontSize}</p>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Shield size={20} color={theme.colors.primary} />
            <h3 style={styles.sectionTitle}>Data & Privacy</h3>
          </div>
          
          <div style={styles.settingsList}>
            <div style={styles.settingItem} onClick={() => alert('Privacy Policy - Coming soon!')}>
              <div style={styles.settingLeft}>
                <FileText size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Privacy Policy</h4>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>

            <div style={styles.settingItem} onClick={() => alert('Terms of Service - Coming soon!')}>
              <div style={styles.settingLeft}>
                <FileText size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>Terms of Service</h4>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>

            <div style={styles.settingItem} onClick={() => alert('Quran Hifdh v1.0.0\nDeveloped by Shayan Qureshi')}>
              <div style={styles.settingLeft}>
                <Info size={20} color={theme.colors.textSecondary} />
                <div style={styles.settingTextContainer}>
                  <h4 style={styles.settingTitle}>About</h4>
                  <p style={styles.settingSubtitle}>Version 1.0.0</p>
                </div>
              </div>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNameModal && (
        <Modal
          title="Your Name"
          onClose={() => setShowNameModal(false)}
        >
          <input
            type="text"
            defaultValue={settings.userName}
            placeholder="Enter your name"
            style={styles.input}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                updateSetting('userName', e.target.value);
                setShowNameModal(false);
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.target.parentElement.querySelector('input');
              updateSetting('userName', input.value);
              setShowNameModal(false);
            }}
            style={styles.modalButton}
          >
            Save
          </button>
        </Modal>
      )}

      {showDailyGoalModal && (
        <Modal
          title="Daily Target"
          subtitle="How many ayahs do you want to memorize daily?"
          onClose={() => setShowDailyGoalModal(false)}
        >
          <div style={styles.optionsList}>
            {[5, 10, 15, 20].map(goal => (
              <div
                key={goal}
                style={{
                  ...styles.optionItem,
                  ...(settings.dailyGoal === goal ? styles.optionItemSelected : {})
                }}
                onClick={() => {
                  updateSetting('dailyGoal', goal);
                  setShowDailyGoalModal(false);
                }}
              >
                <span style={styles.optionText}>{goal} ayahs per day</span>
                {settings.dailyGoal === goal && <Check size={20} color={theme.colors.success} />}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showReciterModal && (
        <Modal
          title="Select Reciter"
          subtitle="Choose your preferred Quran reciter"
          onClose={() => setShowReciterModal(false)}
        >
          <div style={styles.reciterList}>
            {reciters.map(reciter => (
              <div
                key={reciter.id}
                style={{
                  ...styles.reciterItem,
                  ...(settings.selectedReciter === reciter.id ? styles.reciterItemSelected : {})
                }}
                onClick={() => {
                  updateSetting('selectedReciter', reciter.id);
                  setShowReciterModal(false);
                }}
              >
                <div>
                  <h4 style={styles.reciterName}>{reciter.name}</h4>
                  {reciter.style && <p style={styles.reciterStyle}>{reciter.style}</p>}
                </div>
                {settings.selectedReciter === reciter.id && <Check size={20} color={theme.colors.success} />}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showScriptModal && (
        <Modal
          title="Arabic Script Type"
          subtitle="Choose your preferred Quran script style"
          onClose={() => setShowScriptModal(false)}
        >
          <div style={styles.optionsList}>
            {[
              { value: 'uthmani', label: 'Uthmani (Madina)' },
              { value: 'indopak', label: 'IndoPak' },
              { value: 'tajweed', label: 'Tajweed (Color-coded)' }
            ].map(option => (
              <div
                key={option.value}
                style={{
                  ...styles.optionItem,
                  ...(settings.scriptType === option.value ? styles.optionItemSelected : {})
                }}
                onClick={() => {
                  updateSetting('scriptType', option.value);
                  setShowScriptModal(false);
                }}
              >
                <span style={styles.optionText}>{option.label}</span>
                {settings.scriptType === option.value && <Check size={20} color={theme.colors.success} />}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showArabicFontModal && (
        <Modal
          title="Arabic Font Size"
          onClose={() => setShowArabicFontModal(false)}
        >
          <div style={styles.optionsList}>
            {['Small', 'Medium', 'Large', 'Extra Large'].map(size => (
              <div
                key={size}
                style={{
                  ...styles.optionItem,
                  ...(settings.arabicFontSize === size ? styles.optionItemSelected : {})
                }}
                onClick={() => {
                  updateSetting('arabicFontSize', size);
                  setShowArabicFontModal(false);
                }}
              >
                <span style={styles.optionText}>{size}</span>
                {settings.arabicFontSize === size && <Check size={20} color={theme.colors.success} />}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showTranslationFontModal && (
        <Modal
          title="Translation Font Size"
          onClose={() => setShowTranslationFontModal(false)}
        >
          <div style={styles.optionsList}>
            {['Small', 'Medium', 'Large', 'Extra Large'].map(size => (
              <div
                key={size}
                style={{
                  ...styles.optionItem,
                  ...(settings.translationFontSize === size ? styles.optionItemSelected : {})
                }}
                onClick={() => {
                  updateSetting('translationFontSize', size);
                  setShowTranslationFontModal(false);
                }}
              >
                <span style={styles.optionText}>{size}</span>
                {settings.translationFontSize === size && <Check size={20} color={theme.colors.success} />}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

// Modal Component
const Modal = ({ title, subtitle, onClose, children }) => {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>{title}</h3>
            {subtitle && <p style={styles.modalSubtitle}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={styles.modalCloseButton}>
            <X size={24} />
          </button>
        </div>
        <div style={styles.modalBody}>
          {children}
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
    maxWidth: '1200px',
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
  },
  mainContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: theme.colors.textPrimary,
    margin: 0,
  },
  settingsList: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    overflow: 'hidden',
  },
  settingItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: `1px solid ${theme.colors.gray200}`,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  settingLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: '0 0 4px 0',
  },
  settingSubtitle: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '52px',
    height: '28px',
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  switchSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.gray300,
    transition: '0.4s',
    borderRadius: '28px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: theme.shadows.xl,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px',
    borderBottom: `1px solid ${theme.colors.gray200}`,
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.colors.textPrimary,
    margin: '0 0 4px 0',
  },
  modalSubtitle: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  modalCloseButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.md,
    transition: 'background-color 0.2s',
  },
  modalBody: {
    padding: '24px',
    maxHeight: 'calc(80vh - 100px)',
    overflowY: 'auto',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: `2px solid ${theme.colors.gray200}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  modalButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: `2px solid transparent`,
  },
  optionItemSelected: {
    backgroundColor: theme.colors.successLight,
    border: `2px solid ${theme.colors.success}`,
  },
  optionText: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  reciterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  reciterItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: `2px solid transparent`,
  },
  reciterItemSelected: {
    backgroundColor: theme.colors.successLight,
    border: `2px solid ${theme.colors.success}`,
  },
  reciterName: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: '0 0 4px 0',
  },
  reciterStyle: {
    fontSize: '13px',
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

// Add CSS for toggle switch
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    input:checked + .switchSlider {
      background-color: ${theme.colors.success};
    }
  `, styleSheet.cssRules.length);

  styleSheet.insertRule(`
    .switchSlider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  `, styleSheet.cssRules.length);

  styleSheet.insertRule(`
    input:checked + .switchSlider:before {
      transform: translateX(24px);
    }
  `, styleSheet.cssRules.length);
}

export default SettingsScreen;