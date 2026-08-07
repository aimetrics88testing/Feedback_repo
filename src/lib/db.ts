import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  Admin,
  Database,
  Feedback,
  FeedbackCategory,
  FeedbackStatus,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

async function ensureDb(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    const empty: Database = { admins: [], feedback: [] };
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }
}

async function writeDb(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function listFeedback(filters?: {
  status?: FeedbackStatus;
  category?: FeedbackCategory;
}): Promise<Feedback[]> {
  const db = await ensureDb();
  let items = [...db.feedback].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (filters?.status) {
    items = items.filter((f) => f.status === filters.status);
  }
  if (filters?.category) {
    items = items.filter((f) => f.category === filters.category);
  }

  return items;
}

export async function createFeedback(input: {
  studentName?: string;
  isAnonymous: boolean;
  courseCode: string;
  courseName: string;
  instructor: string;
  category: FeedbackCategory;
  rating: number;
  comment: string;
}): Promise<Feedback> {
  const db = await ensureDb();
  const now = new Date().toISOString();
  const feedback: Feedback = {
    id: randomUUID(),
    studentName: input.isAnonymous ? null : input.studentName?.trim() || null,
    isAnonymous: input.isAnonymous,
    courseCode: input.courseCode.trim().toUpperCase(),
    courseName: input.courseName.trim(),
    instructor: input.instructor.trim(),
    category: input.category,
    rating: input.rating,
    comment: input.comment.trim(),
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  db.feedback.unshift(feedback);
  await writeDb(db);
  return feedback;
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): Promise<Feedback | null> {
  const db = await ensureDb();
  const index = db.feedback.findIndex((f) => f.id === id);
  if (index === -1) return null;

  db.feedback[index] = {
    ...db.feedback[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  await writeDb(db);
  return db.feedback[index];
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const db = await ensureDb();
  const before = db.feedback.length;
  db.feedback = db.feedback.filter((f) => f.id !== id);
  if (db.feedback.length === before) return false;
  await writeDb(db);
  return true;
}

export async function getFeedbackStats() {
  const items = await listFeedback();
  const avg =
    items.length === 0
      ? 0
      : items.reduce((sum, f) => sum + f.rating, 0) / items.length;

  return {
    total: items.length,
    newCount: items.filter((f) => f.status === "new").length,
    reviewedCount: items.filter((f) => f.status === "reviewed").length,
    resolvedCount: items.filter((f) => f.status === "resolved").length,
    averageRating: Math.round(avg * 10) / 10,
  };
}

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  const db = await ensureDb();
  return db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function upsertAdmin(admin: Admin): Promise<void> {
  const db = await ensureDb();
  const index = db.admins.findIndex((a) => a.email === admin.email);
  if (index >= 0) {
    db.admins[index] = admin;
  } else {
    db.admins.push(admin);
  }
  await writeDb(db);
}
