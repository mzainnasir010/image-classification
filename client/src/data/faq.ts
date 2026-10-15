export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "What does \"uncertain\" mean?",
    answer:
      "The model returns a calibrated confidence score for every prediction. When that score falls below 70%, SceneSense flags the result as uncertain rather than presenting a potentially wrong answer with false confidence. The top guess is still shown, but clearly marked so you can review it.",
  },
  {
    question: "Are my images stored?",
    answer:
      "No. The backend reads your uploaded file, runs inference, and discards the data immediately. Images are not saved to disk, logged, or retained in any form. The upload exists only for the duration of the request.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "JPEG, PNG, and WebP. Files must be under 10 MB. The model internally resizes every image to 224×224 pixels before inference.",
  },
  {
    question: "Which scenes does the model know?",
    answer:
      "The model was trained on six classes from the Intel Image Classification dataset: buildings, forest, glacier, mountain, sea, and street. It cannot identify objects within scenes or classify any category outside these six.",
  },
  {
    question: "How accurate is it?",
    answer:
      "On the held-out test split the model achieved 94.28% accuracy and a macro F1 of 0.9437 across all six classes. Glacier and mountain are the hardest to separate. See the Model page for per-class details.",
  },
  {
    question: "What is temperature scaling?",
    answer:
      "Neural networks are often overconfident. Temperature scaling divides the model's raw logits by a learned constant (1.677 here) before the softmax, which makes the probability scores better match the model's actual accuracy. A 90% confidence from this model means it is correct roughly 90% of the time.",
  },
];
