import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import StorageService from '../services/StorageService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
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

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const state = StorageService.getState();
      if (state?.settings) {
        setSettings(state.settings);
      }
    } catch (error) {
      console.error('Error loading settings from storage:', error);
    }
  };

  // Update a single setting
  const updateSetting = async (key, value) => {
    try {
      // Update local state
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Update localStorage
      const state = StorageService.getState() || StorageService.initializeState();
      state.settings[key] = value;
      StorageService.saveState(state);

      // Sync to Firestore if user is logged in
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          settings: newSettings,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }

      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  };

  // Update multiple settings at once
  const updateSettings = async (newSettings) => {
    try {
      // Update local state
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // Update localStorage
      const state = StorageService.getState() || StorageService.initializeState();
      state.settings = updatedSettings;
      StorageService.saveState(state);

      // Sync to Firestore if user is logged in
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          settings: updatedSettings,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }

      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  const value = {
    settings,
    updateSetting,
    updateSettings,
    loadSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};