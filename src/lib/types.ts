export type FeedbackStatus = "new" | "reviewed" | "resolved";

export type FeedbackCategory =
  | "teaching"
  | "materials"
  | "workload"
  | "assessment"
  | "other";

export interface Feedback {
  id: string;
  studentName: string | null;
  isAnonymous: boolean;
  courseCode: string;
  courseName: string;
  instructor: string;
  category: FeedbackCategory;
  rating: number;
  comment: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
}

export interface Database {
  admins: Admin[];
  feedback: Feedback[];
}

export const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "teaching", label: "Teaching quality" },
  { value: "materials", label: "Course materials" },
  { value: "workload", label: "Workload & pacing" },
  { value: "assessment", label: "Assessment & grading" },
  { value: "other", label: "Other" },
];

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  resolved: "Resolved",
};
