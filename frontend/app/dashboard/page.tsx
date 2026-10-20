"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest, getToken, StudentResponse, User } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [source, setSource] = useState<"cloud" | "physical">("physical");
  const [records, setRecords] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async (selectedSource: "cloud" | "physical", token: string) => {
    try {
      const result = await apiRequest<StudentResponse>(`/students?source=${selectedSource}`, { token });
      setRecords(result);
      setError("");
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        router.replace("/login");
      }
      setError(cause instanceof Error ? cause.message : "Could not load student records.");
      setRecords(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    apiRequest<{ user: User }>("/me", { token })
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((cause: unknown) => {
        if (cause instanceof ApiError && cause.status === 401) {
          router.replace("/login");
        }
      });
    void Promise.resolve().then(() => loadStudents(source, token));
  }, [loadStudents, router, source]);

  async function handleLogout() {
    const token = getToken();
    try { if (token) await apiRequest("/logout", { method: "POST", token }); }
    finally { sessionStorage.removeItem("student_token"); router.replace("/login"); }
  }

  const initials = user?.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "SS";

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><span className="brand-mark">S</span><span>ScholarSpace</span></Link>
        <div className="sidebar-section-label">WORKSPACE</div>
        <a className="nav-item nav-active" href="/dashboard"><span className="nav-icon">▦</span> Overview</a>
        <a className="nav-item" href="#records"><span className="nav-icon">▤</span> Student records</a>
        <div className="sidebar-bottom">
          <div className="secure-card"><span className="secure-icon">✳</span><strong>Your data, protected</strong><span>Authenticated access keeps your student workspace private.</span></div>
          <div className="sidebar-user"><span className="avatar">{initials}</span><span className="sidebar-user-copy"><strong>{user?.name || "Loading profile"}</strong><span>{user?.email || ""}</span></span><button className="icon-button logout-small" onClick={handleLogout} aria-label="Log out" title="Log out">↗</button></div>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Overview</div><div className="topbar-right"><span className="online-status"><i /> All systems ready</span><button className="avatar top-avatar" onClick={handleLogout} aria-label="Log out">{initials}</button></div></header>
        <div className="dashboard-content">
          <div className="welcome-row"><div><span className="eyebrow">YOUR STUDENT WORKSPACE</span><h1>Good to have you here{user ? ", " : ""}<span>{user?.name.split(" ")[0] || ""}</span><span className="wave">✳</span></h1><p>Here’s what’s happening with your student records.</p></div><button className="button button-outline" onClick={() => { const token = getToken(); if (token) { setLoading(true); void loadStudents(source, token); } }} disabled={loading}><span className={loading ? "refresh-spin" : ""}>↻</span> Refresh data</button></div>

          <div className="stat-grid">
            <article className="stat-card"><div className="stat-head"><span className="stat-label">TOTAL STUDENTS</span><span className="stat-icon stat-icon-violet">▤</span></div><strong className="stat-value">{loading ? "—" : records?.count ?? "—"}</strong><span className="stat-foot">Records in selected source</span></article>
            <article className="stat-card"><div className="stat-head"><span className="stat-label">DATA SOURCE</span><span className="stat-icon stat-icon-mint">⌘</span></div><strong className="stat-value stat-source">{source === "cloud" ? "PostgreSQL" : "Physical MySQL"}</strong><span className="stat-foot"><span className="source-live-dot" /> {source === "cloud" ? "PostgreSQL database" : "Local network database"}</span></article>
            <article className="stat-card stat-card-profile"><div className="stat-head"><span className="stat-label">SIGNED IN AS</span><span className="stat-icon stat-icon-peach">♙</span></div><strong className="stat-value stat-profile">{user?.name || "Loading…"}</strong><span className="stat-foot">{user?.email || "Verifying your account"}</span></article>
          </div>

          <section className="records-card" id="records">
                  <div className="records-header"><div><div className="records-title-line"><h2>Student records</h2><span className="record-count">{records?.count ?? 0}</span></div><p>Browse records from your connected database.</p></div><div className="source-picker"><label htmlFor="source">DATABASE</label><select id="source" value={source} onChange={(event) => { setLoading(true); setSource(event.target.value as "cloud" | "physical"); }}><option value="cloud">▤ &nbsp; PostgreSQL</option><option value="physical">▣ &nbsp; Physical MySQL</option></select></div></div>
            {error ? <div className="empty-state"><span className="empty-icon">!</span><strong>We couldn’t load these records</strong><p>{error}</p><button className="button button-outline" onClick={() => { const token = getToken(); if (token) void loadStudents(source, token); }}>Try again</button></div> : loading ? <div className="loading-state"><span className="loader" /> Connecting to {source === "cloud" ? "PostgreSQL" : "your local MySQL server"}…</div> : records?.data.length ? <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT NUMBER</th><th>COURSE</th><th>YEAR</th><th>ADDED</th></tr></thead><tbody>{records.data.map((student, index) => <tr key={student.id}><td><span className={`student-avatar student-color-${index % 4}`}>{student.first_name[0]}{student.last_name[0]}</span><strong>{student.first_name} {student.last_name}</strong></td><td><span className="student-number">{student.student_number}</span></td><td>{student.course}</td><td><span className="year-pill">Year {student.year_level}</span></td><td className="date-cell">{new Date(student.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td></tr>)}</tbody></table></div> : <div className="empty-state"><span className="empty-icon">▤</span><strong>No student records yet</strong><p>{source === "cloud" ? "Check your PostgreSQL connection and sample records." : "Check your local MySQL server connection and sample records."}</p></div>}
            <div className="records-footer"><span>Showing {records?.count ?? 0} records</span><span>Source: <strong>{records?.source === "physical" ? "Physical MySQL" : "PostgreSQL"}</strong></span></div>
          </section>
          <p className="dashboard-note"><span>✳</span> Physical MySQL is available while Laravel runs on a computer that can access your local network.</p>
        </div>
      </section>
    </main>
  );
}
