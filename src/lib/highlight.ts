export type Lang = 'sol' | 'rs';

export type TokenKind = 'kw' | 'str' | 'com' | 'num' | 'fn' | 'mac' | 'type' | 'plain';

export interface Token {
  text: string;
  kind: TokenKind;
}

const KEYWORDS: Record<Lang, ReadonlySet<string>> = {
  sol: new Set(['function', 'external', 'returns', 'uint256', 'bool', 'require', 'emit', 'return', 'msg', 'value']),
  rs: new Set(['pub', 'fn', 'let', 'mut', 'u64', 'Ok', 'Result', 'Context']),
};

// Groups: line comment | string (possibly unterminated while typing) | number | word or macro | whitespace | punctuation.
const TOKEN = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"?)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*!?)|(\s+)|([^\sA-Za-z0-9_"]+)/g;

/**
 * Tiny highlighter for the hand-written snippets in the code visual — not a parser.
 * Token texts always concatenate back to the input, so a half-typed snippet highlights cleanly.
 */
export function highlight(code: string, lang: Lang): Token[] {
  const tokens: Token[] = [];
  for (const match of code.matchAll(TOKEN)) {
    const [text, comment, string, number, word] = match;
    let kind: TokenKind = 'plain';
    if (comment) kind = 'com';
    else if (string) kind = 'str';
    else if (number) kind = 'num';
    else if (word) {
      if (word.endsWith('!')) kind = 'mac';
      else if (KEYWORDS[lang].has(word)) kind = 'kw';
      else if (/^[A-Z]/.test(word)) kind = 'type';
      else if (code[match.index + text.length] === '(') kind = 'fn';
    }
    tokens.push({ text, kind });
  }
  return tokens;
}
