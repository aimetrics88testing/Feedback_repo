import Link from "next/link";

export default function ThanksPage() {
  return (
    <section className="thanks section">
      <p className="eyebrow">Submitted</p>
      <h1>Thank you</h1>
      <p className="lede" style={{ margin: "0 auto 1.5rem", maxWidth: "34ch" }}>
        Your feedback is in the review queue. Honest notes help the next cohort
        learn better.
      </p>
      <div className="cta-row" style={{ justifyContent: "center" }}>
        <Link href="/submit" className="btn btn--primary">
          Submit another
        </Link>
        <Link href="/" className="btn btn--secondary">
          Back home
        </Link>
      </div>
    </section>
  );
}
