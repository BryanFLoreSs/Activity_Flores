"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiRequest, User } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiRequest<{ token: string; user: User }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      sessionStorage.setItem("student_token", result.token);
      sessionStorage.setItem("auth_feedback", "You’re signed in successfully.");
      router.replace("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Link className="brand brand-light" href="/"><span className="brand-mark">S</span> ScholarSpace</Link>
        <div className="story-copy">
          <span className="eyebrow eyebrow-light">STUDENT INFORMATION SYSTEM</span>
          <h1>Your academic world,<br /><em>all in one place.</em></h1>
          <p>A thoughtful space for your student community, records, and everyday progress.</p>
        </div>
        <div className="story-foot"><span className="story-dot" /> Secure access · Built for learning</div>
      </section>
      <section className="auth-panel">
        <div className="auth-mobile-brand"><Link className="brand" href="/"><span className="brand-mark">S</span> ScholarSpace</Link></div>
        <div className="auth-form-wrap">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="form-intro">Pick up right where you left off.</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">Email address</label>
            <input id="email" className="text-field" type="email" autoComplete="email" placeholder="you@school.edu" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <div className="field-row"><label className="field-label" htmlFor="password">Password</label></div>
            <input id="password" className="text-field" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary form-submit" disabled={loading}>{loading ? "Signing you in…" : "Sign in"}<span aria-hidden="true">↗</span></button>
          </form>
          <p className="form-switch">New to ScholarSpace? <Link href="/register">Create an account</Link></p>
          <p className="auth-note"><span>✳</span> Your account is protected with encrypted credentials.</p>
        </div>
        <span className="auth-copyright">© 2026 ScholarSpace · Student Information System</span>
      </section>
    </main>
  );
}
