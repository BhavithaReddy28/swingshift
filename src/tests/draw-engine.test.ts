import { describe, it, expect } from "vitest";
import {
  generateRandomWinningNumbers,
  generateAlgorithmicWinningNumbers,
  calculateMatchCount,
  processRollingFiveScores,
  calculatePrizeSplits,
} from "../lib/draw-engine";

describe("Digital Heroes Draw Engine & Business Rules", () => {
  describe("Rolling 5-score Window", () => {
    it("keeps only the 5 newest scores when 6 scores are provided", () => {
      const scores = [
        { played_on: "2026-01-01", score: 20 },
        { played_on: "2026-01-02", score: 22 },
        { played_on: "2026-01-03", score: 25 },
        { played_on: "2026-01-04", score: 28 },
        { played_on: "2026-01-05", score: 30 },
        { played_on: "2026-01-06", score: 32 },
      ];

      const retained = processRollingFiveScores(scores);
      expect(retained.length).toBe(5);
      expect(retained[0].played_on).toBe("2026-01-06"); // Newest first
      expect(retained[4].played_on).toBe("2026-01-02");
      // "2026-01-01" should be evicted
      expect(retained.find((s) => s.played_on === "2026-01-01")).toBeUndefined();
    });
  });

  describe("Score Range Bounds & Duplicates", () => {
    it("validates score ranges (1 to 45)", () => {
      const isValidScore = (score: number) => score >= 1 && score <= 45;
      expect(isValidScore(0)).toBe(false);
      expect(isValidScore(46)).toBe(false);
      expect(isValidScore(-5)).toBe(false);
      expect(isValidScore(1)).toBe(true);
      expect(isValidScore(45)).toBe(true);
      expect(isValidScore(28)).toBe(true);
    });

    it("detects duplicate dates correctly", () => {
      const existingDates = ["2026-02-10", "2026-02-15"];
      const isDuplicateDate = (date: string) => existingDates.includes(date);
      expect(isDuplicateDate("2026-02-10")).toBe(true);
      expect(isDuplicateDate("2026-02-11")).toBe(false);
    });
  });

  describe("Lucky Number Match Calculation", () => {
    it("calculates exact match counts for 0, 3, 4, and 5 matches", () => {
      const winning = [7, 14, 21, 28, 35];

      expect(calculateMatchCount([1, 2, 3, 4, 5], winning)).toBe(0);
      expect(calculateMatchCount([7, 14, 21, 1, 2], winning)).toBe(3);
      expect(calculateMatchCount([7, 14, 21, 28, 99], winning)).toBe(4);
      expect(calculateMatchCount([7, 14, 21, 28, 35], winning)).toBe(5);
    });
  });

  describe("Draw Generation Modes", () => {
    it("generates 5 unique random numbers between 1 and 45", () => {
      const { winningNumbers } = generateRandomWinningNumbers();
      expect(winningNumbers.length).toBe(5);
      const uniqueSet = new Set(winningNumbers);
      expect(uniqueSet.size).toBe(5);
      winningNumbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(45);
      });
    });

    it("generates weighted algorithmic numbers with frequency map", () => {
      const scores = [
        { score: 10 }, { score: 10 }, { score: 10 },
        { score: 20 }, { score: 20 },
        { score: 30 },
      ];
      const { winningNumbers, frequencySnapshot } = generateAlgorithmicWinningNumbers(scores);
      expect(winningNumbers.length).toBe(5);
      expect(frequencySnapshot[10]).toBe(3);
      expect(frequencySnapshot[20]).toBe(2);
      expect(frequencySnapshot[30]).toBe(1);
    });
  });

  describe("Prize Tier Splitting & Rollover Arithmetic", () => {
    it("splits prize pool (£500 total = 100 subscribers * £5) into 40% / 35% / 25%", () => {
      const winning = [10, 20, 30, 40, 45];
      const entries = [
        { userId: "u1", numbers: [10, 20, 30, 40, 45] }, // 5 matches
        { userId: "u2", numbers: [10, 20, 30, 40, 1] },  // 4 matches
        { userId: "u3", numbers: [10, 20, 30, 40, 2] },  // 4 matches
        { userId: "u4", numbers: [10, 20, 30, 1, 2] },   // 3 matches
      ];

      // 100 active subscribers @ 500p = 50,000p (£500)
      const result = calculatePrizeSplits(100, entries, winning, 0);

      expect(result.newPoolPence).toBe(50000);
      expect(result.totalPoolPence).toBe(50000);
      // 40% = 20,000p
      expect(result.tierSlices.tier5).toBe(20000);
      // 35% = 17,500p
      expect(result.tierSlices.tier4).toBe(17500);
      // 25% = 12,500p
      expect(result.tierSlices.tier3).toBe(12500);

      // u1 jackpot winner gets 20,000p
      const u1 = result.winners.find((w) => w.userId === "u1");
      expect(u1?.prizeAmountPence).toBe(20000);

      // u2 and u3 tie in tier 4: 17,500 / 2 = 8,750p each
      const u2 = result.winners.find((w) => w.userId === "u2");
      const u3 = result.winners.find((w) => w.userId === "u3");
      expect(u2?.prizeAmountPence).toBe(8750);
      expect(u3?.prizeAmountPence).toBe(8750);

      // u4 tier 3 winner gets 12,500p
      const u4 = result.winners.find((w) => w.userId === "u4");
      expect(u4?.prizeAmountPence).toBe(12500);

      expect(result.rolloverOutPence).toBe(0);
    });

    it("rolls over entire 40% jackpot when no 5-match winners exist", () => {
      const winning = [10, 20, 30, 40, 45];
      const entries = [
        { userId: "u1", numbers: [10, 20, 30, 40, 1] }, // 4 matches
      ];

      // 10 active subscribers @ 500p = 5,000p (£50)
      // Tier 5 (40%) = 2,000p
      // Tier 4 (35%) = 1,750p
      // Tier 3 (25%) = 1,250p
      const result = calculatePrizeSplits(10, entries, winning, 0);

      expect(result.winnerCounts.tier5).toBe(0);
      expect(result.winnerCounts.tier4).toBe(1);
      expect(result.winnerCounts.tier3).toBe(0);

      // Unclaimed Jackpot (2,000p) + Unclaimed Tier 3 (1,250p) = 3,250p rollover out
      expect(result.rolloverOutPence).toBe(3250);
    });

    it("handles integer penny rounding remainders during split ties", () => {
      const winning = [1, 2, 3, 4, 5];
      const entries = [
        { userId: "u1", numbers: [1, 2, 3, 4, 5] },
        { userId: "u2", numbers: [1, 2, 3, 4, 5] },
        { userId: "u3", numbers: [1, 2, 3, 4, 5] },
      ];

      // 2 subscribers @ 500p = 1,000p total pool.
      // Tier 5 (40%) = 400p.
      // 400 / 3 = 133p per winner. Remainder = 400 - (133 * 3) = 1p remainder.
      // Tiers 4 (35% = 350p) and 3 (25% = 250p) are unclaimed.
      // Total rollover out = 1p (remainder) + 350p + 250p = 601p.
      const result = calculatePrizeSplits(2, entries, winning, 0);
      const tier5Winners = result.winners.filter((w) => w.tier === 5);

      expect(tier5Winners[0].prizeAmountPence).toBe(133);
      expect(tier5Winners[1].prizeAmountPence).toBe(133);
      expect(tier5Winners[2].prizeAmountPence).toBe(133);
      expect(result.rolloverOutPence).toBe(601);
    });
  });
});
