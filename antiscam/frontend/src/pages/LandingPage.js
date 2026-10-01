import { useEffect, useRef, useState } from 'react';
import { motion, animate, useScroll, useTransform, useMotionValueEvent, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Moon, Sun, Eye, Network, User, Search, CheckCircle } from 'lucide-react';

/* ---------------------------------------------------------------- content */

/*
 * One worked example, reused by both the hero card and the walkthrough below,
 * so the page shows the same transfer twice rather than two unrelated mockups.
 */
const TRANSFER = {
  receiver: 'kyc-verify@okaxis',
  amount: '₹24,000',
  message: '"Sir, your KYC expires today. Pay the re-verification fee or your account will be frozen."',
  score: 87,
  verdict: 'High risk',
};

const READINGS = [
  {
    icon: Eye,
    name: 'Pattern',
    score: 96,
    saw: 'Matches a KYC-expiry script reported 31 times this month.',
  },
  {
    icon: User,
    name: 'Pressure',
    score: 92,
    saw: 'An authority figure plus a same-day deadline. Both together.',
  },
  {
    icon: Network,
    name: 'Network',
    score: 84,
    saw: 'Receiver account is nine days old and carries six reports.',
  },
  {
    icon: Shield,
    name: 'Behaviour',
    score: 71,
    saw: 'Larger than any transfer you have made to a new payee.',
  },
];

const PRINCIPLES = [
  {
    title: 'Four readings, not one score',
    body: 'Each model looks for a different kind of wrong. Where they disagree is often the most useful part.',
  },
  {
    title: 'Every score shows its working',
    body: 'The reasoning sits next to the number, so a warning is something you can weigh rather than obey.',
  },
  {
    title: 'It learns from what you report',
    body: 'Marking a call as wrong — in either direction — feeds the next version of the models.',
  },
];

/* ---------------------------------------------------------------- motion */

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
};

const stagger = (i) => ({ ...reveal, transition: { ...reveal.transition, delay: i * 0.07 } });

const toneOf = (score) => (score >= 70 ? 'red' : score >= 40 ? 'amber' : 'teal');

/* ---------------------------------------------------------------- pieces */

function Meter({ value, tone, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <div className="h-1 rounded-full bg-surface-3 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `rgb(var(--${tone}))` }}
        initial={{ width: reduce ? `${value}%` : 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay, ease: [0.23, 1, 0.32, 1] }}
      />
    </div>
  );
}

/* --------------------------------------------------------- hero sequence */

/** Circular 0–100 indicator, shown while the transfer is being read. */
function ProgressRing({ value, tone = 'blue' }) {
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={R} fill="none" stroke="rgb(var(--surface-3))" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={R}
          fill="none"
          stroke={`rgb(var(--${tone}))`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - value / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center tnum text-ui font-medium text-ink">
        {value}%
      </span>
    </div>
  );
}

/**
 * The hero sequence. Plays on load and is deliberately independent of scroll —
 * this is the product demonstrating itself, not a diagram to be scrolled through.
 * (The walkthrough further down the page is the scroll-driven one.)
 *
 *   0.0s  the transfer slides in
 *   0.7s  the action appears
 *   1.2s  analysing, ring climbing through the waypoints
 *   2.0s  the assessment resolves
 *   2.7s  the contributing signals land
 *  ~6.7s  hold, then it plays again
 *
 * The card resizes between states rather than staying one large rectangle —
 * a mostly-empty box the size of the finished one reads as a placeholder.
 *
 * Carries the headline score and the four signal names only. The models get
 * their full explanation in the walkthrough below; repeating it here would be
 * the same content twice.
 *
 * Reduced-motion users get the finished state, held.
 */
