import { FeedbackForm } from "@/components/FeedbackForm";

export default function SubmitPage() {
  return (
    <section className="section section--narrow">
      <div className="panel">
        <p className="eyebrow">Course feedback</p>
        <h1>Share what you experienced</h1>
        <p className="lede">
          Rate a course, note the instructor, and leave constructive comments.
          Anonymous mode is on by default.
        </p>
        <FeedbackForm />
      </div>
    </section>
  );
}
