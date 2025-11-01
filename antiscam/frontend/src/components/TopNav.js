import { Shield, Menu } from 'lucide-react';
import { Button } from './ui/button';

const TopNav = ({ onMenuClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 glass-dark border-b border-indigo-200/50" data-testid="topnav">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            data-testid="menu-btn"
            className="hover:bg-indigo-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">FIGMENT</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
