import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero__copy">
        <p className="eyebrow">Student feedback</p>
        <h1 className="display">CampusVoice</h1>
        <p className="lede">
          Tell us what helps you learn — and what gets in the way. Your course
          feedback reaches faculty and staff who can act on it.
        </p>
        <div className="cta-row">
          <Link href="/submit" className="btn btn--primary">
            Share feedback
          </Link>
          <Link href="/admin/login" className="btn btn--secondary">
            Admin desk
          </Link>
        </div>
      </div>
      <div className="hero__visual" aria-hidden="true" />
    </section>
  );
}
