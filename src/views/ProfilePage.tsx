import React, { useState } from 'react';
import { ProfileForm, PreferencesForm, CustomInstructions } from '@/components/profile';

type Tab = 'profile' | 'preferences' | 'instructions';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSaved = () => {
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'instructions', label: 'Instructions' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Customize your experience and AI mentor preferences
        </p>
      </div>

      {/* Success message */}
      {savedMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {savedMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-4 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-500 border-blue-500'
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        {activeTab === 'profile' && <ProfileForm onSaved={handleSaved} />}
        {activeTab === 'preferences' && <PreferencesForm onSaved={handleSaved} />}
        {activeTab === 'instructions' && <CustomInstructions onSaved={handleSaved} />}
      </div>
    </div>
  );
};

export default ProfilePage;
