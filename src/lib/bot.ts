export type BotMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

type BotReply = {
  keywords: string[];
  answer: string;
};

const REPLIES: BotReply[] = [
  {
    keywords: ["anonymous", "anonymously", "name", "identity", "private"],
    answer:
      "Anonymous mode is on by default. Turn it off on the Share feedback form if you want to include your name. Admins still see the course details either way.",
  },
  {
    keywords: ["submit", "how", "form", "share", "send", "write"],
    answer:
      "Go to Share feedback, pick a course and instructor, choose a category, rate 1–5, and leave at least 10 characters of comments. Then hit Submit feedback.",
  },
  {
    keywords: ["category", "categories", "teaching", "materials", "workload", "assessment"],
    answer:
      "Categories are: Teaching quality, Course materials, Workload & pacing, Assessment & grading, and Other. Pick the one that best matches your note.",
  },
  {
    keywords: ["rating", "rate", "score", "stars", "1-5", "1 to 5"],
    answer:
      "Use the 1–5 rating for your overall experience (1 = poor, 5 = excellent). Pair it with a short comment so staff understand why.",
  },
  {
    keywords: ["admin", "login", "staff", "password", "desk"],
    answer:
      "Staff review submissions on the Admin desk. Students don’t need an account—only admins sign in.",
  },
  {
    keywords: ["who", "see", "read", "faculty", "review"],
    answer:
      "Campus staff and admins review feedback in the Admin desk. They can mark items as New, Reviewed, or Resolved.",
  },
  {
    keywords: ["hello", "hi", "hey", "help", "start"],
    answer:
      "Hi — I’m VoiceBot. Ask me about submitting feedback, anonymity, categories, or ratings. Or jump straight to Share feedback.",
  },
  {
    keywords: ["thanks", "thank", "bye", "ok"],
    answer: "Glad to help. Your notes make courses better for the next cohort.",
  },
];

export const BOT_GREETING =
  "Hi, I’m VoiceBot. I can help you share course feedback — try asking about anonymity, categories, or how to submit.";

export const BOT_SUGGESTIONS = [
  "How do I submit?",
  "Is it anonymous?",
  "What are the categories?",
  "How does rating work?",
];

export function getBotReply(input: string): string {
  const text = input.toLowerCase().trim();
  if (!text) {
    return "Ask me anything about CampusVoice feedback, or tap a suggestion below.";
  }

  let best: { score: number; answer: string } | null = null;
  for (const reply of REPLIES) {
    const score = reply.keywords.reduce(
      (sum, keyword) => (text.includes(keyword) ? sum + 1 : sum),
      0,
    );
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: reply.answer };
    }
  }

  if (best) return best.answer;

  return "I’m not sure about that yet. Try asking how to submit, whether feedback is anonymous, what categories mean, or how ratings work.";
}
