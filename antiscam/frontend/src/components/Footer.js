import { Shield, Github, Mail, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Try Demo', to: '/demo' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'How it works', to: '/' },
    ],
  },
  { title: 'Company', links: [{ label: 'About the team' }, { label: 'Privacy' }, { label: 'Contact' }] },
];

const socials = [
  { label: 'GitHub', Icon: Github },
  { label: 'Twitter', Icon: Twitter },
  { label: 'Email', Icon: Mail },
];

/** Site footer. Same chrome surface as the nav, so the page is framed top and bottom. */
const Footer = () => {
  return (
    <footer className="chrome border-t" data-testid="footer">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-surface" strokeWidth={2.25} />
              </div>
              <span className="text-base font-semibold tracking-tight text-ink">Figment</span>
            </div>
            <p className="text-ui text-ink-muted max-w-xs leading-relaxed">
              A co-pilot that reads a UPI transfer before you send it, and tells you what it sees.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className="t-label mb-3">{col.title}</div>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className="text-ui text-ink-muted hover:text-ink transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-ui text-ink-muted">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-chrome-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-faint">© 2025 Figment</p>
          <div className="flex gap-1">
            {socials.map(({ label, Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-chrome-2 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
