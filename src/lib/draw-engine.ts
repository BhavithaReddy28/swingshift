import crypto from "crypto";

export interface ScoreInput {
  score: number;
}

export interface DrawEntryInput {
  userId: string;
  numbers: number[];
}

export interface WinnerResult {
  userId: string;
  tier: 3 | 4 | 5;
  prizeAmountPence: number;
  matchCount: number;
}

export type FrequencySnapshot = Record<string, number>;

export interface PrizeSplitResult {
  totalPoolPence: number;
  newPoolPence: number;
  rolloverInPence: number;
  rolloverOutPence: number;
  tierSlices: {
    tier5: number;
    tier4: number;
    tier3: number;
  };
  winners: WinnerResult[];
  winnerCounts: {
    tier5: number;
    tier4: number;
    tier3: number;
  };
}

/**
 * Generates 5 unique lucky numbers from 1 to 45.
 * Uses crypto.randomInt if no seed is supplied, or a deterministic LCG if seed is supplied.
 */
export function generateRandomWinningNumbers(seed?: string): { winningNumbers: number[]; seed: string } {
  const actualSeed = seed || crypto.randomBytes(16).toString("hex");
  const numbers = new Set<number>();

  if (seed) {
    let hash = crypto.createHash("sha256").update(seed).digest();
    let index = 0;
    while (numbers.size < 5) {
      if (index >= hash.length) {
        hash = crypto.createHash("sha256").update(hash).digest();
        index = 0;
      }
      const val = (hash[index] % 45) + 1;
      numbers.add(val);
      index++;
    }
  } else {
    while (numbers.size < 5) {
      const num = crypto.randomInt(1, 46);
      numbers.add(num);
    }
  }

  const winningNumbers = Array.from(numbers).sort((a, b) => a - b);
  return { winningNumbers, seed: actualSeed };
}

/**
 * Algorithmic mode: Builds a frequency map over scores (1-45).
 * Each candidate gets weight = 1 + occurrences.
 * Draws 5 unique numbers by weighted sampling without replacement.
 */
export function generateAlgorithmicWinningNumbers(scores: ScoreInput[]): {
  winningNumbers: number[];
  frequencySnapshot: FrequencySnapshot;
} {
  const frequencySnapshot: FrequencySnapshot = {};
  for (let i = 1; i <= 45; i++) {
    frequencySnapshot[String(i)] = 0;
  }

  for (const s of scores) {
    if (s.score >= 1 && s.score <= 45) {
      const key = String(s.score);
      frequencySnapshot[key] = (frequencySnapshot[key] || 0) + 1;
    }
  }

  const candidates: { num: number; weight: number }[] = [];
  for (let i = 1; i <= 45; i++) {
    candidates.push({ num: i, weight: 1 + (frequencySnapshot[String(i)] || 0) });
  }

  const selected = new Set<number>();
  while (selected.size < 5) {
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (let i = 0; i < candidates.length; i++) {
      randomWeight -= candidates[i].weight;
      if (randomWeight <= 0) {
        selected.add(candidates[i].num);
        candidates.splice(i, 1);
        break;
      }
    }
  }

  const winningNumbers = Array.from(selected).sort((a, b) => a - b);
  return { winningNumbers, frequencySnapshot };
}

/**
 * Calculates match count between user lucky numbers and winning set.
 */
export function calculateMatchCount(userNumbers: number[], winningNumbers: number[]): number {
  if (!userNumbers || userNumbers.length === 0 || !winningNumbers || winningNumbers.length === 0) {
    return 0;
  }
  const winningSet = new Set(winningNumbers);
  return userNumbers.filter((n) => winningSet.has(n)).length;
}

/**
 * Enforces rolling 5 scores and returns newest 5 sorted descending by played_on.
 */
export function processRollingFiveScores<T extends { played_on: string; created_at?: string }>(scores: T[]): T[] {
  const sorted = [...scores].sort((a, b) => {
    const dateDiff = new Date(b.played_on).getTime() - new Date(a.played_on).getTime();
    if (dateDiff !== 0) return dateDiff;
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });
  return sorted.slice(0, 5);
}

/**
 * Calculates prize pool, tier splits (40% / 35% / 25%), per-winner shares, and rollover.
 */
export function calculatePrizeSplits(
  activeSubscriberCount: number,
  entries: { userId: string; numbers: number[] }[],
  winningNumbers: number[],
  rolloverInPence: number = 0
): PrizeSplitResult {
  const planContributionPence = 500;
  const newPoolPence = activeSubscriberCount * planContributionPence;
  const totalPoolPence = newPoolPence + rolloverInPence;

  const tier5Slice = Math.floor(totalPoolPence * 0.40);
  const tier4Slice = Math.floor(totalPoolPence * 0.35);
  const tier3Slice = totalPoolPence - tier5Slice - tier4Slice;

  const tier5Entries: { userId: string; matchCount: number }[] = [];
  const tier4Entries: { userId: string; matchCount: number }[] = [];
  const tier3Entries: { userId: string; matchCount: number }[] = [];

  for (const entry of entries) {
    const matchCount = calculateMatchCount(entry.numbers, winningNumbers);
    if (matchCount === 5) {
      tier5Entries.push({ userId: entry.userId, matchCount });
    } else if (matchCount === 4) {
      tier4Entries.push({ userId: entry.userId, matchCount });
    } else if (matchCount === 3) {
      tier3Entries.push({ userId: entry.userId, matchCount });
    }
  }

  const winners: WinnerResult[] = [];
  let rolloverOutPence = 0;

  if (tier5Entries.length > 0) {
    const sharePence = Math.floor(tier5Slice / tier5Entries.length);
    const remainder = tier5Slice - (sharePence * tier5Entries.length);
    rolloverOutPence += remainder;

    for (const e of tier5Entries) {
      winners.push({
        userId: e.userId,
        tier: 5,
        prizeAmountPence: sharePence,
        matchCount: 5,
      });
    }
  } else {
    rolloverOutPence += tier5Slice;
  }

  if (tier4Entries.length > 0) {
    const sharePence = Math.floor(tier4Slice / tier4Entries.length);
    const remainder = tier4Slice - (sharePence * tier4Entries.length);
    rolloverOutPence += remainder;

    for (const e of tier4Entries) {
      winners.push({
        userId: e.userId,
        tier: 4,
        prizeAmountPence: sharePence,
        matchCount: 4,
      });
    }
  } else {
    rolloverOutPence += tier4Slice;
  }

  if (tier3Entries.length > 0) {
    const sharePence = Math.floor(tier3Slice / tier3Entries.length);
    const remainder = tier3Slice - (sharePence * tier3Entries.length);
    rolloverOutPence += remainder;

    for (const e of tier3Entries) {
      winners.push({
        userId: e.userId,
        tier: 3,
        prizeAmountPence: sharePence,
        matchCount: 3,
      });
    }
  } else {
    rolloverOutPence += tier3Slice;
  }

  return {
    totalPoolPence,
    newPoolPence,
    rolloverInPence,
    rolloverOutPence,
    tierSlices: {
      tier5: tier5Slice,
      tier4: tier4Slice,
      tier3: tier3Slice,
    },
    winners,
    winnerCounts: {
      tier5: tier5Entries.length,
      tier4: tier4Entries.length,
      tier3: tier3Entries.length,
    },
  };
}
