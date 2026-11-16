import { useEffect, useState, type CSSProperties } from 'react';
import { prefersReducedMotion, useSeen } from '../../hooks';

const BARS = 42;
const TICK_MS = 650;
const MAX_RPS = 3600;
const TARGET_RPS = 3000;

/** Deterministic PRNG so the server and the first client render draw the same chart. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Sample {
  rps: number;
  p95: number;
}

function sample(rand: () => number, i: number): Sample {
  // Base load with a gentle wave, noise, and an occasional burst.
  const wave = Math.sin(i / 6) * 220;
  const burst = rand() > 0.93 ? 700 + rand() * 300 : 0;
  const rps = Math.round(2350 + wave + (rand() - 0.5) * 260 + burst);
  const p95 = Math.round(150 + (rps - 2200) / 22 + rand() * 20);
  return { rps, p95 };
}

function initial(): Sample[] {
  const rand = mulberry32(7);
  return Array.from({ length: BARS }, (_, i) => sample(rand, i));
}

/** A load-test dashboard: RPS bars stream in, p95 and error rate stay boring — which is the point. */
export function ThroughputViz() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);
  const [data, setData] = useState<Sample[]>(initial);

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return;
    const rand = mulberry32(Date.now() % 100000);
    let i = BARS;
    const id = window.setInterval(() => {
      i += 1;
      setData((prev) => [...prev.slice(1), sample(rand, i)]);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [seen]);

  const last = data[data.length - 1] ?? { rps: 0, p95: 0 };
  const burst = last.rps > 2900;

  return (
    <div ref={ref} className="viz viz--throughput" role="img" aria-label="Animation: simulated load test streaming requests per second with steady p95 latency and zero errors.">
      <div className="viz__head mono">
        <span>load test · simulated</span>
        <span>open-model ramp</span>
      </div>
      <div className="tput__stats">
        <div>
          <span className="tput__label mono">req/s</span>
          <span className="tput__value">{last.rps.toLocaleString('en-US')}</span>
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
          target 3k rps
        </span>
        {data.map((d, i) => (
          <span
            key={i}
            className={`tput__bar ${d.rps > 2900 ? 'is-burst' : ''}`}
            style={{ '--h': Math.min(1, d.rps / MAX_RPS) } as CSSProperties}
          />
        ))}
      </div>
      <div className={`viz__foot mono ${burst ? '' : 'is-ok'}`}>
        <span>{burst ? 'burst → autoscaling +2 pods' : 'steady state'}</span>
        <span>kafka lag 0 · db pool 41%</span>
      </div>
    </div>
  );
}
