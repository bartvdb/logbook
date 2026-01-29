import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, List, TrendingUp, User, Settings, PanelLeft } from 'lucide-react';
import { useOnlineStatus, useSyncStatus } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const getFormattedDate = () => {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const navItems: NavItem[] = [
  { path: '/', label: 'Today', icon: <BookOpen className="h-5 w-5" /> },
  { path: '/entries', label: 'Entries', icon: <List className="h-5 w-5" /> },
  { path: '/trends', label: 'Trends', icon: <TrendingUp className="h-5 w-5" /> },
  { path: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const SyncDot: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { status } = useSyncStatus();

  if (!isOnline) {
    return <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" title="Offline" />;
  }

  switch (status) {
    case 'syncing':
      return <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" title="Syncing" />;
    case 'pending':
      return <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pending sync" />;
    case 'error':
      return <span className="w-1.5 h-1.5 rounded-full bg-destructive" title="Sync error" />;
    default:
      return <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Synced" />;
  }
};

interface NavigationProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        onToggleCollapse?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar border-r transition-all duration-200",
          isCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-r-0' : 'lg:w-56'
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between h-14 px-5">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-medium">Logbook</h1>
              <SyncDot />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleCollapse}
              title="Hide sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
                {item.path === '/' && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {getFormattedDate()}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <Separator />
          <div className="px-3 py-3">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Desktop collapsed toggle button */}
      {isCollapsed && (
        <Button
          variant="outline"
          size="icon"
          className="hidden lg:flex fixed top-4 left-4 z-50"
          onClick={onToggleCollapse}
          title="Show sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-center h-12 px-4 relative">
          <h1 className="text-sm font-medium">
            {navItems.find((item) => item.path === location.pathname)?.label || 'Logbook'}
            {location.pathname === '/' && (
              <span className="ml-2 text-muted-foreground font-normal">
                {getFormattedDate()}
              </span>
            )}
          </h1>
          <div className="absolute right-4">
            <SyncDot />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-t safe-area-inset-bottom">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )
              }
            >
              {item.icon}
              <span className="text-[10px] mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
