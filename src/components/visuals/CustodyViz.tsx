import { useLoop, useSeen } from '../../hooks';
import { pad } from '../../lib/format';
import { cssVars } from '../../lib/style';
import { KeyIcon } from '../Icons';
import { VizFrame } from './VizFrame';

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

type Principle = (typeof PRINCIPLES)[number];

const LAST_PRINCIPLE: Principle = PRINCIPLES[PRINCIPLES.length - 1] ?? PRINCIPLES[0];
const PLATES = ['Wallet keys', 'Key-encryption keys', 'Master key'];
const OFFICERS = 3;
const QUORUM = 2;
const STEP_MS = 4600;

const stepClass = (i: number, step: number) => (i === step ? 'is-active' : i < step ? 'is-done' : undefined);

export function CustodyViz() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const step = useLoop(PRINCIPLES.length, seen, STEP_MS, STEP_MS);
  const current: Principle = PRINCIPLES[step] ?? LAST_PRINCIPLE;

  return (
    <VizFrame
      ref={ref}
      variant="hsm"
      label="Animation of a hardware security module: apps send in a hash and get back only a signature; the key cannot be exported; keys are layered from a master key down to wallet keys; admin changes need two of three officers; every use is audited and tampering wipes the keys."
      head={['hardware security module', 'bank-grade key management']}
    >
      <ol className="hsmx__steps mono" style={cssVars({ '--step-ms': `${STEP_MS}ms` })}>
        {PRINCIPLES.map((p, i) => (
          <li key={p.id} className={stepClass(i, step)}>
            <span>{pad(i + 1)}</span> {p.title}
            <i />
          </li>
        ))}
      </ol>

      {/* The stage class (`is-sign`, `is-isolate`, …) drives every animation inside it from CSS. */}
      <div className={`hsmx__stage is-${current.id}`} aria-hidden="true">
        <span className="hsmx__beam hsmx__beam--in">
          <span className="hsmx__beam-label mono">hash</span>
          <span className="hsmx__dot" />
        </span>
        <span className="hsmx__beam hsmx__beam--out">
          <span className="hsmx__beam-label mono">{current.id === 'isolate' ? 'export ✗ refused' : 'signature'}</span>
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
                <KeyIcon width={24} height={24} />
              </span>
            </div>
            <div className="hsmx__face hsmx__face--right" />
            <div className="hsmx__face hsmx__face--left" />
            <div className="hsmx__face hsmx__face--back" />
            <div className="hsmx__face hsmx__face--bottom" />

            {PLATES.map((name, i) => (
              <div key={name} className="hsmx__plate" style={cssVars({ '--n': i })}>
                <span className="mono">{name}</span>
              </div>
            ))}
          </div>
          <div className="hsmx__shadow" />
        </div>

        <div className="hsmx__officers mono">
          {Array.from({ length: OFFICERS }, (_, i) => (
            <span key={i} className={i < QUORUM ? 'is-signer' : undefined} style={cssVars({ '--n': i })}>
              <KeyIcon width={14} height={14} />
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

      <p className="viz__caption">{current.caption}</p>
    </VizFrame>
  );
}
