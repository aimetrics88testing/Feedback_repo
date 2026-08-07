"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  STATUS_LABELS,
  type Feedback,
  type FeedbackCategory,
  type FeedbackStatus,
} from "@/lib/types";

type Stats = {
  total: number;
  newCount: number;
  reviewedCount: number;
  resolvedCount: number;
  averageRating: number;
};

export function AdminDashboard({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState<"" | FeedbackStatus>("");
  const [category, setCategory] = useState<"" | FeedbackCategory>("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);

    const res = await fetch(`/api/admin/feedback?${params.toString()}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load feedback.");
      return;
    }
    setFeedback(data.feedback);
    setStats(data.stats);
    setError("");
  }, [status, category, router]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  async function updateStatus(id: string, next: FeedbackStatus) {
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this feedback entry?")) return;
    const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div>
          <p className="eyebrow">Admin desk</p>
          <h1>Welcome, {adminName}</h1>
        </div>
        <button type="button" className="btn btn--ghost" onClick={logout}>
          Sign out
        </button>
      </div>

      {stats && (
        <div className="stat-strip" aria-label="Feedback summary">
          <div>
            <strong>{stats.total}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{stats.newCount}</strong>
            <span>New</span>
          </div>
          <div>
            <strong>{stats.averageRating || "—"}</strong>
            <span>Avg rating</span>
          </div>
          <div>
            <strong>{stats.resolvedCount}</strong>
            <span>Resolved</span>
          </div>
        </div>
      )}

      <div className="filters">
        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | FeedbackStatus)}
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as "" | FeedbackCategory)
            }
          >
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}
      {pending && feedback.length === 0 && <p className="muted">Loading…</p>}

      <ul className="feedback-list">
        {feedback.map((item) => (
          <li key={item.id} className="feedback-item">
            <div className="feedback-item__meta">
              <span className={`status status--${item.status}`}>
                {STATUS_LABELS[item.status]}
              </span>
              <span className="rating-badge">{item.rating}/5</span>
              <span className="muted">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2>
              {item.courseCode} · {item.courseName}
            </h2>
            <p className="feedback-item__sub">
              {item.instructor} ·{" "}
              {CATEGORIES.find((c) => c.value === item.category)?.label} ·{" "}
              {item.isAnonymous ? "Anonymous" : item.studentName}
            </p>
            <p className="feedback-item__body">{item.comment}</p>
            <div className="feedback-item__actions">
              <select
                aria-label="Update status"
                value={item.status}
                onChange={(e) =>
                  updateStatus(item.id, e.target.value as FeedbackStatus)
                }
              >
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => remove(item.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!pending && feedback.length === 0 && (
        <p className="muted empty-state">No feedback matches these filters.</p>
      )}
    </div>
  );
}
