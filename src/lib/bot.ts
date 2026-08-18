import { CATEGORIES, type FeedbackCategory } from "./types";

export type BotMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

export type DraftFeedback = {
  courseCode: string;
  courseName: string;
  instructor: string;
  category: FeedbackCategory | "";
  rating: number | null;
  comment: string;
  isAnonymous: boolean;
  studentName: string;
};

export type ChatStep =
  | "idle"
  | "courseCode"
  | "courseName"
  | "instructor"
  | "category"
  | "rating"
  | "comment"
  | "anonymous"
  | "studentName"
  | "confirm";

type BotReply = {
  keywords: string[];
  answer: string;
};

export const emptyDraft = (): DraftFeedback => ({
  courseCode: "",
  courseName: "",
  instructor: "",
  category: "",
  rating: null,
  comment: "",
  isAnonymous: true,
  studentName: "",
});

const FAQ: BotReply[] = [
  {
    keywords: ["anonymous", "anonymously", "name", "identity", "private"],
    answer:
      "Anonymous mode is on by default. You can still include your name if you want. Staff always see the course details.",
  },
  {
    keywords: ["submit", "how", "form", "share", "send", "write", "give feedback"],
    answer:
      "You can use Share feedback, or I can collect it here. Say “submit feedback” and I’ll walk you through it.",
  },
  {
    keywords: ["category", "categories", "teaching", "materials", "workload", "assessment"],
    answer:
      "Categories: Teaching quality, Course materials, Workload & pacing, Assessment & grading, and Other.",
  },
  {
    keywords: ["rating", "rate", "score", "stars"],
    answer:
      "Rate 1–5 overall (1 = poor, 5 = excellent), then add a short comment so staff know why.",
  },
  {
    keywords: ["admin", "login", "staff", "password", "desk"],
    answer:
      "Students don’t need an account. Staff sign in at Admin to review, update status, and resolve items.",
  },
  {
    keywords: ["who", "see", "read", "faculty", "review", "status"],
    answer:
      "Campus staff review submissions in the Admin desk and mark them New, Reviewed, or Resolved.",
  },
  {
    keywords: ["filter", "dashboard", "delete", "stats"],
    answer:
      "Admins can filter by status or category, update each item, and delete entries. The strip at the top shows totals and average rating.",
  },
  {
    keywords: ["hello", "hi", "hey", "help", "start"],
    answer:
      "Hi — I’m CampusBot. Ask me how to submit, whether it’s anonymous, or say “submit feedback” and I’ll take your comments here.",
  },
  {
    keywords: ["thanks", "thank", "bye"],
    answer: "Glad to help. Honest notes make the next cohort’s courses better.",
  },
];

const START_SUBMIT = [
  "submit",
  "leave feedback",
  "give feedback",
  "write feedback",
  "share feedback",
  "start",
  "begin",
];

const CANCEL = ["cancel", "stop", "nevermind", "never mind", "quit", "exit"];
const YES = ["yes", "y", "yeah", "yep", "ok", "okay", "sure", "confirm", "submit"];
const NO = ["no", "n", "nope", "not now"];

export const BOT_GREETING =
  "Hi, I’m CampusBot. I can answer questions about this site, or collect course feedback right here in chat.";

export const BOT_SUGGESTIONS_IDLE = [
  "Submit feedback",
  "Is it anonymous?",
  "What are the categories?",
  "How does rating work?",
];

export const BOT_SUGGESTIONS_ADMIN = [
  "How do I review items?",
  "What do statuses mean?",
  "Can students stay anonymous?",
];

function matchFaq(text: string): string | null {
  let best: { score: number; answer: string } | null = null;
  for (const reply of FAQ) {
    const score = reply.keywords.reduce(
      (sum, keyword) => (text.includes(keyword) ? sum + 1 : sum),
      0,
    );
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: reply.answer };
    }
  }
  return best?.answer ?? null;
}

function wantsSubmit(text: string) {
  return START_SUBMIT.some((phrase) => text.includes(phrase));
}

