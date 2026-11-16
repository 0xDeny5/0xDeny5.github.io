import { ticker, type Tick } from '../content';

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="ticker__row" aria-hidden={hidden || undefined}>
      {ticker.map((t: Tick) => (
        <li key={t.symbol} className="ticker__item">
          <span className="ticker__sym">{t.symbol}</span>
          <span className="ticker__val">{t.value}</span>
          <span className={`ticker__chg ticker__chg--${t.dir}`}>
            {t.dir === 'up' ? '▲' : '▼'} {t.change}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Stock-tape marquee of production numbers. Pauses on hover and for reduced motion. */
export function Ticker() {
  return (
    <section className="ticker mono" aria-label="Key numbers">
      <div className="ticker__track">
        <Row />
        <Row hidden />
      </div>
    </section>
  );
}
