import type { ReactNode } from 'react';
import { sections, type SectionId } from '../content';
import { useScramble } from '../hooks';
import { blockMeta } from '../lib/chain';
import { pad } from '../lib/format';

interface SectionProps {
  id: SectionId;
  title: ReactNode;
  /** Short note shown beside the title on wide screens. */
  aside?: ReactNode;
  children: ReactNode;
}

/** A numbered page section. Its number, label and block hash all come from `sections` in content.ts. */
export function Section({ id, title, aside, children }: SectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className="section" aria-labelledby={titleId}>
      <div className="container">
        <SectionHead id={id} titleId={titleId} aside={aside}>
          {title}
        </SectionHead>
        {children}
      </div>
    </section>
  );
}

interface SectionHeadProps {
  id: SectionId;
  titleId: string;
  aside?: ReactNode;
  children: ReactNode;
}

/**
 * A mono label that "decrypts" on view, a large title, and a small block header (height + previous
 * block's hash) that chains the sections together. Block 0 is the hero, so sections start at 1.
 */
function SectionHead({ id, titleId, aside, children }: SectionHeadProps) {
  const height = sections.findIndex((s) => s.id === id) + 1;
  const label = sections[height - 1]?.label ?? id;
  const [ref, text] = useScramble<HTMLParagraphElement>(label);
  const block = blockMeta(height);

  return (
    <header className="shead" data-reveal>
      <p ref={ref} className="shead__label mono">
        <span className="shead__index">{pad(height)}</span>
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
        <h2 id={titleId} className="shead__title">
          <span className="shead__title-inner">{children}</span>
        </h2>
        {aside && <div className="shead__aside">{aside}</div>}
      </div>
    </header>
  );
}