function isCancel(text: string) {
  return CANCEL.includes(text) || text === "cancel submission";
}

function parseCategory(text: string): FeedbackCategory | null {
  const lower = text.toLowerCase();
  const byValue = CATEGORIES.find(
    (c) => lower === c.value || lower.includes(c.value),
  );
  if (byValue) return byValue.value;
  const byLabel = CATEGORIES.find((c) =>
    lower.includes(c.label.toLowerCase().split(" ")[0]),
  );
  if (byLabel) return byLabel.value;
  const index = Number(text);
  if (index >= 1 && index <= CATEGORIES.length) {
    return CATEGORIES[index - 1].value;
  }
  return null;
}

function parseRating(text: string): number | null {
  const match = text.match(/[1-5]/);
  if (!match) return null;
  return Number(match[0]);
}

function parseYesNo(text: string): boolean | null {
  if (YES.includes(text) || text.includes("anonymous")) return true;
  if (NO.includes(text) || text.includes("my name")) return false;
  return null;
}

export function categoryPrompt() {
  const list = CATEGORIES.map((c, i) => `${i + 1}. ${c.label}`).join("\n");
  return `Which category fits best?\n${list}\nYou can reply with a number or the name.`;
}

export function confirmPrompt(draft: DraftFeedback) {
  const category =
    CATEGORIES.find((c) => c.value === draft.category)?.label ?? draft.category;
  const who = draft.isAnonymous
    ? "Anonymous"
    : draft.studentName || "Named student";
  return `Here’s what I’ll send:\n${draft.courseCode} · ${draft.courseName}\nInstructor: ${draft.instructor}\n${category} · ${draft.rating}/5 · ${who}\n“${draft.comment}”\n\nReply yes to submit, or cancel to stop.`;
}

export type BotTurn = {
  reply: string;
  step: ChatStep;
  draft: DraftFeedback;
  suggestions: string[];
  shouldSubmit?: boolean;
};

