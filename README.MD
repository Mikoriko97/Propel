## English Version

# Propel — Decentralized Platform for Predictions and Crowdfunding

Transparent funding of innovation through milestones and a prediction market: the community places bets on the success of concrete project steps, and funds are distributed automatically based on objectively verified progress.

## What it does
- Propel combines prediction markets with crowdfunding: “FOR/AGAINST” bets on milestone completion simultaneously form the development fund.
- If the milestone is completed, participants who bet “FOR” earn a profit, and the creator receives funding for the next step.
- Rewards and fund distribution are governed by smart contracts (in the full version).

## The problem it solves
- For investors/community: significantly reduces the risk of “rug pull” — funds aren’t released upfront and only unlock after verified work.
- For creators: provides access to seed capital based on merit (proven competence), not connections or hype.

## Challenges I ran into
- The “Oracle Problem”: how to decentralize and reliably verify subjective tasks (prototype quality, etc.).
- Our approach: a hybrid arbitration system combining expert reputation with incentives (staking, slashing) and appeals.

## Technologies we use
- Blockchain (planned): Linera Protocol — scalability and low fees via microchains.
- Smart contracts (planned): Rust → WASM — safety and advanced logic.
- Frontend (MVP): React + TypeScript (Vite), Tailwind CSS, lucide‑react icons.
- Backend (off-chain, planned): Node.js/TypeScript for indexing; Python for AI scoring.

## How we built it
Milestone lifecycle:
- Submission: the creator defines a measurable milestone and posts a bond.
- Market: a prediction market opens with “FOR/AGAINST” bets.
- Execution: the creator submits evidence of completed work.
- Arbitration: a decentralized jury (or the team in MVP) reviews evidence and issues a verdict.
- Distribution: smart contract distributes funds (baseline model: 60% to winners, 30% to the creator, 10% to the platform).

## What we learned
- The system’s success depends more on incentive design than code.
- Every fee percentage and arbitration rule creates potential vectors for manipulation — the reward model must incentivize honest behavior.

## What’s next
- MVP launch: centralized arbitration by the team to validate the hypothesis and onboard initial users quickly.
- Decentralized arbitration: a full jury system with staking, appeals, and slashing for dishonest decisions.
- AI integration: advisory scoring of projects (novelty, clarity of criteria, risk) to inform market participants.

## Current status: Demo Frontend (Hackathon)
- An interactive frontend prototype prepared (no blockchain integration yet).
- Demonstrates key UX/UI, core betting mechanics, and user analytics.

### What’s implemented in the demo
- Branding: name “Propel”, logo, unique color palette (light emerald, dark emerald, ruby).
- UI themes: light/dark, theme toggle.
- Key screens:
  - Landing / Markets overview (cards of active projects).
  - Project page (description, milestone criteria, betting module).
  - Dashboard (demo statistics, user/investor role toggle, wallet status).
- Core mechanic: betting module with “FOR” (dark emerald) and “AGAINST” (ruby), visualized pools.

## Roadmap: Six Waves of Delivery
**Wave 1: MVP**
- Focus: fastest launch of core functionality.
- Contracts: baseline Rust/WASM smart contracts for Linera.
- Constraints: one milestone per project, stablecoins only (USDC), centralized arbitration by the team.
- Payouts: 30% to the creator as a single tranche.
- Result: functional platform with real bets.

**Wave 2: Audit & Launch (Mainnet Launch)**
- Security: professional contract audit.
- Launch: deployment to Linera Mainnet.
- Marketing: first 10–20 creators and 100–500 market participants.

**Wave 3: Decentralized Arbitration**
- Jury: staking, reputation, appeals, slashing.
- Tools: transparent voting, on‑chain proof protocols.

**Wave 4: Tokenomics & Incentives**
- Reward model: long‑term incentives, referral system, fee rebates.
- Collusion resistance: influence limits, anti‑Sybil mechanisms.

**Wave 5: AI Integration**
- Advisory scoring: novelty, clarity of criteria, risks, similarity.
- Creator assistant: generating milestones and verification criteria.

**Wave 6: Ecosystem & Partnerships**
- Integrations: wallets, indexers, analytics, partner DAOs.
- Launch programs: curated listings, grants, accelerator.

## Technical stack (current MVP)
- Frontend: React + TypeScript (Vite), TailwindCSS, lucide‑react.
- Infrastructure: Vite dev server, static build in `dist/`.
- Backend preparation: `lib/supabase.ts`, `SUPABASE_MIGRATION.sql`.

## Local development
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev` → open `http://localhost:5174/`
3. Build: `npm run build` → static files in `dist/`

## Team & contacts
**Discord handles:**
- `@Mikoriko` 
- `@Stech🥷` 
- `RuslanSukhovii 🔥` 
- `UCANSEE ✧ᴗ✧` 
- `Lumin`

Roles can be refined as needed; ping us on Discord for collaboration.

## Demo screenshots / video
- Landing & markets: overview of active projects
- Project page: description, criteria, betting module
- Dashboard: demo analytics for user/investor

## Value proposition
- Transparency and trust: independent verification of milestones.
- Fair rewards: rational distribution between creators and accurate forecasters.
- Innovation without undue risk: funds unlock progressively for proven progress.