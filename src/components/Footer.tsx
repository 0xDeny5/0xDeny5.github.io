import { profile } from '../content';
import { useLocalTime } from '../hooks';
import { ArrowUpIcon } from './Icons';

/** A quiet service line: who, where and now, a way back up. */
export function Footer() {
  const time = useLocalTime(profile.timeZone);

  return (
    <footer className="footer">
      <div className="container footer__row mono">
        <span>© 2026 {profile.name}</span>
        <span className="footer__meta">
          Vilnius <span className="footer__time">{time ?? '--:--'}</span>
        </span>
        <a href="#top" className="footer__top-link">
          Back to top <ArrowUpIcon width={14} height={14} />
        </a>
      </div>
    </footer>
  );
}
