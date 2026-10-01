import { Moon, Sun, Menu, Shield } from 'lucide-react';

/**
 * Application top bar. The menu button is the only chrome-level control the
 * user touches on every screen, so it carries the ink weight; the theme toggle
 * stays quiet beside it.
 */
const TopNav = ({ onMenuClick, darkMode, onDarkModeToggle }) => {
  return (
    <nav className="chrome fixed top-0 left-0 right-0 z-30 border-b" data-testid="topnav">
      <div className="px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-ghost -ml-2 px-2"
            onClick={onMenuClick}
            aria-label="Open navigation"
            data-testid="menu-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-surface" strokeWidth={2.25} />
            </div>
            <span className="text-ui font-semibold tracking-tight text-ink">Figment</span>
          </div>
        </div>

        <button
          className="btn btn-ghost px-2"
          onClick={onDarkModeToggle}
          aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          data-testid="dark-mode-toggle"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
};

export default TopNav;
