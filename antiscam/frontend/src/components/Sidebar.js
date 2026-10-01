import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Sparkles, BarChart3, LogOut, X, BrainCircuit } from 'lucide-react';
import APP_ROUTES from '@/routes';

/**
 * Application navigation. The active item is marked with a fill and an ink
 * weight change — not a coloured gradient — so "where am I" reads at a glance
 * without the rail competing with the content for attention.
 */
const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: APP_ROUTES.dashboard, icon: LayoutDashboard },
    { name: 'Threat Intelligence Hub', path: APP_ROUTES.threatIntel, icon: BrainCircuit },
    { name: 'Try Demo', path: APP_ROUTES.demo, icon: Sparkles },
    { name: 'AI Analysis', path: APP_ROUTES.aiAnalysis, icon: BarChart3 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/40"
            data-testid="sidebar-overlay"
          />

          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="chrome fixed left-0 top-0 h-full w-72 z-50 border-r flex flex-col"
            data-testid="sidebar"
          >
            <div className="flex items-center justify-between h-14 px-5 border-b border-chrome-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-surface" strokeWidth={2.25} />
                </div>
                <span className="text-ui font-semibold tracking-tight text-ink">Figment</span>
              </div>
              <button
                className="btn btn-ghost px-2 -mr-2"
                onClick={onClose}
                aria-label="Close navigation"
                data-testid="close-sidebar-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-0.5">
              {menuItems.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    data-testid={`sidebar-link-${item.name.toLowerCase().replace(/ /g, '-')}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-ui transition-colors ${
                      active
                        ? 'bg-surface text-ink font-semibold'
                        : 'text-ink-muted font-medium hover:bg-chrome-2 hover:text-ink'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-chrome-border">
              <button
                onClick={onLogout}
                className="btn btn-ghost w-full justify-start"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
