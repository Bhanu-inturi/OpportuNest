import { useState, useEffect, useRef, createContext, useContext } from "react";

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// ─── API helper ───────────────────────────────────────────────────────────────
async function callGroq(messages, systemPrompt = "", apiKey = "") {
  const key = apiKey || localStorage.getItem("groq_key") || import.meta.env.VITE_GROQ_API_KEY || "";
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

function Sidebar({ view, setView, profile }) {
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
        <div className="xp-label"><span>{profile.name || "Student"}</span><span>Lvl 4</span></div>
        <div className="xp-bar"><div className="xp-fill" style={{ width: "62%" }} /></div>
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
  const [role, setRole]         = useState("Software Engineering");
  const [stage, setStage]       = useState("setup");
  const [qIndex, setQIndex]     = useState(0);
  const [answer, setAnswer]     = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [timer, setTimer]       = useState(120);
  const [timerOn, setTimerOn]   = useState(false);
  const [scores, setScores]     = useState([]);
  const ivRef = useRef(null);

  const questions = INTERVIEW_QS[role];

  useEffect(() => {
    if (timerOn && timer > 0) ivRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    if (timer === 0) setTimerOn(false);
    return () => clearTimeout(ivRef.current);
  }, [timerOn, timer]);

  const getFeedback = async () => {
    if (!answer.trim()) return;
    setLoading(true); setStage("feedback");
    try {
      const raw = await callGroq(
        [{ role: "user", content: `Interview question: "${questions[qIndex]}"\nStudent answer: "${answer}"\nYou are a career coach. Respond ONLY as JSON: {"score":85,"strengths":["point1","point2"],"improvements":["point1","point2"],"model_answer":"A strong answer would...","encouragement":"One sentence of genuine encouragement."}` }],
        "", apiKey
      );
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setFeedback(parsed); setScores((s) => [...s, parsed.score]);
    } catch (e) {
      const f = { score: 78, strengths: ["Good structure", "Clear communication"], improvements: ["Add specific examples", "Quantify your impact"], model_answer: "A strong answer starts with a specific situation, describes your actions, and highlights measurable outcomes.", encouragement: "Great start — with practice you'll nail this!" };
      setFeedback(f); setScores((s) => [...s, f.score]);
      setToast("Showing demo feedback — add API key in Settings");
    }
    setLoading(false);
  };

  const next = () => {
    if (qIndex < questions.length - 1) { setQIndex((i) => i + 1); setAnswer(""); setFeedback(null); setTimer(120); setStage("answering"); }
    else setStage("done");
  };

  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const scoreColor = (s) => s >= 80 ? "var(--text1)" : s >= 60 ? "var(--text2)" : "var(--red)";

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
          <button className="btn btn-primary" onClick={() => { setStage("answering"); setQIndex(0); setScores([]); setAnswer(""); setFeedback(null); }}>Retry same role</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Mock Interview</div><div className="page-subtitle">AI-powered practice with real-time feedback</div></div>
        {stage !== "setup" && <div style={{ fontSize: 13, color: "var(--text2)" }}>Q {qIndex + 1} / {questions.length}</div>}
      </div>
      <div className="page-content">
        {stage === "setup" && (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div className="card card-glow" style={{ marginBottom: 16 }}>
              <div className="section-title" style={{ marginBottom: 13 }}>Choose your track</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.keys(INTERVIEW_QS).map((r) => (
                  <button key={r} onClick={() => setRole(r)} style={{ padding: "12px 15px", borderRadius: "var(--radius-sm)", border: `1.5px solid ${role === r ? "var(--accent)" : "var(--border2)"}`, background: role === r ? "var(--bg3)" : "var(--bg3)", color: role === r ? "var(--text1)" : "var(--text2)", cursor: "pointer", textAlign: "left", fontSize: 13.5, fontWeight: role === r ? 600 : 400, transition: "var(--tr)" }}>
                    {r === "Software Engineering" ? "💻" : r === "Product Management" ? "📱" : "🚀"} {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="section-title" style={{ marginBottom: 11 }}>How it works</div>
              {["5 questions for your chosen track", "2-minute timer per answer", "AI scores each response with detailed feedback", "Final scorecard with improvement tips"].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 11, marginBottom: 9 }}>
                  <div className="roadmap-num">{i + 1}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text2)", paddingTop: 4 }}>{s}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={() => setStage("answering")}>Start interview →</button>
          </div>
        )}
        {(stage === "answering" || stage === "feedback") && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              {questions.map((_, i) => <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i < qIndex ? "var(--accent)" : i === qIndex ? "var(--accent)" : "var(--bg4)", opacity: i < qIndex ? 1 : i === qIndex ? 1 : 0.25 }} />)}
            </div>
            <div className="card card-glow" style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                <span className="tag tag-a">{role}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="int-timer" style={{ color: timer < 30 ? "var(--red)" : "var(--text1)" }}>
                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                  </div>
                  {!timerOn
                    ? <button className="btn btn-outline btn-sm" onClick={() => { setTimer(120); setTimerOn(true); }}>▶ Start</button>
                    : <button className="btn btn-outline btn-sm" onClick={() => setTimerOn(false)}>⏸ Pause</button>}
                </div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "var(--font-display)", lineHeight: 1.5, color: "var(--text1)" }}>{questions[qIndex]}</div>
            </div>
            {stage === "answering" && (
              <>
                <textarea className="input" style={{ minHeight: 128, marginBottom: 10 }} placeholder="Type your answer here..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="btn btn-outline" onClick={() => { setAnswer(""); setTimer(120); setTimerOn(false); }}>Clear</button>
                  <button className="btn btn-primary" onClick={getFeedback} disabled={!answer.trim() || loading}>{loading ? "Analyzing..." : "Get feedback →"}</button>
                </div>
              </>
            )}
            {stage === "feedback" && loading && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[...Array(3)].map((_, i) => <div key={i} className="shimmer" style={{ height: 76 }} />)}</div>}
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
                  <button className="btn btn-outline" onClick={() => { setStage("answering"); setFeedback(null); }}>Retry</button>
                  <button className="btn btn-primary" onClick={next}>{qIndex < questions.length - 1 ? "Next →" : "See results"}</button>
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
        <div><div className="page-title">Resume AI</div><div className="page-subtitle">Expert feedback and instant rewrites</div></div>
      </div>
      <div className="page-content">
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card">
              <label className="input-label">Target role / opportunity</label>
              <input className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} style={{ marginBottom: 12 }} />
              <label className="input-label">Paste your resume</label>
              <textarea className="input" style={{ minHeight: 260 }} placeholder="Paste resume text here..." value={resume} onChange={(e) => setResume(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 12 }} onClick={analyze} disabled={!resume.trim() || loading}>
              {loading ? "Analyzing..." : "Analyze resume →"}
            </button>
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

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme]   = useState(() => localStorage.getItem("on_theme") || "dark");
  const [view, setView]     = useState("dashboard");
  const [profile, setProfile] = useState({ name: "Alex", grade: "11th Grade", gpa: "3.9", skills: "React, Python, ML", interests: "AI, education tech", goals: "Software engineer", location: "New Jersey" });
  const [opportunities, setOpportunities] = useState(DEMO_OPPS);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("groq_key") || "");
  const [toast, setToast]   = useState(null);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("on_theme", next);
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

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <GlobalStyles theme={theme} />
      <div className="app">
        <Sidebar view={view} setView={setView} profile={profile} />
        <main className="main">{views[view] || views.dashboard}</main>
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </ThemeContext.Provider>
  );
}
