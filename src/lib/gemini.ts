import { decryptSecret } from "@/lib/crypto";

const GEMINI_MODEL = "gemini-2.0-flash";

type GenerateVocabularyOptions = {
  encryptedApiKey: string;
  topic: string;
  amount: number;
};

export async function generateVocabularyWithGemini(options: GenerateVocabularyOptions) {
  const apiKey = decryptSecret(options.encryptedApiKey);
  const prompt = `Generate ${options.amount} English vocabulary words about ${options.topic} for Vietnamese learners. Return strict JSON array with objects containing english, vietnamese, pronunciation, exampleEn, exampleVi, difficulty.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.6,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error("Gemini request failed");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned no content");
  }

  return JSON.parse(text);
}