function HeroSequence() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 7 : 0);
  const [progress, setProgress] = useState(reduce ? 100 : 0);

  /*
   * One self-restarting timeline.
   *
   * Deliberately slower than feels right at first pass: an animation you
   * authored reads much faster to you than to someone meeting it cold. The
   * arrival and the press in particular need room to register.
   *
   * The pause is jittered so the loop reads as incidental, not metronomic.
   */
  useEffect(() => {
    if (reduce) return;
    let timers = [];

    const play = () => {
      timers.forEach(clearTimeout);
      timers = [];
      setStep(0);
      setProgress(0);
      [
        [700, 1],   // the notification lands
        [3200, 2],  // it sits as a plain notification a beat longer
        [4400, 3],  // the action appears, and invites a press
        [6000, 4],  // pressed
        [6300, 5],  // analysing
        [7500, 6],  // the assessment resolves
        [8100, 7],  // the score lands
        [8700, 8],  // the signals land
      ].forEach(([ms, s]) => timers.push(setTimeout(() => setStep(s), ms)));

      const hold = 4000 + Math.random() * 1400;
      timers.push(setTimeout(play, 8700 + hold));
    };

    play();
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  // The ring climbs only while analysing — 1.2s, matched to the step's dwell.
  useEffect(() => {
    if (reduce || step !== 5) return;
    const controls = animate(0, [25, 60, 87, 100], {
      duration: 1.2,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => setProgress(Math.round(v)),
    });
    return () => controls.stop();
  }, [step, reduce]);

  const done = step >= 6;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -90 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 1 }}
      className="relative"
    >
      {/*
       * The out-of-focus field the notification sits in front of — portrait-mode
       * background. The card floats over the page rather than being a region of
       * it, which is what makes it read as a notification and not a panel.
       */}
      <div
        aria-hidden="true"
        className="absolute -inset-12 pointer-events-none blur-3xl opacity-70"
        style={{
          background:
            'radial-gradient(45% 45% at 25% 25%, rgb(var(--blue-tint)) 0%, transparent 70%), radial-gradient(45% 45% at 80% 78%, rgb(var(--amber-tint)) 0%, transparent 70%)',
        }}
      />

      {/*
       * One card for the whole sequence. Nothing unmounts except the action
       * area at the bottom: the notification header and the message stay put
       * throughout, so this reads as one continuous event rather than frames
       * replacing each other.
       */}
      <motion.div
        layout
        /* Every height change on this card eases, including the big one when the
           result arrives. Without an explicit layout transition the growth is
           applied on the next frame and reads as a jump. */
        transition={{ layout: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }}
        className="card frosted lift relative p-5"
      >
        {/* Notification header — an app, and when it arrived. */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-surface" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ui font-medium text-ink">Figment</p>
            <p className="text-xs text-ink-faint mt-0.5">
              {step >= 5 ? 'Reading the request' : 'Payment request'}
            </p>
          </div>
          <span className="flex items-center gap-1.5">
            {step >= 5 && <span className="w-1.5 h-1.5 rounded-full bg-teal pulse" />}
            <span className="text-xs text-ink-faint">{step >= 5 ? 'Live' : 'now'}</span>
          </span>
        </div>

        <p className="text-ink leading-relaxed">{TRANSFER.message}</p>

        {/* The details settle in once the notification has landed. */}
        <AnimatePresence initial={false}>
          {step >= 2 && (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-tint border border-blue-line flex items-center justify-center text-blue text-xs font-medium shrink-0">
                    K
                  </div>
                  <span className="t-technical text-ink truncate">{TRANSFER.receiver}</span>
                </div>
                <span className="tnum text-base font-medium whitespace-nowrap">
                  {TRANSFER.amount}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* From here on, only the action area changes. `popLayout` cross-fades
            the outgoing and incoming states over each other; `wait` made each
            swap wait its turn, which is the dead air that read as unsmooth. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {step >= 3 && step <= 4 && (
            <motion.div
              key="cta"
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: step === 4 ? 0.97 : 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
              className="mt-5"
            >
              <button
                type="button"
                className={`btn btn-primary w-full h-11 ${step === 3 ? 'invite' : ''}`}
              >
                <Search className="w-4 h-4" />
                Analyze transaction
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="analyzing"
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
              className="mt-5 flex items-center gap-5 py-1"
            >
              <ProgressRing value={progress} />
              <div className="min-w-0">
                <p className="text-ui font-medium text-ink">Analyzing…</p>
                <p className="t-secondary mt-0.5">Reading amount, recipient and message.</p>
              </div>
            </motion.div>
          )}

          {done && (
            <motion.div
              key="result"
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="mt-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-teal" />
                <span className="text-ui font-medium text-ink">Analysis complete</span>
              </div>

              <p className="text-md leading-snug text-ink">
                This transaction might be a scam.
              </p>

              {/* The score lands a beat after the assessment, then the signals.
                  The card therefore grows in two smaller steps rather than one
                  large jump — which is what made the transition after analysing
                  feel abrupt. */}
              <AnimatePresence initial={false}>
                {step >= 7 && (
                  <motion.div
                    key="score"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-4 pt-5 mb-3">
                      <span className="t-metric">
                        {TRANSFER.score}
                        <span className="text-ui font-normal text-ink-faint ml-1.5">/ 100</span>
                      </span>
                      <span className="pill pill-red">High risk</span>
                    </div>
                    <Meter value={TRANSFER.score} tone="red" />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {step >= 8 && (
                  <motion.div
                    key="signals"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 pt-5 border-t border-border space-y-2.5">
                      {READINGS.map((r, i) => (
                        <motion.div
                          key={r.name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.07 }}
                          className="grid grid-cols-[92px_28px_1fr] items-center gap-3"
                        >
                          <span className="text-ui text-ink-muted">{r.name}</span>
                          <span className="tnum text-ui text-ink text-right">{r.score}</span>
                          <Meter value={r.score} tone={toneOf(r.score)} delay={i * 0.07} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- story */

/**
 * The walkthrough, played rather than diagrammed: the message arrives, each
 * model reports in turn, and the verdict resolves out of what they said.
 *
 * Scroll-linked, not a fixed timer. A timer plays at its own pace, so a fast
 * scroll leaves the animation lagging behind the reader — it feels slow because
 * it is still answering a question that has already been scrolled past. Mapping
 * scroll position onto the step means it reveals at the speed you actually read.
 *
 * Someone who has asked for reduced motion gets the finished state immediately.
 */
function Story() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0); // 0 idle · 1 arrived · 2-5 readings · 6 verdict

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'end 0.5'],
  });
  const progressStep = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [1, 2, 3, 4, 5, 6]
  );

  useMotionValueEvent(progressStep, 'change', (v) => setStep(Math.round(v)));

  /*
   * The verdict is driven straight off scroll position rather than mounted when
   * a step fires. Mount-then-animate means the reveal always *starts* late
   * relative to the scroll, which is exactly what reads as lag. Applied as
   * style, these track the scroll on the compositor with no re-render at all.
   */
  const verdictOpacity = useTransform(scrollYProgress, [0.7, 0.88], [0, 1]);
  const verdictY = useTransform(scrollYProgress, [0.7, 0.88], [18, 0]);

  useEffect(() => {
    if (reduce) setStep(6);
  }, [reduce]);

  const arrived = step >= 1;

  return (
    <div ref={ref} className="max-w-2xl">
      {/* 1 — the message lands. */}
      <motion.div
        initial={false}
        animate={arrived ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="t-eyebrow">Message · 09:41</span>
          {arrived && <span className="w-1.5 h-1.5 rounded-full bg-blue" aria-hidden="true" />}
        </div>
        <p className="text-ink leading-relaxed mb-4">
          Sir, your KYC expires today. Pay the re-verification fee or your account
          will be frozen.
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="t-technical text-ink-muted">kyc-verify@okaxis</span>
          <span className="tnum text-base font-medium">₹24,000</span>
        </div>
      </motion.div>

      {/* Drains from the message into the models. */}
      <motion.div
        initial={false}
        animate={{ opacity: arrived ? 1 : 0.25 }}
        transition={{ duration: 0.4, delay: arrived ? 0.3 : 0 }}
        className="ml-6 h-10 w-px bg-border-strong"
        aria-hidden="true"
      />

      {/* 2 — each model reports, one at a time. */}
      <div className="card divide-y divide-border overflow-hidden">
        {READINGS.map((r, i) => {
          const resolved = step >= i + 2;
          const working = !resolved && step >= i + 1;

          return (
            <div key={r.name} className="px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2.5">
                  <r.icon
                    className={`w-4 h-4 ${resolved ? 'text-ink-muted' : 'text-ink-faint'}`}
                    strokeWidth={1.9}
                  />
                  <span className={`text-ui ${resolved ? 'text-ink' : 'text-ink-faint'}`}>
                    {r.name}
                  </span>
                </span>

                {resolved ? (
                  <span className={`pill pill-${toneOf(r.score)} tnum`}>{r.score}</span>
                ) : (
                  <span className={`t-secondary ${working ? 'text-ink-muted' : 'text-ink-faint'}`}>
                    {working ? <span className="pulse">reading</span> : 'waiting'}
                  </span>
                )}
              </div>

              <AnimatePresence initial={false}>
                {resolved && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="t-secondary mt-2.5 mb-2.5">{r.saw}</p>
                    <Meter value={r.score} tone={toneOf(r.score)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* 3 — the verdict, drawn from all four. Always mounted; it fades up with
          the scroll rather than being inserted once a step threshold is met. */}
      <motion.div
        style={reduce ? { opacity: 1 } : { opacity: verdictOpacity }}
        className="ml-6 h-10 w-px bg-border-strong"
        aria-hidden="true"
      />

      <motion.div
        style={reduce ? { opacity: 1 } : { opacity: verdictOpacity, y: verdictY }}
        className="card p-5"
      >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="t-eyebrow mb-1.5">Verdict</p>
                <p className="t-card">
                  Scored <span className="tnum">87</span> of 100
                </p>
              </div>
              <span className="pill pill-red">High risk</span>
            </div>
            <Meter value={87} tone="red" />
            <p className="t-secondary mt-4">
              Three models agree independently. That agreement is the reason the
              confidence is high rather than marginal.
            </p>
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

const LandingPage = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* ---------------------------------------------------------- nav */}
      <nav className="chrome fixed top-0 left-0 right-0 z-50 border-b" data-testid="navbar">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-surface" strokeWidth={2.25} />
            </div>
            <span className="text-base font-semibold tracking-tight">Figment</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="btn btn-ghost px-2"
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              data-testid="dark-mode-toggle"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => navigate('/auth')} className="btn btn-ghost" data-testid="login-btn">
              Log in
            </button>
            <button onClick={() => navigate('/auth')} className="btn btn-primary" data-testid="signup-btn">
              Check a transfer
            </button>
          </div>
        </div>
      </nav>

      {/* --------------------------------------------------------- hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-x-14 gap-y-16 items-center">
          {/* Copy — left-weighted, deliberately not centred. */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-5"
          >
            <p className="t-eyebrow mb-6">UPI scam detection</p>

            <h1 className="t-display mb-6" data-testid="hero-title">
              Know it's a scam
              <br />
              <em className="text-ink-muted">before</em> the money leaves.
            </h1>

            <p className="text-base leading-relaxed text-ink-muted mb-9 max-w-md">
              Figment reads a transfer as you're about to make it — the amount, the
              recipient, the story you were told — and shows what four models make of
              it, and why.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <button
                onClick={() => navigate('/auth')}
                className="btn btn-primary h-11 px-6"
                data-testid="get-started-btn"
              >
                Check a transfer
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/demo')} className="btn btn-secondary h-11 px-6">
                See a worked example
              </button>
            </div>

            <p className="t-secondary">Takes about ten seconds.</p>
          </motion.div>

          {/* Product — the whole point of the page. */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-7"
          >
            <HeroSequence />
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------- one transfer, four readings */}
      <section className="py-24 px-6 border-t border-border bg-surface-2">
        <div className="max-w-6xl mx-auto">
          <motion.div {...reveal} className="max-w-lg mb-16">
            <p className="t-eyebrow mb-4">The walkthrough</p>
            <h2 className="t-section-lg mb-4">
              One transfer, read four ways
            </h2>
            <p className="text-ink-muted">
              The card above isn't an illustration. Here's the same transfer moving
              through the models that produced it.
            </p>
          </motion.div>

          <Story />
        </div>
      </section>

      {/* ---------------------------------------------------- principles */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div {...reveal} className="max-w-lg mb-14">
            <p className="t-eyebrow mb-4">How it behaves</p>
            <h2 className="t-section-lg">What it does, and what it won't</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-x-12 gap-y-10">
            {PRINCIPLES.map((p, i) => (
              <motion.div key={p.title} {...stagger(i)} className="pt-6 border-t border-border-strong">
                <h3 className="t-card mb-2.5">{p.title}</h3>
                <p className="t-secondary">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- cta */}
      <section className="pb-28 px-6">
        <motion.div {...reveal} className="max-w-4xl mx-auto">
          <div className="rounded-lg border border-border bg-surface-2 px-8 py-16 text-center">
            <h2 className="t-section-lg mb-4 max-w-lg mx-auto">
              Check the next one before you send it
            </h2>
            <p className="text-ink-muted mb-9 max-w-md mx-auto">
              Free to use. Sign in and paste in the transfer you're unsure about.
            </p>
            <button onClick={() => navigate('/auth')} className="btn btn-primary h-11 px-7 mx-auto">
              Check a transfer
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* -------------------------------------------------------- footer */}
      <footer className="chrome border-t py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-surface" strokeWidth={2.25} />
            </div>
            <span className="text-ui font-semibold tracking-tight">Figment</span>
          </div>
          <p className="t-secondary">© 2025 Figment</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
