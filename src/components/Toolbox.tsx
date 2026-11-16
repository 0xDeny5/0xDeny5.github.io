import { about, primaryStack, stack } from '../content';
import { cssVars } from '../lib/style';
import { Section } from './Section';

export function Toolbox() {
  const { education, languages } = about;

  return (
    <Section
      id="toolbox"
      title={
        <>
          What I ship <em>with</em>.
        </>
      }
    >
      <p className="primary-stack" data-reveal>
        {primaryStack.map((tech, i) => (
          <span key={tech} className="primary-stack__item" style={cssVars({ '--i': i })}>
            {tech}
            {i < primaryStack.length - 1 && (
              <span className="primary-stack__sep" aria-hidden="true">
                /
              </span>
            )}
          </span>
        ))}
      </p>

      <div className="toolbox">
        {stack.map((group, i) => (
          <div key={group.title} className="toolbox__group" data-reveal style={cssVars({ '--i': i % 3 })}>
            <h3 className="toolbox__title mono">{group.title}</h3>
            <ul className="toolbox__items">
              {group.items.map((item) => (
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
            <span className="about__strong">{education.degree}</span>
            <span className="muted">
              {education.school}, {education.period}
            </span>
            <dl className="about__facts">
              {education.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="mono">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </dd>
        </div>
        <div className="about__item">
          <dt className="label mono">Languages</dt>
          <dd className="about__langs">
            {languages.map((lang) => (
              <span key={lang.name}>
                <span className="about__strong">{lang.name}</span> <span className="muted">{lang.level}</span>
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </Section>
  );
}
