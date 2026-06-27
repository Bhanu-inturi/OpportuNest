import { useState, useEffect, useRef, createContext, useContext } from "react";

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// ─── API helper ───────────────────────────────────────────────────────────────
async function callGroq(messages, systemPrompt = "", apiKey = "") {
  const key = apiKey || localStorage.getItem("groq_key") || "";
  if (!key) throw new Error("No API key");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: systemPrompt ? [{ role: "system", content: systemPrompt }, ...messages] : messages,
      temperature: 0.7,
      max_tokens: 1800,
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const DEMO_OPPS = [
  { id: 1, title: "Regeneron ISEF Science Fair", org: "Society for Science", type: "Competition", match: 94, deadline: "Feb 2025", amount: "$75,000", tags: ["STEM", "Research"], why: "Your robotics background and research experience align perfectly with ISEF's engineering category. Past winners frequently cite project documentation quality — your GitHub portfolio is a strong asset." },
  { id: 2, title: "Google Generation Scholarship", org: "Google", type: "Scholarship", match: 91, deadline: "Dec 2024", amount: "$10,000", tags: ["CS", "Diversity"], why: "This targets underrepresented students in CS with demonstrated technical skills. Your full-stack projects and hackathon history make you a strong candidate for the engineering track." },
  { id: 3, title: "Congressional App Challenge", org: "US House of Representatives", type: "Competition", match: 88, deadline: "Nov 2024", amount: "Recognition", tags: ["App Dev", "Civic Tech"], why: "You've built real apps with real users. The judges reward polish and impact — your projects could be adapted as civic education tools, hitting both technical and impact rubrics." },
  { id: 4, title: "Questbridge National College Match", org: "Questbridge", type: "Scholarship", match: 85, deadline: "Sep 2024", amount: "Full Ride", tags: ["Need-Based", "College Prep"], why: "Full scholarship to 50+ partner colleges. Your journey building AI education tools for accessibility is exactly the kind of story Questbridge values." },
  { id: 5, title: "AWS ML Research Grant", org: "Amazon Web Services", type: "Grant", match: 82, deadline: "Jan 2025", amount: "$5,000 + Credits", tags: ["ML", "Cloud"], why: "AWS targets high school students with demonstrated ML curiosity. Your Groq/LLM integration work and adaptive tutoring project tick every box in their innovation rubric." },
];

const INTERVIEW_QS = {
  "Software Engineering": [
    "Tell me about a technical project you're proud of. What was the hardest bug you solved?",
    "How do you approach learning a new technology or framework quickly?",
    "Describe a situation where you had to collaborate with someone who had a very different working style.",
    "What's your process for debugging a problem you've never seen before?",
    "Where do you see yourself in 5 years, and what skills are you building toward that goal?",
  ],
  "Product Management": [
    "Tell me about an app you use daily. What would you improve about it?",
    "How would you prioritize features for a student productivity app with limited resources?",
    "Describe a time you had to convince people to adopt your idea.",
    "How do you define success for a product feature?",
    "Walk me through designing an onboarding experience for a new social app.",
  ],
  "Entrepreneurship": [
    "What problem have you personally experienced that you'd love to build a company around?",
    "How do you validate an idea before investing significant time building it?",
    "Tell me about a failure or project that didn't go as planned. What did you learn?",
    "How would you find your first 100 customers for a B2C app targeting high schoolers?",
    "What does success look like to you — and how does it connect to the work you're doing now?",
  ],
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
function GlobalStyles({ theme }) {
  const dark = theme === "dark";
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg1:      ${dark ? "#0a0a0a" : "#ffffff"};
      --bg2:      ${dark ? "#111111" : "#fafafa"};
      --bg3:      ${dark ? "#1a1a1a" : "#f2f2f2"};
      --bg4:      ${dark ? "#242424" : "#e5e5e5"};
      --accent:   ${dark ? "#ffffff" : "#000000"};
      --accent2:  ${dark ? "#e0e0e0" : "#1a1a1a"};
      --accent3:  ${dark ? "#a0a0a0" : "#555555"};
      --cyan:     ${dark ? "#a0a0a0" : "#444444"};
      --green:    ${dark ? "#cccccc" : "#222222"};
      --amber:    ${dark ? "#bbbbbb" : "#333333"};
      --red:      ${dark ? "#ff6666" : "#cc0000"};
      --text1:    ${dark ? "#f5f5f5" : "#0a0a0a"};
      --text2:    ${dark ? "#999999" : "#555555"};
      --text3:    ${dark ? "#555555" : "#aaaaaa"};
      --border:   ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"};
      --border2:  ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"};
      --shadow:   ${dark ? "0 4px 24px rgba(0,0,0,0.6)" : "0 4px 24px rgba(0,0,0,0.08)"};
      --glow:     ${dark ? "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.4)" : "0 0 0 1px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.06)"};
      --glow-sm:  ${dark ? "0 0 0 1px rgba(255,255,255,0.12)" : "0 0 0 1px rgba(0,0,0,0.12)"};
      --radius:    13px;
      --radius-sm: 8px;
      --font-display: 'Space Grotesk', sans-serif;
      --font-body:    'Inter', sans-serif;
      --tr: 0.18s cubic-bezier(0.4,0,0.2,1);
    }

    body {
      background: var(--bg1);
      color: var(--text1);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
      transition: background 0.25s ease, color 0.25s ease;
    }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--bg2); }
    ::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 3px; }

    /* ── Layout ── */
    .app { display: flex; min-height: 100vh; }
    .sidebar {
      width: 232px; min-height: 100vh;
      background: var(--bg2);
      border-right: 1px solid var(--border2);
      display: flex; flex-direction: column;
      padding: 20px 0;
      flex-shrink: 0;
      position: sticky; top: 0; height: 100vh;
      overflow-y: auto;
      transition: background 0.25s ease;
    }
    .main { flex: 1; min-width: 0; background: var(--bg1); transition: background 0.25s ease; }

    /* ── Logo ── */
    .logo { padding: 0 18px 24px; display: flex; align-items: center; gap: 10px; }
    .logo-icon {
      width: 34px; height: 34px;
      background: var(--accent);
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; flex-shrink: 0;
      filter: ${dark ? "none" : "invert(1)"};
    }
    .logo-text { font-family: var(--font-display); font-weight: 700; font-size: 16px; color: var(--text1); }
    .logo-text span { opacity: 0.5; }

    /* ── Nav ── */
    .nav-section { padding: 0 10px 6px; }
    .nav-label {
      font-size: 10px; font-weight: 600;
      letter-spacing: 0.12em; color: var(--text3);
      text-transform: uppercase;
      padding: 0 8px; margin-bottom: 5px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 9px;
      padding: 8px 10px; border-radius: var(--radius-sm);
      cursor: pointer; transition: var(--tr);
      font-size: 13px; color: var(--text2); font-weight: 500;
      border: none; background: none; width: 100%; text-align: left;
    }
    .nav-item:hover { background: var(--bg3); color: var(--text1); }
    .nav-item.active { background: var(--bg3); color: var(--text1); border: 1px solid var(--border); }
    .nav-icon { font-size: 15px; flex-shrink: 0; }
    .nav-badge {
      margin-left: auto;
      background: var(--accent); color: var(--bg1);
      font-size: 10px; font-weight: 700;
      padding: 2px 7px; border-radius: 20px;
    }

    /* ── XP bar ── */
    .sidebar-footer { margin-top: auto; padding: 14px 18px 0; border-top: 1px solid var(--border2); }
    .xp-label { font-size: 11px; color: var(--text3); margin-bottom: 5px; display: flex; justify-content: space-between; }
    .xp-bar { height: 3px; background: var(--bg4); border-radius: 2px; overflow: hidden; }
    .xp-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.8s ease; }

    /* ── Theme toggle ── */
    .theme-toggle {
      display: flex; align-items: center; gap: 9px;
      padding: 10px 18px; margin-top: 8px;
      border-top: 1px solid var(--border2);
    }
    .toggle-emoji { font-size: 14px; }
    .toggle-label { font-size: 12px; color: var(--text3); flex: 1; }
    .toggle-track {
      position: relative; width: 40px; height: 22px;
      background: var(--bg4); border-radius: 11px;
      cursor: pointer; transition: background 0.25s;
      border: 1px solid var(--border);
      flex-shrink: 0;
    }
    .toggle-track.on { background: var(--accent); }
    .toggle-thumb {
      position: absolute; top: 2px; left: 2px;
      width: 16px; height: 16px;
      background: ${dark ? "#000" : "#fff"};
      border-radius: 50%;
      transition: transform 0.22s cubic-bezier(.4,0,.2,1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .toggle-track.on .toggle-thumb { transform: translateX(18px); }

    /* ── Page ── */
    .page-header {
      padding: 26px 30px 20px;
      border-bottom: 1px solid var(--border2);
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 16px;
    }
    .page-title { font-family: var(--font-display); font-size: 23px; font-weight: 700; color: var(--text1); }
    .page-subtitle { font-size: 13px; color: var(--text2); margin-top: 4px; }
    .page-content { padding: 24px 30px; }

    /* ── Cards ── */
    .card {
      background: var(--bg2);
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      padding: 18px;
      transition: background 0.25s ease, border-color 0.18s;
    }
    .card-glow { border-color: var(--border); box-shadow: var(--glow); }
    .card-hover { cursor: pointer; }
    .card-hover:hover { border-color: var(--border); transform: translateY(-2px); box-shadow: var(--glow); }

    /* ── Buttons ── */
    .btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 17px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600;
      cursor: pointer; transition: var(--tr);
      border: none; font-family: var(--font-body); white-space: nowrap;
    }
    .btn-primary { background: var(--accent); color: var(--bg1); }
    .btn-primary:hover { opacity: 0.85; box-shadow: var(--glow-sm); }
    .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
    .btn-outline { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
    .btn-outline:hover { border-color: var(--border); color: var(--text1); background: var(--bg3); }
    .btn-ghost { background: transparent; color: var(--text2); }
    .btn-ghost:hover { color: var(--text1); background: var(--bg3); }
    .btn-sm { padding: 6px 12px; font-size: 12px; }

    /* ── Tags ── */
    .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .tag-a { background: var(--bg3); color: var(--text1); border: 1px solid var(--border2); }
    .tag-b { background: var(--bg4); color: var(--text2); }
    .tag-good { background: var(--bg3); color: var(--text1); border: 1px solid var(--border); }
    .tag-warn { background: var(--bg3); color: var(--text2); border: 1px solid var(--border2); }
    .tag-bad  { background: var(--bg3); color: var(--red); border: 1px solid ${dark ? "rgba(255,100,100,0.2)" : "rgba(200,0,0,0.15)"}; }

    /* ── Inputs ── */
    .input {
      background: var(--bg3);
      border: 1px solid var(--border2);
      border-radius: var(--radius-sm);
      padding: 9px 12px; font-size: 13px;
      color: var(--text1); font-family: var(--font-body);
      width: 100%; transition: var(--tr); outline: none;
    }
    .input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}; }
    .input::placeholder { color: var(--text3); }
    textarea.input { resize: vertical; min-height: 80px; }
    .input-label { font-size: 11.5px; font-weight: 600; color: var(--text2); margin-bottom: 5px; display: block; letter-spacing: 0.03em; }

    /* ── Grids ── */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 13px; }

    /* ── Stats ── */
    .stat-card { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius); padding: 16px; transition: background 0.25s; }
    .stat-val { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--text1); }
    .stat-label { font-size: 12px; color: var(--text2); margin-top: 3px; }
    .stat-change { font-size: 11px; color: var(--accent3); margin-top: 5px; }

    /* ── Progress ── */
    .progress-bar { height: 5px; background: var(--bg4); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease; background: var(--accent); }

    /* ── Opp cards ── */
    .opp-card {
      background: var(--bg2); border: 1px solid var(--border2);
      border-radius: var(--radius); padding: 17px;
      transition: var(--tr); cursor: pointer;
      animation: slideIn 0.32s ease forwards;
    }
    .opp-card:hover { border-color: var(--border); transform: translateY(-2px); box-shadow: var(--glow); }
    @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    .opp-why {
      font-size: 12.5px; color: var(--text2); line-height: 1.65;
      margin: 10px 0; padding: 10px 12px;
      background: var(--bg3); border-radius: var(--radius-sm);
      border-left: 2px solid var(--accent);
    }

    /* ── Chat ── */
    .chat-wrap { display: flex; flex-direction: column; height: calc(100vh - 155px); }
    .chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 13px; padding: 16px 0; }
    .msg { display: flex; gap: 10px; animation: slideIn 0.22s ease; max-width: 86%; }
    .msg-user { align-self: flex-end; flex-direction: row-reverse; }
    .msg-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; border: 1px solid var(--border2); background: var(--bg3); }
    .msg-bubble { padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.65; }
    .msg-ai .msg-bubble { background: var(--bg3); border: 1px solid var(--border2); color: var(--text1); border-radius: 3px 12px 12px 12px; }
    .msg-user .msg-bubble { background: var(--accent); color: var(--bg1); border-radius: 12px 3px 12px 12px; }
    .typing { display: flex; gap: 5px; align-items: center; padding: 11px 14px; }
    .dot { width: 6px; height: 6px; background: var(--text3); border-radius: 50%; animation: bounce 1.2s infinite; }
    .dot:nth-child(2) { animation-delay: 0.2s; } .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
    .chat-input-row { display: flex; gap: 9px; padding: 13px 0 0; border-top: 1px solid var(--border2); }

    /* ── Tabs ── */
    .tabs { display: flex; gap: 3px; background: var(--bg3); padding: 3px; border-radius: 9px; width: fit-content; }
    .tab { padding: 7px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 500; cursor: pointer; transition: var(--tr); color: var(--text2); border: none; background: none; font-family: var(--font-body); }
    .tab.active { background: var(--bg2); color: var(--text1); box-shadow: 0 1px 4px rgba(0,0,0,0.12); border: 1px solid var(--border2); }

    /* ── Section ── */
    .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .section-title { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--text1); }

    /* ── Roadmap ── */
    .roadmap-item { display: flex; gap: 13px; padding: 13px 0; border-bottom: 1px solid var(--border2); }
    .roadmap-num { width: 28px; height: 28px; border-radius: 50%; background: var(--bg3); border: 1px solid var(--border); color: var(--text1); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .roadmap-num.done { background: var(--accent); color: var(--bg1); border-color: var(--accent); }

    /* ── Shimmer ── */
    .shimmer { background: linear-gradient(90deg, var(--bg3) 25%, var(--bg4) 50%, var(--bg3) 75%); background-size: 200%; animation: shimmer 1.5s infinite; border-radius: var(--radius-sm); }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    /* ── Toast ── */
    .toast { position: fixed; bottom: 20px; right: 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 11px 16px; font-size: 13px; color: var(--text1); box-shadow: var(--shadow); z-index: 999; animation: slideIn 0.28s ease; max-width: 280px; }

    /* ── Misc ── */
    .empty { text-align: center; padding: 40px 20px; color: var(--text3); }
    .empty-icon { font-size: 36px; margin-bottom: 10px; }
    .empty-text { font-size: 13px; }
    .int-timer { font-family: var(--font-display); font-size: 22px; font-weight: 700; }
    .divider { height: 1px; background: var(--border2); margin: 18px 0; }

    /* ── Responsive ── */
    @media (max-width: 860px) {
      .sidebar { width: 50px; }
      .logo-text, .nav-item span:not(.nav-icon), .nav-badge, .nav-label, .sidebar-footer, .toggle-label, .toggle-emoji { display: none; }
      .page-header, .page-content { padding: 16px 14px; }
      .grid-4 { grid-template-columns: 1fr 1fr; }
      .grid-3 { grid-template-columns: 1fr 1fr; }
      .grid-2 { grid-template-columns: 1fr; }
    }
  `;
  return <style>{css}</style>;
}

// ─── Shared small components ──────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className="toast">✓ {msg}</div>;
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <div className="theme-toggle">
      <span className="toggle-emoji">{dark ? "🌙" : "☀️"}</span>
      <span className="toggle-label">{dark ? "Dark mode" : "Light mode"}</span>
      <div className={`toggle-track${dark ? " on" : ""}`} onClick={toggle} role="button" aria-label="Toggle theme">
        <div className="toggle-thumb" />
      </div>
    </div>
  );
}

function Sidebar({ view, setView, profile, onLogout, user }) {
  const nav = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "discover",  icon: "🔍", label: "Discover", badge: "5" },
    { id: "interview", icon: "🎤", label: "Mock Interview" },
    { id: "resumeai",  icon: "📄", label: "Resume AI" },
    { id: "roadmap",   icon: "🗺️", label: "My Roadmap" },
    { id: "chat",      icon: "💬", label: "AI Advisor" },
    { id: "settings",  icon: "⚙️", label: "Settings" },
  ];
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">🪺</div>
        <div className="logo-text">Opportu<span>Nest</span></div>
      </div>
      <div className="nav-section">
        <div className="nav-label">Menu</div>
        {nav.map((n) => (
          <button key={n.id} className={`nav-item${view === n.id ? " active" : ""}`} onClick={() => setView(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.badge && <span className="nav-badge">{n.badge}</span>}
          </button>
        ))}
      </div>
      <ThemeToggle />
      <div className="sidebar-footer">
        <div className="xp-label"><span>{profile.name || user?.name || "Student"}</span><span>Lvl 4</span></div>
        <div className="xp-bar"><div className="xp-fill" style={{ width: "62%" }} /></div>
        {onLogout && (
          <button className="nav-item" style={{ marginTop: 10, color: "var(--text3)", fontSize: 12 }} onClick={onLogout}>
            <span className="nav-icon">🚪</span><span>Log out</span>
          </button>
        )}
      </div>
    </aside>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ setView, profile, opportunities }) {
  const stats = [
    { val: opportunities.length, label: "Opportunities found",     change: "+3 this week" },
    { val: "2",                  label: "Applications in progress", change: "1 due soon" },
    { val: "$87K",               label: "Total funding available",  change: "across your matches" },
    { val: "76%",                label: "Profile strength",         change: "Add 2 more skills" },
  ];
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {profile.name || "Explorer"} 👋</div>
          <div className="page-subtitle">You have {opportunities.length} opportunities matched to your profile.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setView("discover")}>🔍 Find Opportunities</button>
      </div>
      <div className="page-content">
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change">↑ {s.change}</div>
            </div>
          ))}
        </div>
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="section-head">
              <div className="section-title">Top matches</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setView("discover")}>See all →</button>
            </div>
            {opportunities.slice(0, 4).map((o) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: "1px solid var(--border2)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, border: "1px solid var(--border2)" }}>
                  {o.type === "Scholarship" ? "🎓" : o.type === "Competition" ? "🏆" : o.type === "Grant" ? "💰" : "🚀"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>{o.org} · {o.amount}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text1)", flexShrink: 0 }}>{o.match}%</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="section-head"><div className="section-title">Quick actions</div></div>
            {[
              { icon: "🎤", label: "Practice interview",  sub: "Prep for your next application", view: "interview" },
              { icon: "📄", label: "Review my resume",    sub: "Get AI feedback instantly",      view: "resumeai" },
              { icon: "🗺️", label: "My roadmap",          sub: "See what to do next",            view: "roadmap" },
              { icon: "💬", label: "Ask AI Advisor",      sub: "Get personalized guidance",      view: "chat" },
            ].map((a, i) => (
              <button key={i} className="nav-item" style={{ width: "100%", marginBottom: 3, borderRadius: "var(--radius-sm)" }} onClick={() => setView(a.view)}>
                <span style={{ fontSize: 16 }}>{a.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)" }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{a.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-head">
            <div className="section-title">Profile strength</div>
            <span style={{ fontSize: 12.5, color: "var(--text2)" }}>76% complete</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {[
              { label: "Basic info",            done: true,  p: 100 },
              { label: "Skills & interests",    done: true,  p: 100 },
              { label: "Academic achievements", done: false, p: 60 },
              { label: "Extracurriculars",      done: false, p: 40 },
              { label: "Goals & career",        done: false, p: 20 },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, opacity: item.done ? 1 : 0.4 }}>{item.done ? "✓" : "○"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: item.done ? "var(--text1)" : "var(--text2)" }}>{item.label}</span>
                    <span style={{ fontSize: 10.5, color: "var(--text3)" }}>{item.p}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.p}%`, opacity: item.done ? 1 : 0.5 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Discover ─────────────────────────────────────────────────────────────────
function Discover({ profile, opportunities, setOpportunities, apiKey, setToast }) {
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState("All");
  const [selected, setSelected] = useState(null);
  const [searched, setSearched] = useState(opportunities.length > 0);

  const types = ["All", "Scholarship", "Competition", "Grant", "Internship"];

  const findOpportunities = async () => {
    setLoading(true);
    try {
      const p = profile;
      const prompt = `You are an opportunity matcher for high school students. Given this profile, generate 6 relevant opportunities (scholarships, competitions, grants, internships).
Profile: Name: ${p.name}, Grade: ${p.grade}, GPA: ${p.gpa}, Skills: ${p.skills}, Interests: ${p.interests}, Goals: ${p.goals}, Location: ${p.location}
Respond ONLY with valid JSON array. Each object: id(number), title, org, type(Scholarship/Competition/Grant/Internship), match(70-98 integer), deadline(e.g. "Jan 2025"), amount(e.g. "$5,000"), tags(array of 2 strings), why(2-3 sentences specific to this student).`;
      const raw = await callGroq([{ role: "user", content: prompt }], "", apiKey);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setOpportunities(parsed);
      setToast("Found " + parsed.length + " personalized opportunities!");
    } catch (e) {
      setOpportunities(DEMO_OPPS);
      setToast("Showing demo results — add API key in Settings");
    }
    setSearched(true);
    setLoading(false);
  };

  const filtered = filter === "All" ? opportunities : opportunities.filter((o) => o.type === filter);

  if (selected) return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)} style={{ marginBottom: 7 }}>← Back</button>
          <div className="page-title">{selected.title}</div>
          <div className="page-subtitle">{selected.org} · {selected.type} · {selected.amount}</div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button className="btn btn-outline">🔖 Save</button>
          <button className="btn btn-primary">Apply now →</button>
        </div>
      </div>
      <div className="page-content">
        <div className="grid-2">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 11 }}>Why you're a strong match</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 13 }}>
                <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text1)" }}>{selected.match}%</div>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar" style={{ height: 7 }}><div className="progress-fill" style={{ width: `${selected.match}%` }} /></div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>Match score</div>
                </div>
              </div>
              <div className="opp-why" style={{ fontSize: 13 }}>{selected.why}</div>
            </div>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 11 }}>Key details</div>
              {[["💰", "Award", selected.amount], ["📅", "Deadline", selected.deadline], ["🏷️", "Category", selected.type], ["🔖", "Tags", selected.tags?.join(", ")]].map(([icon, k, v], i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border2)" }}>
                  <span>{icon}</span>
                  <span style={{ color: "var(--text2)", fontSize: 12.5, flex: 1 }}>{k}</span>
                  <span style={{ color: "var(--text1)", fontSize: 12.5, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 13 }}>Your action plan</div>
            {["Research the organization and study past winners", "Prepare: transcript, resume, essays", "Draft essays focused on your unique story", "Line up 2 recommendation letters", "Submit 1 week early for buffer", "Track your application status"].map((step, i) => (
              <div key={i} className="roadmap-item" style={{ padding: "10px 0", alignItems: "flex-start" }}>
                <div className="roadmap-num">{i + 1}</div>
                <div style={{ fontSize: 12.5, color: "var(--text2)", paddingTop: 4, lineHeight: 1.55 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Discover Opportunities</div>
          <div className="page-subtitle">AI-matched scholarships, competitions, grants & internships</div>
        </div>
        <button className="btn btn-primary" onClick={findOpportunities} disabled={loading}>
          {loading ? "Searching..." : "✨ Find my matches"}
        </button>
      </div>
      <div className="page-content">
        {!searched && !loading && (
          <div className="empty"><div className="empty-icon">🔭</div><div className="empty-text">Click "Find my matches" to discover opportunities tailored to you.</div></div>
        )}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="shimmer" style={{ height: 108 }} />)}
          </div>
        )}
        {searched && !loading && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 17, flexWrap: "wrap" }}>
              {types.map((t) => <button key={t} className={`tab${filter === t ? " active" : ""}`} onClick={() => setFilter(t)}>{t}</button>)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((o, i) => (
                <div key={o.id} className="opp-card" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => setSelected(o)}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                        <span className="tag tag-a">{o.type}</span>
                        {o.tags?.map((t) => <span key={t} className="tag tag-b">{t}</span>)}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text1)", fontFamily: "var(--font-display)" }}>{o.title}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text2)", marginTop: 3 }}>{o.org} · {o.amount}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text1)" }}>{o.match}%</div>
                      <div style={{ fontSize: 10, color: "var(--text3)" }}>match</div>
                    </div>
                  </div>
                  <div className="opp-why">{o.why}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <span className="tag tag-b" style={{ fontSize: 11 }}>⏰ {o.deadline}</span>
                    <button className="btn btn-sm btn-outline" onClick={(e) => e.stopPropagation()}>🔖 Save</button>
                    <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); setSelected(o); }}>View plan →</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Mock Interview ───────────────────────────────────────────────────────────
