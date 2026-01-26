import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { dataService } from '@/lib/dataService';
import {
  Profile,
  Preferences,
  Settings,
  DEFAULT_PROFILE,
  DEFAULT_PREFERENCES,
  DEFAULT_SETTINGS,
} from '@/types';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await dataService.getProfile();
      setProfile(result);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Listen for local changes (for offline mode)
  const localProfile = useLiveQuery(
    async () => {
      const p = await db.profile.get('user-profile');
      return p ?? null;
    },
    []
  );

  useEffect(() => {
    if (localProfile && !navigator.onLine) {
      setProfile(localProfile);
    }
  }, [localProfile]);

  const update = useCallback(async (updates: Partial<Omit<Profile, 'id'>>) => {
    await dataService.updateProfile(updates);
    await fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    update,
  };
};

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await dataService.getPreferences();
      setPreferences(result);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Listen for local changes (for offline mode)
  const localPreferences = useLiveQuery(
    async () => {
      const p = await db.preferences.get('user-preferences');
      return p ?? null;
    },
    []
  );

  useEffect(() => {
    if (localPreferences && !navigator.onLine) {
      setPreferences(localPreferences);
    }
  }, [localPreferences]);

  const update = useCallback(async (updates: Partial<Omit<Preferences, 'id'>>) => {
    await dataService.updatePreferences(updates);
    await fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    update,
  };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await dataService.getSettings();
      setSettings(result);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Listen for local changes (for offline mode)
  const localSettings = useLiveQuery(
    async () => {
      const s = await db.settings.get('app-settings');
      return s ?? null;
    },
    []
  );

  useEffect(() => {
    if (localSettings && !navigator.onLine) {
      setSettings(localSettings);
    }
  }, [localSettings]);

  const update = useCallback(async (updates: Partial<Omit<Settings, 'id'>>) => {
    await dataService.updateSettings(updates);
    await fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    update,
  };
};

export const useTheme = () => {
  const { settings, update } = useSettings();
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateTheme = () => {
      if (settings.theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setEffectiveTheme(prefersDark ? 'dark' : 'light');
      } else {
        setEffectiveTheme(settings.theme);
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => updateTheme();
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.theme]);

  useEffect(() => {
    // Apply theme to document
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [effectiveTheme]);

  const setTheme = useCallback(
    async (theme: Settings['theme']) => {
      await update({ theme });
    },
    [update]
  );

  return {
    theme: settings.theme,
    effectiveTheme,
    setTheme,
  };
};

export const useOnboarding = () => {
  const { profile } = useProfile();
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Consider onboarding complete if user has set their name
    setIsComplete(!!profile.name);
  }, [profile.name]);

  return { isComplete };
};
