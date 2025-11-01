import { Shield, Github, Mail, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0A192F]/90 backdrop-blur-sm" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00FFB2] to-[#00A3FF] rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0A192F]" />
              </div>
              <span className="text-xl font-bold gradient-text">FIGMENT</span>
            </div>
            <p className="text-sm text-gray-400">AI co-pilot for safe UPI transactions</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-300">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/demo" className="text-gray-400 hover:text-[#00FFB2]">Try Demo</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-[#00FFB2]">Dashboard</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFB2]">How It Works</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-300">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-[#00FFB2]">About Team</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFB2]">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#00FFB2]">Contact Us</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-300">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg glass hover:border-[#00FFB2]/50" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg glass hover:border-[#00FFB2]/50" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg glass hover:border-[#00FFB2]/50" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <p>© 2025 FIGMENT. Built with AI for safer digital payments.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
