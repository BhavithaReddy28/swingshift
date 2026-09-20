# ASSUMPTIONS.md - Resolved Spec Ambiguities & Rulings

This document records technical rulings and resolved ambiguities established during the implementation of Digital Heroes.

---

## 1. Lucky Numbers Selection & Fallbacks
- **Range & Constraints**: Lucky numbers consist of 5 unique integers strictly from 1 to 45 (matching the Stableford score range).
- **Edit Window**: Lucky numbers are editable from the subscriber dashboard up until a draw for that month is published.
- **Auto-Assignment**: If a subscriber has no lucky numbers selected at the time a draw runs, the system automatically assigns 5 random unique numbers (1–45) and persists them to the user's profile to ensure draw participation.

---

## 2. Draw Mechanics & Tier Matching
- **Winning Number Generation**: Each monthly draw produces 5 unique winning numbers from 1–45.
- **Tier Matching**:
  - **Jackpot Tier**: 5 matching numbers.
  - **Tier Two**: 4 matching numbers.
  - **Tier Three**: 3 matching numbers.
  - **No Prize**: Fewer than 3 matching numbers.

---

## 3. Draw Engine Generation Modes
- **Random Mode**: Uniform selection of 5 unique numbers (1–45) using `crypto.randomInt` (or hash-based seed). The seed string is stored on the `draws` row for 100% auditability and repeatability.
- **Algorithmic Mode**: Constructs a frequency map over every score value recorded in the `scores` table. Each candidate number 1–45 receives a weight equal to `1 + occurrences`. 5 unique numbers are drawn by weighted sampling without replacement. The frequency snapshot is stored as JSON on the `draws` row for transparent admin UI explanation.

---

## 4. Entry Eligibility & Snapshotting
- **Eligibility Criteria**: A subscriber is eligible for a draw if:
  1. `subscriptions.status = 'active'` at the time the draw runs.
  2. The subscriber has at least one score recorded in `scores`.
- **Snapshotting**: Entry lists (user ID, lucky numbers, and match count) are snapshotted into `draw_entries` when the draw is processed so subsequent score edits cannot retroactively alter published draw results.

---

## 5. Prize Pool & Rollover Arithmetic
- **Prize Contribution**: Fixed £5 (500 pence) per active subscriber per month (yearly subscribers contribute £5 for each month).
- **Pool Slices**:
  - **40% Jackpot Tier**
  - **35% Tier Two (4 Matches)**
  - **25% Tier Three (3 Matches)**
- **Equal Division & Penny Rounding**: Within each tier, the slice is divided equally among tier winners, rounded down to the nearest penny (`Math.floor(slice / winner_count)`).
- **Rollover Rules**:
  - If 0 winners exist in the Jackpot Tier (5 matches), the entire 40% slice carries over into the next month's jackpot.
  - If 0 winners exist in Tier Two or Tier Three, or if penny division remainders exist, those unclaimed amounts are added to `rollover_out_pence` and carried forward into the next month's jackpot pool.

---

## 6. Verification Gate & Payout Safety
- **Verification Gate**: Winners upload scorecard proof screenshots to a private Supabase Storage bucket (`winner-proofs`).
- **State Machine**: Status transitions from `not_submitted` → `pending` → `approved` | `rejected`.
- **Admin Block**: The server API explicitly blocks setting payout status to `paid` unless `verification_status === 'approved'`.
