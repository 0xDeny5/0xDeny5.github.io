import type { CSSProperties } from 'react';
import { about, primaryStack, stack } from '../content';
import { SectionHead } from './SectionHead';

export function Toolbox() {
  return (
    <section id="toolbox" className="section" aria-labelledby="toolbox-title">
      <div className="container">
        <SectionHead index="04" label="Toolbox" id="toolbox-title">
          What I ship <em>with</em>.
        </SectionHead>

        <p className="primary-stack" data-reveal>
          {primaryStack.map((s, i) => (
            <span key={s} className="primary-stack__item" style={{ '--i': i } as CSSProperties}>
              {s}
              {i < primaryStack.length - 1 && <span className="primary-stack__sep" aria-hidden="true">/</span>}
            </span>
          ))}
        </p>

        <div className="toolbox">
          {stack.map((g, i) => (
            <div key={g.title} className="toolbox__group" data-reveal style={{ '--i': i % 3 } as CSSProperties}>
              <h3 className="toolbox__title mono">{g.title}</h3>
              <ul className="toolbox__items">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <dl className="about" data-reveal>
          <div className="about__item">
            <dt className="label mono">Education</dt>
            <dd>
              <span className="about__strong">{about.education.degree}</span>
              <span className="muted">
                {about.education.school}, {about.education.period}
              </span>
              <dl className="about__facts">
                {about.education.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="mono">{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </dd>
          </div>
          <div className="about__item">
            <dt className="label mono">Languages</dt>
            <dd className="about__langs">
              {about.languages.map((l) => (
                <span key={l.name}>
                  <span className="about__strong">{l.name}</span> <span className="muted">{l.level}</span>
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
