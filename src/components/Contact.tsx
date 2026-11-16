import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { links, openTo, profile } from '../content';
import { useMagnetic } from '../hooks';
import { ArrowUpRightIcon, CheckIcon, CopyIcon, GitHubIcon, LinkedInIcon, MailIcon, StackOverflowIcon, TelegramIcon } from './Icons';
import { SectionHead } from './SectionHead';

const CHANNELS = [
  { label: 'LinkedIn', handle: 'in/denys-rybkin', href: links.linkedin, Icon: LinkedInIcon },
  { label: 'Telegram', handle: '@OxDeny5', href: links.telegram, Icon: TelegramIcon },
  { label: 'GitHub', handle: '0xDeny5', href: links.github, Icon: GitHubIcon },
  { label: 'Stack Overflow', handle: 'Denys Rybkin', href: links.stackoverflow, Icon: StackOverflowIcon },
] as const;

const to = encodeURIComponent(profile.email);

// `mailto:` only works when a desktop mail app is set up, which on many machines it isn't —
// so the address opens a small menu with web clients as well.
const COMPOSE = [
  { label: 'Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}`, external: true },
  { label: 'Outlook', href: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}`, external: true },
  { label: 'Mail app', href: links.email, external: false },
] as const;

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mailRef = useMagnetic<HTMLButtonElement>(0.12);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        mailRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, mailRef]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      window.location.href = links.email;
    }
    setMenuOpen(false);
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionHead index="05" label="Contact" id="contact-title">
          Building something that <em>moves money</em>? Let&rsquo;s talk.
        </SectionHead>

        <div className="contact__grid">
          <div className="contact__main" data-reveal>
            <p className="contact__lede">
              I&rsquo;m open to senior and lead engineering roles, and to focused contract work on banking, payments,
              custody and smart contracts.
            </p>

            <dl className="open-to">
              {openTo.map((row) => (
                <div key={row.label}>
                  <dt className="mono">{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="contact__mail" ref={wrapRef}>
              <button
                ref={mailRef}
                type="button"
                className="contact__email"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls="compose-menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {profile.email}
              </button>
              <button type="button" className="icon-btn" onClick={copyEmail} aria-label={copied ? 'Email copied' : 'Copy email address'}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
              <span className={`contact__toast mono ${copied ? 'is-shown' : ''}`} aria-live="polite">
                {copied ? 'Copied to clipboard' : ''}
              </span>

              <AnimatePresence>
                {menuOpen && (
                  <motion.ul
                    id="compose-menu"
                    className="compose"
                    role="menu"
                    aria-label="Write an email with"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
                  >
                    <li className="compose__title mono" role="presentation">
                      Write with
                    </li>
                    {COMPOSE.map((c) => (
                      <li key={c.label} role="none">
                        <a
                          role="menuitem"
                          className="compose__item"
                          href={c.href}
                          {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          onClick={() => setMenuOpen(false)}
                        >
                          <MailIcon width={16} height={16} />
                          <span>{c.label}</span>
                          {c.external && <ArrowUpRightIcon width={14} height={14} className="compose__ext" />}
                        </a>
                      </li>
                    ))}
                    <li role="none">
                      <button type="button" role="menuitem" className="compose__item" onClick={copyEmail}>
                        <CopyIcon width={16} height={16} />
                        <span>Copy address</span>
                      </button>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          <ul className="channels" data-reveal style={{ '--i': 1 } as CSSProperties}>
            {CHANNELS.map(({ label, handle, href, Icon }) => (
              <li key={label}>
                <a className="channel" href={href} target="_blank" rel="noopener noreferrer">
                  <Icon width={18} height={18} />
                  <span className="channel__label">{label}</span>
                  <span className="channel__handle mono">{handle}</span>
                  <ArrowUpRightIcon width={16} height={16} className="channel__arrow" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