function MockInterview({ apiKey, setToast }) {
  const [role, setRole]           = useState("Software Engineering");
  const [stage, setStage]         = useState("setup");
  const [qIndex, setQIndex]       = useState(0);
  const [answer, setAnswer]       = useState("");
  const [feedback, setFeedback]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [timer, setTimer]         = useState(120);
  const [timerOn, setTimerOn]     = useState(false);
  const [scores, setScores]       = useState([]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking]   = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const [micVolume, setMicVolume] = useState(0);
  const ivRef     = useRef(null);
  const recogRef  = useRef(null);
  const analyserRef = useRef(null);
  const animRef   = useRef(null);
  const streamRef = useRef(null);

  const questions = INTERVIEW_QS[role];
  const hasVoice  = "speechSynthesis" in window;
  const hasMic    = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  // ── Timer ──
  useEffect(() => {
    if (timerOn && timer > 0) ivRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    if (timer === 0) { setTimerOn(false); stopListening(); }
    return () => clearTimeout(ivRef.current);
  }, [timerOn, timer]);

  // ── Cleanup on unmount ──
  useEffect(() => () => {
    stopListening();
    window.speechSynthesis?.cancel();
  }, []);

  // ── Speak question aloud ──
  const speakQuestion = (text) => {
    if (!hasVoice) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 1;
    // prefer a natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Samantha") || v.name.includes("Google US English") || v.name.includes("Daniel") || v.name.includes("Karen"));
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => { setSpeaking(false); if (voiceMode) startListening(); };
    window.speechSynthesis.speak(utter);
  };

  // ── Mic volume visualiser ──
  const startVolumeMonitor = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const vol = Math.min(100, Math.round(data.reduce((a, b) => a + b, 0) / data.length * 2.5));
        setMicVolume(vol);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) { /* mic permission denied */ }
  };

  const stopVolumeMonitor = () => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setMicVolume(0);
  };

  // ── Speech recognition ──
  const startListening = () => {
    if (!hasMic) { setToast("Speech recognition not supported — use Chrome"); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";
    let finalText = "";
    recog.onstart = () => { setListening(true); startVolumeMonitor(); };
    recog.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
        else interim = e.results[i][0].transcript;
      }
      setAnswer(finalText + interim);
    };
    recog.onerror = (e) => { if (e.error !== "aborted") setToast("Mic error: " + e.error); };
    recog.onend = () => { setListening(false); stopVolumeMonitor(); };
    recogRef.current = recog;
    recog.start();
  };

  const stopListening = () => {
    recogRef.current?.stop();
    recogRef.current = null;
    stopVolumeMonitor();
    setListening(false);
  };

  const toggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  // ── Start interview — speak first question ──
  const beginInterview = () => {
    setStage("answering");
    setTimeout(() => { if (voiceMode) speakQuestion(questions[0]); }, 300);
  };

  // ── Get AI feedback ──
  const getFeedback = async () => {
    if (!answer.trim()) return;
    stopListening();
    window.speechSynthesis?.cancel();
    setLoading(true); setStage("feedback");
    try {
      const raw = await callGroq(
        [{ role: "user", content: `Interview question: "${questions[qIndex]}"\nStudent answer: "${answer}"\nYou are a career coach. Respond ONLY as JSON: {"score":85,"strengths":["point1","point2"],"improvements":["point1","point2"],"model_answer":"A strong answer would...","encouragement":"One sentence of genuine encouragement."}` }],
        "", apiKey
      );
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setFeedback(parsed); setScores((s) => [...s, parsed.score]);
      // read encouragement aloud
      if (voiceMode && hasVoice) {
        setTimeout(() => {
          const utter = new SpeechSynthesisUtterance(parsed.encouragement);
          utter.rate = 0.95;
          window.speechSynthesis.speak(utter);
        }, 600);
      }
    } catch (e) {
      const f = { score: 78, strengths: ["Good structure", "Clear communication"], improvements: ["Add specific examples", "Quantify your impact"], model_answer: "A strong answer starts with a specific situation, describes your actions, and highlights measurable outcomes.", encouragement: "Great start — with practice you'll nail this!" };
      setFeedback(f); setScores((s) => [...s, f.score]);
      setToast("Showing demo feedback — add API key in Settings");
    }
    setLoading(false);
  };

  const next = () => {
    window.speechSynthesis?.cancel();
    if (qIndex < questions.length - 1) {
      const nextQ = qIndex + 1;
      setQIndex(nextQ); setAnswer(""); setFeedback(null); setTimer(120); setTimerOn(false); setStage("answering");
      setTimeout(() => { if (voiceMode) speakQuestion(questions[nextQ]); }, 300);
    } else { setStage("done"); }
  };

  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const scoreColor = (s) => s >= 80 ? "var(--text1)" : s >= 60 ? "var(--text2)" : "var(--red)";

  // ── Mic button pulse rings ──
  const MicButton = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* pulse rings when listening */}
        {listening && [1, 2, 3].map(n => (
          <div key={n} style={{
            position: "absolute",
            width: 72 + n * 20,
            height: 72 + n * 20,
            borderRadius: "50%",
            border: `1.5px solid var(--accent)`,
            opacity: Math.max(0, (micVolume / 100) * (1 - n * 0.25)),
            animation: `pulse-ring ${0.8 + n * 0.2}s ease-out infinite`,
            animationDelay: `${n * 0.15}s`,
            pointerEvents: "none",
          }} />
        ))}
        <button
          onClick={toggleListening}
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: listening ? "var(--accent)" : "var(--bg3)",
            border: `2px solid ${listening ? "var(--accent)" : "var(--border)"}`,
            color: listening ? "var(--bg1)" : "var(--text1)",
            fontSize: 28, cursor: "pointer",
            transition: "var(--tr)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: listening ? "0 0 24px rgba(255,255,255,0.15)" : "none",
            position: "relative", zIndex: 1,
          }}
          title={listening ? "Stop recording" : "Start speaking"}
        >
          {listening ? "⏹" : "🎤"}
        </button>
      </div>
      <div style={{ fontSize: 12, color: listening ? "var(--text1)" : "var(--text3)", fontWeight: listening ? 600 : 400, letterSpacing: "0.05em" }}>
        {listening ? "Listening... speak now" : "Tap to speak"}
      </div>
      {/* volume bar */}
      {listening && (
        <div style={{ width: 120, height: 3, background: "var(--bg4)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${micVolume}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.1s" }} />
        </div>
      )}
    </div>
  );

  if (stage === "done") return (
    <div>
      <div className="page-header"><div className="page-title">Interview complete 🎉</div></div>
      <div className="page-content">
        <div className="card card-glow" style={{ textAlign: "center", padding: "34px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 56, fontWeight: 700, fontFamily: "var(--font-display)", color: scoreColor(avg) }}>{avg}</div>
          <div style={{ fontSize: 14, color: "var(--text2)", marginTop: 7 }}>Average score across {scores.length} questions</div>
          <div style={{ display: "flex", gap: 7, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
            {scores.map((s, i) => <span key={i} className="tag tag-a">Q{i + 1}: {s}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 11, justifyContent: "center" }}>
          <button className="btn btn-outline" onClick={() => { setStage("setup"); setQIndex(0); setScores([]); setAnswer(""); setFeedback(null); }}>Try another role</button>
          <button className="btn btn-primary" onClick={() => { setStage("answering"); setQIndex(0); setScores([]); setAnswer(""); setFeedback(null); beginInterview(); }}>Retry</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes speaking-wave {
          0%,100% { transform: scaleY(0.4); }
          50%      { transform: scaleY(1); }
        }
      `}</style>

      <div className="page-header">
        <div><div className="page-title">Mock Interview</div><div className="page-subtitle">AI-powered practice with real-time feedback</div></div>
        {stage !== "setup" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Voice mode toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text2)" }}>
              <span>{voiceMode ? "🎙️ Voice" : "⌨️ Text"}</span>
              <div className={`toggle-track${voiceMode ? " on" : ""}`} onClick={() => { setVoiceMode(v => !v); stopListening(); window.speechSynthesis?.cancel(); }} style={{ width: 34, height: 19 }}>
                <div className="toggle-thumb" style={{ width: 13, height: 13, top: 2, left: 2 }} />
              </div>
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)" }}>Q {qIndex + 1} / {questions.length}</div>
          </div>
        )}
      </div>

      <div className="page-content">
        {stage === "setup" && (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div className="card card-glow" style={{ marginBottom: 16 }}>
              <div className="section-title" style={{ marginBottom: 13 }}>Choose your track</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.keys(INTERVIEW_QS).map((r) => (
                  <button key={r} onClick={() => setRole(r)} style={{ padding: "12px 15px", borderRadius: "var(--radius-sm)", border: `1.5px solid ${role === r ? "var(--accent)" : "var(--border2)"}`, background: "var(--bg3)", color: role === r ? "var(--text1)" : "var(--text2)", cursor: "pointer", textAlign: "left", fontSize: 13.5, fontWeight: role === r ? 600 : 400, transition: "var(--tr)" }}>
                    {r === "Software Engineering" ? "💻" : r === "Product Management" ? "📱" : "🚀"} {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="section-title" style={{ marginBottom: 11 }}>How it works</div>
              {[
                "AI reads each question aloud to you",
                "Answer by speaking — your voice is transcribed live",
                "Or switch to text mode anytime",
                "AI scores your answer and gives detailed feedback",
                "Final scorecard with improvement tips",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 11, marginBottom: 9 }}>
                  <div className="roadmap-num">{i + 1}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text2)", paddingTop: 4 }}>{s}</div>
                </div>
              ))}
            </div>
            {/* Voice mode toggle on setup */}
            <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text1)" }}>Voice mode</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>AI speaks questions · you answer aloud</div>
              </div>
              <div className={`toggle-track${voiceMode ? " on" : ""}`} onClick={() => setVoiceMode(v => !v)}>
                <div className="toggle-thumb" />
              </div>
            </div>
            {!hasMic && voiceMode && (
              <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 12, padding: "10px 13px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", borderLeft: "2px solid var(--red)" }}>
                ⚠️ Speech recognition requires Chrome or Edge. Use text mode on other browsers.
              </div>
            )}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={beginInterview}>
              {voiceMode ? "🎙️ Start voice interview →" : "⌨️ Start interview →"}
            </button>
          </div>
        )}

        {(stage === "answering" || stage === "feedback") && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {/* Progress bar */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              {questions.map((_, i) => <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= qIndex ? "var(--accent)" : "var(--bg4)", opacity: i < qIndex ? 1 : i === qIndex ? 1 : 0.25 }} />)}
            </div>

            {/* Question card */}
            <div className="card card-glow" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="tag tag-a">{role}</span>
                  {speaking && (
                    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                      {[...Array(5)].map((_, i) => (
                        <div key={i} style={{ width: 3, height: 14, background: "var(--accent)", borderRadius: 2, animation: `speaking-wave 0.6s ease infinite`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                      <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 4 }}>speaking...</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  {/* Replay question */}
                  {hasVoice && (
                    <button className="btn btn-ghost btn-sm" onClick={() => speakQuestion(questions[qIndex])} title="Replay question" style={{ fontSize: 16, padding: "4px 8px" }}>🔊</button>
                  )}
                  <div className="int-timer" style={{ color: timer < 30 ? "var(--red)" : "var(--text1)" }}>
                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                  </div>
                  {!timerOn
                    ? <button className="btn btn-outline btn-sm" onClick={() => { setTimer(120); setTimerOn(true); }}>▶ Start</button>
                    : <button className="btn btn-outline btn-sm" onClick={() => setTimerOn(false)}>⏸ Pause</button>}
                </div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "var(--font-display)", lineHeight: 1.5, color: "var(--text1)" }}>
                {questions[qIndex]}
              </div>
            </div>

            {stage === "answering" && (
              <>
                {/* Voice mode UI */}
                {voiceMode ? (
                  <div className="card" style={{ marginBottom: 13, textAlign: "center", padding: "28px 20px" }}>
                    <MicButton />
                    {answer && (
                      <div style={{ marginTop: 20, textAlign: "left" }}>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your answer (live transcript)</div>
                        <div style={{ fontSize: 13, color: "var(--text1)", lineHeight: 1.65, background: "var(--bg3)", padding: "12px 14px", borderRadius: "var(--radius-sm)", borderLeft: "2px solid var(--accent)", minHeight: 60 }}>
                          {answer}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea className="input" style={{ minHeight: 128, marginBottom: 13 }} placeholder="Type your answer here..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
                )}

                <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => { setAnswer(""); }}>Clear</button>
                    {voiceMode && (
                      <button className="btn btn-outline btn-sm" onClick={() => setVoiceMode(false)}>⌨️ Switch to text</button>
                    )}
                  </div>
                  <button className="btn btn-primary" onClick={getFeedback} disabled={!answer.trim() || loading}>
                    {loading ? "Analyzing..." : "Get feedback →"}
                  </button>
                </div>
              </>
            )}

            {stage === "feedback" && loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(3)].map((_, i) => <div key={i} className="shimmer" style={{ height: 76 }} />)}
              </div>
            )}

            {stage === "feedback" && !loading && feedback && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 44, fontWeight: 700, fontFamily: "var(--font-display)", color: scoreColor(feedback.score) }}>{feedback.score}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)" }}>/ 100</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--text2)", fontStyle: "italic", marginBottom: 7 }}>"{feedback.encouragement}"</div>
                    <div className="progress-bar" style={{ height: 6 }}><div className="progress-fill" style={{ width: `${feedback.score}%`, opacity: feedback.score >= 80 ? 1 : 0.6 }} /></div>
                  </div>
                </div>

                {/* Your spoken answer */}
                <div className="card">
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)", marginBottom: 7 }}>📝 Your answer</div>
                  <div style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.65, fontStyle: "italic" }}>"{answer.trim()}"</div>
                </div>

                <div className="grid-2">
                  <div className="card">
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)", marginBottom: 8 }}>✓ Strengths</div>
                    {feedback.strengths?.map((s, i) => <div key={i} style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: 6, paddingLeft: 11, borderLeft: "2px solid var(--accent)" }}>• {s}</div>)}
                  </div>
                  <div className="card">
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)", marginBottom: 8 }}>↑ Improve</div>
                    {feedback.improvements?.map((s, i) => <div key={i} style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: 6, paddingLeft: 11, borderLeft: "2px solid var(--border)" }}>• {s}</div>)}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)", marginBottom: 7 }}>Model answer</div>
                  <div style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.65 }}>{feedback.model_answer}</div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="btn btn-outline" onClick={() => { setStage("answering"); setFeedback(null); setAnswer(""); }}>Retry</button>
                  <button className="btn btn-primary" onClick={next}>{qIndex < questions.length - 1 ? "Next question →" : "See results"}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Resume AI ────────────────────────────────────────────────────────────────
function ResumeAI({ apiKey, setToast }) {
  const [resume, setResume]         = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineering Internship");
  const [feedback, setFeedback]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [fileName, setFileName]     = useState("");
  const [dragOver, setDragOver]     = useState(false);
  const [inputMode, setInputMode]   = useState("upload"); // "upload" | "paste"
  const fileRef = useRef(null);

  // Extract text from PDF using FileReader (reads as text for text-based PDFs)
  const extractTextFromFile = (file) => {
    return new Promise((resolve, reject) => {
      if (file.type === "application/pdf") {
        // For PDFs: read as ArrayBuffer and extract readable text chunks
        const reader = new FileReader();
        reader.onload = (e) => {
          const bytes = new Uint8Array(e.target.result);
          let text = "";
          // Extract printable ASCII text from PDF binary
          for (let i = 0; i < bytes.length; i++) {
            const c = bytes[i];
            if (c >= 32 && c < 127) text += String.fromCharCode(c);
            else if (c === 10 || c === 13) text += " ";
          }
          // Clean up PDF artifacts — keep only readable chunks
          const cleaned = text
            .replace(/[^\x20-\x7E\n]/g, " ")
            .replace(/\s{3,}/g, "\n")
            .replace(/(BT|ET|Tf|Td|TD|Tm|Tr|Ts|Tw|Tz|T\*|cm|Do|re|W|n|q|Q|RG|rg|SCN|scn|CS|cs|sh|BI|EI|BMC|EMC|BDC|EDC)\b/g, " ")
            .replace(/\/[A-Za-z0-9]+\s/g, " ")
            .replace(/\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?/g, " ")
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 3)
            .join("\n");
          resolve(cleaned || "Could not extract text. Please paste your resume instead.");
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        // Plain text / docx-as-txt
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      }
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".txt")) {
      setToast("Please upload a PDF or TXT file");
      return;
    }
    setFileName(file.name);
    setToast("Reading file...");
    try {
      const text = await extractTextFromFile(file);
      setResume(text);
      setInputMode("paste");
      setToast("File loaded! Review the text then analyze.");
    } catch (e) {
      setToast("Could not read file — please paste your resume instead");
      setInputMode("paste");
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!resume.trim()) return;
    setLoading(true);
    try {
      const raw = await callGroq(
        [{ role: "user", content: `Analyze this high school student's resume for "${targetRole}". Resume:\n\n${resume}\n\nRespond ONLY as JSON: {"overall_score":82,"sections":{"header":{"score":90,"feedback":"short"},"education":{"score":85,"feedback":"short"},"experience":{"score":75,"feedback":"short"},"skills":{"score":80,"feedback":"short"},"projects":{"score":88,"feedback":"short"}},"top_issues":["issue1","issue2","issue3"],"top_wins":["win1","win2"],"rewritten_summary":"2-3 sentence professional summary","keywords_missing":["kw1","kw2","kw3"]}` }],
        "", apiKey
      );
      setFeedback(JSON.parse(raw.replace(/```json|```/g, "").trim()));
      setToast("Resume analysis complete!");
    } catch (e) {
      setFeedback({ overall_score: 79, sections: { header: { score: 85, feedback: "Clear contact info. Add LinkedIn/GitHub links." }, education: { score: 90, feedback: "GPA visible, strong coursework listed." }, experience: { score: 70, feedback: "Add quantifiable achievements to each role." }, skills: { score: 75, feedback: "Group skills by category for readability." }, projects: { score: 82, feedback: "Strong projects. Add live URLs and tech stack." } }, top_issues: ["No measurable outcomes", "Missing LinkedIn/GitHub", "Skills not categorized"], top_wins: ["Strong project descriptions", "Clear formatting"], rewritten_summary: "Ambitious high school developer with 2+ years building full-stack web apps and AI integrations. Passionate about applying ML to education technology, with 3 shipped projects and hackathon experience.", keywords_missing: ["agile", "API integration", "version control"] });
      setToast("Showing demo feedback — add API key in Settings");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Resume AI</div><div className="page-subtitle">Upload your resume for expert AI feedback and instant rewrites</div></div>
      </div>
      <div className="page-content">
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card">
              <label className="input-label">Target role / opportunity</label>
              <input className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} style={{ marginBottom: 14 }} />

              {/* Tab switcher */}
              <div className="tabs" style={{ marginBottom: 14 }}>
                <button className={`tab${inputMode === "upload" ? " active" : ""}`} onClick={() => setInputMode("upload")}>📎 Upload file</button>
                <button className={`tab${inputMode === "paste" ? " active" : ""}`} onClick={() => setInputMode("paste")}>📋 Paste text</button>
              </div>

              {inputMode === "upload" && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border2)"}`,
                    borderRadius: "var(--radius)",
                    padding: "36px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragOver ? "rgba(255,255,255,0.03)" : "var(--bg3)",
                    transition: "var(--tr)",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
                  {fileName ? (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text1)", marginBottom: 4 }}>{fileName}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)" }}>File loaded — switch to Paste text to review</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text1)", marginBottom: 5 }}>Drop your resume here</div>
                      <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>PDF or TXT · click to browse</div>
                      <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Browse files</button>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              )}

              {inputMode === "paste" && (
                <textarea
                  className="input"
                  style={{ minHeight: 240 }}
                  placeholder="Paste your resume text here, or upload a file using the Upload tab..."
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
              )}
            </div>

            {resume && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setResume(""); setFileName(""); setFeedback(null); }}>Clear</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: 12 }} onClick={analyze} disabled={!resume.trim() || loading}>
                  {loading ? "Analyzing..." : "Analyze resume →"}
                </button>
              </div>
            )}
            {!resume && (
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 12 }} disabled>
                Upload or paste resume first
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {loading && [...Array(4)].map((_, i) => <div key={i} className="shimmer" style={{ height: 84 }} />)}
            {feedback && !loading && (
              <>
                <div className="card card-glow" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text1)" }}>{feedback.overall_score}</div>
                  <div style={{ fontSize: 13, color: "var(--text2)" }}>Overall resume score</div>
                </div>
                {Object.entries(feedback.sections || {}).map(([k, v]) => (
                  <div key={k} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)", textTransform: "capitalize" }}>{k}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text1)" }}>{v.score}</span>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: 7 }}><div className="progress-fill" style={{ width: `${v.score}%`, opacity: v.score >= 80 ? 1 : 0.5 }} /></div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>{v.feedback}</div>
                  </div>
                ))}
                <div className="card">
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)", marginBottom: 7 }}>✨ Rewritten summary</div>
                  <div style={{ fontSize: 12.5, color: "var(--text1)", lineHeight: 1.7, background: "var(--bg3)", padding: "11px 12px", borderRadius: "var(--radius-sm)", borderLeft: "2px solid var(--accent)" }}>{feedback.rewritten_summary}</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)", marginBottom: 7 }}>Missing keywords</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>{feedback.keywords_missing?.map((k) => <span key={k} className="tag tag-a">{k}</span>)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────
