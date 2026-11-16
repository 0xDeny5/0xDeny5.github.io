// Single source of truth for all copy on the site. Edit here, not in components.

export const profile = {
  name: 'Denys Rybkin',
  role: 'Full-stack engineer · Fintech & Blockchain',
  lede: 'Five years building software where a bug costs real money. Banking cores, payment integrations, crypto custody, smart contracts and the high-load services between them — TypeScript on Node.js at the core, Rust where it counts, React when it needs a face.',
  current:
    "Building a stock market analytics platform that checks whether analysts' predictions actually came true.",
  city: 'Vilnius',
  location: 'Vilnius, Lithuania',
  timeZone: 'Europe/Vilnius',
  availability: 'Open to senior & lead roles',
  email: 'denis.ryb186f@gmail.com',
} as const;

export const links = {
  github: 'https://github.com/0xDeny5',
  linkedin: 'https://www.linkedin.com/in/denys-rybkin',
  telegram: 'https://t.me/OxDeny5',
  stackoverflow: 'https://stackoverflow.com/users/12368362/denys-rybkin',
  email: `mailto:${profile.email}`,
} as const;

/** Where to find me, in the order shown in Contact. */
export type ChannelId = 'linkedin' | 'telegram' | 'github' | 'stackoverflow';

export interface Channel {
  id: ChannelId;
  label: string;
  handle: string;
  href: string;
}

export const channels: readonly Channel[] = [
  { id: 'linkedin', label: 'LinkedIn', handle: 'in/denys-rybkin', href: links.linkedin },
  { id: 'telegram', label: 'Telegram', handle: '@OxDeny5', href: links.telegram },
  { id: 'github', label: 'GitHub', handle: '0xDeny5', href: links.github },
  { id: 'stackoverflow', label: 'Stack Overflow', handle: 'Denys Rybkin', href: links.stackoverflow },
];

/* ───────────── Page structure ───────────── */

export type SectionId = 'capabilities' | 'guarantees' | 'approach' | 'toolbox' | 'contact';

export interface Section {
  id: SectionId;
  label: string;
  /** Extra words shown next to the label in the command palette. */
  blurb?: string;
}

/** Sections in page order: drives the nav, section numbers, block hashes and the command palette. */
export const sections: readonly Section[] = [
  { id: 'capabilities', label: 'Capabilities', blurb: 'what I build' },
  { id: 'guarantees', label: 'Guarantees', blurb: 'idempotency, ACID, sagas' },
  { id: 'approach', label: 'Approach' },
  { id: 'toolbox', label: 'Toolbox' },
  { id: 'contact', label: 'Contact' },
];

/** What kind of work I'm open to — shown in Contact as three quick-scan rows. */
export const openTo = [
  { label: 'Roles', value: 'FinTech · Blockchain · Payment systems' },
  { label: 'Format', value: 'Remote · Hybrid · Open to relocation' },
  { label: 'Engagement', value: 'Full-time · Part-time · Contract' },
] as const;

/* ───────────── Ticker tape ───────────── */

export interface Tick {
  symbol: string;
  value: string;
  change: string;
  /** Arrow direction of the raw number. */
  dir: 'up' | 'down';
}

export const ticker: Tick[] = [
  { symbol: 'CUSTODY.TPS', value: '5.00', change: '+400%', dir: 'up' },
  { symbol: 'BANKING.RPS', value: '2,500', change: 'sustained', dir: 'up' },
  { symbol: 'PAYMENTS.UPTIME', value: '99.90%', change: 'money paths', dir: 'up' },
  { symbol: 'GQL.CALLS/PAGE', value: '3', change: '−97%', dir: 'down' },
  { symbol: 'CHAINS.SHIPPED', value: '15+', change: 'BTC·EVM·SOL', dir: 'up' },
  { symbol: 'TX.LIST.LOAD', value: '0.5s', change: '−89%', dir: 'down' },
  { symbol: 'KEYS.OUTSIDE.HSM', value: '0', change: 'FIPS 140-3', dir: 'down' },
  { symbol: 'YEARS.IN.PROD', value: '5+', change: 'since 2021', dir: 'up' },
];

/* ───────────── Capabilities: what I build ───────────── */

export type VisualId = 'ledger' | 'payment' | 'custody' | 'swap' | 'contracts' | 'throughput';

export interface Capability {
  id: string;
  title: string;
  pitch: string;
  includes: string[];
  /** One fact from production that backs the claim. */
  proof: { figure: string; label: string };
  visual: VisualId;
}

/** Anchor id of a capability block on the page (also used by the command palette). */
export const capabilityAnchor = (id: string) => `cap-${id}`;

