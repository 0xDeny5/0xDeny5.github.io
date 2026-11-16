import { describe, expect, it } from 'vitest';
import { highlight, type Token } from './highlight';

const kindsOf = (tokens: Token[]) => tokens.filter((t) => t.text.trim()).map((t) => `${t.kind}:${t.text}`);

describe('highlight', () => {
  it('tokens concatenate back to the exact input', () => {
    const code = 'function withdraw(uint256 amount) external {\n  require(bal >= amount, "insufficient"); // ok\n}';
    expect(
      highlight(code, 'sol')
        .map((t) => t.text)
        .join(''),
    ).toBe(code);
  });

  it('classifies Solidity keywords, calls, strings, numbers and comments', () => {
    expect(kindsOf(highlight('require(ok, "no"); x = 42; // done', 'sol'))).toEqual([
      'kw:require',
      'plain:(',
      'plain:ok',
      'plain:,',
      'str:"no"',
      'plain:);',
      'plain:x',
      'plain:=',
      'num:42',
      'plain:;',
      'com:// done',
    ]);
  });

  it('classifies Rust macros, types and function calls', () => {
    expect(kindsOf(highlight('let r: Result<()> = pay(&ctx)?; emit!(Done)', 'rs'))).toEqual([
      'kw:let',
      'plain:r',
      'plain::',
      'kw:Result',
      'plain:<()>',
      'plain:=',
      'fn:pay',
      'plain:(&',
      'plain:ctx',
      'plain:)?;',
      'mac:emit!',
      'plain:(',
      'type:Done',
      'plain:)',
    ]);
  });

  it('keywords are per language', () => {
    expect(highlight('let', 'sol')[0]?.kind).toBe('plain');
    expect(highlight('let', 'rs')[0]?.kind).toBe('kw');
  });

  it('highlights a half-typed string while it is still open', () => {
    expect(highlight('require(ok, "insuf', 'sol').at(-1)).toEqual({ text: '"insuf', kind: 'str' });
  });
});