function Roadmap() {
  const milestones = [
    { done: true,  title: "Create OpportuNest profile",     sub: "Tell us about yourself",                          tag: "Done",     urgent: false },
    { done: true,  title: "Explore opportunity matches",    sub: "Browse AI-matched scholarships & competitions",   tag: "Done",     urgent: false },
    { done: false, title: "Apply to 2 competitions",        sub: "Regeneron ISEF and Congressional App Challenge",  tag: "Due Nov",  urgent: true  },
    { done: false, title: "Polish your resume",             sub: "Run Resume AI and fix the top 3 issues",          tag: "This week",urgent: false },
    { done: false, title: "Complete 3 mock interviews",     sub: "Practice for scholarship and internship apps",    tag: "Ongoing",  urgent: false },
    { done: false, title: "Submit Questbridge application", sub: "Full-ride scholarship — high effort, big payoff", tag: "Due Sep",  urgent: false },
    { done: false, title: "Build a portfolio project",      sub: "A live URL 10x's your resume credibility",        tag: "1 month",  urgent: false },
    { done: false, title: "Apply to 5 scholarships",        sub: "Mix small and large awards",                      tag: "Ongoing",  urgent: false },
  ];
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">My Roadmap</div><div className="page-subtitle">Your personalized path from here to opportunity</div></div>
        <span className="tag tag-a">2 of 8 complete</span>
      </div>
      <div className="page-content">
        <div style={{ maxWidth: 680 }}>
          <div className="card card-glow" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="section-title">Overall progress</div>
              <span style={{ fontSize: 13, color: "var(--text2)" }}>25%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}><div className="progress-fill" style={{ width: "25%" }} /></div>
          </div>
          {milestones.map((m, i) => (
            <div key={i} className="roadmap-item" style={{ alignItems: "flex-start" }}>
              <div className={`roadmap-num${m.done ? " done" : ""}`}>{m.done ? "✓" : i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: m.done ? "var(--text3)" : "var(--text1)", textDecoration: m.done ? "line-through" : "none" }}>{m.title}</div>
                  <span className={m.urgent ? "tag tag-bad" : "tag tag-b"} style={{ fontSize: 10 }}>{m.tag}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{m.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
function Chat({ profile, apiKey, setToast }) {
  const [messages, setMessages] = useState([{ role: "ai", content: `Hey ${profile.name || "there"}! 👋 I'm your AI advisor. I can help you find opportunities, prep for interviews, review essays, brainstorm project ideas, or answer questions about college and careers. What's on your mind?` }]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));
      const ctx = `Student: ${profile.name}, Grade ${profile.grade}, Skills: ${profile.skills}, Interests: ${profile.interests}, Goals: ${profile.goals}`;
      const reply = await callGroq([...history, { role: "user", content: userMsg }], `You are OpportuNest AI, a friendly career advisor for high school students. Be concise, practical, and encouraging. Student context: ${ctx}`, apiKey);
      setMessages((m) => [...m, { role: "ai", content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "ai", content: "I'm in demo mode right now. Add your Groq API key in Settings to unlock full AI conversations! Meanwhile, check your matches in Discover. 🚀" }]);
    }
    setLoading(false);
  };

  const suggestions = ["What scholarships should I apply to first?", "Help me prep for a Google interview", "What skills should I learn this year?", "Review my elevator pitch"];

  return (
    <div>
      <div className="page-header"><div><div className="page-title">AI Advisor</div><div className="page-subtitle">Your personal career and opportunity coach</div></div></div>
      <div className="page-content">
        <div className="chat-wrap">
          <div className="chat-messages">
            {messages.length === 1 && (
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 6 }}>
                {suggestions.map((s) => <button key={s} className="btn btn-outline btn-sm" onClick={() => setInput(s)}>{s}</button>)}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`msg msg-${m.role === "ai" ? "ai" : "user"}`}>
                <div className="msg-avatar">{m.role === "ai" ? "🪺" : "👤"}</div>
                <div className="msg-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="msg msg-ai">
                <div className="msg-avatar">🪺</div>
                <div className="msg-bubble"><div className="typing"><div className="dot" /><div className="dot" /><div className="dot" /></div></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-row">
            <input className="input" placeholder="Ask anything about opportunities, interviews, essays..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={send} disabled={!input.trim() || loading}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function Settings({ profile, setProfile, apiKey, setApiKey, setToast }) {
  const [localKey, setLocalKey] = useState(apiKey);
  const save = () => { setApiKey(localKey); localStorage.setItem("groq_key", localKey); setToast("Settings saved!"); };
  return (
    <div>
      <div className="page-header"><div><div className="page-title">Settings</div><div className="page-subtitle">Your profile and API configuration</div></div></div>
      <div className="page-content">
        <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 15 }}>Your profile</div>
            {[["name","Full name","Alex Chen"],["grade","Grade / Year","11th Grade"],["gpa","GPA","3.9"],["location","Location","New Jersey"],["skills","Skills (comma separated)","React, Python, Machine Learning"],["interests","Interests","AI, education technology, startups"],["goals","Career goals","Software engineer at a top tech company"]].map(([k, label, ph]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <label className="input-label">{label}</label>
                <input className="input" placeholder={ph} value={profile[k] || ""} onChange={(e) => setProfile((p) => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 7 }}>Groq API key</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)", marginBottom: 12 }}>Get your free key at console.groq.com — enables AI matching, interview feedback, and resume analysis.</div>
            <label className="input-label">API key</label>
            <input className="input" type="password" placeholder="gsk_..." value={localKey} onChange={(e) => setLocalKey(e.target.value)} style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 9 }}>
              <button className="btn btn-primary" onClick={save}>Save settings</button>
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="btn btn-outline">Get API key ↗</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function Landing({ onAuth, theme, toggle }) {
  const dark = theme === "dark";
  const stats = [
    { val: "2,847+", label: "Opportunities matched" },
    { val: "$12.4M", label: "In aid surfaced" },
    { val: "1,200+", label: "Interviews practiced" },
    { val: "94%",    label: "Student satisfaction" },
  ];
  const features = [
    { icon: "🔍", title: "AI Opportunity Finder", desc: "Personalized scholarships, grants & competitions matched to your exact profile with a 'why you fit' explanation." },
    { icon: "🎤", title: "Voice Mock Interviews", desc: "Speak your answers out loud. AI scores you, reads feedback, and gives a model answer — just like a real interview." },
    { icon: "📄", title: "Resume AI", desc: "Upload your PDF. Get section-by-section scores, a rewritten summary, and the exact keywords you're missing." },
    { icon: "🗺️", title: "Personal Roadmap", desc: "A step-by-step action plan showing exactly what to do next, with deadlines and priority flags." },
    { icon: "💬", title: "AI Career Advisor", desc: "Chat with an AI coach that knows your profile and can answer anything about college, careers, and applications." },
    { icon: "✍️", title: "Essay Draft Generator", desc: "Pick an opportunity, click draft — get a personalized first draft of your application essay in seconds." },
  ];
  const testimonials = [
    { name: "Priya S.", grade: "12th grade · New Jersey", text: "Found the Questbridge scholarship through OpportuNest. Applied. Got a full ride to Carnegie Mellon.", emoji: "🎓" },
    { name: "Marcus T.", grade: "11th grade · California", text: "The mock interview feature helped me land a Google STEP internship. I practiced for 3 days straight.", emoji: "💼" },
    { name: "Aisha K.", grade: "12th grade · Texas", text: "I had no idea I qualified for $40K in scholarships. OpportuNest found 6 of them in under a minute.", emoji: "🏆" },
  ];

  const landingCSS = `
    .landing { min-height: 100vh; background: var(--bg1); color: var(--text1); font-family: var(--font-body); }
    .landing-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 60px; border-bottom: 1px solid var(--border2); position: sticky; top: 0; background: var(--bg1); z-index: 100; backdrop-filter: blur(12px); }
    .landing-logo { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 20px; color: var(--text1); }
    .landing-logo-icon { width: 36px; height: 36px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; filter: ${dark ? "none" : "invert(1)"}; }
    .nav-links { display: flex; align-items: center; gap: 10px; }
    .hero { padding: 100px 60px 80px; text-align: center; max-width: 860px; margin: 0 auto; }
    .hero-badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px; background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text2); margin-bottom: 28px; }
    .hero-title { font-family: var(--font-display); font-size: clamp(36px, 6vw, 64px); font-weight: 700; line-height: 1.15; color: var(--text1); margin-bottom: 22px; }
    .hero-title span { color: ${dark ? "#aaaaaa" : "#444444"}; }
    .hero-sub { font-size: 18px; color: var(--text2); line-height: 1.7; max-width: 580px; margin: 0 auto 36px; }
    .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 60px; }
    .role-cards { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-bottom: 80px; }
    .role-card { background: var(--bg2); border: 1.5px solid var(--border2); border-radius: 16px; padding: 32px 28px; width: 280px; text-align: center; cursor: pointer; transition: var(--tr); }
    .role-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: var(--glow); }
    .role-card-icon { font-size: 40px; margin-bottom: 14px; }
    .role-card-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text1); margin-bottom: 8px; }
    .role-card-desc { font-size: 13px; color: var(--text2); line-height: 1.6; margin-bottom: 20px; }
    .stats-row { display: flex; gap: 0; justify-content: center; border: 1px solid var(--border2); border-radius: 16px; overflow: hidden; max-width: 700px; margin: 0 auto 80px; }
    .stat-item { flex: 1; padding: 28px 20px; text-align: center; border-right: 1px solid var(--border2); }
    .stat-item:last-child { border-right: none; }
    .stat-item-val { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--text1); }
    .stat-item-label { font-size: 12px; color: var(--text3); margin-top: 4px; }
    .section { padding: 60px; max-width: 1100px; margin: 0 auto; }
    .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text3); margin-bottom: 10px; }
    .section-h { font-family: var(--font-display); font-size: clamp(26px, 4vw, 40px); font-weight: 700; color: var(--text1); margin-bottom: 14px; }
    .section-sub { font-size: 15px; color: var(--text2); max-width: 480px; line-height: 1.7; margin-bottom: 44px; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .feature-card { background: var(--bg2); border: 1px solid var(--border2); border-radius: 14px; padding: 24px; transition: var(--tr); }
    .feature-card:hover { border-color: var(--border); transform: translateY(-2px); box-shadow: var(--glow); }
    .feature-icon { font-size: 28px; margin-bottom: 12px; }
    .feature-title { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--text1); margin-bottom: 8px; }
    .feature-desc { font-size: 13px; color: var(--text2); line-height: 1.65; }
    .testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .testimonial-card { background: var(--bg2); border: 1px solid var(--border2); border-radius: 14px; padding: 22px; }
    .testimonial-text { font-size: 14px; color: var(--text1); line-height: 1.7; margin-bottom: 16px; font-style: italic; }
    .testimonial-name { font-size: 13px; font-weight: 600; color: var(--text1); }
    .testimonial-grade { font-size: 11px; color: var(--text3); margin-top: 2px; }
    .landing-footer { border-top: 1px solid var(--border2); padding: 32px 60px; display: flex; align-items: center; justify-content: space-between; }
    .footer-text { font-size: 13px; color: var(--text3); }
    .cta-section { background: var(--bg2); border-top: 1px solid var(--border2); border-bottom: 1px solid var(--border2); padding: 80px 60px; text-align: center; }
    @media (max-width: 768px) {
      .landing-nav { padding: 14px 20px; }
      .hero { padding: 60px 20px 40px; }
      .features-grid { grid-template-columns: 1fr; }
      .testimonials { grid-template-columns: 1fr; }
      .stats-row { flex-wrap: wrap; }
      .section { padding: 40px 20px; }
      .role-cards { flex-direction: column; align-items: center; }
      .landing-footer { flex-direction: column; gap: 10px; text-align: center; }
      .cta-section { padding: 50px 20px; }
    }
  `;

  return (
    <>
      <style>{landingCSS}</style>
      <div className="landing">

        {/* Nav */}
        <nav className="landing-nav">
          <div className="landing-logo">
            <div className="landing-logo-icon">🪺</div>
            OpportuNest
          </div>
          <div className="nav-links">
            <ThemeToggle />
            <button className="btn btn-outline btn-sm" onClick={() => onAuth("login", "student")}>Log in</button>
            <button className="btn btn-primary btn-sm" onClick={() => onAuth("signup", "student")}>Sign up free</button>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-badge">🚀 Built for the next generation of achievers</div>
          <h1 className="hero-title">
            Find Opportunities<br /><span>That Actually Match You</span>
          </h1>
          <p className="hero-sub">
            AI-powered scholarship discovery, mock interviews, and resume coaching — so every student gets the guidance that used to cost thousands of dollars or require the right connections.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" style={{ padding: "13px 28px", fontSize: 15 }} onClick={() => onAuth("signup", "student")}>
              Get started free →
            </button>
            <button className="btn btn-outline" style={{ padding: "13px 28px", fontSize: 15 }} onClick={() => onAuth("login", "student")}>
              See how it works
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-item-val">{s.val}</div>
                <div className="stat-item-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Role selector */}
        <div style={{ textAlign: "center", padding: "0 20px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>Who are you?</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "var(--text1)", marginBottom: 14 }}>Choose your path</h2>
          <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 36 }}>Different experience, same mission — connecting talent with opportunity.</p>
        </div>
        <div className="role-cards">
          <div className="role-card" onClick={() => onAuth("signup", "student")}>
            <div className="role-card-icon">🎓</div>
            <div className="role-card-title">I'm a Student</div>
            <div className="role-card-desc">Find scholarships, practice interviews, fix your resume, and get a personalized roadmap to your goals.</div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Sign up as Student →</button>
          </div>
          <div className="role-card" onClick={() => onAuth("signup", "recruiter")}>
            <div className="role-card-icon">🏢</div>
            <div className="role-card-title">I'm a Recruiter</div>
            <div className="role-card-desc">Post internships and programs, discover pre-screened student talent, and reach the next generation of builders.</div>
            <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>Sign up as Recruiter →</button>
          </div>
        </div>

        {/* Features */}
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="section-label">Features</div>
            <h2 className="section-h">Everything you need to launch your future</h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>Six AI-powered tools built specifically for high school and college students.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="section-label">Stories</div>
            <h2 className="section-h">Students who found their future</h2>
          </div>
          <div className="testimonials">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div style={{ fontSize: 28, marginBottom: 12 }}>{t.emoji}</div>
                <div className="testimonial-text">"{t.text}"</div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-grade">{t.grade}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="cta-section">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "var(--text1)", marginBottom: 14 }}>
            Stop missing opportunities you're already qualified for.
          </h2>
          <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            Join thousands of students using OpportuNest to find scholarships, prep for interviews, and launch their careers.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" style={{ padding: "13px 28px", fontSize: 15 }} onClick={() => onAuth("signup", "student")}>
              Start for free →
            </button>
            <button className="btn btn-outline" style={{ padding: "13px 28px", fontSize: 15 }} onClick={() => onAuth("signup", "recruiter")}>
              Post an opportunity
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="landing-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div className="landing-logo-icon" style={{ width: 26, height: 26, fontSize: 13, borderRadius: 7 }}>🪺</div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text1)" }}>OpportuNest</span>
          </div>
          <div className="footer-text">© 2025 OpportuNest · Built for YCFxAI Hackathon</div>
          <div style={{ display: "flex", gap: 16 }}>
            {["About", "Privacy", "Contact"].map(l => <span key={l} style={{ fontSize: 13, color: "var(--text3)", cursor: "pointer" }}>{l}</span>)}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ mode, role, onClose, onSuccess, theme }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", org: "", grade: "" });
  const [step, setStep] = useState(mode); // "login" | "signup"
  const isRecruiter = role === "recruiter";

  const handle = () => {
    if (!form.email || !form.password) return;
    onSuccess({ name: form.name || (isRecruiter ? "Recruiter" : "Student"), email: form.email, role });
  };

  const modalCSS = `
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .modal { background: var(--bg2); border: 1px solid var(--border); border-radius: 18px; padding: 36px; width: 100%; max-width: 420px; animation: slideIn 0.25s ease; box-shadow: var(--shadow); }
    .modal-logo { display: flex; align-items: center; gap: 9px; margin-bottom: 24px; }
    .modal-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text1); margin-bottom: 6px; }
    .modal-sub { font-size: 13px; color: var(--text2); margin-bottom: 24px; }
    .role-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text2); margin-bottom: 20px; }
    .modal-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .modal-divider-line { flex: 1; height: 1px; background: var(--border2); }
    .modal-divider-text { font-size: 11px; color: var(--text3); }
    .switch-mode { text-align: center; margin-top: 18px; font-size: 13px; color: var(--text2); }
    .switch-mode span { color: var(--text1); font-weight: 600; cursor: pointer; text-decoration: underline; }
  `;

  return (
    <>
      <style>{modalCSS}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-logo">
            <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, filter: theme === "dark" ? "none" : "invert(1)" }}>🪺</div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text1)" }}>OpportuNest</span>
          </div>

          <div className="modal-title">{step === "login" ? "Welcome back" : "Create your account"}</div>
          <div className="modal-sub">{step === "login" ? "Sign in to your OpportuNest account" : "Start finding opportunities in minutes"}</div>

          <div className="role-pill">
            {isRecruiter ? "🏢 Recruiter account" : "🎓 Student account"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {step === "signup" && (
              <div>
                <label className="input-label">{isRecruiter ? "Your name" : "Full name"}</label>
                <input className="input" placeholder={isRecruiter ? "Jane Smith" : "Alex Chen"} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            )}
            {step === "signup" && isRecruiter && (
              <div>
                <label className="input-label">Organization / Company</label>
                <input className="input" placeholder="Google, MIT, Questbridge..." value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} />
              </div>
            )}
            {step === "signup" && !isRecruiter && (
              <div>
                <label className="input-label">Grade / Year</label>
                <input className="input" placeholder="11th Grade" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="input-label">Email address</label>
              <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 18, fontSize: 14 }} onClick={handle}>
            {step === "login" ? "Sign in →" : `Create ${isRecruiter ? "recruiter" : "student"} account →`}
          </button>

          <div className="switch-mode">
            {step === "login" ? <>Don't have an account? <span onClick={() => setStep("signup")}>Sign up</span></> : <>Already have an account? <span onClick={() => setStep("login")}>Log in</span></>}
          </div>

          <button onClick={onClose} style={{ position: "absolute", display: "none" }} />
        </div>
      </div>
    </>
  );
}

