import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';

const toneFor = (score) => (score >= 70 ? 'red' : score >= 40 ? 'amber' : 'teal');

/**
 * One agent's reading. Collapsed to a single line — name, verdict, score —
 * because four expanded agents at once is noise; the detail is there when asked.
 */
const AgentCard = ({ agent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tone = toneFor(agent.riskScore);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="card overflow-hidden" data-testid={`agent-card-${agent.name}`}>
        <CollapsibleTrigger className="w-full text-left">
          <div className="flex items-center justify-between gap-4 p-4 hover:bg-surface-2 transition-colors cursor-pointer">
            <div className="min-w-0">
              <h4 className="t-card">{agent.name}</h4>
              <p className="t-secondary truncate">{agent.message}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`pill pill-${tone} tnum`}
                data-testid={`risk-score-${agent.name}`}
              >
                {agent.riskScore}%
              </span>
              <ChevronDown
                className={`w-4 h-4 text-ink-faint transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="px-4 pb-4 border-t border-border"
          >
            <div className="panel p-4 mt-4">
              <p className="t-secondary">{agent.details}</p>
              {agent.evidence?.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {agent.evidence.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 t-secondary">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: `rgb(var(--${tone}))` }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default AgentCard;
