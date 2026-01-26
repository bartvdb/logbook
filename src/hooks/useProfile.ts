import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  updateProfile,
  updatePreferences,
  updateSettings,
} from '@/lib/db';
import {
  Profile,
  Preferences,
  Settings,
  DEFAULT_PROFILE,
  DEFAULT_PREFERENCES,
  DEFAULT_SETTINGS,
} from '@/types';

export const useProfile = () => {
  const result = useLiveQuery(
    async () => {
      const profile = await db.profile.get('user-profile');
      return profile ?? null;
    },
    []
  );

  const update = useCallback(async (updates: Partial<Omit<Profile, 'id'>>) => {
    await updateProfile(updates);
  }, []);

  // useLiveQuery returns undefined while loading
  const isLoading = result === undefined;
  const profile = isLoading || result === null ? DEFAULT_PROFILE : result;

  return {
    profile,
    isLoading,
    update,
  };
};

export const usePreferences = () => {
  const result = useLiveQuery(
    async () => {
      const preferences = await db.preferences.get('user-preferences');
      return preferences ?? null;
    },
    []
  );

  const update = useCallback(async (updates: Partial<Omit<Preferences, 'id'>>) => {
    await updatePreferences(updates);
  }, []);

  // useLiveQuery returns undefined while loading
  const isLoading = result === undefined;
  const preferences = isLoading || result === null ? DEFAULT_PREFERENCES : result;

  return {
    preferences,
    isLoading,
    update,
  };
};

export const useSettings = () => {
  const result = useLiveQuery(
    async () => {
      const settings = await db.settings.get('app-settings');
      return settings ?? null;
    },
    []
  );

  const update = useCallback(async (updates: Partial<Omit<Settings, 'id'>>) => {
    await updateSettings(updates);
  }, []);

  // useLiveQuery returns undefined while loading
  const isLoading = result === undefined;
  const settings = isLoading || result === null ? DEFAULT_SETTINGS : result;

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
