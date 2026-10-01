import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';

/**
 * Public marketing nav. Sits on the chrome surface — a quiet band a step below
 * the page — so the content below it stays the brightest thing on screen.
 */
const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Demo', path: '/demo' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <nav className="chrome fixed top-0 left-0 right-0 z-50 border-b" data-testid="navbar">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2.5" data-testid="logo-link">
            <div className="w-8 h-8 rounded-md bg-ink flex items-center justify-center">
              <Shield className="w-4 h-4 text-surface" strokeWidth={2.25} />
            </div>
            <span className="text-base font-semibold tracking-tight text-ink">Figment</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-link-${link.name.toLowerCase()}`}
                  className={`relative py-1 text-ui font-medium transition-colors ${
                    active ? 'text-ink' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-ink"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="btn btn-ghost md:hidden -mr-2 px-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-chrome-border"
            data-testid="mobile-menu"
          >
            <div className="py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-1 py-2.5 text-ui font-medium ${
                    location.pathname === link.path ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