export const capabilities: Capability[] = [
  {
    id: 'banking',
    title: 'Core banking & FinTech backends',
    pitch: 'Accounts, balances and money movement for regulated businesses — with the unglamorous guarantees that keep auditors and customers calm.',
    includes: ['Double-entry ledgers & balance models', 'KYC/AML onboarding flows', 'Settlement & daily reconciliation', 'Audit trails & role-based access'],
    proof: { figure: '2–3k', label: 'RPS sustained on a licensed e-money institution, 99.9% uptime on money paths' },
    visual: 'ledger',
  },
  {
    id: 'payments',
    title: 'Payment integrations',
    pitch: 'Wiring products into banks, PSPs and card rails so every payment lands exactly once, in exactly one state — retries and duplicate webhooks included.',
    includes: ['Banking-partner & PSP APIs', 'Idempotent webhooks & retries', 'Payment state machines & sagas', 'Payouts, refunds, subscriptions'],
    proof: { figure: '100k+', label: 'users moving money through payment flows I designed' },
    visual: 'payment',
  },
  {
    id: 'custody',
    title: 'Custody & key management',
    pitch: 'Key infrastructure a bank can trust: keys live in tamper-resistant hardware, every signature passes policy first, and no single person can move funds alone.',
    includes: [
      'HSM-backed signing with non-extractable keys',
      'Key hierarchies & envelope encryption',
      'Policy engines & M-of-N approvals',
      'Multi-tenant, multi-chain wallets',
    ],
    proof: { figure: '5×', label: 'sustained withdrawal throughput on a bank custody platform' },
    visual: 'custody',
  },
  {
    id: 'chains',
    title: 'Blockchain & DeFi',
    pitch: 'Everything between a user’s wallet and the trade: reading the chain, moving value across it and putting it to work — behind one API, whatever chain sits underneath.',
    includes: [
      'Multi-chain wallets, indexers & reorg-safe deposits',
      'Swaps, bridges & DEX integrations — Pump.fun, Raydium, Meteora',
      'Trading tools on real-time streams, protected from MEV',
      'Staking, liquidity positions & NFTs, incl. Bitcoin Ordinals',
    ],
    proof: { figure: '15+', label: 'chains in production — Bitcoin, EVM, Solana, Sui, Aptos, Tron, XRP and more' },
    visual: 'swap',
  },
  {
    id: 'contracts',
    title: 'Smart contracts in Solidity & Rust',
    pitch: 'On-chain logic for EVM and Solana, written like the money is real — because it is. Tested, fuzzed and reviewed before it ever sees mainnet.',
    includes: ['Solidity with Foundry: tests, fuzzing, gas', 'Solana programs in Rust / Anchor', 'Security review: reentrancy, access control', 'MEV-aware execution (Jito, private flow)'],
    proof: { figure: 'EVM + SVM', label: 'contracts and programs shipped on both virtual machines' },
    visual: 'contracts',
  },
  {
    id: 'highload',
    title: 'High-load & real-time systems',
    pitch: 'Services that stay fast when traffic, chains and markets all spike at once — and tell you why before your users do.',
    includes: ['Event-driven microservices (Kafka, NATS)', 'Load testing & bottleneck hunting', 'Real-time streams over gRPC & WebSocket', 'Observability, tracing, on-call'],
    proof: { figure: '101 → 3', label: 'cross-service calls per page after killing an N+1 — list load 4.5 s → 0.5 s' },
    visual: 'throughput',
  },
];

export const industries = ['Banks & EMIs', 'Crypto custodians', 'Wallets & exchanges', 'DeFi protocols', 'Wealth management', 'iGaming & real-money apps'];

/* ───────────── Guarantees: correctness in money code ───────────── */

export interface ExampleLine {
  text: string;
  tone?: 'ok' | 'bad' | 'muted';
}

export interface Guarantee {
  term: string;
  body: string;
  example: ExampleLine[];
}

