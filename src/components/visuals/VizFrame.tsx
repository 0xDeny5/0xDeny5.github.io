import type { ReactNode, Ref } from 'react';
import { cx } from '../../lib/style';

interface VizFrameProps {
  ref?: Ref<HTMLDivElement>;
  /** Modifier class: `viz--${variant}`. */
  variant: string;
  /** Text alternative for the whole animation: the frame is a single `role="img"`. */
  label: string;
  /** Two mono captions above the content, left and right. */
  head?: readonly [ReactNode, ReactNode];
  /** Status line below the content; turns green when `ok`. */
  foot?: { ok: boolean; start: ReactNode; end: ReactNode };
  children: ReactNode;
}

/** The card every live visual sits in: header captions, content, status footer. */
export function VizFrame({ ref, variant, label, head, foot, children }: VizFrameProps) {
  return (
    <div ref={ref} className={`viz viz--${variant}`} role="img" aria-label={label}>
      {head && (
        <div className="viz__head mono">
          <span>{head[0]}</span>
          <span>{head[1]}</span>
        </div>
      )}
      {children}
      {foot && (
        <div className={cx('viz__foot mono', foot.ok && 'is-ok')}>
          <span>{foot.start}</span>
          <span>{foot.end}</span>
        </div>
      )}
    </div>
  );
}
