import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <section className="section section--narrow">
      <div className="panel">
        <p className="eyebrow">Staff access</p>
        <h1>Admin sign in</h1>
        <p className="lede">
          Review student submissions, update status, and keep the queue moving.
        </p>
        <AdminLoginForm />
      </div>
    </section>
  );
}
