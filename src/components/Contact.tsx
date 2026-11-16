import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import { channels, links, openTo, profile, type ChannelId } from '../content';
import { useDismiss, useMagnetic } from '../hooks';
import { copyText, shouldOpenAbove } from '../lib/dom';
import { EASE } from '../lib/motion';
import { cssVars } from '../lib/style';
import { ArrowUpRightIcon, CheckIcon, CopyIcon, GitHubIcon, LinkedInIcon, MailIcon, StackOverflowIcon, TelegramIcon } from './Icons';
import { Section } from './Section';

const CHANNEL_ICONS: Record<ChannelId, ComponentType<SVGProps<SVGSVGElement>>> = {
  linkedin: LinkedInIcon,
  telegram: TelegramIcon,
  github: GitHubIcon,
  stackoverflow: StackOverflowIcon,
};

const to = encodeURIComponent(profile.email);

// `mailto:` only works when a desktop mail app is set up, which on many machines it isn't —
// so the address opens a small menu with web clients as well.
const COMPOSE = [
  { label: 'Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}`, external: true },
  { label: 'Outlook', href: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}`, external: true },
  { label: 'Mail app', href: links.email, external: false },
] as const;

/** Approximate rendered height of the compose menu, used to decide whether it fits below. */
const COMPOSE_MENU_HEIGHT = 230;
const COPIED_TOAST_MS = 2000;

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAbove, setMenuAbove] = useState(false);
  const mailRef = useMagnetic<HTMLButtonElement>(0.12);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), COPIED_TOAST_MS);
    return () => window.clearTimeout(t);
  }, [copied]);

  useDismiss(
    menuOpen,
    (reason) => {
      setMenuOpen(false);
      if (reason === 'escape') mailRef.current?.focus();
    },
    wrapRef,
  );

  const toggleMenu = () => {
    // The address sits near the page bottom: open upwards when the menu wouldn't fit below it.
    if (!menuOpen && mailRef.current) {
      setMenuAbove(shouldOpenAbove(mailRef.current.getBoundingClientRect(), window.innerHeight, COMPOSE_MENU_HEIGHT));
    }
    setMenuOpen((open) => !open);
  };

  const copyEmail = async () => {
    setMenuOpen(false);
    if (await copyText(profile.email)) setCopied(true);
    else window.location.assign(links.email);
  };

  const offsetY = menuAbove ? 6 : -6;

  return (
    <Section
      id="contact"
      title={
        <>
          Building something that <em>moves money</em>? Let&rsquo;s talk.
        </>
      }
    >
      <div className="contact__grid">
        <div className="contact__main" data-reveal>
          <p className="contact__lede">
            I&rsquo;m open to senior and lead engineering roles, and to focused contract work on banking, payments, custody and smart
            contracts.
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
              onClick={toggleMenu}
            >
              {profile.email}
            </button>
            <button type="button" className="icon-btn" onClick={copyEmail} aria-label={copied ? 'Email copied' : 'Copy email address'}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
            <span className={copied ? 'contact__toast mono is-shown' : 'contact__toast mono'} aria-live="polite">
              {copied ? 'Copied to clipboard' : ''}
            </span>

            <AnimatePresence>
              {menuOpen && (
                <motion.ul
                  id="compose-menu"
                  className={menuAbove ? 'compose compose--above' : 'compose'}
                  role="menu"
                  aria-label="Write an email with"
                  initial={{ opacity: 0, y: offsetY, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: offsetY, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASE }}
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

        <ul className="channels" data-reveal style={cssVars({ '--i': 1 })}>
          {channels.map((channel) => {
            const Icon = CHANNEL_ICONS[channel.id];
            return (
              <li key={channel.id}>
                <a className="channel" href={channel.href} target="_blank" rel="noopener noreferrer">
                  <Icon width={18} height={18} />
                  <span className="channel__label">{channel.label}</span>
                  <span className="channel__handle mono">{channel.handle}</span>
                  <ArrowUpRightIcon width={16} height={16} className="channel__arrow" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
