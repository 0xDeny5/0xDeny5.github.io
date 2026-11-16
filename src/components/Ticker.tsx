import { ticker } from '../content';

function TickerRow({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="ticker__row" aria-hidden={duplicate || undefined}>
      {ticker.map((t) => (
        <li key={t.symbol} className="ticker__item">
          <span className="ticker__sym">{t.symbol}</span>
          <span className="ticker__val">{t.value}</span>
          <span className="ticker__chg">
            {t.dir === 'up' ? '▲' : '▼'} {t.change}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Stock-tape marquee of production numbers. The row is rendered twice (the copy hidden from
 * assistive tech) so the tape loops seamlessly. Pauses on hover and for reduced motion.
 */
export function Ticker() {
  return (
    <section className="ticker mono" aria-label="Key numbers">
      <div className="ticker__track">
        <TickerRow />
        <TickerRow duplicate />
      </div>
    </section>
  );
}
