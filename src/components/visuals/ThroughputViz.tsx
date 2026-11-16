import { useEffect, useState } from 'react';
import { useSeen } from '../../hooks';
import { prefersReducedMotion } from '../../lib/dom';
import { formatCount } from '../../lib/format';
import { mulberry32 } from '../../lib/random';
import { cssVars } from '../../lib/style';
import { VizFrame } from './VizFrame';

const BARS = 42;
const TICK_MS = 650;
const MAX_RPS = 3600;
const TARGET_RPS = 3000;
/** Bars above this are drawn as bursts, and the footer reports autoscaling. */
const BURST_RPS = 2900;

interface Sample {
  rps: number;
  p95: number;
}

/** One second of simulated load: a base level with a gentle wave, noise and an occasional burst. */
function sample(rand: () => number, i: number): Sample {
  const wave = Math.sin(i / 6) * 220;
  const burst = rand() > 0.93 ? 700 + rand() * 300 : 0;
  const rps = Math.round(2350 + wave + (rand() - 0.5) * 260 + burst);
  const p95 = Math.round(150 + (rps - 2200) / 22 + rand() * 20);
  return { rps, p95 };
}

/** Same seed on server and client, so the prerendered chart hydrates without a mismatch. */
function initialSamples(): Sample[] {
  const rand = mulberry32(7);
  return Array.from({ length: BARS }, (_, i) => sample(rand, i));
}

/** A load-test dashboard: RPS bars stream in, p95 and error rate stay boring — which is the point. */
export function ThroughputViz() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const [data, setData] = useState<Sample[]>(initialSamples);

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return;
    const rand = mulberry32(Date.now() % 100_000);
    let i = BARS;
    const id = window.setInterval(() => {
      i += 1;
      setData((prev) => [...prev.slice(1), sample(rand, i)]);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [seen]);

  const last = data[data.length - 1] ?? { rps: 0, p95: 0 };
  const bursting = last.rps > BURST_RPS;

  return (
    <VizFrame
      ref={ref}
      variant="throughput"
      label="Animation: simulated load test streaming requests per second with steady p95 latency and zero errors."
      head={['load test · simulated', 'open-model ramp']}
      foot={{ ok: !bursting, start: bursting ? 'burst → autoscaling +2 pods' : 'steady state', end: 'kafka lag 0 · db pool 41%' }}
    >
      <div className="tput__stats">
        <div>
          <span className="tput__label mono">req/s</span>
          <span className="tput__value">{formatCount(last.rps)}</span>
        </div>
        <div>
          <span className="tput__label mono">p95</span>
          <span className="tput__value">{last.p95} ms</span>
        </div>
        <div>
          <span className="tput__label mono">errors</span>
          <span className="tput__value tput__value--ok">0.00%</span>
        </div>
      </div>
      <div className="tput__chart" aria-hidden="true">
        <span className="tput__target mono" style={{ bottom: `${(TARGET_RPS / MAX_RPS) * 100}%` }}>
          target {TARGET_RPS / 1000}k rps
        </span>
        {data.map((d, i) => (
          <span
            key={i}
            className={d.rps > BURST_RPS ? 'tput__bar is-burst' : 'tput__bar'}
            style={cssVars({ '--h': Math.min(1, d.rps / MAX_RPS) })}
          />
        ))}
      </div>
    </VizFrame>
  );
}
