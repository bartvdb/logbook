import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useOnlineStatus, usePWA, useQueueStatus, useSyncStatus } from '@/hooks';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const TimelineIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const navItems: NavItem[] = [
  { path: '/', label: 'Today', icon: <HomeIcon /> },
  { path: '/timeline', label: 'Timeline', icon: <TimelineIcon /> },
  { path: '/profile', label: 'Profile', icon: <ProfileIcon /> },
];

const SyncIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CloudOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const StatusIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { pendingCount } = useQueueStatus();
  const { updateAvailable, update } = usePWA();
  const { status, forceSync } = useSyncStatus();

  const getSyncStatusDisplay = () => {
    if (!isOnline) {
      return {
        icon: <CloudOffIcon className="w-4 h-4" />,
        label: 'Offline',
        color: 'text-slate-500 dark:text-slate-400',
        bg: 'bg-slate-100 dark:bg-slate-800',
      };
    }

    switch (status) {
      case 'syncing':
        return {
          icon: <SyncIcon className="w-4 h-4 animate-spin" />,
          label: 'Syncing',
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/30',
        };
      case 'pending':
        return {
          icon: <SyncIcon className="w-4 h-4" />,
          label: `${pendingCount} pending`,
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-50 dark:bg-yellow-900/30',
        };
      case 'error':
        return {
          icon: <CloudOffIcon className="w-4 h-4" />,
          label: 'Sync error',
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-900/30',
        };
      case 'synced':
      default:
        return {
          icon: <CheckIcon className="w-4 h-4" />,
          label: 'Synced',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/30',
        };
    }
  };

  const syncStatus = getSyncStatusDisplay();

  return (
    <div className="flex items-center gap-2">
      {updateAvailable && (
        <button
          onClick={update}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          Update
        </button>
      )}
      <button
        onClick={forceSync}
        disabled={!isOnline || status === 'syncing'}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-full transition-colors ${syncStatus.bg} ${syncStatus.color} ${
          isOnline && status !== 'syncing' ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
        }`}
        title={isOnline ? 'Click to sync now' : 'Offline - changes will sync when online'}
      >
        {syncStatus.icon}
        <span className="hidden sm:inline">{syncStatus.label}</span>
      </button>
    </div>
  );
};

export const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Logbook
            </h1>
            <StatusIndicator />
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`
              }
            >
              <SettingsIcon />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            {navItems.find((item) => item.path === location.pathname)?.label ||
              'Logbook'}
          </h1>
          <StatusIndicator />
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-blue-500'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