export const guarantees: Guarantee[] = [
  {
    term: 'Idempotency',
    body: 'Every money-moving request carries an idempotency key. Retries, timeouts and duplicate webhooks produce exactly one effect — a replay just returns the original result.',
    example: [
      { text: 'POST /transfers  Idempotency-Key: 7f3a…c1  → 201' },
      { text: 'POST /transfers  Idempotency-Key: 7f3a…c1  → 201 (replay)', tone: 'ok' },
    ],
  },
  {
    term: 'ACID transactions',
    body: 'A balance change and its ledger entries commit together or not at all. The isolation level is a deliberate choice per flow, not whatever the ORM defaults to.',
    example: [
      { text: 'BEGIN;' },
      { text: '  INSERT INTO entries …;  UPDATE balances …;', tone: 'muted' },
      { text: 'COMMIT;  -- both or neither', tone: 'ok' },
    ],
  },
  {
    term: 'Race conditions',
    body: 'Two withdrawals hitting one account in the same millisecond cannot both win. Conditional updates, row locks or optimistic versions — then proven under parallel load.',
    example: [
      { text: 'UPDATE accounts SET balance = balance - $1' },
      { text: ' WHERE id = $2 AND balance >= $1;', tone: 'muted' },
      { text: '-- 0 rows updated → reject, never overdraw', tone: 'ok' },
    ],
  },
  {
    term: 'Sagas & outbox',
    body: 'Flows that span services and partners — debit, payout, confirm — run as sagas with compensating steps. Events leave through a transactional outbox, so a rollback never gets announced.',
    example: [
      { text: 'debit ✓ → payout ✗ partner timeout', tone: 'bad' },
      { text: 'refund ✓ → state: compensated', tone: 'ok' },
    ],
  },
  {
    term: 'Reconciliation',
    body: 'The internal ledger is checked against bank statements and on-chain state every day. A mismatch is flagged and investigated — never silently patched.',
    example: [
      { text: 'ledger 1,204,551.20 EUR = bank ✓', tone: 'ok' },
      { text: 'ledger 41.92710553 BTC = on-chain ✓', tone: 'ok' },
    ],
  },
  {
    term: 'Integer minor units',
    body: 'Amounts are stored and calculated as integers in the smallest unit — cents, satoshis, wei, lamports — with BigInt or decimal types. Never floating point.',
    example: [
      { text: '0.1 + 0.2 = 0.30000000000000004 ✗', tone: 'bad' },
      { text: '10n + 20n = 30n cents ✓', tone: 'ok' },
      { text: '1 BTC = 10⁸ sat · 1 ETH = 10¹⁸ wei · 1 SOL = 10⁹ lamports', tone: 'muted' },
    ],
  },
];

/* ───────────── Approach ───────────── */

export interface Step {
  title: string;
  body: string;
}

export const approach: Step[] = [
  { title: 'Start with how money moves', body: 'Before any code: which accounts exist, how money moves between them, and which rules must never break. Get that right and most bugs never happen.' },
  { title: 'Design for failure', body: 'Retries, duplicate webhooks, reorgs, partner outages — assumed from day one, not discovered in production.' },
  { title: 'Shift left on quality & security', body: 'Tests, threat modelling and security review start at design time, not the week before release — fuzzing for money math, audits before mainnet, keys in an HSM from day one.' },
  { title: 'Measure, then optimise', body: 'Load tests and traces before rewrites. Opinions are cheap; flame graphs are not.' },
  { title: 'Own it in production', body: 'Terraform, CI/CD, dashboards, on-call. Merged is not done — running reliably for real users is.' },
];

/* ───────────── Toolbox ───────────── */

export const primaryStack = ['Node.js', 'TypeScript', 'NestJS', 'React', 'Rust'] as const;

export interface StackGroup {
  title: string;
  items: string[];
}

export const stack: StackGroup[] = [
  { title: 'Backend', items: ['Express', 'GraphQL', 'REST', 'gRPC', 'WebSockets', 'Microservices', 'Jest'] },
  { title: 'On-chain', items: ['Bitcoin (UTXO, PSBT, descriptors)', 'EVM', 'Solana', 'Anchor', 'Solidity', 'Foundry', 'Tokio'] },
  { title: 'Frontend', items: ['React', 'Redux Toolkit', 'Vite', 'Wallet adapters', 'WalletConnect'] },
  { title: 'Data & messaging', items: ['PostgreSQL', 'Redis', 'MongoDB', 'InfluxDB', 'Kafka', 'RabbitMQ', 'NATS'] },
  { title: 'Cloud & ops', items: ['AWS', 'Terraform', 'Docker', 'GitLab CI', 'GitHub Actions', 'Datadog', 'Linux'] },
  { title: 'Fintech & security', items: ['Payments', 'KYC/AML', 'Banking APIs', 'CloudHSM · PKCS#11', 'FIPS 140-3', 'Contract audits'] },
];

export const about = {
  education: {
    degree: "Bachelor's degree in Computer Engineering",
    school: 'National University “Zaporizhzhia Polytechnic”',
    period: '2020 — 2024',
    facts: [
      { label: 'Programme', value: 'Computer Engineering' },
      { label: 'Graduated', value: 'June 2024' },
      { label: 'Accreditation', value: 'Ministry of Education and Science of Ukraine' },
      { label: 'Diploma', value: 'State-registered (Diia) · verified copy on request' },
    ],
  },
  languages: [
    { name: 'English', level: 'Professional' },
    { name: 'Ukrainian', level: 'Native' },
    { name: 'Russian', level: 'Native' },
    { name: 'Lithuanian', level: 'Learning' },
  ],
};
