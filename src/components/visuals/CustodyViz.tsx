import type { CSSProperties } from 'react';
import { useLoop, useSeen } from '../../hooks';

/**
 * Bank-grade key management, told around a 3D hardware security module. Five principles play in
 * turn — each one shown in the hardware itself rather than in labels around it.
 */

const PRINCIPLES = [
  { id: 'sign', title: 'Sign', caption: 'Apps never touch a key. They send in a hash and get back only a signature.' },
  { id: 'isolate', title: 'Isolate', caption: 'Keys are born inside the HSM and are non-extractable — nothing can copy them out.' },
  { id: 'layer', title: 'Layer', caption: 'A master key wraps key-encryption keys, which wrap every wallet key. Lose nothing, expose nothing.' },
  { id: 'quorum', title: 'Quorum', caption: 'Changing how keys are managed takes several officers at once — never a single person.' },
  { id: 'audit', title: 'Audit', caption: 'Every key use is logged, and opening the case wipes the keys. Trust enforced by hardware.' },
] as const;

const PLATES = ['Wallet keys', 'Key-encryption keys', 'Master key'];
const OFFICERS = 3;
const QUORUM = 2;
const STEP_MS = 4600;

function KeyGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.8 12.2 20 3M16 7l3 3M14 9l2 2" />
    </svg>
  );
}

export function CustodyViz() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);
  const step = useLoop(PRINCIPLES.length, seen, STEP_MS, STEP_MS);
  const current = PRINCIPLES[step] ?? PRINCIPLES[PRINCIPLES.length - 1];
  const id = current?.id ?? 'audit';

  return (
    <div
      ref={ref}
      className="viz viz--hsm"
      role="img"
      aria-label="Animation of a hardware security module: apps send in a hash and get back only a signature; the key cannot be exported; keys are layered from a master key down to wallet keys; admin changes need two of three officers; every use is audited and tampering wipes the keys."
    >
      <div className="viz__head mono">
        <span>hardware security module</span>
        <span>bank-grade key management</span>
      </div>

      <ol className="hsmx__steps mono" style={{ '--step-ms': `${STEP_MS}ms` } as CSSProperties}>
        {PRINCIPLES.map((p, i) => (
          <li key={p.id} className={i === step ? 'is-active' : i < step ? 'is-done' : ''}>
            <span>{String(i + 1).padStart(2, '0')}</span> {p.title}
            <i />
          </li>
        ))}
      </ol>

      <div className={`hsmx__stage is-${id}`} aria-hidden="true">
        {/* Beams into and out of the box */}
        <span className="hsmx__beam hsmx__beam--in">
          <span className="hsmx__beam-label mono">hash</span>
          <span className="hsmx__dot" />
        </span>
        <span className="hsmx__beam hsmx__beam--out">
          <span className="hsmx__beam-label mono">{id === 'isolate' ? 'export ✗ refused' : 'signature'}</span>
          <span className="hsmx__dot" />
        </span>

        <div className="hsmx__scene">
          <div className="hsmx__box">
            <div className="hsmx__face hsmx__face--front">
              <span className="hsmx__leds">
                <i />
                <i />
                <i />
              </span>
              <span className="hsmx__brand mono">HSM · FIPS 140-3</span>
              <span className="hsmx__slot" />
            </div>
            <div className="hsmx__face hsmx__face--top">
              <span className="hsmx__key">
                <KeyGlyph />
              </span>
            </div>
            <div className="hsmx__face hsmx__face--right" />
            <div className="hsmx__face hsmx__face--left" />
            <div className="hsmx__face hsmx__face--back" />
            <div className="hsmx__face hsmx__face--bottom" />

            {PLATES.map((name, i) => (
              <div key={name} className="hsmx__plate" style={{ '--n': i } as CSSProperties}>
                <span className="mono">{name}</span>
              </div>
            ))}
          </div>
          <div className="hsmx__shadow" />
        </div>

        <div className="hsmx__officers mono">
          {Array.from({ length: OFFICERS }, (_, i) => (
            <span key={i} className={i < QUORUM ? 'is-signer' : ''} style={{ '--n': i } as CSSProperties}>
              <KeyGlyph size={14} />
            </span>
          ))}
          <em>
            {QUORUM} of {OFFICERS} officers
          </em>
        </div>

        <div className="hsmx__log mono">
          <span>sign · key#7 · 12:04:31Z ✓</span>
          <span>sign · key#7 · 12:04:33Z ✓</span>
          <span className="is-alert">tamper → keys zeroized</span>
        </div>
      </div>

      <p className="hsmx__caption">{current?.caption}</p>
    </div>
  );
}
