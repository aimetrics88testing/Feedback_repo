"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/types";

export function FeedbackForm() {
  const router = useRouter();
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [rating, setRating] = useState(4);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      studentName: String(form.get("studentName") ?? ""),
      isAnonymous,
      courseCode: String(form.get("courseCode") ?? ""),
      courseName: String(form.get("courseName") ?? ""),
      instructor: String(form.get("instructor") ?? ""),
      category: String(form.get("category") ?? ""),
      rating,
      comment: String(form.get("comment") ?? ""),
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setPending(false);
        return;
      }
      router.push("/thanks");
    } catch {
      setError("Network error. Please try again.");
      setPending(false);
    }
  }

  return (
    <form className="feedback-form" onSubmit={onSubmit}>
      <div className="form-row form-row--toggle">
        <label className="toggle">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <span>Submit anonymously</span>
        </label>
      </div>

      {!isAnonymous && (
        <label className="field">
          <span>Your name</span>
          <input name="studentName" type="text" placeholder="Alex Rivera" required />
        </label>
      )}

      <div className="form-grid">
        <label className="field">
          <span>Course code</span>
          <input name="courseCode" type="text" placeholder="CS201" required />
        </label>
        <label className="field">
          <span>Course name</span>
          <input
            name="courseName"
            type="text"
            placeholder="Data Structures"
            required
          />
        </label>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Instructor</span>
          <input name="instructor" type="text" placeholder="Dr. Mehta" required />
        </label>
        <label className="field">
          <span>Category</span>
          <select name="category" defaultValue="teaching" required>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="rating-field">
        <legend>Overall rating</legend>
        <div className="rating-pips" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={rating === value ? "pip is-active" : "pip"}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Your feedback</span>
        <textarea
          name="comment"
          rows={5}
          placeholder="What worked well? What could improve?"
          required
          minLength={10}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Submit feedback"}
      </button>
    </form>
  );
}
