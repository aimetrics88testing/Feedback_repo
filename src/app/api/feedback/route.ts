import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/db";
import type { FeedbackCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.value));

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const courseCode = String(body.courseCode ?? "").trim();
    const courseName = String(body.courseName ?? "").trim();
    const instructor = String(body.instructor ?? "").trim();
    const category = String(body.category ?? "") as FeedbackCategory;
    const rating = Number(body.rating);
    const comment = String(body.comment ?? "").trim();
    const isAnonymous = Boolean(body.isAnonymous);
    const studentName = String(body.studentName ?? "").trim();

    if (!courseCode || !courseName || !instructor || !comment) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 },
      );
    }

    if (!isAnonymous && !studentName) {
      return NextResponse.json(
        { error: "Enter your name, or submit anonymously." },
        { status: 400 },
      );
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { error: "Please write at least 10 characters of feedback." },
        { status: 400 },
      );
    }

    const feedback = await createFeedback({
      studentName,
      isAnonymous,
      courseCode,
      courseName,
      instructor,
      category,
      rating,
      comment,
    });

    return NextResponse.json({ id: feedback.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save feedback. Try again." },
      { status: 500 },
    );
  }
}
