import { QuizMode, ReviewResult, ReviewSource, ReviewState, UserVocabularyProgress } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

type ProgressLike = Pick<
  UserVocabularyProgress,
  | "state"
  | "intervalDays"
  | "easeFactor"
  | "stability"
  | "difficultyScore"
  | "totalReviews"
  | "consecutiveCorrect"
  | "lapses"
  | "lastResult"
>;

type SchedulerInput = {
  progress: ProgressLike | null;
  result: ReviewResult;
  source: ReviewSource;
  now?: Date;
};

export function getQuizReviewResult(isCorrect: boolean, mode: QuizMode): ReviewResult {
  if (!isCorrect) {
    return ReviewResult.AGAIN;
  }

  return mode === QuizMode.TYPING ? ReviewResult.GOOD : ReviewResult.HARD;
}

export function scheduleSpacedRepetition(input: SchedulerInput) {
  const now = input.now ?? new Date();
  const current = input.progress ?? {
    state: ReviewState.NEW,
    intervalDays: 0,
    easeFactor: 2.5,
    stability: 0,
    difficultyScore: 5,
    totalReviews: 0,
    consecutiveCorrect: 0,
    lapses: 0,
    lastResult: null
  };

  let state = current.state;
  let intervalDays = current.intervalDays;
  let easeFactor = current.easeFactor;
  let stability = current.stability;
  let difficultyScore = current.difficultyScore;
  let totalReviews = current.totalReviews + 1;
  let consecutiveCorrect = current.consecutiveCorrect;
  let lapses = current.lapses;

  if (input.result === ReviewResult.AGAIN) {
    consecutiveCorrect = 0;
    lapses += 1;
    state = current.state === ReviewState.NEW ? ReviewState.LEARNING : ReviewState.RELEARNING;
    easeFactor = clamp(easeFactor - 0.2, 1.3, 3.2);
    stability = Math.max(0.5, stability * 0.5 || 0.5);
    difficultyScore = clamp(difficultyScore + 0.6, 1, 10);
    intervalDays = input.source === ReviewSource.QUIZ ? 0.25 : 0.04;
  }

  if (input.result === ReviewResult.HARD) {
    consecutiveCorrect += 1;
    easeFactor = clamp(easeFactor - 0.05, 1.3, 3.2);
    stability = Math.max(1, stability ? stability * 1.25 : 1.2);
    difficultyScore = clamp(difficultyScore + 0.15, 1, 10);
    intervalDays = Math.max(1, roundToTenth((current.intervalDays || 1) * 1.2 * Math.max(1, easeFactor / 2)));
    state = consecutiveCorrect >= 2 ? ReviewState.REVIEW : ReviewState.LEARNING;
  }

  if (input.result === ReviewResult.GOOD) {
    consecutiveCorrect += 1;
    easeFactor = clamp(easeFactor + 0.05, 1.3, 3.2);
    stability = Math.max(2, stability ? stability * 1.8 : 2);
    difficultyScore = clamp(difficultyScore - 0.2, 1, 10);
    intervalDays = current.intervalDays > 0
      ? roundToTenth(Math.max(1, current.intervalDays * easeFactor))
      : consecutiveCorrect >= 2 ? 3 : 1;
    state = consecutiveCorrect >= 2 ? ReviewState.REVIEW : ReviewState.LEARNING;
  }

  if (input.result === ReviewResult.EASY) {
    consecutiveCorrect += 1;
    easeFactor = clamp(easeFactor + 0.12, 1.3, 3.2);
    stability = Math.max(3, stability ? stability * 2.4 : 3);
    difficultyScore = clamp(difficultyScore - 0.35, 1, 10);
    intervalDays = current.intervalDays > 0
      ? roundToTenth(Math.max(3, current.intervalDays * easeFactor * 1.4))
      : 4;
    state = ReviewState.REVIEW;
  }

  const dueAt = new Date(now.getTime() + intervalDays * DAY_MS);

  return {
    state,
    dueAt,
    intervalDays,
    easeFactor,
    stability,
    difficultyScore,
    totalReviews,
    consecutiveCorrect,
    lapses,
    lastReviewedAt: now,
    lastResult: input.result,
    nextReviewLabel: formatRelativeDue(now, dueAt)
  };
}

export function formatRelativeDue(from: Date, to: Date) {
  const diff = to.getTime() - from.getTime();

  if (diff <= HOUR_MS) {
    const minutes = Math.max(1, Math.round(diff / (60 * 1000)));
    return `${minutes} phut nua`;
  }

  if (diff < DAY_MS) {
    const hours = Math.max(1, Math.round(diff / HOUR_MS));
    return `${hours} gio nua`;
  }

  const days = Math.max(1, Math.round(diff / DAY_MS));
  return `${days} ngay nua`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}
