"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { apiRequest, User } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = useMemo(() => [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length, [password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) { setError("Your passwords do not match yet."); return; }
    setLoading(true);
    try {
      const result = await apiRequest<{ token: string; user: User }>("/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, password_confirmation: confirmation }),
      });
      sessionStorage.setItem("student_token", result.token);
      sessionStorage.setItem("auth_feedback", "Your account was created successfully.");
      router.replace("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Link className="brand brand-light" href="/"><span className="brand-mark">S</span> ScholarSpace</Link>
        <div className="story-copy">
          <span className="eyebrow eyebrow-light">A BETTER WAY TO STAY CONNECTED</span>
          <h1>Make room for<br /><em>what’s next.</em></h1>
          <p>One secure home for student records and the people behind them.</p>
        </div>
        <div className="story-foot"><span className="story-dot" /> Your next chapter starts here</div>
      </section>
      <section className="auth-panel">
        <div className="auth-mobile-brand"><Link className="brand" href="/"><span className="brand-mark">S</span> ScholarSpace</Link></div>
        <div className="auth-form-wrap">
          <span className="eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="form-intro">Join your student community in just a moment.</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="name">Full name</label>
            <input id="name" className="text-field" autoComplete="name" placeholder="e.g. Alex Rivera" value={name} onChange={(event) => setName(event.target.value)} required />
            <label className="field-label" htmlFor="email">Email address</label>
            <input id="email" className="text-field" type="email" autoComplete="email" placeholder="you@school.edu" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label className="field-label" htmlFor="password">Create password</label>
            <input id="password" className="text-field" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
            <div className="strength-meter" aria-label={`Password strength ${strength} of 4`}>{[0, 1, 2, 3].map((part) => <span key={part} className={strength > part ? `strength-on strength-${strength}` : ""} />)}</div>
            <span className="strength-caption">Use 8+ characters, with a mix of letters, numbers, or symbols.</span>
            <label className="field-label" htmlFor="confirmation">Confirm password</label>
            <input id="confirmation" className="text-field" type="password" autoComplete="new-password" placeholder="Type your password again" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary form-submit" disabled={loading}>{loading ? "Creating your account…" : "Create account"}<span aria-hidden="true">↗</span></button>
          </form>
          <p className="form-switch">Already have an account? <Link href="/login">Sign in</Link></p>
          <p className="auth-note"><span>✳</span> Your password is encrypted before it is stored.</p>
        </div>
        <span className="auth-copyright">© 2026 ScholarSpace · Student Information System</span>
      </section>
    </main>
  );
}
