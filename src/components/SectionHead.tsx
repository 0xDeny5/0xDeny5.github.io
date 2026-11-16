import type { ReactNode } from 'react';
import { blockMeta } from '../chain';
import { useScramble } from '../hooks';

interface SectionHeadProps {
  index: string;
  label: string;
  id: string;
  children: ReactNode;
  aside?: ReactNode;
}

/**
 * Numbered section heading: a mono label that "decrypts" on view, a large title, and a small
 * block header (height + previous block's hash) that chains the sections together.
 */
export function SectionHead({ index, label, id, children, aside }: SectionHeadProps) {
  const [ref, text] = useScramble<HTMLParagraphElement>(label);
  const block = blockMeta(Number(index));

  return (
    <header className="shead" data-reveal>
      <p ref={ref} className="shead__label mono">
        <span className="shead__index">{index}</span>
        <span className="shead__rule" aria-hidden="true" />
        <span className="sr-only">{label}</span>
        <span aria-hidden="true">{text}</span>
        <span className="shead__block" aria-hidden="true">
          <span>block {block.height}</span>
          <span className="shead__prev">prev {block.prev}</span>
          <span className="shead__hash">hash {block.hash}</span>
        </span>
      </p>
      <div className="shead__row">
        <h2 id={id} className="shead__title">
          <span className="shead__title-inner">{children}</span>
        </h2>
        {aside && <div className="shead__aside">{aside}</div>}
      </div>
    </header>
  );
}
