import { QuizDirection, Vocabulary } from "@prisma/client";

export function buildQuestionText(vocabulary: Vocabulary, direction: QuizDirection) {
  return direction === "EN_TO_VI" ? vocabulary.english : vocabulary.vietnamese;
}

export function buildCorrectAnswer(vocabulary: Vocabulary, direction: QuizDirection) {
  return direction === "EN_TO_VI" ? vocabulary.vietnamese : vocabulary.english;
}

export function buildOptions(pool: Vocabulary[], current: Vocabulary, direction: QuizDirection) {
  const options = new Set<string>([buildCorrectAnswer(current, direction)]);

  for (const item of pool) {
    if (item.id === current.id) {
      continue;
    }

    options.add(buildCorrectAnswer(item, direction));

    if (options.size === 4) {
      break;
    }
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
}