// ─── Recruiter Dashboard ──────────────────────────────────────────────────────
function RecruiterDashboard({ user, onLogout, theme, toggle }) {
  const [view, setView] = useState("home");
  const [postForm, setPostForm] = useState({ title: "", org: user.name, type: "Internship", deadline: "", amount: "", description: "", skills: "" });
  const [posted, setPosted] = useState([
    { id: 1, title: "Summer Engineering Internship", type: "Internship", applicants: 24, deadline: "Aug 2025", status: "Active" },
    { id: 2, title: "STEM Research Grant", type: "Grant", applicants: 11, deadline: "Oct 2025", status: "Active" },
  ]);
  const [toast, setToast] = useState(null);

  const submit = () => {
    if (!postForm.title) return;
    setPosted(p => [...p, { id: Date.now(), title: postForm.title, type: postForm.type, applicants: 0, deadline: postForm.deadline, status: "Active" }]);
    setPostForm({ title: "", org: user.name, type: "Internship", deadline: "", amount: "", description: "", skills: "" });
    setToast("Opportunity posted!");
    setView("home");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <GlobalStyles theme={theme} />
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <div style={{ minHeight: "100vh", background: "var(--bg1)" }}>
        {/* Recruiter nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid var(--border2)", background: "var(--bg2)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, filter: theme === "dark" ? "none" : "invert(1)" }}>🪺</div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text1)" }}>OpportuNest <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-body)", fontWeight: 400 }}>Recruiter</span></span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemeToggle />
            <span style={{ fontSize: 13, color: "var(--text2)" }}>🏢 {user.name}</span>
            <button className="btn btn-outline btn-sm" onClick={onLogout}>Log out</button>
          </div>
        </nav>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 24 }}>
            <button className={`tab${view === "home" ? " active" : ""}`} onClick={() => setView("home")}>📊 Dashboard</button>
            <button className={`tab${view === "post" ? " active" : ""}`} onClick={() => setView("post")}>➕ Post Opportunity</button>
            <button className={`tab${view === "talent" ? " active" : ""}`} onClick={() => setView("talent")}>🔍 Browse Talent</button>
          </div>

          {view === "home" && (
            <>
              <div className="grid-3" style={{ marginBottom: 24 }}>
                {[{ val: posted.length, label: "Active postings" }, { val: posted.reduce((a, b) => a + b.applicants, 0), label: "Total applicants" }, { val: "94%", label: "Match quality score" }].map((s, i) => (
                  <div key={i} className="stat-card"><div className="stat-val">{s.val}</div><div className="stat-label">{s.label}</div></div>
                ))}
              </div>
              <div className="card">
                <div className="section-head">
                  <div className="section-title">Your postings</div>
                  <button className="btn btn-primary btn-sm" onClick={() => setView("post")}>+ Post new</button>
                </div>
                {posted.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border2)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text1)" }}>{p.title}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text2)", marginTop: 3 }}>{p.type} · Deadline {p.deadline}</div>
                    </div>
                    <span className="tag tag-a">{p.applicants} applicants</span>
                    <span className="tag tag-good">{p.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === "post" && (
            <div className="card" style={{ maxWidth: 600 }}>
              <div className="section-title" style={{ marginBottom: 18 }}>Post an opportunity</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {[["title","Opportunity title","Summer Engineering Internship"],["org","Organization","Google"],["amount","Award / Stipend","$5,000"],["deadline","Deadline","Aug 2025"],["skills","Required skills (comma separated)","Python, React, ML"]].map(([k, label, ph]) => (
                  <div key={k}>
                    <label className="input-label">{label}</label>
                    <input className="input" placeholder={ph} value={postForm[k]} onChange={e => setPostForm(f => ({ ...f, [k]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className="input-label">Type</label>
                  <select className="input" value={postForm.type} onChange={e => setPostForm(f => ({ ...f, type: e.target.value }))}>
                    {["Internship","Scholarship","Grant","Competition","Research"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Description</label>
                  <textarea className="input" style={{ minHeight: 100 }} placeholder="Describe the opportunity, eligibility, what students will gain..." value={postForm.description} onChange={e => setPostForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setView("home")}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={submit} disabled={!postForm.title}>Post opportunity →</button>
                </div>
              </div>
            </div>
          )}

          {view === "talent" && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div className="page-title" style={{ marginBottom: 6 }}>Browse Student Talent</div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>Pre-screened profiles of students actively seeking opportunities.</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {[
                  { name: "Alex Chen", grade: "11th Grade", location: "New Jersey", skills: "React, Python, ML", gpa: "3.9", goal: "Software Engineering Internship" },
                  { name: "Priya Sharma", grade: "12th Grade", location: "California", skills: "Biology, Data Analysis, R", gpa: "4.0", goal: "STEM Research Program" },
                  { name: "Marcus Thompson", grade: "11th Grade", location: "Texas", skills: "UI/UX, Figma, JavaScript", gpa: "3.7", goal: "Product Design Internship" },
                  { name: "Aisha Kamara", grade: "10th Grade", location: "New York", skills: "Writing, Public Speaking, Policy", gpa: "3.8", goal: "Political Science Scholarship" },
                ].map((s, i) => (
                  <div key={i} className="card card-hover">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👤</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text1)" }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{s.grade} · {s.location} · GPA {s.gpa}</div>
                          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Looking for: {s.goal}</div>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm">View profile</button>
                    </div>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 12 }}>
                      {s.skills.split(", ").map(sk => <span key={sk} className="tag tag-b">{sk}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme]   = useState(() => localStorage.getItem("on_theme") || "dark");
  const [screen, setScreen] = useState("landing"); // landing | app | recruiter
  const [auth, setAuth]     = useState(null); // { mode, role }
  const [user, setUser]     = useState(null);
  const [view, setView]     = useState("dashboard");
  const [profile, setProfile] = useState({ name: "", grade: "", gpa: "", skills: "", interests: "", goals: "", location: "" });
  const [opportunities, setOpportunities] = useState(DEMO_OPPS);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("groq_key") || "");
  const [toast, setToast]   = useState(null);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("on_theme", next);
  };

  const handleAuth = (mode, role) => setAuth({ mode, role });

  const handleSuccess = (userData) => {
    setUser(userData);
    setAuth(null);
    if (userData.role === "recruiter") {
      setScreen("recruiter");
    } else {
      setProfile(p => ({ ...p, name: userData.name, email: userData.email }));
      setScreen("app");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setScreen("landing");
    setView("dashboard");
  };

  const views = {
    dashboard: <Dashboard setView={setView} profile={profile} opportunities={opportunities} />,
    discover:  <Discover  profile={profile} opportunities={opportunities} setOpportunities={setOpportunities} apiKey={apiKey} setToast={setToast} />,
    interview: <MockInterview apiKey={apiKey} setToast={setToast} />,
    resumeai:  <ResumeAI  apiKey={apiKey} setToast={setToast} />,
    roadmap:   <Roadmap />,
    chat:      <Chat profile={profile} apiKey={apiKey} setToast={setToast} />,
    settings:  <Settings profile={profile} setProfile={setProfile} apiKey={apiKey} setApiKey={setApiKey} setToast={setToast} />,
  };

  if (screen === "recruiter" && user) {
    return <RecruiterDashboard user={user} onLogout={handleLogout} theme={theme} toggle={toggle} />;
  }

  if (screen === "app") {
    return (
      <ThemeContext.Provider value={{ theme, toggle }}>
        <GlobalStyles theme={theme} />
        <div className="app">
          <Sidebar view={view} setView={setView} profile={profile} onLogout={handleLogout} user={user} />
          <main className="main">{views[view] || views.dashboard}</main>
        </div>
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <GlobalStyles theme={theme} />
      <Landing onAuth={handleAuth} theme={theme} toggle={toggle} />
      {auth && <AuthModal mode={auth.mode} role={auth.role} onClose={() => setAuth(null)} onSuccess={handleSuccess} theme={theme} />}
    </ThemeContext.Provider>
  );
}