export function handleBotTurn(
  input: string,
  step: ChatStep,
  draft: DraftFeedback,
): BotTurn {
  const text = input.trim();
  const lower = text.toLowerCase();

  if (!text) {
    return {
      reply: "Type a message, or tap a suggestion below.",
      step,
      draft,
      suggestions: step === "idle" ? BOT_SUGGESTIONS_IDLE : ["Cancel"],
    };
  }

  if (step !== "idle" && isCancel(lower)) {
    return {
      reply: "Stopped. Ask me anything else, or say “submit feedback” to start again.",
      step: "idle",
      draft: emptyDraft(),
      suggestions: BOT_SUGGESTIONS_IDLE,
    };
  }

  if (step === "idle") {
    if (wantsSubmit(lower)) {
      return {
        reply: "Let’s capture your course feedback. What’s the course code? (for example CS201)",
        step: "courseCode",
        draft: emptyDraft(),
        suggestions: ["Cancel"],
      };
    }
    const faq = matchFaq(lower);
    if (faq) {
      return {
        reply: faq,
        step: "idle",
        draft,
        suggestions: BOT_SUGGESTIONS_IDLE,
      };
    }
    return {
      reply:
        "I can answer questions about CampusVoice, or collect feedback here. Try “submit feedback”, “is it anonymous?”, or “what are the categories?”",
      step: "idle",
      draft,
      suggestions: BOT_SUGGESTIONS_IDLE,
    };
  }

  if (step === "courseCode") {
    if (text.length < 2) {
      return {
        reply: "Please enter a course code such as CS201.",
        step,
        draft,
        suggestions: ["Cancel"],
      };
    }
    return {
      reply: "What’s the course name?",
      step: "courseName",
      draft: { ...draft, courseCode: text.toUpperCase() },
      suggestions: ["Cancel"],
    };
  }

  if (step === "courseName") {
    if (text.length < 2) {
      return {
        reply: "Please enter the course name.",
        step,
        draft,
        suggestions: ["Cancel"],
      };
    }
    return {
      reply: "Who was the instructor?",
      step: "instructor",
      draft: { ...draft, courseName: text },
      suggestions: ["Cancel"],
    };
  }

  if (step === "instructor") {
    if (text.length < 2) {
      return {
        reply: "Please enter the instructor’s name.",
        step,
        draft,
        suggestions: ["Cancel"],
      };
    }
    return {
      reply: categoryPrompt(),
      step: "category",
      draft: { ...draft, instructor: text },
      suggestions: CATEGORIES.map((c) => c.label).concat("Cancel"),
    };
  }

  if (step === "category") {
    const category = parseCategory(text);
    if (!category) {
      return {
        reply: `Please pick a category.\n${categoryPrompt()}`,
        step,
        draft,
        suggestions: CATEGORIES.map((c) => c.label).concat("Cancel"),
      };
    }
    return {
      reply: "Overall rating from 1 (poor) to 5 (excellent)?",
      step: "rating",
      draft: { ...draft, category },
      suggestions: ["1", "2", "3", "4", "5", "Cancel"],
    };
  }

  if (step === "rating") {
    const rating = parseRating(text);
    if (!rating) {
      return {
        reply: "Please reply with a number from 1 to 5.",
        step,
        draft,
        suggestions: ["1", "2", "3", "4", "5", "Cancel"],
      };
    }
    return {
      reply: "What would you like staff to know? Write at least a sentence.",
      step: "comment",
      draft: { ...draft, rating },
      suggestions: ["Cancel"],
    };
  }

  if (step === "comment") {
    if (text.length < 10) {
      return {
        reply: "Please add a bit more detail (at least 10 characters).",
        step,
        draft,
        suggestions: ["Cancel"],
      };
    }
    return {
      reply: "Submit anonymously? Reply yes or no.",
      step: "anonymous",
      draft: { ...draft, comment: text },
      suggestions: ["Yes", "No", "Cancel"],
    };
  }

  if (step === "anonymous") {
    const anonymous = parseYesNo(lower);
    if (anonymous === null) {
      return {
        reply: "Please reply yes to stay anonymous, or no to include your name.",
        step,
        draft,
        suggestions: ["Yes", "No", "Cancel"],
      };
    }
    if (anonymous) {
      const next = { ...draft, isAnonymous: true, studentName: "" };
      return {
        reply: confirmPrompt(next),
        step: "confirm",
        draft: next,
        suggestions: ["Yes", "Cancel"],
      };
    }
    return {
      reply: "What’s your name?",
      step: "studentName",
      draft: { ...draft, isAnonymous: false },
      suggestions: ["Cancel"],
    };
  }

  if (step === "studentName") {
    if (text.length < 2) {
      return {
        reply: "Please enter your name, or say cancel.",
        step,
        draft,
        suggestions: ["Cancel"],
      };
    }
    const next = { ...draft, studentName: text };
    return {
      reply: confirmPrompt(next),
      step: "confirm",
      draft: next,
      suggestions: ["Yes", "Cancel"],
    };
  }

  if (step === "confirm") {
    if (YES.includes(lower) || lower.includes("submit")) {
      return {
        reply: "Sending your feedback…",
        step: "confirm",
        draft,
        suggestions: [],
        shouldSubmit: true,
      };
    }
    if (NO.includes(lower)) {
      return {
        reply: "Not sent. Say “submit feedback” if you want to start over.",
        step: "idle",
        draft: emptyDraft(),
        suggestions: BOT_SUGGESTIONS_IDLE,
      };
    }
    return {
      reply: "Reply yes to submit, or cancel to stop.",
      step,
      draft,
      suggestions: ["Yes", "Cancel"],
    };
  }

  return {
    reply: "Let’s start over. Say “submit feedback” when you’re ready.",
    step: "idle",
    draft: emptyDraft(),
    suggestions: BOT_SUGGESTIONS_IDLE,
  };
}
